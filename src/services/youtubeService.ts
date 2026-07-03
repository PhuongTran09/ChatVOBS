import { API_CONFIG } from '../config/api';

const { API_KEY, BASE_URL } = API_CONFIG.YOUTUBE;

export interface YouTubeStats {
  id: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
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
  tags: string[];
}

const CACHE_KEYS = {
  STATS: 'youtube_stats_cache',
  NOTIFICATIONS: 'youtube_notifications_cache'
};

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache expiration

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getFromCache<T>(key: string, ignoreExpiry = false): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const entry: CacheEntry<T> = JSON.parse(cached);
    if (!ignoreExpiry && Date.now() - entry.timestamp > CACHE_TTL) {
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setToCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('Error saving to local storage cache:', error);
  }
}

/**
 * Fetches YouTube channel statistics using a handle (e.g., @YatoKenji)
 */
export async function getChannelStats(identifier: string, bypassCache = false): Promise<YouTubeStats | null> {
  // Check active cache
  if (!bypassCache) {
    const cached = getFromCache<YouTubeStats>(CACHE_KEYS.STATS);
    if (cached) return cached;
  }

  try {
    let url = '';
    if (identifier.startsWith('UC')) {
      url = `${BASE_URL}/channels?part=statistics,snippet&id=${identifier}&key=${API_KEY}`;
    } else {
      const formattedHandle = identifier.startsWith('@') ? identifier : `@${identifier}`;
      url = `${BASE_URL}/channels?part=statistics,snippet&forHandle=${formattedHandle}&key=${API_KEY}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      const stats = {
        id: channel.id,
        subscriberCount: channel.statistics.subscriberCount,
        viewCount: channel.statistics.viewCount,
        videoCount: channel.statistics.videoCount,
        thumbnailUrl: channel.snippet.thumbnails.default?.url || '',
        title: channel.snippet.title,
        description: channel.snippet.description
      };
      setToCache(CACHE_KEYS.STATS, stats);
      return stats;
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTube stats:', error);
    // Fall back to expired cache if available to prevent showing blank interface
    const fallback = getFromCache<YouTubeStats>(CACHE_KEYS.STATS, true);
    if (fallback) return fallback;
    return null;
  }
}

/**
 * Fetches the latest videos or streams from the channel as notifications
 * Optimized: Uses playlistItems of the default uploads playlist (1 quota unit instead of 100)
 */
export async function getLatestNotifications(channelId: string, maxResults: number = 5): Promise<YouTubeNotification[]> {
  const cacheKey = `${CACHE_KEYS.NOTIFICATIONS}_list_${channelId}_${maxResults}`;
  const cached = getFromCache<YouTubeNotification[]>(cacheKey);
  if (cached) return cached;

  try {
    if (!channelId.startsWith('UC')) {
      throw new Error(`Invalid channel ID: ${channelId}`);
    }
    // Uploads playlist ID is derived by changing UC to UU in the channel ID
    const playlistId = 'UU' + channelId.substring(2);
    
    const response = await fetch(
      `${BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`
    );
    if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const list = data.items.map((item: any) => ({
        title: item.snippet.title || '',
        videoId: item.snippet.resourceId?.videoId || '',
        publishedAt: item.snippet.publishedAt || '',
        description: item.snippet.description || '',
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        tags: []
      }));
      setToCache(cacheKey, list);
      return list;
    }
    return [];
  } catch (error) {
    console.error('Error fetching YouTube notifications:', error);
    const fallback = getFromCache<YouTubeNotification[]>(cacheKey, true);
    if (fallback) return fallback;
    return [];
  }
}

/**
 * Formats numbers to a shorter string (e.g., 12530 -> 12.53K)
 */
export function formatCompactNumber(numberStr: string): string {
  const number = parseInt(numberStr, 10);
  if (isNaN(number)) return '0';
  
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(number);
}
