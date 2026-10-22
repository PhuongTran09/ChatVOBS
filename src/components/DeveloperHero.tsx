import { useState } from 'react';
import './Hero.css';
import './DeveloperSections.css';
import './DeveloperHero.css';
import { Metric } from './Metric';
import { TechChip } from './TechChip';
import { useI18n } from '../i18n';
import { getTechIcon } from '../data/techIcons';
import {
  DEV_AVATAR,
  DEV_AVATAR_URL,
  DEV_CONTACTS,
  DEV_METRICS,
  DEV_NAME,
  DEV_SIGNATURE_TAGS,
  getDeveloperProjects,
} from '../data/developerProfile';

export function DeveloperHero() {
  const { t } = useI18n();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const projects = getDeveloperProjects(t);

  return (
    <div className="hero-top-grid">
      <div className="hero-content">
        <div className="badge-wrapper">
          <span className="cyber-badge">{t('mode.developer')} {t('hero.badge')} </span>
        </div>
        <h1 className="glitch-text" data-text={DEV_NAME}>
          {DEV_NAME}
        </h1>
        <p className="hero-lead dev-prose">{t('hero.description.developer')}</p>

        <div className="platform-tags">
          <a href={DEV_CONTACTS.github} target="_blank" rel="noopener noreferrer" className="plat-tag">
            {t('dev.contact.github')}
          </a>
        </div>

        <a href={DEV_CONTACTS.github} target="_blank" rel="noopener noreferrer" className="channel-profile-tag">
          {avatarFailed ? (
            <div className="dev-avatar" aria-hidden="true">{DEV_AVATAR}</div>
          ) : (
            <img
              className="dev-avatar"
              src={DEV_AVATAR_URL}
              alt=""
              width={60}
              height={60}
              onError={() => setAvatarFailed(true)}
            />
          )}
          <div className="channel-info-hero">
            <span className="channel-name-hero">{DEV_NAME}</span>
            <span className="channel-platform-hero">{t('dev.role')}</span>
          </div>
        </a>

        <div className="cyber-metrics" aria-label={t('dev.metric.aria')}>
          <Metric label={t('dev.metric.projects')} value={String(DEV_METRICS.projects)} />
          <Metric label={t('dev.metric.skillAreas')} value={String(DEV_METRICS.skillAreas)} />
          <Metric label={t('dev.metric.repos')} value={String(DEV_METRICS.publicRepos)} />
        </div>
      </div>

      <aside className="cyber-panel status-panel">
        <div className="panel-scanline" />
        <div className="panel-corner-tl" />
        <div className="panel-corner-br" />

        <div className="panel-head">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <strong>{t('dev.panel.index')}</strong>
        </div>
        <div className="panel-body">
          <div className="notifications-list">
            {projects.map((project, index) => {
              const link = project.repos.find((repo) => repo.public);
              return (
                <div key={project.id} className={`notification-item ${index === 0 ? 'latest' : ''}`}>
                  <div className="notification-main">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {link ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="highlight-text notification-title"
                        >
                          {project.name}
                        </a>
                      ) : (
                        <span className="highlight-text notification-title">{project.name}</span>
                      )}
                      <p className="notification-desc">{project.short}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="tech-tags">
            {DEV_SIGNATURE_TAGS.map((tag) => (
              <TechChip key={tag} tag={tag} icon={getTechIcon(tag)} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
