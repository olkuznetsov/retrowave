import { useMusic } from '../../hooks/useMusic';
import styles from './MusicToggle.module.css';

export default function MusicToggle() {
  const { isPlaying, volume, toggleMusic, changeVolume } = useMusic();

  return (
    <div className={styles.container}>
      <button
        className={`${styles.toggleBtn} ${isPlaying ? styles.playing : ''}`}
        onClick={toggleMusic}
        title={isPlaying ? 'Mute ambient music' : 'Play ambient music'}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>

      {isPlaying && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => changeVolume(parseFloat(e.target.value))}
          className={styles.volumeSlider}
          title="Volume"
        />
      )}
    </div>
  );
}
