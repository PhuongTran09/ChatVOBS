import './FeatureCards.css';
import { useI18n } from '../i18n';

export function FeatureCards() {
  const { t } = useI18n();

  return (
    <section className="cyber-section" id="chat-themes">
      <div className="section-head">
        <span className="badge badge-primary">{t('features.title')}</span>
        <p className="sys-text">{t('features.description')}</p>
      </div>
      <div className="feature-grid">
        <article className="cyber-card">
          <h3>{t('features.glass.title')}</h3>
          <p>{t('features.glass.desc')}</p>
        </article>
        <article className="cyber-card card-magenta">
          <h3>{t('features.neon.title')}</h3>
          <p>{t('features.neon.desc')}</p>
        </article>
        <article className="cyber-card card-green">
          <h3>{t('features.terminal.title')}</h3>
          <p>{t('features.terminal.desc')}</p>
        </article>
      </div>
    </section>
  );
}
