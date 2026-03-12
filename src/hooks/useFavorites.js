import { useState, useEffect, useCallback } from 'react';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { app } from '../firebase';
import { useAuth } from './useAuth';

const db = getFirestore(app);

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load favorites
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const favsRef = collection(db, 'users', user.uid, 'favorites');
      const snapshot = await getDocs(favsRef);
      const favs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFavorites(favs);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Add to favorites
  const addFavorite = useCallback(async (consoleId, gameId) => {
    if (!user) return;

    const favRef = doc(db, 'users', user.uid, 'favorites', `${consoleId}_${gameId}`);
    await setDoc(favRef, {
      consoleId,
      gameId,
      addedAt: serverTimestamp(),
    });

    setFavorites(prev => [...prev, { id: `${consoleId}_${gameId}`, consoleId, gameId }]);
  }, [user]);

  // Remove from favorites
  const removeFavorite = useCallback(async (consoleId, gameId) => {
    if (!user) return;

    const favRef = doc(db, 'users', user.uid, 'favorites', `${consoleId}_${gameId}`);
    await deleteDoc(favRef);

    setFavorites(prev => prev.filter(f => f.id !== `${consoleId}_${gameId}`));
  }, [user]);

  // Check if a game is favorited
  const isFavorite = useCallback((consoleId, gameId) => {
    return favorites.some(f => f.consoleId === consoleId && f.gameId === gameId);
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (consoleId, gameId) => {
    if (isFavorite(consoleId, gameId)) {
      await removeFavorite(consoleId, gameId);
    } else {
      await addFavorite(consoleId, gameId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}
