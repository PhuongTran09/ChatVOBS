import { useEffect, useState } from 'react';
import '../styles/SubOverlayPage.css';
import { getChannelStats, formatCompactNumber } from '../services';
import type { YouTubeStats } from '../services';
import { getOverlayParams } from '../constants/overlay';
import { CHANNEL_HANDLE } from '../constants/branding';
import { useOverlayMode, useOverlayTheme } from '../hooks/useOverlayShell';

export function SubOverlayPage() {
  const { theme, accentColor } = useOverlayTheme();
  const [ytStats, setYtStats] = useState<YouTubeStats | null>(null);
  
  // Custom overrides from URL parameters
  const [customSubs, setCustomSubs] = useState<number | null>(null);
  const [customViews, setCustomViews] = useState<number | null>(null);
  const [customVideos, setCustomVideos] = useState<number | null>(null);
  const [handle, setHandle] = useState<string>(CHANNEL_HANDLE);

  useOverlayMode();

  useEffect(() => {
    const params = getOverlayParams();
    const subsParam = params.get('subs');
    const viewsParam = params.get('views');
    const videosParam = params.get('videos');
    const handleParam = params.get('handle') || params.get('channelId');

    if (subsParam) {
      const parsedSubs = parseInt(subsParam, 10);
      if (!isNaN(parsedSubs) && parsedSubs >= 0) setCustomSubs(parsedSubs);
    }
    if (viewsParam) {
      const parsedViews = parseInt(viewsParam, 10);
      if (!isNaN(parsedViews) && parsedViews >= 0) setCustomViews(parsedViews);
    }
    if (videosParam) {
      const parsedVideos = parseInt(videosParam, 10);
      if (!isNaN(parsedVideos) && parsedVideos >= 0) setCustomVideos(parsedVideos);
    }
    if (handleParam) {
      setHandle(handleParam);
    }
  }, []);

  useEffect(() => {
    if (customSubs !== null && customViews !== null && customVideos !== null) {
      return;
    }

    async function fetchStats() {
      try {
        const statsData = await getChannelStats(handle, false);
        if (statsData) {
          setYtStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
    fetchStats();
  }, [handle, customSubs, customViews, customVideos]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 4000); // Cycle every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const subscriberCount = customSubs !== null 
    ? customSubs 
    : (ytStats ? parseInt(ytStats.subscriberCount, 10) : 3530);
    
  const viewCountStr = customViews !== null 
    ? customViews.toString() 
    : (ytStats ? ytStats.viewCount : '1240000');
    
  const videoCountStr = customVideos !== null 
    ? customVideos.toString() 
    : (ytStats ? ytStats.videoCount : '142');

  return (
    <div className="sub-overlay-wrapper">
      <div 
        className={`sub-stats-card-container theme-${theme}`}
        style={{ '--accent-color': accentColor } as React.CSSProperties}
      >
        {/* Cyberpunk decorative elements */}
        <div className="sub-corner-decor sub-top-left" />
        <div className="sub-corner-decor sub-top-right" />
        <div className="sub-corner-decor sub-bottom-left" />
        <div className="sub-corner-decor sub-bottom-right" />
        <div className="sub-scanline-overlay" />
        <div className="sub-cyber-grid-overlay" />

        <div className="sub-stats-card">
          <div 
            className="sub-stats-track"
            style={{ transform: `translateY(-${activeIndex * 100}%)` }}
          >
            <div className="stat-slide">
              <div className="stat-value">{formatCompactNumber(subscriberCount.toString())}</div>
              <div className="stat-label">SUBSCRIBERS</div>
            </div>
            <div className="stat-slide">
              <div className="stat-value">{formatCompactNumber(viewCountStr)}</div>
              <div className="stat-label">TOTAL VIEWS</div>
            </div>
            <div className="stat-slide">
              <div className="stat-value">{videoCountStr}</div>
              <div className="stat-label">TOTAL VIDEOS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
