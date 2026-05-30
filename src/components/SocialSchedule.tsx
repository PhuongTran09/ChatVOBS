import { useState, useEffect } from 'react';
import './SocialSchedule.css';
import { useI18n } from '../i18n';
import { API_CONFIG } from '../config/api';

export function SocialSchedule() {
  const { t } = useI18n();
  const [weekOffset, setWeekOffset] = useState(0);
  const [discordData, setDiscordData] = useState<any>(null);

  useEffect(() => {
    async function fetchDiscord() {
      try {
        const res = await fetch(`${API_CONFIG.DISCORD.API_BASE_URL}/invites/${API_CONFIG.DISCORD.INVITE_CODE}?with_counts=true`);
        if (res.ok) {
          const data = await res.json();
          setDiscordData(data);
        }
      } catch (err) {
        console.error('Error fetching Discord data:', err);
      }
    }
    fetchDiscord();
  }, []);

  // Hàm lấy ngày trong tuần dựa trên offset
  const getWeekDates = (offset: number) => {
    const now = new Date();
    // Thêm offset tuần (7 ngày mỗi tuần)
    now.setDate(now.getDate() + offset * 7);
    
    const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const monday = new Date(now.setDate(diff));
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);
  const today = new Date();
  const todayStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const tasks = [
    { key: 'schedule.task.code', time: '21:00' },
    { key: 'schedule.task.code', time: '21:00' },
    { key: 'schedule.task.code', time: '21:00' },
    { key: 'schedule.task.gaming', time: '22:30', highlight: true },
    { key: 'schedule.task.gaming', time: '22:30', highlight: true },
    { key: 'schedule.task.community', time: '14:00' },
    { key: 'schedule.task.reboot', time: t('schedule.time.offline') },
  ];

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => prev + 1);
  const handleToday = () => setWeekOffset(0);

  // Hàm format ngày DD/MM
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Hàm kiểm tra xem một ngày có phải là hôm nay không
  const checkIsToday = (date: Date) => {
    const now = new Date();
    return date.getDate() === now.getDate() &&
           date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
  };

  return (
    <div className="cyber-grid-2-1" id="schedule">
      {/* STREAM SCHEDULE */}
      <div className="cyber-panel schedule-panel">
        <div className="panel-head">
          <div className="head-left">
            <svg className="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <strong>{t('schedule.title')}</strong>
          </div>
          <div className="head-right current-day-tag">
            <span className="tag-label">TODAY:</span>
            <span className="tag-value">{todayStr}</span>
          </div>
        </div>
        
        <div className="schedule-controls">
          <div className="week-navigation">
            <button className="nav-btn" onClick={handlePrevWeek}>&lt; PREV</button>
            <button className="nav-btn today-btn" onClick={handleToday}>WEEK {weekOffset === 0 ? 'NOW' : (weekOffset > 0 ? `+${weekOffset}` : weekOffset)}</button>
            <button className="nav-btn" onClick={handleNextWeek}>NEXT &gt;</button>
          </div>
          <div className="week-range">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </div>
        </div>

        <div className="panel-body">
          <div className="schedule-table-wrapper custom-scrollbar">
            <div className="schedule-table">
              {weekDates.map((date, index) => (
                <div key={index} className={`sched-row ${checkIsToday(date) ? 'highlight' : ''}`}>
                  <div className="day-info">
                    <span className="day">{t(`schedule.${dayKeys[index]}`)}</span>
                    <span className="full-date">
                      {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="task">{t(tasks[index].key)}</span>
                  <span className="time">{tasks[index].time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DISCORD PROMO */}
      <div className="cyber-panel discord-panel">
        <div className="panel-head">
          <div className="head-left">
            <svg className="community-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <strong>{t('discord.title')}</strong>
          </div>
        </div>
        <div className="panel-body discord-content">
          <div className="discord-logo-wrap" style={{ overflow: 'hidden', padding: 0, background: 'transparent' }}>
            {discordData?.guild?.icon ? (
              <img 
                src={`https://cdn.discordapp.com/icons/${discordData.guild.id}/${discordData.guild.icon}.png?size=256`} 
                alt="Server Icon" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <svg className="discord-icon" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.21,16.15c2.45-3.35,4.63-6.9,6.51-10.63a67.06,67.06,0,0,1-10.41-5c.87-.64,1.71-1.31,2.53-2a82.5,82.5,0,0,0,51.84,0c.81.69,1.66,1.36,2.53,2a67.1,67.1,0,0,1-10.41,5c1.88,3.73,4.06,7.28,6.51,10.63a105.4,105.4,0,0,0,32.24-16.15C129.58,51,123.46,27.35,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.92,53.9,53,48.74,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.43-12.74S96.11,45.92,96.11,53,91,65.69,82.69,65.69Z" />
              </svg>
            )}
          </div>
          <h3>{discordData?.guild?.name || t('discord.server')}</h3>
          <p>{discordData?.guild?.description || t('discord.desc')}</p>
          {discordData?.approximate_presence_count && (
            <div style={{ color: 'var(--cyan)', fontSize: '0.8rem', marginTop: '-5px', marginBottom: '5px', fontWeight: 'bold' }}>
              <span className="blink-dot" style={{ display: 'inline-block', width: '8px', height: '8px', marginRight: '5px', background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }}></span>
              {discordData.approximate_presence_count} Online
            </div>
          )}
          <a href={`https://discord.gg/${API_CONFIG.DISCORD.INVITE_CODE}`} target="_blank" rel="noopener noreferrer" className="cyber-btn primary-cyan discord-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
            {t('discord.btn')}
          </a>
        </div>
      </div>
    </div>
  );
}
