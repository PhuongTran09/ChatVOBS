import { useState, useEffect, useRef } from 'react';
import './MiniMusicController.css';
import { useI18n } from '../i18n';

interface Song {
  name: string;
  artist: string;
  url: string;
}

export function MiniMusicController() {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded on mount, swipe/click to collapse
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Sync with global music state
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { isPlaying: playing, volume: vol, currentSong: song } = customEvent.detail;
        setIsPlaying(playing);
        setVolume(vol);
        setCurrentSong(song);
      }
    };

    window.addEventListener('music-state-changed', handleStateChange);
    
    // Request initial state on mount
    window.dispatchEvent(new CustomEvent('request-music-state'));

    return () => {
      window.removeEventListener('music-state-changed', handleStateChange);
    };
  }, []);

  const handlePlayPause = () => {
    const nextState = !isPlaying;
    window.dispatchEvent(new CustomEvent(nextState ? 'music-control-play' : 'music-control-pause'));
  };

  const handleNext = () => {
    window.dispatchEvent(new CustomEvent('music-control-next'));
  };

  const handlePrev = () => {
    window.dispatchEvent(new CustomEvent('music-control-prev'));
  };

  const handleVolumeChange = (v: number) => {
    window.dispatchEvent(new CustomEvent('music-control-set-volume', { detail: v }));
  };

  // Pointer drag/swipe gesture detection
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const diffX = e.clientX - pointerStartRef.current.x;
    const diffY = e.clientY - pointerStartRef.current.y;

    // Detect click/tap if drag distance is tiny
    if (Math.abs(diffX) < 6 && Math.abs(diffY) < 6) {
      if (!isExpanded) {
        setIsExpanded(true);
      }
    } else {
      // Swipe left (diffX < -30) -> Collapse
      if (diffX < -30) {
        setIsExpanded(false);
      }
      // Swipe right (diffX > 30) -> Expand
      else if (diffX > 30) {
        setIsExpanded(true);
      }
    }

    pointerStartRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    pointerStartRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  return (
    <div 
      className={`mini-music-overlay ${isExpanded ? 'expanded' : 'collapsed'}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {isExpanded ? (
        <div className="mini-panel glass-card slide-right-quick">
          {/* Drag Handle indicator */}
          <div className="drag-handle-left">
            <div className="dots-icon">⋮</div>
          </div>
          
          <div className="song-details">
            <div className="song-title-marquee">
              <span className={isPlaying ? 'marquee-scroll' : ''}>
                {currentSong ? currentSong.name : t('music.no_song') || 'No Song Playing'}
              </span>
            </div>
            <div className="song-artist">
              {currentSong ? currentSong.artist : 'System Standby'}
            </div>
          </div>

          <div className="mini-controls">
            <button className="btn-mini-control" onClick={handlePrev} title="Previous">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="3" />
              </svg>
            </button>

            <button className="btn-mini-control btn-play-pause" onClick={handlePlayPause}>
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="8 5 19 12 8 19 8 5" />
                </svg>
              )}
            </button>

            <button className="btn-mini-control" onClick={handleNext} title="Next">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="3" />
              </svg>
            </button>
          </div>

          <div className="mini-volume-wrapper">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="vol-icon">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <input 
              type="range" 
              min="0" 
              max="100" 
              className="mini-volume-slider" 
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
            />
          </div>

          <button className="btn-collapse" onClick={() => setIsExpanded(false)} title="Collapse">
            ◂
          </button>
        </div>
      ) : (
        <div className="mini-handle-chevron" onClick={() => setIsExpanded(true)} title="Swipe right or Click to expand">
          <svg className="chevron-symbol-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M11 21H12C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3H11M11 16L15 12M15 12L11 8M15 12H3" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          {isPlaying && <div className="scanning-line"></div>}
        </div>
      )}
    </div>
  );
}
