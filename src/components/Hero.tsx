import { useState, useEffect } from 'react';
import { Metric } from './Metric';
import './Hero.css';
import { useI18n } from '../i18n';
import { getChannelStats, getLatestNotifications, type YouTubeStats, type YouTubeNotification } from '../services';
import { CHANNEL_DISPLAY_NAME, CHANNEL_HANDLE, CHANNEL_URL } from '../constants/branding';
import { DeveloperHero } from './DeveloperHero';

interface HeroProps {
  profileMode: 'streamer' | 'developer';
}

function StreamerHero() {
  const { t, fmt } = useI18n();
  const [stats, setStats] = useState<YouTubeStats | null>(null);
  const [notifications, setNotifications] = useState<YouTubeNotification[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      const data = await getChannelStats(CHANNEL_HANDLE);
      if (!data || cancelled) return;
      setStats(data);
      const notifs = await getLatestNotifications(data.uploadsPlaylistId, 5);
      if (!cancelled) setNotifications(notifs);
    }
    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="hero-top-grid">
      <div className="hero-content">
        <div className="badge-wrapper">
          <span className="cyber-badge">{t('mode.streamer')} {t('hero.badge')} </span>
        </div>
        <h1 className="glitch-text" data-text={t('hero.title')}>
          {t('hero.title')}
        </h1>
        <p className="hero-lead">{t('hero.description.streamer')}</p>

        <div className="platform-tags">
          <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="channel-profile-tag" title="Visit YouTube Channel">
            <div className="click-indicator">
              <span>{t('overlay.hero.click')}</span>
            </div>
            <img src={stats?.thumbnailUrl || "/icon.png"} alt="Channel Avatar" className="channel-avatar" />
            <div className="channel-info-hero">
              <span className="channel-name-hero">{stats?.title ? stats.title.toUpperCase() : CHANNEL_DISPLAY_NAME}</span>
              <span className="channel-platform-hero" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textTransform: 'none', lineHeight: 1.4, marginTop: '4px' }}>
                {stats?.description || t('overlay.hero.youtubePartner')}
              </span>
            </div>
          </a>
        </div>



        <div className="cyber-metrics" aria-label={t('overlay.hero.metricsLabel')}>
          <Metric label={t('metrics.subscribers.label')} value={stats ? fmt.compact(stats.subscriberCount) : t('common.placeholder')} />
          <Metric label={t('metrics.views.label')} value={stats ? fmt.compact(stats.viewCount) : t('common.placeholder')} />
          <Metric label={t('metrics.videos.label')} value={stats ? fmt.compact(stats.videoCount) : t('common.placeholder')} />
        </div>
      </div>

      {/* STATUS PANEL */}
      <aside className="cyber-panel status-panel">
        <div className="panel-scanline" />
        <div className="panel-corner-tl" />
        <div className="panel-corner-br" />
        
        <div className="panel-head">
          <svg className="blink-bell" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <strong>{t('panel.live')}</strong>
        </div>
        <div className="panel-body">
          {notifications && notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notification, index) => {
                const isLatest = index === 0;
                return (
                  <div key={notification.videoId} className={`notification-item ${isLatest ? 'latest' : ''}`}>
                    <div className="notification-main">
                      {notification.thumbnailUrl && (
                        <a href={`https://youtube.com/watch?v=${notification.videoId}`} target="_blank" rel="noopener noreferrer" className="notification-thumb-link">
                          <img src={notification.thumbnailUrl} alt="Thumbnail" className="notification-thumb" />
                        </a>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a href={`https://youtube.com/watch?v=${notification.videoId}`} target="_blank" rel="noopener noreferrer" className="highlight-text notification-title">
                          {notification.title}
                        </a>
                        {notification.description && (
                          <p className="notification-desc">
                            {notification.description}
                          </p>
                        )}
                        {notification.publishedAt && (
                          <span className="notification-date">
                            {fmt.date(notification.publishedAt, '.')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          ) : (
            <>
              <p className="highlight-text" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                {'> '} {t('panel.topic')}
              </p>
              <div className="tech-tags">
                <span>#YouTubeLive</span>
                <span>#ReactJS</span>
                <span>#CSS</span>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

/** Split so the channel request never happens in developer mode, not just hidden. */
export function Hero({ profileMode }: HeroProps) {
  return profileMode === 'developer' ? <DeveloperHero /> : <StreamerHero />;
}
