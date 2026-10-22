import { useEffect, useState } from 'react';
import '../styles/SubOverlayPage.css';
import { getChannelStats } from '../services/youtubeService';
import type { YouTubeStats } from '../services/youtubeService';
import { getOverlayParams } from '../constants/overlay';
import { CHANNEL_HANDLE } from '../constants/branding';
import { useOverlayMode, useOverlayTheme } from '../hooks/useOverlayShell';
import { useI18n } from '../i18n';

export function SubOverlayPage() {
  const { theme, accentColor } = useOverlayTheme();
  const { t, fmt } = useI18n();
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

    const readCount = (value: string | null): number | null => {
      const parsed = Number(value);
      return value !== null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    };

    const parsedSubs = readCount(subsParam);
    if (parsedSubs !== null) setCustomSubs(parsedSubs);
    const parsedViews = readCount(viewsParam);
    if (parsedViews !== null) setCustomViews(parsedViews);
    const parsedVideos = readCount(videosParam);
    if (parsedVideos !== null) setCustomVideos(parsedVideos);
    if (handleParam) {
      setHandle(handleParam);
    }
  }, []);

  useEffect(() => {
    if (customSubs !== null && customViews !== null && customVideos !== null) {
      return;
    }

    let cancelled = false;

    async function fetchStats() {
      const statsData = await getChannelStats(handle);
      if (statsData && !cancelled) setYtStats(statsData);
    }
    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [handle, customSubs, customViews, customVideos]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 4000); // Cycle every 4 seconds
    return () => clearInterval(timer);
  }, []);

  // Null means "unknown" and renders a placeholder: an overlay must never show a made-up count.
  const subscriberCount = customSubs ?? (ytStats && !ytStats.hiddenSubscriberCount ? ytStats.subscriberCount : null);
  const viewCount = customViews ?? (ytStats ? ytStats.viewCount : null);
  const videoCount = customVideos ?? (ytStats ? ytStats.videoCount : null);

  const renderCount = (value: number | null) =>
    value === null ? t('common.placeholder') : fmt.compact(value);

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
              <div className="stat-value">{renderCount(subscriberCount)}</div>
              <div className="stat-label">{t('metrics.subscribers.label')}</div>
            </div>
            <div className="stat-slide">
              <div className="stat-value">{renderCount(viewCount)}</div>
              <div className="stat-label">{t('metrics.views.label')}</div>
            </div>
            <div className="stat-slide">
              <div className="stat-value">{renderCount(videoCount)}</div>
              <div className="stat-label">{t('metrics.videos.label')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
