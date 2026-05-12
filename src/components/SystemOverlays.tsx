import './SystemOverlays.css';
import { useI18n } from '../i18n';

interface SystemOverlaysProps {
  isInitialLoading: boolean;
  isRebooting: boolean;
}

export function SystemOverlays({ isInitialLoading, isRebooting }: SystemOverlaysProps) {
  const { t } = useI18n();

  return (
    <>
      {/* INITIAL SYSTEM BOOT OVERLAY */}
      {isInitialLoading && (
        <div className="reboot-overlay initial-boot">
          <div className="reboot-content">
            <div className="reboot-glitch" data-text={t('system.booting')}>{t('system.booting')}</div>
            <div className="reboot-bar">
              <div className="reboot-fill" style={{ animationDuration: '2.5s' }}></div>
            </div>
            <div className="reboot-logs">
              <p className="log-entry">{t('system.initializing')}</p>
              <p className="log-entry delay-1" style={{ animationDelay: '0.6s' }}>{t('system.loading_overlays')}</p>
              <p className="log-entry delay-2" style={{ animationDelay: '1.2s' }}>{t('system.establishing')}</p>
              <p className="log-entry" style={{ animationDelay: '1.8s', opacity: 0, animationFillMode: 'forwards' }}>{t('system.ready')}</p>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM REBOOT OVERLAY */}
      {isRebooting && (
        <div className="reboot-overlay">
          <div className="reboot-content">
            <div className="reboot-glitch" data-text={t('system.rebooting')}>{t('system.rebooting')}</div>
            <div className="reboot-bar">
              <div className="reboot-fill"></div>
            </div>
            <div className="reboot-logs">
              <p className="log-entry">{t('system.loading_kernel')}</p>
              <p className="log-entry delay-1">{t('system.mounting')}</p>
              <p className="log-entry delay-2">{t('system.starting_core')}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
