import { useEffect, useState, useRef } from 'react';
import '../styles/EndStreamOverlayPage.css';
import { useI18n } from '../i18n';
import { getChannelStats, getLatestNotifications, type YouTubeStats, type YouTubeNotification } from '../services/youtubeService';

const POCHACCO_GIFS = [
  'https://media.tenor.com/hcqMKPFXVNsAAAAj/cute-funny.gif',
  'https://media.tenor.com/i7ir6sHYaToAAAAj/dancing-dog-dancing-pochacco.gif',
  'https://media.tenor.com/LliOta9Fa8wAAAAj/pochacco-dancing-pochacco.gif',
  'https://media.tenor.com/mhV0m-KGkscAAAAj/dancing-pochacco-dancing-dog.gif',
  'https://media.tenor.com/ZqUoQQ4kou8AAAAi/ted-puppy.gif',
  'https://media.tenor.com/ImNcEfxo8kEAAAAi/dancing-dance.gif'
];

const DEFAULT_VIDEO_1 = '5qap5aO4i9A'; // lofi hip hop radio
const DEFAULT_VIDEO_2 = 'jfKfPfyJRdk'; // Lofi Girl


export function EndStreamOverlayPage() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<'cyan' | 'magenta' | 'amber' | 'rainbow'>('cyan');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ytStats, setYtStats] = useState<YouTubeStats | null>(null);
  const [youtubeHandle, setYoutubeHandle] = useState('@YatoKenji');
  const [latestVideos, setLatestVideos] = useState<YouTubeNotification[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initAudioAnalyzer = () => {
    if (!audioRef.current || audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) {
      console.error("Failed to initialize Web Audio API analyzer:", e);
    }
  };

  // Close audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Listen for first interaction to unlock audio in standard browsers
  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(prev => {
        if (!prev) {
          setIsPlaying(true);
          return true;
        }
        return prev;
      });
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Play/pause local audio element
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Silent catch for autoplay block
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, userInteracted]);


  // States for dynamic rendering
  const [activeGifIdx, setActiveGifIdx] = useState(0);
  const [gifTransition, setGifTransition] = useState<'in' | 'out'>('in');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fps, setFps] = useState(60.0);
  const [ping, setPing] = useState(12);
  const [audioData, setAudioData] = useState<number[]>(new Array(28).fill(10));

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
          // Fetch latest videos to display in monitors
          const videos = await getLatestNotifications(statsData.id, 5);
          if (videos && videos.length > 0) {
            setLatestVideos(videos);
          }
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

  // Audio wave simulated visualizer or real-time frequency visualizer
  useEffect(() => {
    let animationId: number;
    const dataArray = new Uint8Array(32); // fftSize 64 gives 32 bins
    const smoothedHeights = new Array(28).fill(5); // Cache heights for frame-by-frame interpolation

    const generateWave = () => {
      if (!isPlaying) {
        // Smoothly glide down to flat bars on pause
        setAudioData(() => {
          for (let i = 0; i < 28; i++) {
            smoothedHeights[i] = smoothedHeights[i] + (5 - smoothedHeights[i]) * 0.15;
          }
          return [...smoothedHeights];
        });
        animationId = requestAnimationFrame(generateWave);
        return;
      }

      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioData(() => {
          const newHeights: number[] = [];
          for (let i = 0; i < 28; i++) {
            // Map index i (0 to 27) to analyzer data index (0 to 19 for low/mid frequencies)
            const dataIndex = Math.floor((i / 28) * 20);
            const val = dataArray[dataIndex] || 0;
            // Normalize 0-255 to 5-65%
            const targetHeight = Math.max(5, Math.min(65, (val / 255) * 60 + 5));

            // Smooth interpolation (lerp)
            // Asymmetrical: fast rise (0.3) for responsiveness, slow decay (0.15) for smooth flow
            const current = smoothedHeights[i];
            const lerpRate = targetHeight > current ? 0.3 : 0.15;
            smoothedHeights[i] = current + (targetHeight - current) * lerpRate;

            newHeights.push(smoothedHeights[i]);
          }
          return newHeights;
        });
      } else {
        // Fallback to simulated sine wave if analyzer is not ready yet
        const time = Date.now() * 0.003;
        setAudioData(() => {
          for (let i = 0; i < 28; i++) {
            const sineValue1 = Math.sin(time * 1.5 + i * 0.3);
            const sineValue2 = Math.cos(time * 2.3 - i * 0.15);
            const rawHeight = 22 + sineValue1 * 18 + sineValue2 * 12;
            const jitter = Math.random() * 6 - 3;
            const targetHeight = Math.max(5, Math.min(65, rawHeight + jitter));

            const current = smoothedHeights[i];
            smoothedHeights[i] = current + (targetHeight - current) * 0.2;
          }
          return [...smoothedHeights];
        });
      }
      animationId = requestAnimationFrame(generateWave);
    };

    animationId = requestAnimationFrame(generateWave);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

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

  const video1Id = latestVideos[0]?.videoId || DEFAULT_VIDEO_1;
  const video2Id = latestVideos[1]?.videoId || latestVideos[0]?.videoId || DEFAULT_VIDEO_2;

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

            {/* Twin Monitors at the Bottom Left */}
            <div className="twin-monitors-container">
              {/* Monitor 1: Webcam */}
              <div className="video-monitor-window cam-monitor" style={{ borderColor: activeColor }}>
                <div className="monitor-corner top-left" style={{ borderColor: activeColor }} />
                <div className="monitor-corner top-right" style={{ borderColor: activeColor }} />
                <div className="monitor-corner bottom-left" style={{ borderColor: activeColor }} />
                <div className="monitor-corner bottom-right" style={{ borderColor: activeColor }} />

                <div className="monitor-header">
                  <div className="monitor-title">
                    <span className="rec-dot" />
                    <span>VIDEO_01.bin</span>
                  </div>
                  <div className="monitor-status">ONLINE</div>
                </div>

                <div className="monitor-body-transparent">
                  {video1Id ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video1Id}?autoplay=1&mute=1&loop=1&playlist=${video1Id}&controls=0&modestbranding=1&iv_load_policy=3&rel=0`}
                      title="Cam 1 Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="monitor-iframe"
                    />
                  ) : null}
                  <div className="viewfinder-corners" />
                  <span className="placeholder-text-monitor">WEBCAM LAYER</span>
                </div>

                <div className="monitor-footer">
                  <span className="freq-lbl">FREQ: 60Hz</span>
                  <span className="res-lbl">RAW</span>
                </div>
              </div>

              {/* Monitor 2: Gameplay / Outro */}
              <div className="video-monitor-window stream-monitor" style={{ borderColor: activeColor }}>
                <div className="monitor-corner top-left" style={{ borderColor: activeColor }} />
                <div className="monitor-corner top-right" style={{ borderColor: activeColor }} />
                <div className="monitor-corner bottom-left" style={{ borderColor: activeColor }} />
                <div className="monitor-corner bottom-right" style={{ borderColor: activeColor }} />

                <div className="monitor-header">
                  <div className="monitor-title">
                    <span className="rec-dot" />
                    <span>VIDEO_02.bin</span>
                  </div>
                  <div className="monitor-status">ONLINE</div>
                </div>

                <div className="monitor-body-transparent">
                  {video2Id ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video2Id}?autoplay=1&mute=1&loop=1&playlist=${video2Id}&controls=0&modestbranding=1&iv_load_policy=3&rel=0`}
                      title="Cam 2 Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="monitor-iframe"
                    />
                  ) : null}
                  <div className="viewfinder-corners" />
                  <span className="placeholder-text-monitor">OUTRO / GAMEPLAY LAYER</span>
                </div>

                <div className="monitor-footer">
                  <span className="freq-lbl">FREQ: 60Hz</span>
                  <span className="res-lbl">RAW</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Music player at top, Visualizer & Social Card at bottom */}
          <div className="right-panel">
            {/* Top Right Music Player Widget */}
            <div className="top-right-music-widget" onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>
              <div className="widget-header">
                <div className="pulse-indicator">
                  <span className={`pulse-core ${!isPlaying ? 'paused' : ''}`} />
                  {isPlaying && <span className="pulse-ring" />}
                </div>
                <span>LOCAL_AUDIO_STREAM.exe</span>
                <span className={`play-status-lbl ${!isPlaying ? 'paused' : ''}`}>
                  {isPlaying ? 'PLAYING' : 'PAUSED'}
                </span>
              </div>
              <div className="widget-body">
                <div className="vinyl-disk-container">
                  <div className={`vinyl-disk ${!isPlaying ? 'paused' : ''}`} />
                </div>
                <div className="track-info">
                  <div className="now-playing-tag">NOW PLAYING</div>
                  <div className="track-name-scroll" title="Kontraa - No Sleep">
                    Kontraa - No Sleep
                  </div>
                  <div className="audio-telemetry">FREQ: 44.1kHz | FORMAT: MP3</div>
                </div>
              </div>
              <audio
                ref={audioRef}
                src="/kontraa-no-sleep-hiphop-music-473847.mp3"
                loop
                style={{ display: 'none' }}
                onPlay={() => {
                  initAudioAnalyzer();
                  if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                    audioCtxRef.current.resume();
                  }
                }}
              />
            </div>

            <div className="bottom-right-container">
              {/* Audio Visualizer */}
              <div className="visualizer-container">
                <div className="visualizer-header">
                  <svg className="audio-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 3v18c-4.97 0-9-4.03-9-9s4.03-9 9-9zm0-2C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 15.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z"/>
                  </svg>
                  <span className="scrolling-text" title="AUDIO_SPECTRUM.bin">
                    AUDIO_SPECTRUM.bin
                  </span>
                </div>
                <div className="visualizer-bars">
                  {audioData.map((height, i) => (
                    <div
                      key={i}
                      className="visualizer-bar"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

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
