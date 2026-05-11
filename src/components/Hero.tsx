import React from 'react';
import { Metric } from './Metric';
import './Hero.css';
import { useI18n } from '../i18n';

interface HeroProps {
  profileMode: 'streamer' | 'developer';
  onOpenChat?: () => void;
}

export function Hero({ profileMode, onOpenChat }: HeroProps) {
  const { t } = useI18n();

  return (
    <section className="cyber-hero" id="overview">
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

        <div className="hero-actions">
          <button type="button" className="cyber-btn primary-cyan" onClick={onOpenChat}>
            {t('hero.primary')}
          </button>
          <button type="button" className="cyber-btn outline-magenta">
            {t('hero.secondary')}
          </button>
        </div>

        <div className="cyber-metrics" aria-label="Channel metrics">
          <Metric label={t('metrics.subscribers')} value="12.5K" />
          <Metric label={t('metrics.themes')} value="45+" />
          <Metric label={t('metrics.uptime')} value="1,240H" />
        </div>
      </div>

      {/* STATUS PANEL */}
      <aside className="cyber-panel status-panel">
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
    </section>
  );
}
