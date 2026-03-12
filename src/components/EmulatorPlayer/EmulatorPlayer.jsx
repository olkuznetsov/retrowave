import { useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSaveStates } from '../../hooks/useSaveStates';
import styles from './EmulatorPlayer.module.css';

export default function EmulatorPlayer({ game, consoleData, onExit }) {
  const { user } = useAuth();
  const { uploadSave } = useSaveStates();

  // Listen for save state messages from iframe
  const handleMessage = useCallback(async (event) => {
    if (event.data?.type === 'save-state' && user) {
      try {
        const saveData = event.data.data;
        if (saveData) {
          await uploadSave(consoleData.id, game.id, saveData);
          console.log('Save state uploaded successfully');
        }
      } catch (err) {
        console.error('Failed to upload save state:', err);
      }
    }
  }, [user, consoleData.id, game.id, uploadSave]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // ESC to exit
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onExit]);

  // Build iframe URL
  const params = new URLSearchParams({
    core: consoleData.core,
    rom: game.rom,
    name: game.title,
  });
  if (consoleData.bios) {
    const R2_BASE = import.meta.env.VITE_R2_PUBLIC_URL || '';
    params.set('bios', `${R2_BASE}/bios/${consoleData.bios}`);
  }

  return (
    <div className={styles.playerContainer}>
      {/* Exit button */}
      <button className={styles.exitBtn} onClick={onExit} title="Exit (ESC)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        <span>Exit</span>
      </button>

      {/* Game title bar */}
      <div className={styles.titleBar}>
        <span className={styles.gameName}>{game.title}</span>
        <span className={styles.consoleBadge}>{consoleData.shortName}</span>
      </div>

      {/* Emulator iframe */}
      <iframe
        src={`/emulator.html?${params.toString()}`}
        className={styles.iframe}
        title={`Playing ${game.title}`}
        allow="gamepad; autoplay"
        allowFullScreen
      />
    </div>
  );
}
