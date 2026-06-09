import { useEffect, useState } from 'react';
import '../styles/SocialOverlayPage.css';

const POCHACCO_GIFS = [
  'https://media.tenor.com/hcqMKPFXVNsAAAAj/cute-funny.gif',
  'https://media.tenor.com/i7ir6sHYaToAAAAj/dancing-dog-dancing-pochacco.gif',
  'https://media.tenor.com/LliOta9Fa8wAAAAj/pochacco-dancing-pochacco.gif',
  'https://media.tenor.com/mhV0m-KGkscAAAAj/dancing-pochacco-dancing-dog.gif',
  'https://media.tenor.com/ZqUoQQ4kou8AAAAi/ted-puppy.gif',
  'https://media.tenor.com/ImNcEfxo8kEAAAAi/dancing-dance.gif'
];

export function SocialOverlayPage() {
  const [theme, setTheme] = useState<'cyan' | 'magenta' | 'amber'>('cyan');
  const [activeGifIdx, setActiveGifIdx] = useState(0);
  const [gifTransition, setGifTransition] = useState<'in' | 'out'>('in');
  const [followText, setFollowText] = useState('FOLLOW FOR UPDATES');
  const [youtubeHandle, setYoutubeHandle] = useState('@YatoKenji');

  useEffect(() => {
    // Add overlay mode to body for transparency
    document.body.classList.add('overlay-mode');

    // Parse options from URL query params
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme')?.toLowerCase();
    const followParam = params.get('follow');
    const handleParam = params.get('handle') || params.get('channelId');

    if (themeParam === 'magenta') setTheme('magenta');
    if (themeParam === 'amber') setTheme('amber');
    
    if (followParam) setFollowText(followParam);
    if (handleParam) setYoutubeHandle(handleParam.startsWith('@') ? handleParam : `@${handleParam}`);

    return () => {
      document.body.classList.remove('overlay-mode');
    };
  }, []);

  // Rotate through Pochacco GIFs with transition effect
  useEffect(() => {
    const gifInterval = setInterval(() => {
      setGifTransition('out');
      setTimeout(() => {
        setActiveGifIdx((prev) => (prev + 1) % POCHACCO_GIFS.length);
        setGifTransition('in');
      }, 400); // Wait for fade-out to finish
    }, 6000);

    return () => clearInterval(gifInterval);
  }, []);

  // Accent color mapping based on theme choice
  const accentColors = {
    cyan: '#00f0ff',
    magenta: '#ff0055',
    amber: '#ffaa00'
  };
  const activeColor = accentColors[theme];

  return (
    <div className="social-overlay-wrapper">
      {/* Holographic Social Card */}
      <div className={`holo-social-card theme-${theme}`} style={{ '--accent-color': activeColor } as React.CSSProperties}>
        <div className="holo-frame-corner top-left" />
        <div className="holo-frame-corner top-right" />
        <div className="holo-frame-corner bottom-left" />
        <div className="holo-frame-corner bottom-right" />

        <div className="social-content-container">
          {/* Brand Header */}
          <div className="social-platform-label" style={{ color: '#ff0000' }}>
            HASHTAG
          </div>

          {/* Account Details */}
          <div className="social-details">
            <div className="social-handle">#yatokenji</div>
            <div className="social-action-txt">{followText}</div>
          </div>

          {/* Puppy Dance GIF */}
          <div className="puppy-dance-container">
            <img
              src={POCHACCO_GIFS[activeGifIdx]}
              alt="Pochacco Dance"
              className={`puppy-dance-gif transition-${gifTransition}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
