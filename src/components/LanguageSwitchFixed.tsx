import { useState } from 'react';
import { useI18n } from '../i18n';
import { CyberButtonSwitch } from './CyberButtonSwitch';
import './LanguageSwitchFixed.css';

export const LanguageSwitchFixed = () => {
  const { locale, toggleLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(true);

  // Swipe gesture handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 30;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setIsOpen(true); // Swipe left opens (pulls container out)
    } else if (isRightSwipe) {
      setIsOpen(false); // Swipe right closes (hides container)
    }
  };

  return (
    <div 
      className={`language-switch-fixed ${isOpen ? 'open' : 'collapsed'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button 
        className="toggle-collapse-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Hide language switch" : "Show language switch"}
      >
        <svg 
          width="15" 
          height="15" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="arrow-icon"
        >
          <polyline points={isOpen ? "9 5 16 12 9 19" : "15 5 8 12 15 19"} />
        </svg>
      </button>
      <div className="switch-container">
        <CyberButtonSwitch 
          options={[
            { label: 'VN', value: 'vi' },
            { label: 'EN', value: 'en' }
          ]}
          value={locale}
          onChange={() => toggleLocale()}
          activeColor="green"
          size="small"
        />
      </div>
    </div>
  );
};
