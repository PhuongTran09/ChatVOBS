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
            <span>LIVE_FEED.exe</span>
            <div className="term-controls">
              <span className="ctrl minimize" />
              <span className="ctrl maximize" />
              <span className="ctrl close" />
            </div>
          </div>
          <div className="term-body">
            <p className="sys-text">{'>'} INITIATING LIVE FEED...</p>
            <p><span className="user-hl">@alex_dev</span> donate 50.000đ: "Giao diện đẹp quá ad ơi!"</p>
            <p><span className="user-hl">@coder_noob</span> đăng ký Hội viên</p>
            <p><span className="user-hl">@sarah_lee</span> superchat $5.00: "Hướng dẫn API đi anh"</p>
            <p className="sys-text">{'>'} WAITING FOR NEW EVENTS...</p>
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
    </main>
  )
}