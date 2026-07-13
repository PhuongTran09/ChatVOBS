import { useState, useEffect, useMemo } from 'react';
import './SocialSchedule.css';
import { useI18n } from '../i18n';
import { API_CONFIG } from '../config/api';
import { subscribeToAllWeeks, subscribeToEventsByWeekId, getWeekNumberAndYear, type WeekDoc, type ScheduleEvent } from '../services';

interface DiscordWidgetData {
  guild?: {
    id: string;
    icon?: string;
    name?: string;
    description?: string;
  };
  approximate_presence_count?: number;
}

export function SocialSchedule() {
  const { t } = useI18n();
  const [weeksList, setWeeksList] = useState<WeekDoc[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(-1);
  const [discordData, setDiscordData] = useState<DiscordWidgetData | null>(null);
  const [weekTasks, setWeekTasks] = useState<ScheduleEvent[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

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

  // Subscribe to all weeks configurations in real-time
  useEffect(() => {
    setLoadingSchedule(true);
    const unsubscribe = subscribeToAllWeeks(
      (list) => {
        setWeeksList(list);
        if (list.length > 0) {
          const today = new Date();
          const todayCal = getWeekNumberAndYear(today);
          
          setCurrentWeekIndex((prevIndex) => {
            // If we already have a valid selected index, retain it
            if (prevIndex >= 0 && prevIndex < list.length) {
              return prevIndex;
            }
            
            // Otherwise, default to today's week or the latest week
            const index = list.findIndex(
              (w) => w.week === todayCal.week && w.year === String(todayCal.year)
            );
            return index !== -1 ? index : list.length - 1;
          });
        } else {
          setCurrentWeekIndex(-1);
        }
        setLoadingSchedule(false);
      },
      (error) => {
        console.error('Error loading weeks:', error);
        setLoadingSchedule(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Helper to generate Mon-Sun dates based on ISO Week & Year
  const getWeekDatesFromWeekNumber = (week: number, year: number) => {
    const jan1 = new Date(year, 0, 1);
    const dayOfJan1 = jan1.getDay();
    const jan1ThursdayOffset = (4 - dayOfJan1 + 7) % 7;
    const firstThursday = new Date(year, 0, 1 + jan1ThursdayOffset);
    const targetThursday = new Date(firstThursday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const monday = new Date(targetThursday.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const activeWeek = useMemo(() => {
    if (currentWeekIndex >= 0 && currentWeekIndex < weeksList.length) {
      return weeksList[currentWeekIndex];
    }
    return null;
  }, [currentWeekIndex, weeksList]);

  // Monday is index 0, Sunday is index 6
  const weekDates = useMemo(() => {
    if (activeWeek) {
      return getWeekDatesFromWeekNumber(activeWeek.week, Number(activeWeek.year));
    }
    // Fallback to current calendar week dates
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [activeWeek]);

  // Subscribe to events for active week in real-time
  useEffect(() => {
    if (!activeWeek) {
      const emptyTasks = Array(7).fill(null).map(() => ({
        title: t('schedule.time.offline'),
        description: '',
        time: '',
        highlight: false
      }));
      setWeekTasks(emptyTasks);
      return;
    }

    setLoadingSchedule(true);
    const unsubscribe = subscribeToEventsByWeekId(
      activeWeek.id,
      (fetchedTasks) => {
        if (fetchedTasks) {
          const translatedTasks = fetchedTasks.map((task) => ({
            title: task.titleKey ? t(task.titleKey) : (task.title || t('schedule.time.offline')),
            description: task.descriptionKey ? t(task.descriptionKey) : (task.description || ''),
            time: task.time || '',
            highlight: task.highlight
          }));
          setWeekTasks(translatedTasks);
        } else {
          const emptyTasks = Array(7).fill(null).map(() => ({
            title: t('schedule.time.offline'),
            description: '',
            time: '',
            highlight: false
          }));
          setWeekTasks(emptyTasks);
        }
        setLoadingSchedule(false);
      },
      (error) => {
        console.error('Error fetching schedule events:', error);
        const emptyTasks = Array(7).fill(null).map(() => ({
          title: t('schedule.time.offline'),
          description: '',
          time: '',
          highlight: false
        }));
        setWeekTasks(emptyTasks);
        setLoadingSchedule(false);
      }
    );
    return () => unsubscribe();
  }, [activeWeek, t]);

  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex((prev) => prev - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weeksList.length - 1) {
      setCurrentWeekIndex((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    if (weeksList.length > 0) {
      const today = new Date();
      const todayCal = getWeekNumberAndYear(today);
      const index = weeksList.findIndex(
        (w) => w.week === todayCal.week && w.year === String(todayCal.year)
      );
      if (index !== -1) {
        setCurrentWeekIndex(index);
      } else {
        setCurrentWeekIndex(weeksList.length - 1);
      }
    }
  };

  const today = useMemo(() => new Date(), []);
  const todayCal = useMemo(() => getWeekNumberAndYear(today), [today]);
  const isCurrentWeekActive = useMemo(() => {
    return !!(activeWeek && 
      activeWeek.week === todayCal.week && 
      activeWeek.year === String(todayCal.year));
  }, [activeWeek, todayCal]);

  const todayStr = useMemo(() => today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }), [today]);
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

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
            <span className="tag-label">{t('schedule.today')}</span>
            <span className="tag-value">{todayStr}</span>
          </div>
        </div>
        
        <div className="schedule-controls">
          <div className="week-navigation">
            <button className="nav-btn" onClick={handlePrevWeek} disabled={currentWeekIndex <= 0} aria-label="Previous Week">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="nav-btn today-btn" onClick={handleToday}>
              {isCurrentWeekActive ? t('schedule.week_now') : (activeWeek ? t('schedule.week_num', { num: activeWeek.week }) : t('schedule.week_now'))}
            </button>
            <button className="nav-btn" onClick={handleNextWeek} disabled={currentWeekIndex === -1 || currentWeekIndex >= weeksList.length - 1} aria-label="Next Week">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <div className="week-range">
            {activeWeek ? activeWeek.name : `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`}
          </div>
        </div>

        <div className="panel-body">
          <div className="schedule-table-wrapper custom-scrollbar">
            {loadingSchedule ? (
              <div className="schedule-loading">
                <span className="blink-text">&gt; LOADING...</span>
                <div className="loading-scanner" />
              </div>
            ) : (
              <div className="schedule-table">
                {weekDates.map((date, index) => {
                  const task = weekTasks[index];
                  return (
                    <div key={index} className={`sched-row ${checkIsToday(date) ? 'highlight' : ''} ${task?.highlight ? 'event-highlight' : ''}`}>
                      <div className="day-info">
                        <span className="day">{t(`schedule.${dayKeys[index]}`)}</span>
                        <span className="full-date">
                          {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="task-container">
                        <span className="task">{task ? task.title : t('schedule.time.offline')}</span>
                        {task?.description && (
                          <span className="task-desc">{task.description}</span>
                        )}
                      </div>
                      <span className="time">{task ? task.time : ''}</span>
                    </div>
                  );
                })}
              </div>
            )}
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
              <svg className="discord-icon" viewBox="0 -28.5 256 256">
                <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fillRule="nonzero" />
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
