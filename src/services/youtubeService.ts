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

/**
 * Fetches YouTube channel statistics using a handle (e.g., @YatoKenji)
 */
export async function getChannelStats(handle: string): Promise<YouTubeStats | null> {
  try {
    const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;
    const response = await fetch(
      `${BASE_URL}/channels?part=statistics,snippet&forHandle=${formattedHandle}&key=${API_KEY}`
    );
    if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      return {
        id: channel.id,
        subscriberCount: channel.statistics.subscriberCount,
        viewCount: channel.statistics.viewCount,
        videoCount: channel.statistics.videoCount,
        thumbnailUrl: channel.snippet.thumbnails.default?.url || '',
        title: channel.snippet.title,
        description: channel.snippet.description
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTube stats:', error);
    return null;
  }
}

/**
 * Fetches the latest video or stream from the channel as a notification
 */
export async function getLatestNotification(channelId: string): Promise<YouTubeNotification | null> {
  try {
    // Get latest video ID
    const searchResponse = await fetch(
      `${BASE_URL}/search?part=id&channelId=${channelId}&order=date&maxResults=1&type=video&key=${API_KEY}`
    );
    if (!searchResponse.ok) throw new Error(`YouTube API error: ${searchResponse.status}`);
    const searchData = await searchResponse.json();
    
    if (searchData.items && searchData.items.length > 0) {
      const videoId = searchData.items[0].id.videoId;
      
      // Get video details (description, tags, thumbnail)
      const videoResponse = await fetch(
        `${BASE_URL}/videos?part=snippet&id=${videoId}&key=${API_KEY}`
      );
      if (!videoResponse.ok) throw new Error(`YouTube API error: ${videoResponse.status}`);
      const videoData = await videoResponse.json();
      
      if (videoData.items && videoData.items.length > 0) {
        const video = videoData.items[0];
        return {
          title: video.snippet.title,
          videoId: video.id,
          publishedAt: video.snippet.publishedAt,
          description: video.snippet.description,
          thumbnailUrl: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url || '',
          tags: video.snippet.tags || []
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTube notification:', error);
    return null;
  }
}

/**
 * Formats numbers to a shorter string (e.g., 12500 -> 12.5K)
 */
export function formatCompactNumber(numberStr: string): string {
  const number = parseInt(numberStr, 10);
  if (isNaN(number)) return '0';
  
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(number);
}
