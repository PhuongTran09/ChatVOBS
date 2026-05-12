import './FloatingButtons.css';
import { useI18n } from '../i18n';

interface FloatingButtonsProps {
  showScrollTop: boolean;
  scrollToTop: () => void;
  isAnyTerminalClosed: boolean;
  reopenTerminals: () => void;
}

export function FloatingButtons({ 
  showScrollTop, 
  scrollToTop, 
  isAnyTerminalClosed, 
  reopenTerminals 
}: FloatingButtonsProps) {
  const { t } = useI18n();

  return (
    <>
      {/* SCROLL TO TOP BUTTON */}
      <button 
        className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        aria-label={t('floating.scroll_top')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 13 12 7 6 13"></polyline>
          <polyline points="16 19 12 15 8 19" className="sub-arrow" strokeWidth="2"></polyline>
        </svg>
      </button>

      {/* RESTORE TERMINALS BUTTON */}
      <button 
        className={`restore-terminals-btn ${isAnyTerminalClosed ? 'visible' : ''}`} 
        onClick={reopenTerminals}
        aria-label={t('floating.restore_terminals')}
      >
        <div className="btn-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <span className="btn-glitch-layer"></span>
        </div>
      </button>
    </>
  );
}
