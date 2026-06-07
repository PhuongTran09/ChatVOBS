import { useEffect, useState } from 'react';
import '../styles/LoadingOverlayPage.css';
import { useI18n } from '../i18n';
import { getChannelStats, formatCompactNumber, type YouTubeStats } from '../services/youtubeService';

const mockSystemLogs: string[] = [];

export function LoadingOverlayPage() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<'cyan' | 'magenta' | 'amber'>('cyan');
  const [title, setTitle] = useState('STREAM STARTING SOON');
  const [logs, setLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  // Stats states
  const [ytStats, setYtStats] = useState<YouTubeStats | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ping, setPing] = useState(14);
  const [fps, setFps] = useState(60.0);

  useEffect(() => {
    // Add overlay mode to body for transparency
    document.body.classList.add('overlay-mode');

    // Parse options from URL query params
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme')?.toLowerCase();
    const titleParam = params.get('title');

    if (themeParam === 'magenta') setTheme('magenta');
    if (themeParam === 'amber') setTheme('amber');
    
    if (titleParam) {
      setTitle(titleParam.toUpperCase());
    }

    // Fetch real YouTube statistics for Yato Kenji
    async function fetchYtStats() {
      try {
        const statsData = await getChannelStats('@YatoKenji');
        if (statsData) {
          setYtStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching YouTube stats for loading page:', err);
      }
    }
    fetchYtStats();

    // Clock timer
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Randomize ping stats
    const pingTimer = setInterval(() => {
      setPing(Math.floor(Math.random() * 12) + 11); // random 11-22ms
    }, 3000);

    // Randomize fps stats
    const fpsTimer = setInterval(() => {
      const randomFps = (60.0 + (Math.random() * 0.6 - 0.3)); // 59.7-60.3
      setFps(randomFps);
    }, 1500);

    return () => {
      document.body.classList.remove('overlay-mode');
      clearInterval(clockTimer);
      clearInterval(pingTimer);
      clearInterval(fpsTimer);
    };
  }, []);

  const formatCurrentTime = (date: Date) => {
    const hrs = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    const secs = String(date.getSeconds()).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const formatCurrentDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // Staggered logs display effect
  useEffect(() => {
    if (logIndex < mockSystemLogs.length) {
      const logTimer = setTimeout(() => {
        setLogs((prev) => [...prev, mockSystemLogs[logIndex]]);
        setLogIndex(logIndex + 1);
      }, 600 + Math.random() * 500);
      return () => clearTimeout(logTimer);
    }
  }, [logIndex]);

  const accentColors = {
    cyan: '#00f0ff',
    magenta: '#ff0055',
    amber: '#ffaa00'
  };
  const activeColor = accentColors[theme];

  const displaySubs = ytStats ? formatCompactNumber(ytStats.subscriberCount) : 'NA';
  const displayViews = ytStats ? formatCompactNumber(ytStats.viewCount) : 'NA';
  const displayVideos = ytStats ? formatCompactNumber(ytStats.videoCount) : t('metrics.videos.value') || 'NA';

  return (
    <div className="loading-overlay-wrapper">
      <div 
        className={`loading-container theme-${theme}`}
        style={{ '--accent-color': activeColor } as React.CSSProperties}
      >
        {/* Cyberpunk background grid and scanlines */}
        <div className="scanline-overlay" />
        <div className="cyber-grid-overlay" />

        {/* Decorative corner brackets */}
        <div className="decor-frame border-tl" />
        <div className="decor-frame border-tr" />
        <div className="decor-frame border-bl" />
        <div className="decor-frame border-br" />

        {/* Top Header bar */}
        <div className="top-banner">
          <div className="logo-section">
            <span className="logo-square" />
            <span className="logo-text">YATO KENJI</span>
          </div>
          <div className="system-status-indicator">
            <span className="status-dot-pulse" />
            LIVE STREAM
          </div>
        </div>

        {/* Main Loading Body Grid */}
        <div className="loading-main-grid">
          {/* Left Column: Tech Circular Spinner and Title */}
          <div className="left-panel">
            <div className="tech-spinner-outer">
              <div className="tech-spinner-inner" />
              <div className="spinner-center">
                <span className="spinner-percent">LIVE</span>
              </div>
            </div>
            
            <h1 className="starting-soon-title" data-text={title}>
              {title}
            </h1>
            
            <p className="sub-tagline">---------/---------</p>
          </div>

          {/* Right Column: Terminal Logs & Stats */}
          <div className="right-panel">
            {/* Terminal Logs Panel */}
            <div className="terminal-logs-window">
              <div className="terminal-header">
                <span>CHAT.log</span>
                <span className="term-ctrls">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </span>
              </div>
              <div className="terminal-body">
                {logs.map((log, index) => (
                  <div key={index} className="log-line">{log}</div>
                ))}
                {logIndex < mockSystemLogs.length && (
                  <div className="log-line cursor-blink">&gt; █</div>
                )}
              </div>
            </div>

            {/* Stats Panel */}
            <div className="stats-box">
              <div className="stats-header">YOUTUBE_STATUS</div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">SUBSCRIBERS</div>
                  <div className="stat-value text-accent-glow">{displaySubs}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">TOTAL VIEWS</div>
                  <div className="stat-value">{displayViews}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">TOTAL VIDEOS</div>
                  <div className="stat-value">{displayVideos}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-bar">
          <span className="footer-copyright">SẮP LÊN HÌNH RỒI TỪ TỪ NHÉ!</span>
          <span>
            TIME: {formatCurrentTime(currentTime)} | {formatCurrentDate(currentTime)}
          </span>
          <div className="connection-speed">
            <span>PING: {ping}MS</span>
            <span className="divider">|</span>
            <span>FPS: {fps.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
