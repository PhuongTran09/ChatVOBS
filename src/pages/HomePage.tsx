import { useI18n } from '../i18n'

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="metric">
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
    </div>
  )
}

function FeatureCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <article className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

export function HomePage({
  onOpenFonts,
  onOpenChat,
}: {
  onOpenFonts?: () => void
  onOpenChat?: () => void
}) {
  const { t, toggleLocale } = useI18n()

  return (
    <main className="home">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">
            CV
          </span>
          <div>
            <strong>{t('app.brand')}</strong>
            <p>{t('app.tagline')}</p>
          </div>
        </div>

        <nav className="topnav" aria-label="Primary">
          <a href="#overview">{t('nav.overview')}</a>
          <a href="#rooms">{t('nav.rooms')}</a>
          <a href="#reports">{t('nav.reports')}</a>
          <a href="#settings">{t('nav.settings')}</a>
          {onOpenFonts ? (
            <button type="button" className="nav-button" onClick={onOpenFonts}>
              {t('nav.fonts')}
            </button>
          ) : null}
          {onOpenChat ? (
            <button type="button" className="nav-button" onClick={onOpenChat}>
              {t('nav.chat')}
            </button>
          ) : null}
        </nav>

        <button type="button" className="locale-toggle" onClick={toggleLocale}>
          {t('language.switch')}
        </button>
      </header>

      <section className="hero-band" id="overview">
        <div className="hero-copy">
          <span className="eyebrow">{t('hero.badge')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-lead">{t('hero.description')}</p>

          <div className="hero-actions">
            <button type="button" className="primary-action">
              {t('hero.primary')}
            </button>
            <button type="button" className="secondary-action">
              {t('hero.secondary')}
            </button>
          </div>

          <div className="metrics" aria-label="Dashboard metrics">
            <Metric label={t('metrics.rooms.label')} value={t('metrics.rooms.value')} />
            <Metric label={t('metrics.users.label')} value={t('metrics.users.value')} />
            <Metric label={t('metrics.uptime.label')} value={t('metrics.uptime.value')} />
          </div>
        </div>

        <aside className="hero-panel" aria-label={t('panel.title')}>
          <div className="hero-panel-copy">
            <div className="panel-head">
              <span className="status-dot" aria-hidden="true" />
              <strong>{t('panel.title')}</strong>
            </div>
            <p>{t('panel.description')}</p>
            <div className="panel-tags">
              <span>{t('panel.live')}</span>
              <span>{t('panel.sync')}</span>
              <span>{t('panel.private')}</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="content-band" id="rooms">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t('features.title')}</span>
            <h2>{t('features.description')}</h2>
          </div>
        </div>

        <div className="feature-grid">
          <FeatureCard
            title={t('features.one.title')}
            description={t('features.one.description')}
          />
          <FeatureCard
            title={t('features.two.title')}
            description={t('features.two.description')}
          />
          <FeatureCard
            title={t('features.three.title')}
            description={t('features.three.description')}
          />
        </div>
      </section>

      <section className="content-band split-band" id="reports">
        <div className="activity-panel">
          <span className="eyebrow">{t('activity.title')}</span>
          <h2>{t('activity.description')}</h2>
          <ul className="activity-list">
            <li>{t('activity.one')}</li>
            <li>{t('activity.two')}</li>
            <li>{t('activity.three')}</li>
            <li>{t('activity.four')}</li>
          </ul>
        </div>

        <div className="settings-panel" id="settings">
          <span className="eyebrow">{t('nav.settings')}</span>
          <h2>{t('footer.note')}</h2>
          <p>{t('footer.description')}</p>
        </div>
      </section>
    </main>
  )
}
