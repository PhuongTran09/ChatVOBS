import { useState, useEffect, useRef } from 'react';
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hasGyro, setHasGyro] = useState(false);
  const initialBetaRef = useRef<number | null>(null);
  const initialGammaRef = useRef<number | null>(null);

  // Handle device orientation (gyroscope) for mobile
  useEffect(() => {
    if (!isInitialLoading) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const { beta, gamma } = e;
      if (beta === null || gamma === null) return;
      
      setHasGyro(true);

      if (initialBetaRef.current === null) {
        initialBetaRef.current = beta;
      }
      if (initialGammaRef.current === null) {
        initialGammaRef.current = gamma;
      }

      // Smoothly drift the reference to center around current position
      initialBetaRef.current = initialBetaRef.current * 0.98 + beta * 0.02;
      initialGammaRef.current = initialGammaRef.current * 0.98 + gamma * 0.02;

      const diffBeta = beta - initialBetaRef.current;
      const diffGamma = gamma - initialGammaRef.current;

      // Limit/map tilt values to maximum of 25deg
      const targetX = Math.max(-25, Math.min(25, diffBeta * 0.8));
      const targetY = Math.max(-25, Math.min(25, diffGamma * 0.8));

      setTilt({ x: targetX, y: targetY });
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isInitialLoading]);

  // Request permission for iOS devices
  const requestOrientationPermission = async () => {
    if (
      typeof window !== 'undefined' &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      // @ts-ignore
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        // @ts-ignore
        const state = await DeviceOrientationEvent.requestPermission();
        if (state === 'granted') {
          // Setting permission automatically fires events to the main useEffect listener
          setHasGyro(true);
        }
      } catch (err) {
        console.warn('DeviceOrientation permission request failed:', err);
      }
    }
  };

  const handleInteraction = () => {
    requestOrientationPermission();
  };

  // Fallback: Handle mouse move for desktop users
  useEffect(() => {
    if (hasGyro || !isInitialLoading) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const dx = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const dy = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      setTilt({
        x: -dy * 20, // Pitch (tilt up/down)
        y: dx * 20,  // Roll (tilt left/right)
      });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasGyro, isInitialLoading]);

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

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering parent overlay interaction click
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
    <div 
      className={`reboot-overlay initial-boot ${isUnlocking ? 'overlay-fade-out' : ''}`}
      onTouchStart={handleInteraction}
      onClick={handleInteraction}
    >
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
          <div 
            className={`padlock-container ${isUnlocking ? 'unlock-anim' : ''}`} 
            onClick={handleUnlock}
            style={{
              ['--tilt-x' as any]: `${tilt.x}deg`,
              ['--tilt-y' as any]: `${tilt.y}deg`,
            }}
          >
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
