import { createContext, useState, useCallback } from 'react';
import { startAmbient, stopAmbient, setAmbientVolume } from '../utils/ambientMusic';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopAmbient();
      setIsPlaying(false);
    } else {
      startAmbient();
      setAmbientVolume(volume);
      setIsPlaying(true);
    }
  }, [isPlaying, volume]);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    setAmbientVolume(newVolume);
  }, []);

  const value = {
    isPlaying,
    isLoaded: true, // procedural — always "loaded"
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
