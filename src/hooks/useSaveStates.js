import { useState, useEffect, useCallback } from 'react';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { app } from '../firebase';
import { useAuth } from './useAuth';

const db = getFirestore(app);
const storage = getStorage(app);

export function useSaveStates() {
  const { user } = useAuth();
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load saves for a specific game
  const loadSaves = useCallback(async (consoleId, gameId) => {
    if (!user) {
      setSaves([]);
      return;
    }

    setLoading(true);
    try {
      const savesRef = collection(db, 'users', user.uid, 'saves');
      const q = query(
        savesRef,
        where('consoleId', '==', consoleId),
        where('gameId', '==', gameId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const saveDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSaves(saveDocs);
    } catch (err) {
      console.error('Error loading saves:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Upload a save state
  const uploadSave = useCallback(async (consoleId, gameId, saveData, screenshot) => {
    if (!user) return;

    const saveId = `${consoleId}_${gameId}_${Date.now()}`;

    // Upload save file to Firebase Storage
    const saveRef = ref(storage, `saves/${user.uid}/${saveId}.state`);
    await uploadBytes(saveRef, saveData);
    const saveUrl = await getDownloadURL(saveRef);

    // Upload screenshot if available
    let screenshotUrl = null;
    if (screenshot) {
      const ssRef = ref(storage, `saves/${user.uid}/${saveId}.png`);
      await uploadBytes(ssRef, screenshot);
      screenshotUrl = await getDownloadURL(ssRef);
    }

    // Save metadata to Firestore
    const docRef = doc(db, 'users', user.uid, 'saves', saveId);
    await setDoc(docRef, {
      consoleId,
      gameId,
      saveUrl,
      screenshotUrl,
      createdAt: serverTimestamp(),
    });

    // Update local state
    setSaves(prev => [{
      id: saveId,
      consoleId,
      gameId,
      saveUrl,
      screenshotUrl,
      createdAt: new Date(),
    }, ...prev]);

    return saveUrl;
  }, [user]);

  // Delete a save state
  const deleteSave = useCallback(async (saveId) => {
    if (!user) return;

    try {
      // Delete files from Storage
      const saveRef = ref(storage, `saves/${user.uid}/${saveId}.state`);
      await deleteObject(saveRef).catch(() => {});
      const ssRef = ref(storage, `saves/${user.uid}/${saveId}.png`);
      await deleteObject(ssRef).catch(() => {});

      // Delete metadata from Firestore
      const docRef = doc(db, 'users', user.uid, 'saves', saveId);
      await deleteDoc(docRef);

      setSaves(prev => prev.filter(s => s.id !== saveId));
    } catch (err) {
      console.error('Error deleting save:', err);
    }
  }, [user]);

  return {
    saves,
    loading,
    loadSaves,
    uploadSave,
    deleteSave,
  };
}
