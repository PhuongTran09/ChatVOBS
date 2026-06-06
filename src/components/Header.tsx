import './Header.css';
import { useI18n } from '../i18n';

interface HeaderProps {
  profileMode: 'streamer' | 'developer';
  setProfileMode: (mode: 'streamer' | 'developer') => void;
}

import { CyberButtonSwitch } from './CyberButtonSwitch';

export function Header({ profileMode, setProfileMode }: HeaderProps) {
  const { t } = useI18n();

  return (
    <header className="cyber-header">
      <div className="brand-block">
        <div className="brand-text">
          <strong>{t('nav.brand')}</strong>
          <span>{t('nav.tagline')}</span>
        </div>
      </div>
      <nav className="cyber-nav" aria-label="Primary">
        {profileMode === 'developer' ? (
          <>
            <a href="#overview">{t('nav.dev.profile')}</a>
            <a href="#dev-skills">{t('nav.dev.skills')}</a>
            <a href="#dev-projects">{t('nav.dev.projects')}</a>
            <a href="#dev-tools">{t('nav.dev.tools')}</a>
          </>
        ) : (
          <>
            <a href="#overview">{t('nav.profile')}</a>
            <a href="#overlays-activity">{t('nav.overlays')}</a>
            <a href="#donate">{t('nav.donate')}</a>
            <a href="#social-hub">{t('nav.schedule')}</a>
          </>
        )}
      </nav>
      <CyberButtonSwitch 
        options={[
          { label: t('mode.streamer'), value: 'streamer' },
          { label: t('mode.developer'), value: 'developer' }
        ]}
        value={profileMode}
        onChange={(val) => setProfileMode(val as 'streamer' | 'developer')}
        activeColor={profileMode === 'developer' ? 'cyan' : 'magenta'}
      />
    </header>
  );
}
