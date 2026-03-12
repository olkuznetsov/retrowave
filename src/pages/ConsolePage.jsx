import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getConsole, getGamesForConsole } from '../data/consoles';
import GameList from '../components/GameList/GameList';
import GameInfo from '../components/GameInfo/GameInfo';
import styles from './ConsolePage.module.css';

export default function ConsolePage() {
  const { consoleId } = useParams();
  const [selectedGame, setSelectedGame] = useState(null);

  const consoleData = getConsole(consoleId);
  const games = getGamesForConsole(consoleId);

  if (!consoleData) {
    return (
      <div className={styles.notFound}>
        <h2>Console not found</h2>
        <Link to="/" className="btn-ffx">Back to Consoles</Link>
      </div>
    );
  }

  return (
    <div className={styles.consolePage}>
      {/* Header */}
      <div className={styles.header}>
        <Link to="/" className={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>
        <div className={styles.headerInfo}>
          <h1 className={styles.consoleTitle}>{consoleData.name}</h1>
          <div className={styles.headerMeta}>
            <span>{consoleData.manufacturer}</span>
            <span>&bull;</span>
            <span>{consoleData.year}</span>
            <span>&bull;</span>
            <span>{games.length} games</span>
          </div>
        </div>
      </div>

      {/* Split Panel */}
      <div className={styles.splitPanel}>
        {/* Left — Game List */}
        <div className={`glass-panel ${styles.leftPanel}`}>
          <GameList
            games={games}
            consoleId={consoleId}
            selectedGameId={selectedGame?.id}
            onSelectGame={setSelectedGame}
          />
        </div>

        {/* Right — Game Info */}
        <div className={`glass-panel ${styles.rightPanel}`}>
          <GameInfo
            game={selectedGame}
            consoleId={consoleId}
            consoleName={consoleData.shortName}
          />
        </div>
      </div>
    </div>
  );
}
