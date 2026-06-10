import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import './MusicPlayerBody.css';

// Keep audio context and player persistent across unmount/remount (e.g. portal transition on maximize)
let globalAudio: HTMLAudioElement | null = null;
let globalAudioCtx: AudioContext | null = null;
let globalAnalyser: AnalyserNode | null = null;
let globalIsPlaying = false;
let globalActiveSongIdx = 0;
let globalVolume = 80;
let globalCurrentTime = 0;
let globalDuration = 0;
let globalMountedInstances = 0;

interface MusicPlayerBodyProps {
  isOpen?: boolean;
}

export function MusicPlayerBody({ isOpen = true }: MusicPlayerBodyProps) {
  const { t } = useI18n();
  const [activeSongIdx, setActiveSongIdx] = useState(globalActiveSongIdx);
  const [volume, setVolume] = useState(globalVolume);
  const [isPlaying, setIsPlaying] = useState(globalIsPlaying);
  const [currentTime, setCurrentTime] = useState(globalCurrentTime);
  const [duration, setDuration] = useState(globalDuration);

  const songs = [
    { name: "No Sleep", artist: "Kontraa", time: "02:13", url: "/kontraa-no-sleep-hiphop-music-473847.mp3" },
    { name: "Rainy Night in Tokyo", artist: "Lofi Girl / Chillhop", time: "06:12", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { name: "Cyberpunk City Lights", artist: "Synthwave Master", time: "07:05", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { name: "Neon Dreams (Slowed)", artist: "Nightcrawler", time: "05:44", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { name: "Midnight Protocol", artist: "Hacker.wav", time: "05:02", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
  ];

  const audioRef = useRef<HTMLAudioElement | null>(globalAudio);
  const audioCtxRef = useRef<AudioContext | null>(globalAudioCtx);
  const analyserRef = useRef<AnalyserNode | null>(globalAnalyser);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Sync state to global variables
  useEffect(() => {
    globalActiveSongIdx = activeSongIdx;
  }, [activeSongIdx]);

  useEffect(() => {
    globalVolume = volume;
  }, [volume]);

  useEffect(() => {
    globalIsPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    globalCurrentTime = currentTime;
  }, [currentTime]);

  useEffect(() => {
    globalDuration = duration;
  }, [duration]);

  // Initialize Web Audio API
  const initAudio = () => {
    if (audioCtxRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128; // gives us 64 frequency bins

    if (audioRef.current) {
      audioRef.current.crossOrigin = "anonymous";
      try {
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
      } catch (e) {
        console.warn("Failed to connect media element source:", e);
      }
    }

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    globalAudioCtx = ctx;
    globalAnalyser = analyser;
  };

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Sync source and handle song change
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.volume = volume / 100;
      globalAudio = audioRef.current;
    }

    const audio = audioRef.current;
    
    // Only set src if it's different to prevent resetting playback position on mount
    const targetUrl = new URL(songs[activeSongIdx].url, window.location.href).href;
    if (audio.src !== targetUrl) {
      audio.src = songs[activeSongIdx].url;
      audio.load();
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setActiveSongIdx((prev) => (prev < songs.length - 1 ? prev + 1 : 0));
      setIsPlaying(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Sync metadata immediately on mount if already loaded
    if (audio.duration) {
      setDuration(audio.duration);
    }
    setCurrentTime(audio.currentTime);

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn("Playback failed:", err);
        setIsPlaying(false);
      });
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeSongIdx]);

  // Play/Pause effect
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      initAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current.play().catch((err) => {
        console.warn("Playback failed:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Stop audio if terminal is explicitly closed
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      globalIsPlaying = false;
    }
  }, [isOpen]);

  // Clean up animation and handle conditional pause on unmount
  useEffect(() => {
    globalMountedInstances++;
    return () => {
      globalMountedInstances--;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // If no other instances of the player are mounted after 50ms (i.e. not a Portal transition),
      // we pause the audio and reset the global state.
      setTimeout(() => {
        if (globalMountedInstances === 0) {
          if (globalAudio) {
            globalAudio.pause();
            globalIsPlaying = false;
          }
        }
      }, 50);
    };
  }, []);

  // Animation loop for horizontal waveform visualizer
  useEffect(() => {
    const dataArray = new Uint8Array(64);
    let lastTime = performance.now();
    let volumeFactor = 0;

    const drawWaveform = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationRef.current = requestAnimationFrame(drawWaveform);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(drawWaveform);
        return;
      }

      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Smooth play/pause volume transition
      if (isPlaying) {
        volumeFactor = Math.min(1, volumeFactor + dt * 4);
      } else {
        volumeFactor = Math.max(0, volumeFactor - dt * 2);
      }

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 64;
      let hasRealData = false;

      if (isPlaying && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        // Check if data has real non-zero values
        for (let i = 0; i < 8; i++) {
          if (dataArray[i] > 0) {
            hasRealData = true;
            break;
          }
        }
      }

      // Simulated beat if offline / CORS blocks / loading
      if (!hasRealData) {
        const beatPeriod = 60000 / 80; // 80 BPM lofi pulse
        const timeInBeat = (Date.now() % beatPeriod) / beatPeriod;
        const simulatedPulse = Math.pow(Math.max(0, 1 - timeInBeat * 3.5), 2.5);

        for (let i = 0; i < 64; i++) {
          const freqFactor = 1 - i / 64;
          const wave = Math.sin(i * 0.2 + Date.now() * 0.005) * 20 + 20;
          const pulse = simulatedPulse * 150 * freqFactor;
          dataArray[i] = (wave + pulse) * volumeFactor;
        }
      } else {
        // Apply volumeFactor transition to real data to fade in/out smoothly
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = dataArray[i] * volumeFactor;
        }
      }

      // Draw horizontal spectrum bars
      const barCount = 24;
      const barWidth = 8;
      const barGap = 5;
      const maxBarHeight = height - 12;
      const totalWidth = barCount * barWidth + (barCount - 1) * barGap;
      const startX = (width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIdx = Math.floor((i / barCount) * 45); // Focus on low-to-mid range frequencies
        const val = dataArray[dataIdx] || 0;
        const barHeight = (val / 255) * maxBarHeight;

        const x = startX + i * (barWidth + barGap);

        // 1. Draw background slot/grid bar
        ctx.fillStyle = 'rgba(0, 255, 0, 0.06)';
        ctx.fillRect(x, 6, barWidth, maxBarHeight);

        // 2. Draw active glowing vertical bar
        if (barHeight > 0) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
          ctx.fillStyle = '#00ff00';
          ctx.fillRect(x, height - barHeight - 6, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }
      }

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
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="term-body music-player-body">
      <div className="music-main">
        <div className="music-info">
          <p className="song-title">{songs[activeSongIdx].name}</p>
          <p className="song-artist">{songs[activeSongIdx].artist}</p>
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
          setActiveSongIdx((prev) => (prev > 0 ? prev - 1 : songs.length - 1));
          setIsPlaying(true);
        }}>{'<<'}</button>
        <button className="m-btn play-btn" onClick={togglePlay}>
          {isPlaying ? t('music.pause') : t('music.play')}
        </button>
        <button className="m-btn" onClick={() => {
          setActiveSongIdx((prev) => (prev < songs.length - 1 ? prev + 1 : 0));
          setIsPlaying(true);
        }}>{'>>'}</button>
        <div className="volume-slider">
          <span>{t('music.vol')}</span>
          <input 
            type="range" 
            className="vol-input-green" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))} 
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
              setActiveSongIdx(idx);
              setIsPlaying(true);
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
