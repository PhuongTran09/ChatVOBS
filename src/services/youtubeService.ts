import { API_CONFIG } from '../config/api';

const { API_KEY, BASE_URL } = API_CONFIG.YOUTUBE;

export interface YouTubeStats {
  id: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  hiddenSubscriberCount: boolean;
  /** `contentDetails.relatedPlaylists.uploads`, so callers never derive it by string surgery. */
  uploadsPlaylistId: string;
  thumbnailUrl: string;
  title: string;
  description: string;
}

export interface YouTubeNotification {
  title: string;
  videoId: string;
  publishedAt: string;
  description: string;
  thumbnailUrl: string;
}

export type YouTubeErrorCode =
  | 'no_api_key'
  | 'quota_exceeded'
  | 'not_found'
  | 'http'
  | 'network';

export class YouTubeApiError extends Error {
  readonly code: YouTubeErrorCode;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(code: YouTubeErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'YouTubeApiError';
    this.code = code;
    this.status = status;
    // Anything the client cannot fix by waiting a few seconds, or that bills quota
    // to retry, must stop the overlay poll loops.
    this.retryable = code === 'network' || (status !== undefined && status >= 500);
  }
}

interface ChannelItem {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: { default?: { url?: string } };
  };
  statistics?: {
    subscriberCount?: string;
    viewCount?: string;
    videoCount?: string;
    hiddenSubscriberCount?: boolean;
  };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
}

interface PlaylistItem {
  snippet?: {
    title?: string;
    publishedAt?: string;
    description?: string;
    resourceId?: { videoId?: string };
    thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
  };
  contentDetails?: { videoId?: string };
}

interface ListResponse<T> {
  items?: T[];
  error?: {
    code?: number;
    message?: string;
    errors?: Array<{ reason?: string }>;
  };
}

/** A typo in `fields=` degrades to missing data at runtime, not a compile error — so it is declared once, here. */
const CHANNEL_FIELDS =
  'items(id,snippet(title,description,thumbnails/default/url),' +
  'statistics(subscriberCount,viewCount,videoCount,hiddenSubscriberCount),' +
  'contentDetails/relatedPlaylists/uploads)';
const PLAYLIST_FIELDS =
  'items(snippet(title,publishedAt,description,resourceId/videoId,' +
  'thumbnails(medium(url),default(url))),contentDetails/videoId)';

const CACHE_PREFIX = {
  STATS: 'chatvobs:yt:stats',
  NOTIFICATIONS: 'chatvobs:yt:uploads',
  BACKOFF: 'chatvobs:yt:backoff',
};

const CACHE_TTL = 15 * 60 * 1000;
/** How long every poll loop stays asleep after a non-recoverable API response. */
const BACKOFF_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10 * 1000;
const MAX_NOTIFICATIONS = 50;

/**
 * Handles are case-insensitive and IDs are not, so each kind gets its own cache-key
 * namespace. Rejecting odd characters here also keeps them out of localStorage keys.
 */
function normalizeIdentifier(identifier: string): { key: string; queryName: string; queryValue: string } | null {
  const trimmed = identifier.trim().replace(/^@/, '');
  if (!/^[A-Za-z0-9._-]{2,40}$/.test(trimmed)) return null;

  if (/^UC[A-Za-z0-9_-]{22}$/.test(trimmed)) {
    return { key: `id:${trimmed}`, queryName: 'id', queryValue: trimmed };
  }
  return { key: `handle:${trimmed.toLowerCase()}`, queryName: 'forHandle', queryValue: `@${trimmed}` };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function readCache<T>(key: string, guard: (value: unknown) => boolean, ignoreExpiry = false): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const entry: unknown = JSON.parse(cached);
    if (
      typeof entry !== 'object' ||
      entry === null ||
      typeof (entry as CacheEntry<T>).timestamp !== 'number'
    ) {
      return null;
    }
    const { data, timestamp } = entry as CacheEntry<T>;
    if (!ignoreExpiry && Date.now() - timestamp > CACHE_TTL) return null;
    // A cached entry written by an older build has the previous shape.
    return guard(data) ? (data as T) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('Error saving to local storage cache:', error);
  }
}

