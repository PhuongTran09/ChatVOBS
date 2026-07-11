import { useState, useEffect, useRef, useMemo } from 'react';
import { useI18n } from '../i18n';
import './MusicPlayerBody.css';
import { subscribeToActiveSongs, type SongDoc } from '../services';

// Keep audio context and player persistent across unmount/remount (e.g. portal transition on maximize)
let globalAudio: HTMLAudioElement | null = null;
let globalAudioCtx: AudioContext | null = null;
let globalAnalyser: AnalyserNode | null = null;
let globalIsPlaying = false;
let globalActiveSongIdx = 0;
let globalVolume = 80;
let globalCurrentTime = 0;
let globalDuration = 0;
let globalSongList: SongDoc[] = [];
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
  const [songList, setSongList] = useState<SongDoc[]>(globalSongList);

  useEffect(() => {
    const unsubscribe = subscribeToActiveSongs(
      (data) => {
        setSongList(data);
        globalSongList = data;
      },
      (error) => {
        console.error('Error loading songs:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const songs = useMemo(() => {
    return songList.map((item) => ({
      name: item.title,
      artist: item.artist,
      time: item.duration,
      url: item.url,
    }));
  }, [songList]);

  const audioRef = useRef<HTMLAudioElement | null>(globalAudio);
  const audioCtxRef = useRef<AudioContext | null>(globalAudioCtx);
  const analyserRef = useRef<AnalyserNode | null>(globalAnalyser);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Track mounting instances to pause audio when closed (but not on portal/maximize transition)
  useEffect(() => {
    globalMountedInstances++;
    return () => {
      globalMountedInstances--;
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

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
        console.warn("Audio Context initialization failed or source already connected:", e);
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
      audioRef.current.volume = globalVolume / 100;
      globalAudio = audioRef.current;
    }

    if (songs.length === 0) return;
    const currentSong = songs[activeSongIdx];
    if (!currentSong) return;

    const audio = audioRef.current;
    
    // Only set src if it's different to prevent resetting playback position on mount
    const targetUrl = new URL(currentSong.url, window.location.href).href;
    if (audio.src !== targetUrl) {
      audio.src = currentSong.url;
      audio.load();
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setActiveSongIdx((prev) => {
        if (prev < songs.length - 1) {
          setIsPlaying(true);
          return prev + 1;
        } else {
          setIsPlaying(false);
          return 0;
        }
      });
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
  }, [activeSongIdx, songs, isPlaying]);

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
      if (!isPlaying || !analyserRef.current) {
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

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        // Scale frequency value to canvas height
        const percent = val / 255;
        const barHeight = Math.max(4, percent * height * 0.85);

        // Cyberpunk green-cyan gradient colors
        const greenShade = Math.floor(200 + percent * 55);
        const blueShade = Math.floor(100 + percent * 155);
        ctx.fillStyle = `rgb(0, ${greenShade}, ${blueShade})`;

        // Glow effect
        ctx.shadowColor = `rgba(0, ${greenShade}, ${blueShade}, 0.5)`;
        ctx.shadowBlur = isPlaying ? 4 : 0;

        const y = height - barHeight;
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        x += barWidth;
      }

      // Reset shadows
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
          if (songs.length === 0) return;
          setActiveSongIdx((prev) => (prev > 0 ? prev - 1 : songs.length - 1));
          setIsPlaying(true);
        }}>{'<<'}</button>
        <button className="m-btn play-btn" onClick={togglePlay}>
          {isPlaying ? t('music.pause') : t('music.play')}
        </button>
        <button className="m-btn" onClick={() => {
          if (songs.length === 0) return;
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
