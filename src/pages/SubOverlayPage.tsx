import { useEffect, useState } from 'react';
import '../styles/SubOverlayPage.css';
import { getChannelStats, formatCompactNumber } from '../services/youtubeService';

interface YouTubeStats {
  id: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  thumbnailUrl: string;
  title: string;
  description: string;
}

export function SubOverlayPage() {
  const [theme, setTheme] = useState<'cyan' | 'magenta' | 'amber' | 'rainbow'>('cyan');
  const [ytStats, setYtStats] = useState<YouTubeStats | null>(null);
  const [minimal, setMinimal] = useState<boolean>(true); // Default to minimal mode
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pollInterval, setPollInterval] = useState<number>(60); // Poll every 60s
  const [simulate, setSimulate] = useState<boolean>(false);
  const [simulatedSubs, setSimulatedSubs] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  
  // Custom configuration overrides from URL parameters
  const [goal, setGoal] = useState<number>(4000);
  const [customName, setCustomName] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [customSubs, setCustomSubs] = useState<number | null>(null);
  const [customViews, setCustomViews] = useState<number | null>(null);
  const [customVideos, setCustomVideos] = useState<number | null>(null);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [handle, setHandle] = useState<string>('@YatoKenji');

  useEffect(() => {
    // Add overlay mode class to body for background transparency
    document.body.classList.add('overlay-mode');

    // Parse options from URL query params
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme')?.toLowerCase();
    const goalParam = params.get('goal');
    const nameParam = params.get('name');
    const avatarParam = params.get('avatar');
    const subsParam = params.get('subs');
    const viewsParam = params.get('views');
    const videosParam = params.get('videos');
    const showStatsParam = params.get('showstats');
    const handleParam = params.get('handle') || params.get('channelId');
    const detailsParam = params.get('details');
    const minimalParam = params.get('minimal');
    const pollParam = params.get('poll') || params.get('interval');
    const simulateParam = params.get('simulate');

    if (themeParam === 'magenta') setTheme('magenta');
    if (themeParam === 'amber') setTheme('amber');
    if (themeParam === 'rainbow') setTheme('rainbow');
    
    if (goalParam) {
      const parsedGoal = parseInt(goalParam, 10);
      if (!isNaN(parsedGoal) && parsedGoal > 0) setGoal(parsedGoal);
    }

    if (nameParam) setCustomName(nameParam);
    if (avatarParam) setCustomAvatar(avatarParam);
    
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

    if (showStatsParam === 'false') {
      setShowStats(false);
    }

    if (handleParam) {
      setHandle(handleParam);
    }

    if (pollParam) {
      const parsedPoll = parseInt(pollParam, 10);
      if (!isNaN(parsedPoll) && parsedPoll > 0) {
        setPollInterval(parsedPoll);
      }
    }

    if (simulateParam === 'true') {
      setSimulate(true);
    }

    // Toggle minimal mode: default is true
    if (detailsParam === 'true' || minimalParam === 'false') {
      setMinimal(false);
    }

    return () => {
      document.body.classList.remove('overlay-mode');
    };
  }, []);

  // Effect to load YouTube channel stats with polling
  useEffect(() => {
    // If subscriber count is overridden, or if we are simulating, do not fetch API
    if (customSubs !== null || simulate) {
      return;
    }

    async function fetchStats(isPoll: boolean) {
      setIsSyncing(true);
      try {
        // Fetch public YouTube data (supports handle or UC channelId)
        const statsData = await getChannelStats(handle, isPoll);
        if (statsData) {
          setYtStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching YouTube stats:', err);
      } finally {
        setTimeout(() => setIsSyncing(false), 800);
      }
    }

    // Initial load
    fetchStats(false);

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchStats(true);
    }, pollInterval * 1000);

    return () => clearInterval(intervalId);
  }, [handle, pollInterval, simulate, customSubs]);

  // Effect to simulate subscriber ticks (helpful for testing/previews)
  useEffect(() => {
    if (!simulate) return;

    const baseSubs = customSubs !== null 
      ? customSubs 
      : (ytStats ? parseInt(ytStats.subscriberCount, 10) : 3530);

    if (simulatedSubs === null) {
      setSimulatedSubs(baseSubs);
    }

    const timer = setInterval(() => {
      setSimulatedSubs(prev => {
        if (prev === null) return baseSubs;
        // 30% chance to gain 1 sub
        return Math.random() > 0.7 ? prev + 1 : prev;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [simulate, ytStats, customSubs, simulatedSubs]);

  // Rotate active statistics slide every 5 seconds with slide-up transition
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTransitionEnd = () => {
    // There are 3 stats in the rotating list. When we reach index 3 (the clone),
    // we snap back to index 0 instantly without animation.
    if (currentIndex === 3) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };



  // Determine active values (custom URL override vs. fetched API vs. defaults)
  const displayName = customName || ytStats?.title || 'YATO KENJI';
  const displayAvatar = customAvatar || ytStats?.thumbnailUrl || '/assets/images/obs-mockup.png';
  
  const subscriberCount = simulate && simulatedSubs !== null
    ? simulatedSubs
    : (customSubs !== null 
        ? customSubs 
        : (ytStats ? parseInt(ytStats.subscriberCount, 10) : 3530));
    
  const viewCountStr = customViews !== null 
    ? customViews.toString() 
    : (ytStats ? ytStats.viewCount : '1240000');
    
  const videoCountStr = customVideos !== null 
    ? customVideos.toString() 
    : (ytStats ? ytStats.videoCount : '142');

  // Rotating statistics data
  const rotatingStatsList = [
    { value: formatCompactNumber(subscriberCount.toString()), label: 'ĐĂNG KÝ' },
    { value: formatCompactNumber(viewCountStr), label: 'LƯỢT XEM' },
    { value: videoCountStr, label: 'SỐ VIDEO' }
  ];


  // Calculations
  const progressPercent = Math.min((subscriberCount / goal) * 100, 100);
  const subsRemaining = Math.max(goal - subscriberCount, 0);

  // Theme colors configurations
  const themeColors = {
    cyan: '#00f0ff',
    magenta: '#ff0055',
    amber: '#ffaa00',
    rainbow: 'linear-gradient(90deg, #00f0ff, #ff0055)'
  };
  const activeColor = theme === 'rainbow' ? '#00f0ff' : themeColors[theme];

  // Minimal Mode: Render single statistic card rotating through sub, views, and video count
  if (minimal) {
    return (
      <div className="sub-overlay-wrapper">
        <div 
          className={`sub-minimal-card theme-${theme}`}
          style={{ 
            '--accent-color': activeColor,
            '--accent-gradient': themeColors[theme]
          } as React.CSSProperties}
        >
          {/* Futuristic Grid and Scanline Overlays */}
          <div className="scanline-overlay" />
          <div className="cyber-grid-overlay" />

          {/* Decorative elements */}
          <div className="corner-decor top-left" />
          <div className="corner-decor top-right" />
          <div className="corner-decor bottom-left" />
          <div className="corner-decor bottom-right" />

          <div className="minimal-slider-viewport">
            <div 
              className={`minimal-slider-track ${isTransitioning ? 'transition-active' : ''}`}
              style={{ transform: `translateY(-${currentIndex * 76}px)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {[...rotatingStatsList, rotatingStatsList[0]].map((stat, idx) => (
                <div key={idx} className="minimal-stat-slide">
                  <div className="minimal-count">{stat.value}</div>
                  <div className="minimal-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed Mode: Render full HUD statistics card showing Subs, Views, and Videos count
  return (
    <div className="sub-overlay-wrapper">
      <div 
        className={`sub-detail-card theme-${theme}`}
        style={{ 
          '--accent-color': activeColor,
          '--accent-gradient': themeColors[theme]
        } as React.CSSProperties}
      >
        {/* Futuristic Grid and Scanline Overlays */}
        <div className="scanline-overlay" />
        <div className="cyber-grid-overlay" />

        {/* Decorative elements */}
        <div className="corner-decor top-left" />
        <div className="corner-decor top-right" />
        <div className="corner-decor bottom-left" />
        <div className="corner-decor bottom-right" />
        
        {/* HUD Top Bar info */}
        <div className="card-top-hud">
          <div className="hud-id">{isSyncing ? 'SYS_STATUS: ĐỒNG BỘ...' : 'SYS_STATUS: TRỰC TUYẾN'}</div>
          <div className="hud-status">
            <span className={`live-pulse-dot ${isSyncing ? 'syncing' : ''}`} />
            <span>{isSyncing ? 'ĐANG CẬP NHẬT...' : 'ĐĂNG KÝ TRỰC TIẾP'}</span>
          </div>
        </div>

        {/* Channel Info section */}
        <div className="channel-profile-block">
          <div className="avatar-frame">
            <img src={displayAvatar} alt="Channel Avatar" className="avatar-img" />
            <div className="avatar-glow" />
          </div>
          <div className="channel-text-details">
            <h2 className="channel-name-glitch" data-text={displayName.toUpperCase()}>
              {displayName.toUpperCase()}
            </h2>
            <div className="channel-handle-hud">{handle.toUpperCase()}</div>
          </div>
        </div>

        {/* Main Subscriber count displaying */}
        <div className="subscriber-counter-container">
          <div className="counter-glow-effect" />
          <div className="counter-value">
            {formatCompactNumber(subscriberCount.toString())}
          </div>
          <div className="counter-label">TỔNG LƯỢT ĐĂNG KÝ</div>
        </div>

        {/* Cyberpunk Progress Bar */}
        <div className="goal-progress-section">
          <div className="goal-label-row">
            <span className="goal-tag">TIẾN TRÌNH MỤC TIÊU</span>
            <span className="goal-pct">{progressPercent.toFixed(1)}%</span>
          </div>
          
          <div className="goal-progress-track">
            <div className="goal-progress-fill-glow" style={{ width: `${progressPercent}%` }} />
            <div className="goal-progress-fill" style={{ width: `${progressPercent}%` }} />
            <div className="goal-progress-ticks">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>

          <div className="goal-info-row">
            <span className="goal-subs-target">MỤC TIÊU: {goal.toLocaleString()}</span>
            <span className="goal-remaining">CẦN THÊM: {subsRemaining.toLocaleString()}</span>
          </div>
        </div>

        {/* Channel Details Section (Views, Videos) */}
        {showStats && (
          <div className="channel-extra-stats">
            <div className="divider-line" />
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value">{formatCompactNumber(viewCountStr)}</span>
                <span className="stat-label">TỔNG LƯỢT XEM</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{videoCountStr}</span>
                <span className="stat-label">SỐ VIDEO</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer info line */}
        <div className="card-footer-hud">
          <span className="footer-code">SUBSCRIBER_FEED_V1.02</span>
          <span className="footer-deco-dots">...</span>
        </div>
      </div>
    </div>
  );
}
