import { ClockOverlayPage } from './ClockOverlayPage';
import { QROverlayPage } from './QROverlayPage';
import { SubOverlayPage } from './SubOverlayPage';
import { SocialOverlayPage } from './SocialOverlayPage';
import { TransitionOverlayPage } from './TransitionOverlayPage';
import '../styles/CombinedOverlayPage.css';

export function CombinedOverlayPage() {
  return (
    <div className="combined-overlay-container">
      {/* Bottom-left corner: Clock overlay */}
      <ClockOverlayPage />

      {/* Right margin sidebar stack: QR on top, Sub in middle, Social below it */}
      <div className="combined-right-sidebar">
        <QROverlayPage />
        <SubOverlayPage />
        <SocialOverlayPage />
      </div>

      {/* Bottom-right corner: Transition overlay */}
      <TransitionOverlayPage />
    </div>
  );
}
