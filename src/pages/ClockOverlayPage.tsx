import { useEffect, useState } from 'react';
import '../styles/ClockOverlayPage.css';

export function ClockOverlayPage() {
  const [time, setTime] = useState(new Date());
  const [format24h, setFormat24h] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [theme, setTheme] = useState<'cyan' | 'magenta' | 'amber'>('cyan');

  useEffect(() => {
    // Add overlay mode to body for transparency
    document.body.classList.add('overlay-mode');

    // Parse options from URL query params
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme')?.toLowerCase();
    const formatParam = params.get('format')?.toLowerCase();
    const secondsParam = params.get('seconds')?.toLowerCase();

    if (themeParam === 'magenta') setTheme('magenta');
    if (themeParam === 'amber') setTheme('amber');
    
    if (formatParam === '12h') setFormat24h(false);
    if (secondsParam === 'false') setShowSeconds(false);

    // Update time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      document.body.classList.remove('overlay-mode');
      clearInterval(timer);
    };
  }, []);

  // Format Date and Time details
  const getFormattedTime = () => {
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');
    let ampm = '';

    if (!format24h) {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
    }

    const formattedHours = String(hours).padStart(2, '0');
    
    return {
      hours: formattedHours,
      minutes,
      seconds,
      ampm
    };
  };

  const getFormattedDate = () => {
    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, '0');
    const date = String(time.getDate()).padStart(2, '0');
    
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayName = days[time.getDay()];

    return `${dayName} | ${year}.${month}.${date}`;
  };

  const { hours, minutes, seconds, ampm } = getFormattedTime();
  const dateStr = getFormattedDate();

  // Progress of the current minute (for the cyberpunk progress bar)
  const minuteProgress = (time.getSeconds() / 60) * 100;

  // Accent color mapping based on theme choice
  const accentColors = {
    cyan: '#00f0ff',
    magenta: '#ff0055',
    amber: '#ffaa00'
  };
  const activeColor = accentColors[theme];

  return (
    <div className="clock-overlay-wrapper">
      <div 
        className={`clock-overlay-card theme-${theme}`}
        style={{ '--accent-color': activeColor } as React.CSSProperties}
      >
        {/* Cyberpunk decorative elements */}
        <div className="corner-decor top-left" />
        <div className="corner-decor top-right" />
        <div className="corner-decor bottom-left" />
        <div className="corner-decor bottom-right" />
        <div className="scanline-overlay" />
        <div className="cyber-grid-overlay" />
        <div className="side-vertical-label-clock">LIKE & SUB!</div>

        {/* Header */}
        <div className="clock-header">
          <div className="header-label-left">
            <span className="dot-blink" />
            SYSTEM TIME
          </div>
          <div className="header-label-right">
            TZ: UTC+7
          </div>
        </div>

        {/* Main Clock Display */}
        <div className="clock-display">
          <span className="time-part hours">{hours}</span>
          <span className="time-separator">:</span>
          <span className="time-part minutes">{minutes}</span>
          {showSeconds && (
            <>
              <span className="time-separator">:</span>
              <span className="time-part seconds">{seconds}</span>
            </>
          )}
          {ampm && <span className="ampm-label">{ampm}</span>}
        </div>

        {/* Date Display */}
        <div className="clock-date">
          {dateStr}
        </div>

        {/* Futuristic progress bar representing the current minute's progress */}
        <div className="progress-container-clock">
          <div className="progress-bar-glow-clock" style={{ width: `${minuteProgress}%` }} />
          <div className="progress-bar-clock" style={{ width: `${minuteProgress}%` }} />
        </div>

        {/* Footer info band */}
        <div className="clock-footer">
          <span className="footer-deco-square" />
          <span className="footer-status-text">YATO KENJI</span>
          <span className="footer-deco-square" />
        </div>
      </div>
    </div>
  );
}
