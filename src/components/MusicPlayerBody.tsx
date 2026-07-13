import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import './MusicPlayerBody.css';
import { subscribeToActiveSongs, type SongDoc } from '../services';

// Persistent audio state across unmount/remount
let globalAudio: HTMLAudioElement | null = null;
let globalAudioCtx: AudioContext | null = null;
let globalAnalyser: AnalyserNode | null = null;
let globalIsPlaying = false;
let globalActiveSongIdx = 0;
let globalVolume = 80;
let globalCurrentTime = 0;
let globalDuration = 0;
let globalSongList: SongDoc[] = [];

// Helper to map SongDoc to the Song format used in controllers
const mapSongs = (list: SongDoc[]) => {
  return list.map((item) => ({
    name: item.title,
    artist: item.artist,
    time: item.duration,
    url: item.url,
  }));
};

let globalSongs = mapSongs(globalSongList);

// Helper to broadcast state to all listening components
const broadcastState = () => {
  const currentSong = globalSongs[globalActiveSongIdx] || null;
  const state = {
    isPlaying: globalIsPlaying,
    activeSongIdx: globalActiveSongIdx,
    volume: globalVolume,
    currentSong,
    songs: globalSongs,
    currentTime: globalCurrentTime,
    duration: globalDuration
  };
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('music-state-changed', { detail: state }));
  }
};

// Subscribe to Firebase songs at module level to keep song list always in sync
if (typeof window !== 'undefined') {
  subscribeToActiveSongs(
    (data) => {
      globalSongList = data;
      globalSongs = mapSongs(data);
      broadcastState();
    },
    (error) => {
      console.error('Error loading songs globally:', error);
    }
  );
}

// Initialize Web Audio API analyser
const initAnalyser = (audio: HTMLAudioElement) => {
  if (globalAudioCtx) return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;

    audio.crossOrigin = "anonymous";
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    globalAudioCtx = ctx;
    globalAnalyser = analyser;
    
    // Set on window so other components can access it if needed
    (window as any).globalAudioCtx = ctx;
  } catch (e) {
    console.warn("Audio Context initialization failed or source already connected:", e);
  }
};

// Ensure audio element is created and event listeners are bound
const ensureAudioInitialized = () => {
  if (globalAudio) return globalAudio;

  const audio = new Audio();
  audio.crossOrigin = "anonymous";
  audio.volume = globalVolume / 100;
  globalAudio = audio;
  (window as any).globalAudio = audio;

  audio.addEventListener('timeupdate', () => {
    globalCurrentTime = audio.currentTime;
    broadcastState();
  });

  audio.addEventListener('loadedmetadata', () => {
    globalDuration = audio.duration;
    broadcastState();
  });

  audio.addEventListener('ended', () => {
    if (globalSongs.length === 0) return;
    
    globalActiveSongIdx = (globalActiveSongIdx + 1) % globalSongs.length;
    globalIsPlaying = true;
    
    const nextSong = globalSongs[globalActiveSongIdx];
    if (nextSong) {
      audio.src = nextSong.url;
      audio.load();
      audio.play().catch((err) => {
        console.warn("Playback failed on ended:", err);
        globalIsPlaying = false;
        broadcastState();
      });
    }
    broadcastState();
  });

  return audio;
};

// Bind global control events
if (typeof window !== 'undefined') {
  window.addEventListener('music-control-play', () => {
    const audio = ensureAudioInitialized();
    globalIsPlaying = true;
    
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
    
    const currentSong = globalSongs[globalActiveSongIdx];
    if (currentSong) {
      const targetUrl = new URL(currentSong.url, window.location.href).href;
      if (audio.src !== targetUrl) {
        audio.src = currentSong.url;
        audio.load();
      }
    }
    
    audio.play().catch((err) => {
      console.warn("Global play failed:", err);
    });
    
    broadcastState();
  });

  window.addEventListener('music-control-pause', () => {
    const audio = ensureAudioInitialized();
    globalIsPlaying = false;
    audio.pause();
    broadcastState();
  });

  window.addEventListener('music-control-next', () => {
    const audio = ensureAudioInitialized();
    if (globalSongs.length === 0) return;
    
    globalActiveSongIdx = (globalActiveSongIdx + 1) % globalSongs.length;
    globalIsPlaying = true;
    
    const currentSong = globalSongs[globalActiveSongIdx];
    if (currentSong) {
      audio.src = currentSong.url;
      audio.load();
      audio.play().catch((err) => {
        console.warn("Global next failed:", err);
      });
    }
    broadcastState();
  });

  window.addEventListener('music-control-prev', () => {
    const audio = ensureAudioInitialized();
    if (globalSongs.length === 0) return;
    
    globalActiveSongIdx = (globalActiveSongIdx - 1 + globalSongs.length) % globalSongs.length;
    globalIsPlaying = true;
    
    const currentSong = globalSongs[globalActiveSongIdx];
    if (currentSong) {
      audio.src = currentSong.url;
      audio.load();
      audio.play().catch((err) => {
        console.warn("Global prev failed:", err);
      });
    }
    broadcastState();
  });

  window.addEventListener('music-control-select-song', (e: Event) => {
    const customEvent = e as CustomEvent;
    if (typeof customEvent.detail === 'number') {
      const idx = customEvent.detail;
      if (idx < 0 || idx >= globalSongs.length) return;
      
      const audio = ensureAudioInitialized();
      globalActiveSongIdx = idx;
      globalIsPlaying = true;
      
      const currentSong = globalSongs[globalActiveSongIdx];
      if (currentSong) {
        audio.src = currentSong.url;
        audio.load();
        audio.play().catch((err) => {
          console.warn("Select song play failed:", err);
        });
      }
      broadcastState();
    }
  });

  window.addEventListener('music-control-seek', (e: Event) => {
    const customEvent = e as CustomEvent;
    if (typeof customEvent.detail === 'number') {
      const time = customEvent.detail;
      const audio = ensureAudioInitialized();
      audio.currentTime = time;
      globalCurrentTime = time;
      broadcastState();
    }
  });

  window.addEventListener('music-control-set-volume', (e: Event) => {
    const customEvent = e as CustomEvent;
    if (typeof customEvent.detail === 'number') {
      const vol = customEvent.detail;
      globalVolume = vol;
      const audio = ensureAudioInitialized();
      audio.volume = vol / 100;
      broadcastState();
    }
  });

  window.addEventListener('request-music-state', () => {
    broadcastState();
  });

  window.addEventListener('play-global-music', () => {
    window.dispatchEvent(new CustomEvent('music-control-play'));
  });
}

