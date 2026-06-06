import { useState, useEffect } from 'react';
import { Metric } from './Metric';
import './Hero.css';
import { useI18n } from '../i18n';
import { getChannelStats, getLatestNotifications, formatCompactNumber, type YouTubeStats, type YouTubeNotification } from '../services/youtubeService';

interface HeroProps {
  profileMode: 'streamer' | 'developer';
  onOpenChat?: () => void;
}

export function Hero({ profileMode }: HeroProps) {
  const { t } = useI18n();
  const [stats, setStats] = useState<YouTubeStats | null>(null);
  const [notifications, setNotifications] = useState<YouTubeNotification[]>([]);

  useEffect(() => {
    async function loadStats() {
      const data = await getChannelStats('@YatoKenji');
      if (data) {
        setStats(data);
        const notifs = await getLatestNotifications(data.id, 5);
        setNotifications(notifs);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="hero-top-grid">
      <div className="hero-content">
        <div className="badge-wrapper">
          <span className="cyber-badge">{t('hero.badge')} {t(`mode.${profileMode}` as any)}</span>
        </div>
        <h1 className="glitch-text" data-text={t('hero.title')}>
          {t('hero.title')}
        </h1>
        <p className="hero-lead">
          {profileMode === 'streamer'
            ? t('hero.description.streamer')
            : t('hero.description.developer')}
        </p>

        <div className="platform-tags">
          <a href="https://youtube.com/@YatoKenji" target="_blank" rel="noopener noreferrer" className="channel-profile-tag" title="Visit YouTube Channel">
            <div className="click-indicator">
              <span>CLICK</span>
            </div>
            <img src={stats?.thumbnailUrl || "/icon.png"} alt="Channel Avatar" className="channel-avatar" />
            <div className="channel-info-hero">
              <span className="channel-name-hero">{stats?.title ? stats.title.toUpperCase() : 'YATO KENJI'}</span>
              <span className="channel-platform-hero" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textTransform: 'none', lineHeight: 1.4, marginTop: '4px' }}>
                {stats?.description || 'YOUTUBE PARTNER'}
              </span>
            </div>
          </a>
        </div>



        <div className="cyber-metrics" aria-label="Channel metrics">
          <Metric label={t('metrics.subscribers.label')} value={stats ? formatCompactNumber(stats.subscriberCount) : t('metrics.subscribers.value')} />
          <Metric label="TOTAL VIEWS" value={stats ? formatCompactNumber(stats.viewCount) : '...'} />
          <Metric label={t('metrics.uptime.label')} value={t('metrics.uptime.value')} />
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
                        <a href={`https://youtube.com/watch?v=${notification.videoId}`} target="_blank" rel="noopener noreferrer" className="highlight-text notification-title" style={{ fontSize: '0.85rem', lineHeight: '1.3', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0, marginBottom: '4px' }}>
                          {notification.title}
                        </a>
                        {notification.description && (
                          <p className="notification-desc" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2', textTransform: 'none' }}>
                            {notification.description}
                          </p>
                        )}
                      </div>
                    </div>
                  {notification.tags && notification.tags.length > 0 && (
                    <div className="tech-tags" style={{ marginTop: '2px' }}>
                      {notification.tags.slice(0, 3).map((tag, i) => (
                        <span key={i}>#{tag.replace(/\s+/g, '')}</span>
                      ))}
                    </div>
                  )}
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
