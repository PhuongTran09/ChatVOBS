export const API_CONFIG = {
  YOUTUBE: {
    API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY || '',
    BASE_URL: import.meta.env.VITE_YOUTUBE_BASE_URL || 'https://www.googleapis.com/youtube/v3'
  },
  DISCORD: {
    INVITE_CODE: import.meta.env.VITE_DISCORD_INVITE_CODE || '',
    API_BASE_URL: import.meta.env.VITE_DISCORD_API_BASE_URL || 'https://discord.com/api'
  }
};
