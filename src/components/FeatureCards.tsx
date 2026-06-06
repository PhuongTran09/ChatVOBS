import './FeatureCards.css';
import { useI18n } from '../i18n';

export function FeatureCards() {
  const { t } = useI18n();

  return (
    <div className="features-wrapper" id="features">
      {/* STREAM TOOLS */}
      <div className="icon-group">
        <h4 className="icon-group-title">{t('features.stream.title')}</h4>
        <div className="icon-list">
          <a href="https://obsproject.com" target="_blank" rel="noopener noreferrer" className="cyber-icon-btn obs" title="OBS Studio">
            <svg viewBox="0 0 24 24" className="icon-svg">
              <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="icon-label">OBS STUDIO</span>
          </a>
        </div>
      </div>

      {/* SOCIAL MEDIA */}
      <div className="icon-group">
        <h4 className="icon-group-title">{t('features.social.title')}</h4>
        <div className="icon-list">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="cyber-icon-btn facebook" title="Facebook">
            <svg viewBox="0 0 24 24" className="icon-svg" fill="currentColor">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
            </svg>
            <span className="icon-label">FACEBOOK</span>
          </a>
          
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="cyber-icon-btn tiktok" title="TikTok">
            <svg viewBox="0 0 24 24" className="icon-svg" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.7-3.88-1.72-.01 2.22 0 4.43-.01 6.65-.1 1.48-.51 2.94-1.27 4.21-.99 1.63-2.63 2.76-4.51 3.09-1.89.34-3.9-.03-5.53-1.07-1.78-1.15-2.85-3.12-2.92-5.23-.1-2.02.82-4.04 2.42-5.31C8.29 9.17 10.2 8.58 12.1 8.78c.01 1.42 0 2.84.01 4.26-1.16-.29-2.43-.04-3.29.77-.86.81-1.12 2.12-.66 3.19.46 1.07 1.64 1.77 2.8 1.65 1.14-.12 2.11-.94 2.39-2.05.07-.46.06-.92.06-1.39V0h-.89z"/>
            </svg>
            <span className="icon-label">TIKTOK</span>
          </a>
          
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="cyber-icon-btn twitter" title="X (Twitter)">
            <svg viewBox="0 0 24 24" className="icon-svg" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="icon-label">X / TWITTER</span>
          </a>
        </div>
      </div>
    </div>
  );
}
