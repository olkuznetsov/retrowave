import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import styles from './GameInfo.module.css';

export default function GameInfo({ game, consoleId, consoleName }) {
  const navigate = useNavigate();
  const [coverError, setCoverError] = useState(false);

  // Reset error state when game changes
  useEffect(() => {
    setCoverError(false);
  }, [game?.id]);

  if (!game) {
    return (
      <div className={styles.gameInfo}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="16" cy="12" r="2" />
            </svg>
          </div>
          <p>Select a game to see details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameInfo}>
      {/* Cover Art */}
      <div className={styles.coverSection}>
        <div className={styles.coverArt}>
          {game.cover && !coverError ? (
            <img
              src={game.cover}
              alt={game.title}
              className={styles.coverImage}
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <span className={styles.coverTitle}>{game.title}</span>
              <span className={styles.coverYear}>{game.year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Game Details */}
      <div className={styles.details}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{game.title}</h2>
          <FavoriteButton consoleId={consoleId} gameId={game.id} size={28} />
        </div>

        <div className={styles.meta}>
          <span className={styles.tag}>{consoleName}</span>
          <span className={styles.tag}>{game.year}</span>
          {game.genre && <span className={styles.tag}>{game.genre}</span>}
        </div>

        <p className={styles.description}>{game.description}</p>

        {/* Play Button */}
        <button
          className={`btn-ffx ${styles.playBtn}`}
          onClick={() => navigate(`/play/${consoleId}/${game.id}`)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Play Now
        </button>
      </div>
    </div>
  );
}
