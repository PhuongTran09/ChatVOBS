import { useState } from 'react'
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

      {/* ================================================= */}
      {/* TERMINAL SPLIT BAND */}
      {/* ================================================= */}
      <section className="cyber-split" id="activity">
        {/* LIVE FEED */}
        <div className="cyber-terminal">
          <div className="term-head head-green">
            <span>MUSIC_CHILL.exe</span>
            <div className="term-controls">
              <span className="ctrl minimize" />
              <span className="ctrl maximize" />
              <span className="ctrl close" />
            </div>
          </div>
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
                <span className="status-icon">â–¶</span>
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
        </div>

        {/* OBS SETUP */}
        <div className="cyber-terminal" id="obs-setup">
          <div className="term-head head-cyan">
            <span>OBS_SETUP.txt</span>
            <div className="term-controls">
              <span className="ctrl minimize" />
              <span className="ctrl maximize" />
              <span className="ctrl close" />
            </div>
          </div>
          <div className="term-body">
            <p className="sys-text">{'>'} TÍCH HỢP OBS BROWSER</p>
            <p>Hướng dẫn cài đặt:</p>
            <p>1. Click [OPEN CHAT EDITOR] để tùy chỉnh.</p>
            <p>2. Copy đường dẫn CSS sinh ra.</p>
            <p>3. Thêm Browser Source vào OBS, dán link YouTube Chat và chèn CSS vào "Custom CSS".</p>
            <p className="blink-cursor">_</p>
          </div>
        </div>
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
            <div className="gallery-item">
              <div className="img-frame">
                <img src="https://picsum.photos/id/1/400/300" alt="Review 1" />
                <div className="scanline" />
              </div>
              <div className="img-meta">
                <span className="file-name">CHAT_THEME_01.PNG</span>
                <span className="file-date">10.05.2026</span>
              </div>
            </div>
            <div className="gallery-item">
              <div className="img-frame">
                <img src="https://picsum.photos/id/2/400/300" alt="Review 2" />
                <div className="scanline" />
              </div>
              <div className="img-meta">
                <span className="file-name">NEON_PREVIEW.PNG</span>
                <span className="file-date">09.05.2026</span>
              </div>
            </div>
            <div className="gallery-item">
              <div className="img-frame">
                <img src="https://picsum.photos/id/3/400/300" alt="Review 3" />
                <div className="scanline" />
              </div>
              <div className="img-meta">
                <span className="file-name">GLASS_EFFECT.PNG</span>
                <span className="file-date">08.05.2026</span>
              </div>
            </div>
            <div className="gallery-item">
              <div className="img-frame">
                <img src="https://picsum.photos/id/4/400/300" alt="Review 4" />
                <div className="scanline" />
              </div>
              <div className="img-meta">
                <span className="file-name">SETUP_OBS.PNG</span>
                <span className="file-date">07.05.2026</span>
              </div>
            </div>
            {/* Duplicated Items for Seamless Loop */}
            <div className="gallery-item">
              <div className="img-frame">
                <img src="https://picsum.photos/id/1/400/300" alt="Review 1" />
                <div className="scanline" />
              </div>
              <div className="img-meta">
                <span className="file-name">CHAT_THEME_01.PNG</span>
              </div>
            </div>
            <div className="gallery-item">
              <div className="img-frame">
                <img src="https://picsum.photos/id/2/400/300" alt="Review 2" />
                <div className="scanline" />
              </div>
              <div className="img-meta">
                <span className="file-name">NEON_PREVIEW.PNG</span>
              </div>
            </div>
            <div className="gallery-item">
              <div className="img-frame">
                <img src="https://picsum.photos/id/3/400/300" alt="Review 3" />
                <div className="scanline" />
              </div>
              <div className="img-meta">
                <span className="file-name">GLASS_EFFECT.PNG</span>
              </div>
            </div>
            <div className="gallery-item">
              <div className="img-frame">
                <img src="https://picsum.photos/id/4/400/300" alt="Review 4" />
                <div className="scanline" />
              </div>
              <div className="img-meta">
                <span className="file-name">SETUP_OBS.PNG</span>
              </div>
            </div>
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
    </main>
  )
}