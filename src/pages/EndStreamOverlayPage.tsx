import { useEffect, useState } from 'react';
import '../styles/EndStreamOverlayPage.css';
import { useI18n } from '../i18n';
import { getChannelStats, type YouTubeStats } from '../services/youtubeService';
const POCHACCO_GIFS = [
  'https://media.tenor.com/hcqMKPFXVNsAAAAj/cute-funny.gif',
  'https://media.tenor.com/i7ir6sHYaToAAAAj/dancing-dog-dancing-pochacco.gif',
  'https://media.tenor.com/LliOta9Fa8wAAAAj/pochacco-dancing-pochacco.gif',
  'https://media.tenor.com/mhV0m-KGkscAAAAj/dancing-pochacco-dancing-dog.gif',
  'https://media.tenor.com/ZqUoQQ4kou8AAAAi/ted-puppy.gif',
  'https://media.tenor.com/ImNcEfxo8kEAAAAi/dancing-dance.gif'
];
export function EndStreamOverlayPage() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<'cyan' | 'magenta' | 'amber' | 'rainbow'>('cyan');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ytStats, setYtStats] = useState<YouTubeStats | null>(null);
  const [youtubeHandle, setYoutubeHandle] = useState('@YatoKenji');
  // States for dynamic rendering
  const [activeGifIdx, setActiveGifIdx] = useState(0);
  const [gifTransition, setGifTransition] = useState<'in' | 'out'>('in');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fps, setFps] = useState(60.0);
  const [ping, setPing] = useState(12);
  useEffect(() => {
    // Enable transparent overlay support
    document.body.classList.add('overlay-mode');
    // Parse configuration from URL query params
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme')?.toLowerCase();
    const titleParam = params.get('title');
    const subtitleParam = params.get('subtitle');
    const channelParam = params.get('handle') || params.get('channelId') || '@YatoKenji';
    const formattedHandle = channelParam.startsWith('@') ? channelParam : `@${channelParam}`;
    setYoutubeHandle(formattedHandle);
    if (themeParam === 'magenta') setTheme('magenta');
    else if (themeParam === 'amber') setTheme('amber');
    else if (themeParam === 'rainbow') setTheme('rainbow');
    setTitle(titleParam || t('endstream.title') || 'STREAM ENDED');
    setSubtitle(subtitleParam || t('endstream.subtitle') || 'THANK YOU FOR WATCHING!');
    // Fetch real channel stats to display final stream subscriber numbers
    async function fetchStats() {
      try {
        const statsData = await getChannelStats(channelParam);
        if (statsData) {
          setYtStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching stats for end stream page:', err);
      }
    }
    fetchStats();
    // Clock interval
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    // Randomize ping stats
    const pingTimer = setInterval(() => {
      setPing(Math.floor(Math.random() * 8) + 10); // 10-18ms
    }, 4000);
    // Randomize fps stats
    const fpsTimer = setInterval(() => {
      setFps(60.0 + (Math.random() * 0.4 - 0.2)); // 59.8-60.2
    }, 2000);
    return () => {
      document.body.classList.remove('overlay-mode');
      clearInterval(clockTimer);
      clearInterval(pingTimer);
      clearInterval(fpsTimer);
    };
  }, []);
  // Rotate through Pochacco GIFs with transition effect
  useEffect(() => {
    const gifInterval = setInterval(() => {
      setGifTransition('out');
      setTimeout(() => {
        setActiveGifIdx((prev) => (prev + 1) % POCHACCO_GIFS.length);
        setGifTransition('in');
      }, 400); // Wait for fade-out to finish
    }, 6000);
    return () => clearInterval(gifInterval);
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
  const themeColors = {
    cyan: '#00f0ff',
    magenta: '#ff0055',
    amber: '#ffaa00',
    rainbow: 'linear-gradient(90deg, #00f0ff, #ff0055)'
  };
  const activeColor = theme === 'rainbow' ? '#00f0ff' : themeColors[theme];
  return (
    <div className="endstream-overlay-wrapper">
      <div
        className={`endstream-container theme-${theme}`}
        style={{
          '--accent-color': activeColor,
          '--accent-gradient': themeColors[theme]
        } as React.CSSProperties}
      >
        {/* Cyberpunk overlays */}
        <div className="scanline-overlay" />
        <div className="cyber-grid-overlay" />
        {/* Decorative elements */}
        <div className="decor-frame border-tl" />
        <div className="decor-frame border-tr" />
        <div className="decor-frame border-bl" />
        <div className="decor-frame border-br" />
        {/* Top Header bar */}
        <header className="top-banner">
          <div className="logo-section">
            <span className="logo-square" />
            <span className="logo-text">{ytStats?.title ? ytStats.title.toUpperCase() : 'YATO KENJI'}</span>
          </div>
          <div className="system-status-indicator offline">
            <span className="status-dot-pulse" />
            {t('endstream.status.offline') || 'OFFLINE'}
          </div>
        </header>
        {/* Main Workspace Grid */}
        <div className="endstream-grid">
          
          {/* LEFT COLUMN: Main Title & Stream Metrics */}
          <div className="left-panel">
            <div className="channel-badge-pill">
              <span className="badge-bullet"></span>
              {t('mode.streamer') || 'STREAMER'} SESSION COMPLETED
            </div>
            <h1 className="stream-ended-title" data-text={title.toUpperCase()}>
              {title.toUpperCase()}
            </h1>
            
            <p className="stream-ended-subtitle">
              {subtitle.toUpperCase()}
            </p>
          </div>
          <div className="right-panel">
            <div className="bottom-right-container">
              {/* Holographic Social Card */}
              <div className="holo-social-card">
                <div className="holo-frame-corner top-left" />
                <div className="holo-frame-corner top-right" />
                <div className="holo-frame-corner bottom-left" />
                <div className="holo-frame-corner bottom-right" />
                <div className="social-content-container">
                  {/* Brand Header */}
                  <div className="social-platform-label" style={{ color: '#ff0055' }}>
                    YOUTUBE
                  </div>
                  {/* Account Details */}
                  <div className="social-details">
                    <div className="social-handle">{youtubeHandle}</div>
                    <div className="social-action-txt">{t('endstream.socials.follow') || 'FOLLOW FOR UPDATES'}</div>
                  </div>
                  {/* Puppy Dance GIF */}
                  <div className="puppy-dance-container">
                    <img
                      src={POCHACCO_GIFS[activeGifIdx]}
                      alt="Pochacco Dance"
                      className={`puppy-dance-gif transition-${gifTransition}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <footer className="bottom-bar">
          <span className="footer-copyright">{t('endstream.footer.text') || 'STREAMING PROCESS COMPLETE. SYSTEM STANDBY.'}</span>
          <span className="time-display">
            TIME: {formatCurrentTime(currentTime)} | {formatCurrentDate(currentTime)}
          </span>
          <div className="connection-speed">
            <span>PING: {ping}MS</span>
            <span className="divider">|</span>
            <span>FPS: {fps.toFixed(1)}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}