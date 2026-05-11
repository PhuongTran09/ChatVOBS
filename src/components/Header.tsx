import React from 'react';
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
          <strong>[DEVSTREAMER]</strong>
          <span>CODE & CHILL</span>
        </div>
      </div>
      <nav className="cyber-nav" aria-label="Primary">
        <a href="#overview">{t('nav.profile')}</a>
        <a href="#chat-themes">{t('nav.overlays')}</a>
        <a href="#activity">{t('nav.donate')}</a>
        <a href="#obs-setup">{t('nav.obs')}</a>
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
