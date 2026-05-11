import { useState,useEffect } from 'react'
import '../styles/HomePage.css'

// Giả lập hook i18n
const useI18n = () => ({ toggleLocale: () => console.log('Đổi ngôn ngữ') })

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="cyber-metric">
      <span className="metric-label">[{label}]</span>
      <span className="metric-value">{value}</span>
    </div>
  )
}

export function StreamerProfilePage({
  onOpenChat,
}: {
  onOpenFonts?: () => void
  onOpenChat?: () => void
}) {
  const { toggleLocale } = useI18n()
  const [profileMode, setProfileMode] = useState<'streamer' | 'developer'>('streamer')
  const [selectedImage, setSelectedImage] = useState<{ src: string; name: string } | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isRebooting, setIsRebooting] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [activeTerminal, setActiveTerminal] = useState<'music' | 'obs' | null>(null)
  
  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      setActiveTerminal('music'); // Focus on one after loading
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Terminal states
  const [terminals, setTerminals] = useState({
    music: { isOpen: true, isMinimized: false, isMaximized: false, pos: { x: 0, y: 0 }, oldPos: { x: 0, y: 0 }, zIndex: 1 },
    obs: { isOpen: true, isMinimized: false, isMaximized: false, pos: { x: 0, y: 0 }, oldPos: { x: 0, y: 0 }, zIndex: 1 }
  })

  const [dragging, setDragging] = useState<{ id: 'music' | 'obs', startX: number, startY: number } | null>(null)

  const bringToFront = (id: 'music' | 'obs') => {
    setActiveTerminal(id);
    setTerminals(prev => {
      const maxZ = Math.max(prev.music.zIndex, prev.obs.zIndex);
      if (prev[id].zIndex >= maxZ && maxZ > 1) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], zIndex: maxZ + 1 }
      };
    });
  }

  const toggleMinimize = (id: 'music' | 'obs') => {
    bringToFront(id);
    setTerminals(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: !prev[id].isMinimized }
    }))
  }

  const toggleMaximize = (id: 'music' | 'obs') => {
    bringToFront(id);
    setTerminals(prev => {
      const terminal = prev[id];
      if (terminal.isMaximized) {
        return {
          ...prev,
          [id]: { 
            ...terminal, 
            isMaximized: false, 
            pos: terminal.oldPos 
          }
        };
      } else {
        return {
          ...prev,
          [id]: { 
            ...terminal, 
            isMaximized: true, 
            isMinimized: false,
            oldPos: { ...terminal.pos },
            pos: { x: 0, y: 0 } 
          }
        };
      }
    });
  }

  const closeTerminal = (id: 'music' | 'obs') => {
    if (activeTerminal === id) setActiveTerminal(null);
    setTerminals(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }))
  }

  const reopenTerminals = () => {
    setIsRebooting(true);
    // Simulate system reboot delay
    setTimeout(() => {
      setTerminals(prev => ({
        music: { ...prev.music, isOpen: true },
        obs: { ...prev.obs, isOpen: true }
      }));
      setIsRebooting(false);
      setActiveTerminal('obs'); // Focus on one by default
    }, 1200);
  }

  const isAnyTerminalClosed = !terminals.music.isOpen || !terminals.obs.isOpen;

  const handleMouseDown = (id: 'music' | 'obs', e: React.MouseEvent) => {
    bringToFront(id);
    // Only drag from the header, not controls
    if ((e.target as HTMLElement).closest('.term-controls')) return
    
    // Auto restore if dragging a maximized window
    if (terminals[id].isMaximized) {
      const restoredPos = terminals[id].oldPos;
      toggleMaximize(id);
      setDragging({
        id,
        startX: e.clientX - restoredPos.x,
        startY: e.clientY - restoredPos.y
      })
      return; 
    }
    
    setDragging({
      id,
      startX: e.clientX - terminals[id].pos.x,
      startY: e.clientY - terminals[id].pos.y
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setTerminals(prev => ({
          ...prev,
          [dragging.id]: {
            ...prev[dragging.id],
            pos: {
              x: e.clientX - dragging.startX,
              y: e.clientY - dragging.startY
            }
          }
        }))
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
    }

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging])

  const donateMethods = [
    {
      id: 'playerduo',
      name: 'PLAYERDUO',
      url: 'https://playerduo.net/example',
      color: 'var(--magenta)',
      btnClass: 'outline-magenta'
    },
    {
      id: 'wescan',
      name: 'WESCAN',
      url: 'https://wescan.vn/example',
      color: 'var(--magenta)',
      btnClass: 'outline-magenta'
    }
  ]
  const [activeDonateIdx, setActiveDonateIdx] = useState(0)
  const activeDonate = donateMethods[activeDonateIdx]

  const nextDonate = () => {
    setActiveDonateIdx((prev) => (prev + 1) % donateMethods.length)
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const galleryItems = [
    { id: 1, src: "https://picsum.photos/id/1/1200/900", thumb: "https://picsum.photos/id/1/400/300", name: "CHAT_THEME_01.PNG", date: "10.05.2026" },
    { id: 2, src: "https://picsum.photos/id/2/1200/900", thumb: "https://picsum.photos/id/2/400/300", name: "NEON_PREVIEW.PNG", date: "09.05.2026" },
    { id: 3, src: "https://picsum.photos/id/3/1200/900", thumb: "https://picsum.photos/id/3/400/300", name: "GLASS_EFFECT.PNG", date: "08.05.2026" },
    { id: 4, src: "https://picsum.photos/id/4/1200/900", thumb: "https://picsum.photos/id/4/400/300", name: "SETUP_OBS.PNG", date: "07.05.2026" },
  ]

  return (
    <main className={`cyber-home mode-${profileMode}`}>
      {/* ================================================= */}
      {/* HEADER NAVIGATION */}
      {/* ================================================= */}
      <header className="cyber-header">
        <div className="brand-block">
          <div className="brand-text">
            <strong>[DEVSTREAMER]</strong>
            <span>CODE & CHILL</span>
          </div>
        </div>

        {/* Nút Switch Profile */}
        <div className="mode-switch">
          <button
            className={profileMode === 'streamer' ? 'active magenta-glow' : ''}
            onClick={() => setProfileMode('streamer')}
          >
            [ STREAMER ]
          </button>
          <button
            className={profileMode === 'developer' ? 'active cyan-glow' : ''}
            onClick={() => setProfileMode('developer')}
          >
            [ DEVELOPER ]
          </button>
        </div>

        <nav className="cyber-nav" aria-label="Primary">
          <a href="#overview">PROFILE</a>
          <a href="#chat-themes">OVERLAYS</a>
          <a href="#activity">DONATE HISTORY</a>
          <a href="#obs-setup">OBS SETUP</a>
        </nav>

        <button type="button" className="cyber-btn-outline" onClick={toggleLocale}>
          VN | EN
        </button>
      </header>

      {/* ================================================= */}
      {/* HERO SECTION */}
      {/* ================================================= */}
      <section className="cyber-hero" id="overview">
        <div className="hero-content">
          <div className="badge-wrapper">
            <span className="cyber-badge">YOUTUBE PARTNER</span>
          </div>
          <h1 className="glitch-text" data-text="CHÀO, MÌNH LÀ CODELIVE">
            CHÀO, MÌNH LÀ CODELIVE
          </h1>
          <p className="hero-lead">
            {profileMode === 'streamer'
              ? 'Full-stack Developer chuyên Live Stream viết code trên các nền tảng. Tại đây bạn có thể lấy các mẫu custom chat overlays cực chất cho OBS.'
              : 'Software Engineer đam mê xây dựng các hệ thống Scalable và Interactive UI. Nhận thiết kế và tối ưu hóa hệ thống Web/App hiệu suất cao.'}
          </p>

          <div className="platform-tags">
            <span className="plat-tag active">YOUTUBE</span>
            <span className="plat-tag">TWITCH</span>
            <span className="plat-tag">FB GAMING</span>
          </div>

          <div className="hero-actions">
            <button type="button" className="cyber-btn primary-cyan" onClick={onOpenChat}>
              OPEN CHAT EDITOR
            </button>
            <button type="button" className="cyber-btn outline-magenta">
              COPY LINK OBS
            </button>
          </div>

          <div className="cyber-metrics" aria-label="Channel metrics">
            <Metric label="SUBSCRIBERS" value="12.5K" />
            <Metric label="CHAT THEMES" value="45+" />
            <Metric label="TỔNG GIỜ LIVE" value="1,240H" />
          </div>
        </div>

        {/* STATUS PANEL */}
        <aside className="cyber-panel status-panel">
          <div className="panel-head">
            <span className="blink-dot" />
            <strong>[LIVE: YOUTUBE]</strong>
          </div>
          <div className="panel-body">
            <p className="highlight-text">
              {'>'} CHỦ ĐỀ: BUILD GIAO DIỆN CHAT YOUTUBE PHONG CÁCH CYBERPUNK
            </p>
            <div className="tech-tags">
              <span>#YouTubeLive</span>
              <span>#ReactJS</span>
              <span>#CSS</span>
            </div>
          </div>
        </aside>
      </section>

      {/* ================================================= */}
      {/* FEATURE CARDS */}
      {/* ================================================= */}
      <section className="cyber-section" id="chat-themes">
        <div className="feature-grid">
          <article className="cyber-card">
            <h3>[ GLASSMORPHISM UI ]</h3>
            <p>Giao diện kính mờ hiện đại, xuyên thấu nền game. Hỗ trợ đầy đủ badges.</p>
          </article>
          <article className="cyber-card card-magenta">
            <h3>[ CYBERPUNK NEON ]</h3>
            <p>Phong cách viễn tưởng với viền sáng neon nhấp nháy mỗi khi có SuperChat.</p>
          </article>
          <article className="cyber-card card-green">
            <h3>[ TERMINAL HACKER ]</h3>
            <p>Biến khung chat thành màn hình Console đậm chất lập trình viên.</p>
          </article>
        </div>
      </section>

      {/* INITIAL SYSTEM BOOT OVERLAY */}
      {isInitialLoading && (
        <div className="reboot-overlay initial-boot">
          <div className="reboot-content">
            <div className="reboot-glitch" data-text="BOOTING_SYSTEM...">BOOTING_SYSTEM...</div>
            <div className="reboot-bar">
              <div className="reboot-fill" style={{ animationDuration: '2.5s' }}></div>
            </div>
            <div className="reboot-logs">
              <p className="log-entry">{'>'} INITIALIZING CORE...</p>
              <p className="log-entry delay-1" style={{ animationDelay: '0.6s' }}>{'>'} LOADING OVERLAYS...</p>
              <p className="log-entry delay-2" style={{ animationDelay: '1.2s' }}>{'>'} ESTABLISHING CONNECTION...</p>
              <p className="log-entry" style={{ animationDelay: '1.8s', opacity: 0, animationFillMode: 'forwards' }}>{'>'} SYSTEM READY.</p>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM REBOOT OVERLAY */}
      {isRebooting && (
        <div className="reboot-overlay">
          <div className="reboot-content">
            <div className="reboot-glitch" data-text="SYSTEM_REBOOTING...">SYSTEM_REBOOTING...</div>
            <div className="reboot-bar">
              <div className="reboot-fill"></div>
            </div>
            <div className="reboot-logs">
              <p className="log-entry">{'>'} LOADING KERNEL...</p>
              <p className="log-entry delay-1">{'>'} MOUNTING FILE SYSTEMS...</p>
              <p className="log-entry delay-2">{'>'} STARTING CYBER_CORE.EXE...</p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* TERMINAL SPLIT BAND */}
      {/* ================================================= */}
      <section className="cyber-split" id="activity">
        {/* LIVE FEED */}
        {terminals.music.isOpen && (
          <div 
            className={`cyber-terminal ${terminals.music.isMinimized ? 'minimized' : ''} ${terminals.music.isMaximized ? 'maximized' : ''} ${dragging?.id === 'music' ? 'dragging' : ''} ${activeTerminal === 'music' ? 'active' : ''}`}
            style={{ 
              transform: `translate(${terminals.music.pos.x}px, ${terminals.music.pos.y}px)`,
              zIndex: terminals.music.zIndex
            }}
            onMouseDown={() => bringToFront('music')}
          >
            <div className="term-head head-green" onMouseDown={(e) => handleMouseDown('music', e)}>
              <span>MUSIC_CHILL.exe</span>
              <div className="term-controls">
                <span className="ctrl minimize" onClick={() => toggleMinimize('music')} />
                <span className="ctrl maximize" onClick={() => toggleMaximize('music')} />
                <span className="ctrl close" onClick={() => closeTerminal('music')} />
              </div>
            </div>
            {!terminals.music.isMinimized && (
              <div className="term-body music-player-body">
                <div className="music-main">
                  <div className="disc-container">
                    <div className="music-disc">
                      <div className="disc-inner">
                        <div className="disc-label">
                          <div className="disc-dot" />
                        </div>
                      </div>
                    </div>
                    <div className="disc-arm" />
                  </div>
                  <div className="music-info">
                    <p className="song-title">Rainy Night in Tokyo</p>
                    <p className="song-artist">Lofi Girl / Chillhop</p>
                    <div className="music-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" />
                      </div>
                      <div className="time-info">
                        <span>01:45</span>
                        <span>03:20</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="music-controls">
                  <button className="m-btn">{'<<'}</button>
                  <button className="m-btn play-btn">PAUSE</button>
                  <button className="m-btn">{'>>'}</button>
                  <div className="volume-slider">
                    <span>VOL</span>
                    <div className="vol-bar"><div className="vol-fill" /></div>
                  </div>
                </div>
                <div className="music-list custom-scrollbar">
                  <div className="song-item active">
                    <span className="status-icon">▶</span>
                    <span className="s-name">Rainy Night in Tokyo</span>
                    <span className="s-time">03:20</span>
                  </div>
                  <div className="song-item">
                    <span className="status-icon"> </span>
                    <span className="s-name">Cyberpunk City Lights</span>
                    <span className="s-time">04:15</span>
                  </div>
                  <div className="song-item">
                    <span className="status-icon"> </span>
                    <span className="s-name">Neon Dreams (Slowed)</span>
                    <span className="s-time">02:50</span>
                  </div>
                  <div className="song-item">
                    <span className="status-icon"> </span>
                    <span className="s-name">Midnight Protocol</span>
                    <span className="s-time">03:45</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OBS SETUP */}
        {terminals.obs.isOpen && (
          <div 
            className={`cyber-terminal ${terminals.obs.isMinimized ? 'minimized' : ''} ${terminals.obs.isMaximized ? 'maximized' : ''} ${dragging?.id === 'obs' ? 'dragging' : ''} ${activeTerminal === 'obs' ? 'active' : ''}`} 
            id="obs-setup"
            style={{ 
              transform: `translate(${terminals.obs.pos.x}px, ${terminals.obs.pos.y}px)`,
              zIndex: terminals.obs.zIndex
            }}
            onMouseDown={() => bringToFront('obs')}
          >
            <div className="term-head head-cyan" onMouseDown={(e) => handleMouseDown('obs', e)}>
              <span>OBS_SETUP.txt</span>
              <div className="term-controls">
                <span className="ctrl minimize" onClick={() => toggleMinimize('obs')} />
                <span className="ctrl maximize" onClick={() => toggleMaximize('obs')} />
                <span className="ctrl close" onClick={() => closeTerminal('obs')} />
              </div>
            </div>
            {!terminals.obs.isMinimized && (
              <div className="term-body">
                <p className="sys-text">{'>'} TÍCH HỢP OBS BROWSER</p>
                <p>Hướng dẫn cài đặt:</p>
                <p>1. Click [OPEN CHAT EDITOR] để tùy chỉnh.</p>
                <p>2. Copy đường dẫn CSS sinh ra.</p>
                <p>3. Thêm Browser Source vào OBS, dán link YouTube Chat và chèn CSS vào "Custom CSS".</p>
                <p className="blink-cursor">_</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================================================= */}
      {/* PHOTO GALLERY */}
      {/* ================================================= */}
      <section className="cyber-section" id="gallery">
        <div className="section-head">
          <span className="badge badge-secondary">SNAPSHOTS</span>
          <h2>[ SYSTEM_GALLERY.img ]</h2>
        </div>
        <div className="gallery-viewport">
          <div className="gallery-track">
            {/* Original Items */}
            {galleryItems.map((item) => (
              <div 
                className="gallery-item" 
                key={item.id}
                onClick={() => setSelectedImage({ src: item.src, name: item.name })}
              >
                <div className="img-frame">
                  <img src={item.thumb} alt={item.name} />
                  <div className="scanline" />
                </div>
                <div className="img-meta">
                  <span className="file-name">{item.name}</span>
                  <span className="file-date">{item.date}</span>
                </div>
              </div>
            ))}
            {/* Duplicated Items for Seamless Loop */}
            {galleryItems.map((item) => (
              <div 
                className="gallery-item" 
                key={`dup-${item.id}`}
                onClick={() => setSelectedImage({ src: item.src, name: item.name })}
              >
                <div className="img-frame">
                  <img src={item.thumb} alt={item.name} />
                  <div className="scanline" />
                </div>
                <div className="img-meta">
                  <span className="file-name">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* SCHEDULE & SOCIAL */}
      {/* ================================================= */}
      <section className="cyber-grid-2-1" id="social-schedule">
        {/* STREAM SCHEDULE */}
        <div className="cyber-panel schedule-panel">
          <div className="panel-head">
            <span className="blink-dot green" />
            <strong>[SYSTEM_SCHEDULE.log]</strong>
          </div>
          <div className="panel-body">
            <div className="schedule-table">
              <div className="sched-row">
                <span className="day">MON-WED</span>
                <span className="task">CODE & CHILL</span>
                <span className="time">21:00</span>
              </div>
              <div className="sched-row highlight">
                <span className="day">THU-FRI</span>
                <span className="task">GAMING NIGHT</span>
                <span className="time">22:30</span>
              </div>
              <div className="sched-row">
                <span className="day">SATURDAY</span>
                <span className="task">COMMUNITY DAY</span>
                <span className="time">14:00</span>
              </div>
              <div className="sched-row">
                <span className="day">SUNDAY</span>
                <span className="task">SYSTEM REBOOT</span>
                <span className="time">OFFLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* DISCORD PROMO */}
        <div className="cyber-panel discord-panel">
          <div className="panel-head">
            <strong>[JOIN_COMMUNITY]</strong>
          </div>
          <div className="panel-body discord-content">
            <div className="discord-logo-wrap">
              <svg className="discord-icon" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.21,16.15c2.45-3.35,4.63-6.9,6.51-10.63a67.06,67.06,0,0,1-10.41-5c.87-.64,1.71-1.31,2.53-2a82.5,82.5,0,0,0,51.84,0c.81.69,1.66,1.36,2.53,2a67.1,67.1,0,0,1-10.41,5c1.88,3.73,4.06,7.28,6.51,10.63a105.4,105.4,0,0,0,32.24-16.15C129.58,51,123.46,27.35,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.92,53.9,53,48.74,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.43-12.74S96.11,45.92,96.11,53,91,65.69,82.69,65.69Z" />
              </svg>
            </div>
            <h3>SERVER DISCORD</h3>
            <p>Nơi giao lưu, chia sẻ kinh nghiệm về stream và code.</p>
            <button className="cyber-btn primary-cyan discord-btn">JOIN NOW</button>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* DONATE SECTION */}
      {/* ================================================= */}
      <section className="cyber-section donate-section" id="donate">
        <div className="section-head">
          <span className="badge badge-primary">SUPPORT_ME</span>
          <h2>[ SYSTEM_DONATE.exe ]</h2>
        </div>
        
        <div className="donate-container">
          <div className={`donate-card glass-card method-${activeDonate.id}`}>
            <div className="donate-info">
              <div className="method-header">
                <span className="donate-method-tag" style={{ borderColor: activeDonate.color, color: activeDonate.color }}>
                  {activeDonate.name}
                </span>
                <div className="method-status">
                  <span className="blink-dot"></span> ONLINE
                </div>
              </div>
              
              <p className="sys-text">Nếu bạn yêu thích những gì mình chia sẻ, hãy ủng hộ mình qua {activeDonate.name} nhé! Mỗi sự đóng góp đều là nguồn động lực lớn.</p>
              
              <div className="donate-actions">
                <a href={activeDonate.url} target="_blank" rel="noopener noreferrer" className={`cyber-btn ${activeDonate.btnClass}`}>
                  DONATE VIA {activeDonate.name}
                </a>
              </div>
              
              <div className="donate-msg">
                <span className="msg-tag">[MEMO]</span>
                <p>Nội dung: [Tên của bạn] - Ung ho ChatVOBS</p>
              </div>
            </div>
            
            <div className="donate-qr-wrapper">
              <div className="qr-container">
                <div className="qr-frame">
                  <img 
                    key={activeDonate.id}
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeDonate.url}`} 
                    alt={`QR ${activeDonate.name}`} 
                  />
                  <div className="scan-line-anim" />
                </div>
                <span className="qr-label">SCAN TO DONATE</span>
              </div>
            </div>

            <button className="donate-next-btn" onClick={nextDonate} title="Switch Method">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              <span className="next-label">NEXT</span>
            </button>
          </div>
        </div>
      </section>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setSelectedImage(null)}>×</button>
            <img src={selectedImage.src} alt={selectedImage.name} />
            <div className="image-modal-info">
              <h4>{selectedImage.name}</h4>
            </div>
          </div>
        </div>
      )}
      {/* SCROLL TO TOP BUTTON */}
      <button 
        className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 13 12 7 6 13"></polyline>
          <polyline points="16 19 12 15 8 19" className="sub-arrow" strokeWidth="2"></polyline>
        </svg>
      </button>

      {/* RESTORE TERMINALS BUTTON */}
      <button 
        className={`restore-terminals-btn ${isAnyTerminalClosed ? 'visible' : ''}`} 
        onClick={reopenTerminals}
        aria-label="Restore Terminals"
      >
        <div className="btn-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <span className="btn-glitch-layer"></span>
        </div>
      </button>
    </main>
  )
}