const isStatsCache = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null) return false;
  const stats = value as Partial<YouTubeStats>;
  return (
    typeof stats.id === 'string' &&
    typeof stats.subscriberCount === 'number' &&
    typeof stats.viewCount === 'number'
  );
};

const isNotificationListCache = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every((item) => typeof (item as YouTubeNotification)?.videoId === 'string');

/**
 * Errors that retrying cannot fix — a bad key, a dead key, a quota wall — park every
 * overlay poll loop until `BACKOFF_MS` has passed.
 */
function startBackoff(): void {
  try {
    localStorage.setItem(CACHE_PREFIX.BACKOFF, String(Date.now() + BACKOFF_MS));
  } catch {
    /* storage unavailable; poll loops just keep trying */
  }
}

function isBackingOff(): boolean {
  try {
    const until = Number(localStorage.getItem(CACHE_PREFIX.BACKOFF));
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

async function requestYouTube<T>(
  path: string,
  params: Record<string, string>,
): Promise<ListResponse<T>> {
  if (!API_KEY) {
    throw new YouTubeApiError('no_api_key', 'YouTube API key is not configured');
  }

  // `URLSearchParams` encodes every value, so a crafted `?handle=` cannot inject
  // extra query parameters or leak past the intended one.
  const url = new URL(`${BASE_URL.replace(/\/+$/, '')}/${path}`);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }
  url.searchParams.set('key', API_KEY);

  // Explicit controller rather than AbortSignal.timeout(): OBS ships older CEF builds.
  // The timeout is the only canceller on purpose — callers share one in-flight request
  // per channel, so letting one of them unmount must not cancel it for the others.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      let reason = '';
      try {
        const body = (await response.json()) as ListResponse<T>;
        reason = body.error?.errors?.[0]?.reason ?? '';
      } catch {
        /* non-JSON error body; status alone is enough to classify */
      }
      const quotaBlocked =
        response.status === 429 ||
        (response.status === 403 &&
          ['quotaExceeded', 'rateLimitExceeded', 'userRateLimitExceeded'].includes(reason));

      if (quotaBlocked) {
        startBackoff();
        throw new YouTubeApiError('quota_exceeded', 'YouTube API quota exhausted', response.status);
      }
      if (response.status === 404 || reason === 'notFound') {
        startBackoff();
        throw new YouTubeApiError('not_found', 'YouTube channel or playlist not found', response.status);
      }
      if (response.status === 403 || response.status === 400) {
        startBackoff();
        throw new YouTubeApiError('http', `YouTube API rejected the request: ${response.status} ${reason}`, response.status);
      }
      throw new YouTubeApiError('http', `YouTube API error: ${response.status}`, response.status);
    }

    return (await response.json()) as ListResponse<T>;
  } catch (error) {
    if (error instanceof YouTubeApiError) throw error;
    throw new YouTubeApiError('network', 'YouTube request failed or timed out');
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pages such as the combined overlay mount several consumers of the same channel at
 * once. Quota is billed per API key, so identical in-flight calls collapse into one.
 */
function dedupe<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  task: () => Promise<T>,
): Promise<T> {
  const pending = cache.get(key);
  if (pending) return pending;

  const created = task().finally(() => cache.delete(key));
  cache.set(key, created);
  return created;
}

const statsInFlight = new Map<string, Promise<YouTubeStats | null>>();
const notificationsInFlight = new Map<string, Promise<YouTubeNotification[]>>();

/**
 * Fetches channel statistics by handle (e.g. `@YatoKenji`) or channel ID (`UC…`).
 * Resolves to `null` when nothing usable is known — callers show a placeholder and
 * must never substitute invented numbers.
 */
