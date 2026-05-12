import './SocialSchedule.css';
import { useI18n } from '../i18n';

export function SocialSchedule() {
  const { t } = useI18n();

  return (
    <section className="cyber-grid-2-1" id="social-schedule">
      {/* STREAM SCHEDULE */}
      <div className="cyber-panel schedule-panel">
        <div className="panel-head">
          <span className="blink-dot green" />
          <strong>{t('schedule.title')}</strong>
        </div>
        <div className="panel-body">
          <div className="schedule-table">
            <div className="sched-row">
              <span className="day">{t('schedule.mon_wed')}</span>
              <span className="task">{t('schedule.task.code')}</span>
              <span className="time">21:00</span>
            </div>
            <div className="sched-row highlight">
              <span className="day">{t('schedule.thu_fri')}</span>
              <span className="task">{t('schedule.task.gaming')}</span>
              <span className="time">22:30</span>
            </div>
            <div className="sched-row">
              <span className="day">{t('schedule.sat')}</span>
              <span className="task">{t('schedule.task.community')}</span>
              <span className="time">14:00</span>
            </div>
            <div className="sched-row">
              <span className="day">{t('schedule.sun')}</span>
              <span className="task">{t('schedule.task.reboot')}</span>
              <span className="time">{t('schedule.time.offline')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DISCORD PROMO */}
      <div className="cyber-panel discord-panel">
        <div className="panel-head">
          <strong>{t('discord.title')}</strong>
        </div>
        <div className="panel-body discord-content">
          <div className="discord-logo-wrap">
            <svg className="discord-icon" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.21,16.15c2.45-3.35,4.63-6.9,6.51-10.63a67.06,67.06,0,0,1-10.41-5c.87-.64,1.71-1.31,2.53-2a82.5,82.5,0,0,0,51.84,0c.81.69,1.66,1.36,2.53,2a67.1,67.1,0,0,1-10.41,5c1.88,3.73,4.06,7.28,6.51,10.63a105.4,105.4,0,0,0,32.24-16.15C129.58,51,123.46,27.35,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.92,53.9,53,48.74,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.43-12.74S96.11,45.92,96.11,53,91,65.69,82.69,65.69Z" />
            </svg>
          </div>
          <h3>{t('discord.server')}</h3>
          <p>{t('discord.desc')}</p>
          <button className="cyber-btn primary-cyan discord-btn">{t('discord.btn')}</button>
        </div>
      </div>
    </section>
  );
}
