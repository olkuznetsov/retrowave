import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { startAmbient, stopAmbient, setAmbientVolume } from '../utils/ambientMusic';

const MusicContext = createContext(null);

const MUSIC_KEY   = 'retrowave_music_playing';
const VOLUME_KEY  = 'retrowave_music_volume';

export function MusicProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(
    () => localStorage.getItem(MUSIC_KEY) === 'true'
  );
  const [volume, setVolume] = useState(
    () => parseFloat(localStorage.getItem(VOLUME_KEY) || '0.5')
  );

  // Track whether audio has actually started (vs. just "pending" after refresh)
  const audioStarted = useRef(false);

  // On mount: if preference says playing, start on first user gesture
  useEffect(() => {
    if (!isPlaying) return;

    const startOnGesture = () => {
      if (audioStarted.current) return;
      audioStarted.current = true;
      startAmbient();
      setAmbientVolume(volume);
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click',      startOnGesture);
      window.removeEventListener('keydown',    startOnGesture);
      window.removeEventListener('touchstart', startOnGesture);
    };

    window.addEventListener('click',      startOnGesture);
    window.addEventListener('keydown',    startOnGesture);
    window.addEventListener('touchstart', startOnGesture);

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopAmbient();
      audioStarted.current = false;
      setIsPlaying(false);
      localStorage.setItem(MUSIC_KEY, 'false');
    } else {
      startAmbient();
      setAmbientVolume(volume);
      audioStarted.current = true;
      setIsPlaying(true);
      localStorage.setItem(MUSIC_KEY, 'true');
    }
  }, [isPlaying, volume]);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    setAmbientVolume(newVolume);
    localStorage.setItem(VOLUME_KEY, String(newVolume));
  }, []);

  const value = {
    isPlaying,
    isLoaded: true,
    volume,
    toggleMusic,
    changeVolume,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export { MusicContext };