export async function getChannelStats(
  identifier: string,
  opts: { bypassCache?: boolean } = {},
): Promise<YouTubeStats | null> {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) {
    console.warn('Ignoring invalid YouTube channel identifier');
    return null;
  }

  const cacheKey = `${CACHE_PREFIX.STATS}:${normalized.key}`;
  const { bypassCache = false } = opts;

  if (!bypassCache) {
    const cached = readCache<YouTubeStats>(cacheKey, isStatsCache);
    if (cached) return cached;
  }
  // An exhausted quota or a dead key does not heal within one poll tick, so a bypassCache
  // poll must not hammer it either. Stale data on screen beats an empty card, but never
  // invents a number.
  if (isBackingOff()) return readCache<YouTubeStats>(cacheKey, isStatsCache, true);

  return dedupe(statsInFlight, cacheKey, async () => {
    try {
      const data = await requestYouTube<ChannelItem>(
        'channels',
        {
          part: 'snippet,statistics,contentDetails',
          [normalized.queryName]: normalized.queryValue,
          fields: CHANNEL_FIELDS,
        },
      );

      const channel = data.items?.[0];
      if (!channel?.id) return null;

      const stats: YouTubeStats = {
        id: channel.id,
        subscriberCount: toCount(channel.statistics?.subscriberCount),
        viewCount: toCount(channel.statistics?.viewCount),
        videoCount: toCount(channel.statistics?.videoCount),
        hiddenSubscriberCount: channel.statistics?.hiddenSubscriberCount === true,
        uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads ?? '',
        thumbnailUrl: channel.snippet?.thumbnails?.default?.url ?? '',
        title: channel.snippet?.title ?? '',
        description: channel.snippet?.description ?? '',
      };
      writeCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching YouTube stats:', error);
      return readCache<YouTubeStats>(cacheKey, isStatsCache, true);
    }
  });
}

function toCount(raw: string | undefined): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * Latest uploads, for the notification panel. Uses the uploads playlist reported by
 * `channels` (1 quota unit) instead of searching the channel (100 units).
 */
export async function getLatestNotifications(
  uploadsPlaylistId: string,
  maxResults = 5,
  opts: { bypassCache?: boolean } = {},
): Promise<YouTubeNotification[]> {
  const playlistId = uploadsPlaylistId.trim();
  if (!/^UU[A-Za-z0-9_-]{22}$/.test(playlistId)) {
    console.warn('Ignoring invalid YouTube uploads playlist id');
    return [];
  }

  const limit = Math.min(Math.max(Math.trunc(maxResults) || 1, 1), MAX_NOTIFICATIONS);
  const cacheKey = `${CACHE_PREFIX.NOTIFICATIONS}:${playlistId}:${limit}`;
  const { bypassCache = false } = opts;

  if (!bypassCache) {
    const cached = readCache<YouTubeNotification[]>(cacheKey, isNotificationListCache);
    if (cached) return cached;
  }
  if (isBackingOff()) return readCache<YouTubeNotification[]>(cacheKey, isNotificationListCache, true) ?? [];

  return dedupe(notificationsInFlight, cacheKey, async () => {
    try {
      const data = await requestYouTube<PlaylistItem>(
        'playlistItems',
        {
          part: 'snippet,contentDetails',
          playlistId,
          maxResults: String(limit),
          fields: PLAYLIST_FIELDS,
        },
      );

      const list = (data.items ?? [])
        .map((item) => ({
          title: item.snippet?.title ?? '',
          // `contentDetails` is authoritative; `snippet.resourceId` is kept as the older fallback.
          videoId: item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId ?? '',
          publishedAt: item.snippet?.publishedAt ?? '',
          description: item.snippet?.description ?? '',
          thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? '',
        }))
        .filter((item) => item.videoId !== '');

      if (list.length > 0) writeCache(cacheKey, list);
      return list;
    } catch (error) {
      console.error('Error fetching YouTube notifications:', error);
      return readCache<YouTubeNotification[]>(cacheKey, isNotificationListCache, true) ?? [];
    }
  });
}
