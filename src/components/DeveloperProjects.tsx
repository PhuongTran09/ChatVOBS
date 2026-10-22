import './DeveloperSections.css';
import { TechChip } from './TechChip';
import { useI18n } from '../i18n';
import { getTechIcon } from '../data/techIcons';
import { getDeveloperProjects } from '../data/developerProfile';

export function DeveloperProjects() {
  const { t } = useI18n();
  // Called during render on purpose: memoising it without `t` would freeze the copy
  // in whichever language was active when the section first mounted.
  const projects = getDeveloperProjects(t);

  return (
    <div className="dev-block">
      <div className="dev-block-head">
        <h2 className="dev-block-title">{t('dev.projects.title')}</h2>
      </div>

      <div className="dev-project-grid">
        {projects.map((project) => (
          <article key={project.id} className="cyber-panel dev-project-card">
            <div className="panel-scanline" />
            <div className="panel-corner-tl" />
            <div className="panel-corner-br" />

            <div className="panel-head">
              <strong>{project.name}</strong>
              <span className="dev-project-role">{project.role}</span>
            </div>

            <div className="panel-body">
              <p className="dev-project-tagline">{project.short}</p>

              <p className="dev-field-label">{t('dev.projects.overview')}</p>
              <p className="dev-project-summary">{project.summary}</p>

              <p className="dev-field-label">{t('dev.projects.stack')}</p>
              <div className="dev-chips">
                {project.stack.map((tag) => (
                  <TechChip key={tag} tag={tag} icon={getTechIcon(tag)} />
                ))}
              </div>

              <div className="dev-project-foot">
                <p className="dev-field-label">{t('dev.projects.links')}</p>
                <div className="dev-project-links">
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dev-link-btn"
                    >
                      {t('dev.projects.web')}
                    </a>
                  )}
                  {project.repos.map((repo) => {
                    // One repo needs no qualifier; two of them have to say which is which.
                    const part = project.repos.length > 1 ? ` / ${repo.label}` : '';
                    return repo.public ? (
                      <a
                        key={repo.url}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dev-link-btn"
                      >
                        {t('dev.projects.github')}
                        {part}
                      </a>
                    ) : (
                      <span key={repo.url} className="dev-link-private">
                        {t('dev.projects.private')}
                        {part}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