interface MusicPlayerBodyProps {
  isOpen?: boolean;
}

export function MusicPlayerBody(_props: MusicPlayerBodyProps) {
  const { t } = useI18n();
  const [activeSongIdx, setActiveSongIdx] = useState(globalActiveSongIdx);
  const [volume, setVolume] = useState(globalVolume);
  const [isPlaying, setIsPlaying] = useState(globalIsPlaying);
  const [currentTime, setCurrentTime] = useState(globalCurrentTime);
  const [duration, setDuration] = useState(globalDuration);
  const [songs, setSongs] = useState(globalSongs);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Sync state with global audio player
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { 
          isPlaying: playing, 
          activeSongIdx: idx, 
          volume: vol, 
          currentTime: time, 
          duration: dur, 
          songs: list 
        } = customEvent.detail;
        
        setIsPlaying(playing);
        setActiveSongIdx(idx);
        setVolume(vol);
        setCurrentTime(time);
        setDuration(dur);
        setSongs(list);
      }
    };

    window.addEventListener('music-state-changed', handleStateChange);
    // Request initial state on mount
    window.dispatchEvent(new CustomEvent('request-music-state'));

    return () => {
      window.removeEventListener('music-state-changed', handleStateChange);
    };
  }, []);

  // Initialize analyser if playing
  useEffect(() => {
    if (isPlaying && globalAudio) {
      initAnalyser(globalAudio);
    }
  }, [isPlaying]);

  // Canvas visualizer rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawWaveform = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Render static cyberpunk background bars if paused
      if (!isPlaying || !globalAnalyser) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
        const barWidth = 4;
        const barGap = 3;
        const totalBars = Math.floor(width / (barWidth + barGap));
        for (let i = 0; i < totalBars; i++) {
          const barHeight = 8 + Math.sin(i * 0.15) * 6;
          const x = i * (barWidth + barGap);
          const y = height - barHeight;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
        animationRef.current = requestAnimationFrame(drawWaveform);
        return;
      }

      const bufferLength = globalAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      globalAnalyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        const percent = val / 255;
        const barHeight = Math.max(4, percent * height * 0.85);

        const greenShade = Math.floor(200 + percent * 55);
        const blueShade = Math.floor(100 + percent * 155);
        ctx.fillStyle = `rgb(0, ${greenShade}, ${blueShade})`;

        ctx.shadowColor = `rgba(0, ${greenShade}, ${blueShade}, 0.5)`;
        ctx.shadowBlur = isPlaying ? 4 : 0;

        const y = height - barHeight;
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        x += barWidth;
      }

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(drawWaveform);
    };

    animationRef.current = requestAnimationFrame(drawWaveform);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    window.dispatchEvent(new CustomEvent(isPlaying ? 'music-control-pause' : 'music-control-play'));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    window.dispatchEvent(new CustomEvent('music-control-seek', { detail: newTime }));
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const currentSong = songs[activeSongIdx] || { name: 'NO_TRACK_LOADED', artist: 'UNKNOWN' };

  return (
    <div className="term-body music-player-body">
      <div className="music-main">
        <div className="music-info">
          <p className="song-title">{currentSong.name}</p>
          <p className="song-artist">{currentSong.artist}</p>
          <div className="music-progress">
            <div className="progress-bar" onClick={handleProgressClick} style={{ cursor: 'pointer' }}>
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="time-info">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || currentTime)}</span>
            </div>
          </div>
        </div>
        <div className="visualizer-container">
          <canvas ref={canvasRef} className="music-waveform-canvas" width={360} height={100} />
        </div>
      </div>
      <div className="music-controls">
        <button className="m-btn" onClick={() => {
          window.dispatchEvent(new CustomEvent('music-control-prev'));
        }}>{'<<'}</button>
        <button className="m-btn play-btn" onClick={togglePlay}>
          {isPlaying ? t('music.pause') : t('music.play')}
        </button>
        <button className="m-btn" onClick={() => {
          window.dispatchEvent(new CustomEvent('music-control-next'));
        }}>{'>>'}</button>
        <div className="volume-slider">
          <span>{t('music.vol')}</span>
          <input 
            type="range" 
            className="vol-input-green" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => {
              window.dispatchEvent(new CustomEvent('music-control-set-volume', { detail: Number(e.target.value) }));
            }} 
            style={{ '--vol-percent': `${volume}%` } as React.CSSProperties}
          />
        </div>
      </div>
      <div className="music-list custom-scrollbar">
        {songs.map((song, idx) => (
          <div 
            key={idx} 
            className={`song-item ${activeSongIdx === idx ? 'active' : ''}`}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('music-control-select-song', { detail: idx }));
            }}
          >
            <span className="status-icon">{activeSongIdx === idx ? '▶' : ' '}</span>
            <span className="s-name">{song.name}</span>
            <span className="s-time">{song.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
