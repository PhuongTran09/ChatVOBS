import { useEffect, useState } from 'react';
import '../styles/QROverlayPage.css';
import { subscribeToActiveDonates } from '../services';

interface DonateMethod {
  id: string;
  name: string;
  url: string;
  color: string;
  qrImage?: string;
  description?: string;
}

export function QROverlayPage() {
  const [donateMethods, setDonateMethods] = useState<DonateMethod[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [methodParam, setMethodParam] = useState<string | null>(null);
  const [intervalParam, setIntervalParam] = useState<number>(40); // Default 40s as requested
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    document.body.classList.add('overlay-mode');
    
    const params = new URLSearchParams(window.location.search);
    const cycleTime = params.get('interval');
    if (cycleTime) {
      const parsed = parseInt(cycleTime, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setIntervalParam(parsed);
      }
    }

    return () => {
      document.body.classList.remove('overlay-mode');
    };
  }, []);

  // Fetch active donate methods from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToActiveDonates(
      (list) => {
        setDonateMethods(list);
        
        const params = new URLSearchParams(window.location.search);
        const method = params.get('method')?.toLowerCase();
        
        if (method && list.some(m => m.id === method)) {
          setMethodParam(method);
          const idx = list.findIndex(m => m.id === method);
          setActiveIdx(idx);
        } else {
          setMethodParam('all');
        }
      },
      (error) => {
        console.error('Failed to load active donates:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (methodParam !== 'all' || donateMethods.length === 0) return;

    const interval = setInterval(() => {
      // Trigger slide out animation
      setIsAnimating(true);
      
      setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % donateMethods.length);
        setIsAnimating(false);
      }, 800); // match CSS transition duration
      
    }, intervalParam * 1000);

    return () => clearInterval(interval);
  }, [methodParam, intervalParam, donateMethods]);

  const activeDonate = donateMethods[activeIdx];

  if (!activeDonate) {
    return null;
  }

  return (
    <div className="qr-overlay-wrapper">
      <div 
        className={`qr-overlay-card ${isAnimating ? 'slide-out' : 'slide-in'}`}
        style={{ '--accent-color': activeDonate.color } as React.CSSProperties}
      >
        {/* Cyberpunk decorative elements */}
        <div className="corner-decor top-left" />
        <div className="corner-decor top-right" />
        <div className="corner-decor bottom-left" />
        <div className="corner-decor bottom-right" />
        <div className="scanline-overlay" />
        <div className="cyber-grid-overlay" />
        <div className="side-vertical-label">YATO KENJI</div>

        <div className="overlay-header">
          <div className="method-glow-title">
            <span className="deco-dot"></span>
            {activeDonate.name}
          </div>
          <div className="status-indicator">
            <span className="pulse-dot" />
            LIVE
          </div>
        </div>

        <div className="qr-overlay-container">
          <div className="qr-overlay-frame">
            <img 
              src={activeDonate.qrImage || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(activeDonate.url)}`} 
              alt={`QR ${activeDonate.name}`} 
              className="qr-img" 
            />
            <div className="scanning-bar" />
          </div>
        </div>

        <div className="overlay-footer">
          <div className="donation-name-badge">
            <span className="badge-prefix">DONATE</span>
            <span className="badge-name">{activeDonate.name}</span>
          </div>
          <span className="footer-deco-line" />
        </div>
      </div>
    </div>
  );
}
