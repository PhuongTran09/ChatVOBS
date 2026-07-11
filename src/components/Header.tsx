import { useState, useEffect } from 'react';
import './Header.css';
import { useI18n } from '../i18n';
import { CyberButtonSwitch } from './CyberButtonSwitch';

interface HeaderProps {
  profileMode: 'streamer' | 'developer';
  setProfileMode: (mode: 'streamer' | 'developer') => void;
}

export function Header({ profileMode, setProfileMode }: HeaderProps) {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const sections = profileMode === 'developer'
      ? ['overview', 'dev-skills', 'dev-projects', 'dev-tools']
      : ['overview', 'overlays-activity', 'donate', 'social-hub'];

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -55% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, [profileMode]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            <a 
              href="#overview" 
              className={activeSection === 'overview' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'overview')}
            >
              {t('nav.dev.profile')}
            </a>
            <a 
              href="#dev-skills" 
              className={activeSection === 'dev-skills' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'dev-skills')}
            >
              {t('nav.dev.skills')}
            </a>
            <a 
              href="#dev-projects" 
              className={activeSection === 'dev-projects' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'dev-projects')}
            >
              {t('nav.dev.projects')}
            </a>
            <a 
              href="#dev-tools" 
              className={activeSection === 'dev-tools' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'dev-tools')}
            >
              {t('nav.dev.tools')}
            </a>
          </>
        ) : (
          <>
            <a 
              href="#overview" 
              className={activeSection === 'overview' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'overview')}
            >
              {t('nav.profile')}
            </a>
            <a 
              href="#overlays-activity" 
              className={activeSection === 'overlays-activity' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'overlays-activity')}
            >
              {t('nav.overlays')}
            </a>
            <a 
              href="#donate" 
              className={activeSection === 'donate' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'donate')}
            >
              {t('nav.donate')}
            </a>
            <a 
              href="#social-hub" 
              className={activeSection === 'social-hub' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'social-hub')}
            >
              {t('nav.schedule')}
            </a>
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
