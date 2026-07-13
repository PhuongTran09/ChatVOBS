import './SystemOverlays.css';
import { useI18n } from '../i18n';

interface SystemOverlaysProps {
  isRebooting: boolean;
}

export function SystemOverlays({ isRebooting }: SystemOverlaysProps) {
  const { t } = useI18n();

  return (
    <>
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
