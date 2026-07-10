import { useEffect, useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSaveStates } from '../../hooks/useSaveStates';
import styles from './EmulatorPlayer.module.css';

// Safe for SSR/test environments — guard with typeof
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export default function EmulatorPlayer({ game, consoleData, onExit }) {
  const { user } = useAuth();
  const { uploadSave } = useSaveStates();
  const [gamepadCount, setGamepadCount] = useState(0);

  // Build emulator URL — memoize to avoid rebuilding on every render
  const emulatorUrl = useMemo(() => {
    const params = new URLSearchParams({
      core: consoleData.core,
      rom: game.rom,
      name: game.title,
      returnUrl: window.location.href,
    });
    if (consoleData.bios) {
      const R2_BASE = import.meta.env.VITE_R2_PUBLIC_URL || '';
      params.set('bios', `${R2_BASE}/bios/${consoleData.bios}`);
    }
    return `/emulator.html?${params.toString()}`;
  }, [consoleData.core, consoleData.bios, game.rom, game.title]);

  // On mobile: navigate directly to emulator.html (avoids iOS WebGL-in-iframe block)
  useEffect(() => {
    if (isMobile) {
      window.location.href = emulatorUrl;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fire once on mount — URL is stable for the session

  // Listen for save state messages from iframe (desktop only)
  const handleMessage = useCallback(async (event) => {
    if (event.data?.type === 'save-state' && user) {
      try {
        const saveData = event.data.data;
        if (saveData) {
          await uploadSave(consoleData.id, game.id, saveData);
        }
      } catch (err) {
        console.error('Failed to upload save state:', err);
      }
    }
  }, [user, consoleData.id, game.id, uploadSave]);

  useEffect(() => {
    if (isMobile) return; // No iframe on mobile — no messages to listen for
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // ESC to exit (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const handleKey = (e) => { if (e.key === 'Escape') onExit(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onExit]);

  // Gamepad detection — shows indicator when controller is connected
  useEffect(() => {
    if (isMobile) return;
    const countPads = () => Array.from(navigator.getGamepads()).filter(Boolean).length;
    const onConnect = () => setGamepadCount(countPads());
    const onDisconnect = () => setGamepadCount(countPads());
    setGamepadCount(countPads());
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  // Mobile: show loading state while redirecting
  if (isMobile) {
    return (
      <div className={styles.playerContainer}>
        <div className={styles.mobileRedirect}>
          <div className={styles.mobileSpinner} />
          <p>Loading game…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playerContainer}>
      <button className={styles.exitBtn} onClick={onExit} title="Exit (ESC)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        <span>Exit</span>
      </button>

      <div className={styles.titleBar}>
        <span className={styles.gameName}>{game.title}</span>
        <span className={styles.consoleBadge}>{consoleData.shortName}</span>
      </div>

      <div className={`${styles.gamepadIndicator} ${gamepadCount > 0 ? styles.gamepadConnected : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 6h10l2.4 7.2A2 2 0 0 1 17.5 16h-11a2 2 0 0 1-1.9-2.8L7 6zm5-4a2 2 0 0 1 2 2H10a2 2 0 0 1 2-2zM9 10v2H7v1h2v2h1v-2h2v-1h-2v-2H9zm7 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
        </svg>
        <span>{gamepadCount > 0 ? `${gamepadCount} gamepad${gamepadCount > 1 ? 's' : ''} ready` : 'No gamepad — press a button to connect'}</span>
      </div>

      <iframe
        src={emulatorUrl}
        className={styles.iframe}
        title={`Playing ${game.title}`}
        allow="gamepad; autoplay; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
