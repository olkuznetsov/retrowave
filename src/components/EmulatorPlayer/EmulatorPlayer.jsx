import { useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSaveStates } from '../../hooks/useSaveStates';
import styles from './EmulatorPlayer.module.css';

// Safe for SSR/test environments — guard with typeof
const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export default function EmulatorPlayer({ game, consoleData, onExit }) {
  const { user } = useAuth();
  const { uploadSave } = useSaveStates();

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
