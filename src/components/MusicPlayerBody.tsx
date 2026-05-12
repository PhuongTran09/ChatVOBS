import { useState } from 'react';
import { useI18n } from '../i18n';
import './MusicPlayerBody.css'

export function MusicPlayerBody() {
  const { t } = useI18n();
  const [activeSongIdx, setActiveSongIdx] = useState(0);

  const songs = [
    { name: "Rainy Night in Tokyo", artist: "Lofi Girl / Chillhop", time: "03:20" },
    { name: "Cyberpunk City Lights", artist: "Synthwave Master", time: "04:15" },
    { name: "Neon Dreams (Slowed)", artist: "Nightcrawler", time: "02:50" },
    { name: "Midnight Protocol", artist: "Hacker.wav", time: "03:45" }
  ];

  return (
    <div className="term-body music-player-body">
      <div className="music-main">
        <div className="disc-container">
          <div className="music-disc">
            <div className="disc-inner">
              <div className="disc-label">
                <div className="disc-dot" />
              </div>
            </div>
          </div>
          <div className="disc-arm" />
        </div>
        <div className="music-info">
          <p className="song-title">{songs[activeSongIdx].name}</p>
          <p className="song-artist">{songs[activeSongIdx].artist}</p>
          <div className="music-progress">
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
            <div className="time-info">
              <span>01:45</span>
              <span>{songs[activeSongIdx].time}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="music-controls">
        <button className="m-btn" onClick={() => setActiveSongIdx((prev) => (prev > 0 ? prev - 1 : songs.length - 1))}>{'<<'}</button>
        <button className="m-btn play-btn">{t('music.pause')}</button>
        <button className="m-btn" onClick={() => setActiveSongIdx((prev) => (prev < songs.length - 1 ? prev + 1 : 0))}>{'>>'}</button>
        <div className="volume-slider">
          <span>{t('music.vol')}</span>
          <div className="vol-bar"><div className="vol-fill" /></div>
        </div>
      </div>
      <div className="music-list custom-scrollbar">
        {songs.map((song, idx) => (
          <div 
            key={idx} 
            className={`song-item ${activeSongIdx === idx ? 'active' : ''}`}
            onClick={() => setActiveSongIdx(idx)}
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
