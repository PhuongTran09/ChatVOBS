import { Metric } from './Metric';
import './Hero.css';
import { useI18n } from '../i18n';

interface HeroProps {
  profileMode: 'streamer' | 'developer';
  onOpenChat?: () => void;
}

export function Hero({ profileMode }: HeroProps) {
  const { t } = useI18n();

  return (
    <div className="hero-top-grid">
      <div className="hero-content">
        <div className="badge-wrapper">
          <span className="cyber-badge">{t('hero.badge')}</span>
        </div>
        <h1 className="glitch-text" data-text={t('hero.title')}>
          {t('hero.title')}
        </h1>
        <p className="hero-lead">
          {profileMode === 'streamer'
            ? t('hero.description.streamer')
            : t('hero.description.developer')}
        </p>

        <div className="platform-tags">
          <span className="plat-tag active">YOUTUBE</span>
          <span className="plat-tag">TWITCH</span>
          <span className="plat-tag">FB GAMING</span>
        </div>



        <div className="cyber-metrics" aria-label="Channel metrics">
          <Metric label={t('metrics.subscribers.label')} value={t('metrics.subscribers.value')} />
          <Metric label={t('metrics.themes.label')} value={t('metrics.themes.value')} />
          <Metric label={t('metrics.uptime.label')} value={t('metrics.uptime.value')} />
        </div>
      </div>

      {/* STATUS PANEL */}
      <aside className="cyber-panel status-panel">
        <div className="panel-scanline" />
        <div className="panel-corner-tl" />
        <div className="panel-corner-br" />
        
        <div className="panel-head">
          <span className="blink-dot" />
          <strong>{t('panel.live')}</strong>
        </div>
        <div className="panel-body">
          <p className="highlight-text">
            {'>'} {t('panel.topic')}
          </p>
          <div className="tech-tags">
            <span>#YouTubeLive</span>
            <span>#ReactJS</span>
            <span>#CSS</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
