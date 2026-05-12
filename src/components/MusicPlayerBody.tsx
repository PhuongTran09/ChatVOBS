import { useI18n } from '../i18n';
import './MusicPlayerBody.css'

export function MusicPlayerBody() {
  const { t } = useI18n();

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
          <p className="song-title">Rainy Night in Tokyo</p>
          <p className="song-artist">Lofi Girl / Chillhop</p>
          <div className="music-progress">
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
            <div className="time-info">
              <span>01:45</span>
              <span>03:20</span>
            </div>
          </div>
        </div>
      </div>
      <div className="music-controls">
        <button className="m-btn">{'<<'}</button>
        <button className="m-btn play-btn">{t('music.pause')}</button>
        <button className="m-btn">{'>>'}</button>
        <div className="volume-slider">
          <span>{t('music.vol')}</span>
          <div className="vol-bar"><div className="vol-fill" /></div>
        </div>
      </div>
      <div className="music-list custom-scrollbar">
        <div className="song-item active">
          <span className="status-icon">▶</span>
          <span className="s-name">Rainy Night in Tokyo</span>
          <span className="s-time">03:20</span>
        </div>
        <div className="song-item">
          <span className="status-icon"> </span>
          <span className="s-name">Cyberpunk City Lights</span>
          <span className="s-time">04:15</span>
        </div>
        <div className="song-item">
          <span className="status-icon"> </span>
          <span className="s-name">Neon Dreams (Slowed)</span>
          <span className="s-time">02:50</span>
        </div>
        <div className="song-item">
          <span className="status-icon"> </span>
          <span className="s-name">Midnight Protocol</span>
          <span className="s-time">03:45</span>
        </div>
      </div>
    </div>
  );
}
