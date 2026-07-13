import { useState, useEffect } from 'react';
import './InitialLoadingOverlay.css';
import { useI18n } from '../i18n';

interface InitialLoadingOverlayProps {
  isInitialLoading: boolean;
  loadingProgress: number;
  onUnlock: () => void;
}

export function InitialLoadingOverlay({
  isInitialLoading,
  loadingProgress,
  onUnlock,
}: InitialLoadingOverlayProps) {
  const { t } = useI18n();
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Absolute scroll locking (touch, mouse wheel, keyboard keys) during loading
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    const preventScrollKeys = (e: KeyboardEvent) => {
      const keys = ['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'End', 'Home'];
      if (keys.includes(e.code) || keys.includes(e.key)) {
        e.preventDefault();
      }
    };

    if (isInitialLoading) {
      window.addEventListener('touchmove', preventDefault, { passive: false });
      window.addEventListener('wheel', preventDefault, { passive: false });
      window.addEventListener('keydown', preventScrollKeys, { passive: false });
    }

    return () => {
      window.removeEventListener('touchmove', preventDefault);
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('keydown', preventScrollKeys);
    };
  }, [isInitialLoading]);

  const handleUnlock = () => {
    if (isUnlocking) return;
    setIsUnlocking(true);

    // Trigger global music playing event
    window.dispatchEvent(new CustomEvent('play-global-music'));

    // Allow 1.3 seconds for shackle swing and overlay fadeout
    setTimeout(() => {
      onUnlock();
    }, 1300);
  };

  if (!isInitialLoading) return null;

  return (
    <div className={`reboot-overlay initial-boot ${isUnlocking ? 'overlay-fade-out' : ''}`}>
      {loadingProgress < 100 ? (
        <div className="reboot-content">
          <div className="reboot-glitch" data-text={t('system.booting')}>{t('system.booting')}</div>
          <div className="reboot-bar">
            <div className="reboot-fill-percent" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <div className="progress-counter">{loadingProgress}%</div>
          <div className="reboot-logs">
            <p className="log-entry">{t('system.initializing')} ... {loadingProgress > 25 ? 'OK' : 'RUNNING'}</p>
            {loadingProgress > 30 && <p className="log-entry delay-1">{t('system.loading_overlays')} ... {loadingProgress > 65 ? 'OK' : 'RUNNING'}</p>}
            {loadingProgress > 60 && <p className="log-entry delay-2">{t('system.establishing')} ... {loadingProgress > 90 ? 'OK' : 'RUNNING'}</p>}
          </div>
        </div>
      ) : (
        <div className="padlock-wrapper">
          <div className={`padlock-container ${isUnlocking ? 'unlock-anim' : ''}`} onClick={handleUnlock}>
            <div className="padlock-shackle">
              <div className="shackle-loop"></div>
            </div>
            <div className="padlock-body-3d">
              <div className="padlock-face front">
                <div className="padlock-core">
                  <div className="keyhole"></div>
                </div>
              </div>
              <div className="padlock-face back"></div>
              <div className="padlock-face left"></div>
              <div className="padlock-face right"></div>
              <div className="padlock-face top"></div>
              <div className="padlock-face bottom"></div>
            </div>
            <div className="padlock-text glitch-text" data-text={t('system.click_to_unlock')}>
              {t('system.click_to_unlock')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
