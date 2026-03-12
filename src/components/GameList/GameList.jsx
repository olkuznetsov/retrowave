import { useState, useMemo } from 'react';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import styles from './GameList.module.css';

export default function GameList({ games, consoleId, selectedGameId, onSelectGame }) {
  const [search, setSearch] = useState('');

  const filteredGames = useMemo(() => {
    if (!search.trim()) return games;
    const term = search.toLowerCase();
    return games.filter(
      (g) =>
        g.title.toLowerCase().includes(term) ||
        g.genre?.toLowerCase().includes(term)
    );
  }, [games, search]);

  return (
    <div className={styles.gameList}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className={`input-ffx ${styles.searchInput}`}
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Game count */}
      <p className={styles.count}>
        {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
        {search && ` matching "${search}"`}
      </p>

      {/* Game cards */}
      <div className={styles.list}>
        {filteredGames.length === 0 ? (
          <div className={styles.empty}>
            <p>No games found</p>
            {search && <p className={styles.emptyHint}>Try a different search term</p>}
          </div>
        ) : (
          filteredGames.map((game) => (
            <div
              key={game.id}
              className={`${styles.gameCard} ${selectedGameId === game.id ? styles.selected : ''}`}
              onClick={() => onSelectGame(game)}
            >
              <div className={styles.gameCover}>
                <div className={styles.coverPlaceholder}>
                  {game.title.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div className={styles.gameCardInfo}>
                <h4 className={styles.gameTitle}>{game.title}</h4>
                <div className={styles.gameMeta}>
                  <span>{game.year}</span>
                  {game.genre && (
                    <>
                      <span className={styles.metaDot}>&bull;</span>
                      <span>{game.genre}</span>
                    </>
                  )}
                </div>
              </div>
              <FavoriteButton consoleId={consoleId} gameId={game.id} size={18} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
