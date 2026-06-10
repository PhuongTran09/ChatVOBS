import './DonateSection.css';
import { useI18n } from '../i18n';

interface DonateMethod {
  id: string;
  name: string;
  url: string;
  color: string;
  btnClass: string;
  qrImage?: string;
}

interface DonateSectionProps {
  donateMethods: DonateMethod[];
  activeDonateIdx: number;
  nextDonate: () => void;
}

export function DonateSection({ donateMethods, activeDonateIdx, nextDonate }: DonateSectionProps) {
  const { t } = useI18n();
  const activeDonate = donateMethods[activeDonateIdx];

  return (
    <section className="cyber-section donate-section" id="donate">
      <div className="section-head">
        <span className="badge badge-primary">{t('donate.support')}</span>
      </div>
      
      <div className="donate-container">
        <div className={`donate-carousel glass-card method-${activeDonate.id}`}>
          <div 
            className="donate-track" 
            style={{ transform: `translateX(-${activeDonateIdx * 100}%)` }}
          >
            {donateMethods.map((method) => (
              <div key={method.id} className={`donate-slide method-${method.id}`}>
                <div className="donate-info">
                  <div className="method-header">
                    <span className="donate-method-tag" style={{ borderColor: method.color, color: method.color }}>
                      {method.name}
                    </span>
                    <div className="method-status">
                      <span className="blink-dot"></span> {t('donate.online')}
                    </div>
                  </div>
                  
                  <p className="sys-text">{t('donate.description', { method: method.name })}</p>
                  
                  <div className="donate-actions">
                    <a href={method.url} target="_blank" rel="noopener noreferrer" className={`cyber-btn ${method.btnClass}`}>
                      {t('donate.action', { method: method.name })}
                    </a>
                  </div>
                </div>
                
                <div className="donate-qr-wrapper">
                  <div className="qr-container">
                    <div className="qr-frame">
                      <img 
                        src={method.qrImage || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${method.url}`} 
                        alt={`QR ${method.name}`} 
                      />
                    </div>
                    <span className="qr-label">{t('donate.scan')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="donate-next-btn" onClick={nextDonate} title="Switch Method">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span className="next-label">{t('donate.next')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
