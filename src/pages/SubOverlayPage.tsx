import { useEffect, useState } from 'react';
import '../styles/SubOverlayPage.css';
import { getChannelStats, getLiveStreamViewers, formatCompactNumber } from '../services/youtubeService';

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
  const [minimal, setMinimal] = useState<boolean>(true); // Default to minimal mode (Sub + Live Viewers)
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pollInterval, setPollInterval] = useState<number>(10); // Poll every 10s by default
  const [simulate, setSimulate] = useState<boolean>(false);
  const [simulatedSubs, setSimulatedSubs] = useState<number | null>(null);
  const [simulatedViewers, setSimulatedViewers] = useState<number | null>(null);
  const [liveViewers, setLiveViewers] = useState<number | null>(null);
  
  // Custom configuration overrides from URL parameters
  const [goal, setGoal] = useState<number>(4000);
  const [customName, setCustomName] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [customSubs, setCustomSubs] = useState<number | null>(null);
  const [customViews, setCustomViews] = useState<number | null>(null);
  const [customVideos, setCustomVideos] = useState<number | null>(null);
  const [customViewers, setCustomViewers] = useState<number | null>(null); // Live viewers override
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
    const viewersParam = params.get('viewers') || params.get('views_live');
    const showStatsParam = params.get('showstats');
    const handleParam = params.get('handle') || params.get('channelId'); // Support channelId directly
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

    if (viewersParam) {
      const parsedViewers = parseInt(viewersParam, 10);
      if (!isNaN(parsedViewers) && parsedViewers >= 0) setCustomViewers(parsedViewers);
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

    // Toggle minimal mode: default is true (show Sub + Live Viewers side-by-side)
    if (detailsParam === 'true' || minimalParam === 'false') {
      setMinimal(false);
    }

    return () => {
      document.body.classList.remove('overlay-mode');
    };
  }, []);

  // Effect to load YouTube channel stats and concurrent viewers with polling
  useEffect(() => {
    async function fetchStats(isPoll: boolean) {
      setIsSyncing(true);
      try {
        // Fetch public YouTube data (supports handle or UC channelId)
        const statsData = await getChannelStats(handle, isPoll);
        
        if (statsData) {
          setYtStats(statsData);

          // Fetch live concurrent viewers using the channel ID
          if (customViewers === null) {
            const viewers = await getLiveStreamViewers(statsData.id);
            setLiveViewers(viewers);
          }
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
  }, [handle, pollInterval, customViewers]);

  // Effect to simulate subscriber and viewer ticks (helpful for testing/previews)
  useEffect(() => {
    if (!simulate) return;

    const baseSubs = customSubs !== null 
      ? customSubs 
      : (ytStats ? parseInt(ytStats.subscriberCount, 10) : 3530);

    const baseViewers = customViewers !== null
      ? customViewers
      : (liveViewers !== null ? liveViewers : 45);

    if (simulatedSubs === null) {
      setSimulatedSubs(baseSubs);
    }
    if (simulatedViewers === null) {
      setSimulatedViewers(baseViewers);
    }

    const timer = setInterval(() => {
      setSimulatedSubs(prev => {
        if (prev === null) return baseSubs;
        // 30% chance to gain 1 sub
        return Math.random() > 0.7 ? prev + 1 : prev;
      });
      
      setSimulatedViewers(prev => {
        if (prev === null) return baseViewers;
        // Randomly fluctuate viewers by +/- 1-3 viewers
        const change = Math.floor(Math.random() * 7) - 3;
        return Math.max(prev + change, 0);
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [simulate, ytStats, customSubs, customViewers, liveViewers, simulatedSubs, simulatedViewers]);

  // Determine active values (custom URL override vs. fetched API vs. defaults)
  const displayName = customName || ytStats?.title || 'YATO KENJI';
  const displayAvatar = customAvatar || ytStats?.thumbnailUrl || '/assets/images/obs-mockup.png';
  
  const subscriberCount = simulate && simulatedSubs !== null
    ? simulatedSubs
    : (customSubs !== null 
        ? customSubs 
        : (ytStats ? parseInt(ytStats.subscriberCount, 10) : 3530));

  const activeViewers = customViewers !== null
    ? customViewers
    : (simulate && simulatedViewers !== null
        ? simulatedViewers
        : liveViewers);
    
  const viewCountStr = customViews !== null 
    ? customViews.toString() 
    : (ytStats ? ytStats.viewCount : '1240000');
    
  const videoCountStr = customVideos !== null 
    ? customVideos.toString() 
    : (ytStats ? ytStats.videoCount : '142');

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

  // Minimal Mode: Render subscriber count and live viewers side-by-side
  if (minimal) {
    return (
      <div className="sub-overlay-wrapper">
        <div 
          className={`sub-minimal-card combined theme-${theme}`}
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
          
          {/* Real-time status sync indicator */}
          <div className={`minimal-sync-indicator ${isSyncing ? 'active' : ''}`}>
            {isSyncing ? 'SYNCING' : 'LIVE'}
          </div>

          <div className="minimal-split-box">
            <div className="minimal-count">
              {formatCompactNumber(subscriberCount.toString())}
            </div>
            <div className="minimal-label">SUBSCRIBERS</div>
          </div>

          <div className="minimal-divider"></div>

          <div className="minimal-split-box">
            <div className={`minimal-count ${activeViewers !== null ? 'live-accent-text' : 'offline-text'}`}>
              {activeViewers !== null ? activeViewers.toLocaleString() : 'OFFLINE'}
            </div>
            <div className="minimal-label">LIVE VIEWERS</div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed Mode: Render full HUD statistics card
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
          <div className="hud-id">{isSyncing ? 'SYS_STATUS: SYNCING...' : 'SYS_STATUS: ONLINE'}</div>
          <div className="hud-status">
            <span className={`live-pulse-dot ${isSyncing ? 'syncing' : (activeViewers !== null ? 'active-live' : '')}`} />
            <span>{isSyncing ? 'SYNCING...' : 'LIVE SUBSCRIBERS'}</span>
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
          <div className="counter-label">TOTAL SUBSCRIBERS</div>
        </div>

        {/* Cyberpunk Progress Bar */}
        <div className="goal-progress-section">
          <div className="goal-label-row">
            <span className="goal-tag">GOAL PROGRESS</span>
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
            <span className="goal-subs-target">TARGET: {goal.toLocaleString()}</span>
            <span className="goal-remaining">{subsRemaining.toLocaleString()} TO GO</span>
          </div>
        </div>

        {/* Channel Details Section (Views, Videos, Live viewers) */}
        {showStats && (
          <div className="channel-extra-stats">
            <div className="divider-line" />
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value">{formatCompactNumber(viewCountStr)}</span>
                <span className="stat-label">TOTAL VIEWS</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{videoCountStr}</span>
                <span className="stat-label">VIDEOS</span>
              </div>
              
              {/* Live concurrent viewers display */}
              <div className="stat-box">
                <span className={`stat-value ${activeViewers !== null ? 'live-accent' : 'offline-text'}`}>
                  {activeViewers !== null ? activeViewers.toLocaleString() : 'OFFLINE'}
                </span>
                <span className="stat-label">LIVE VIEWERS</span>
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
