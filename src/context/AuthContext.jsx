import { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { app } from '../firebase';
import { getRoleForEmail, DEFAULT_ROLE } from '../data/roles';

const AuthContext = createContext(null);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const ROLE_STORAGE_KEY = 'userRole';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY) || DEFAULT_ROLE;
    window.userRole = saved; // available immediately for DAP tools
    return saved;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      const resolvedRole = firebaseUser
        ? getRoleForEmail(firebaseUser.email)
        : DEFAULT_ROLE;

      setRole(resolvedRole);
      localStorage.setItem(ROLE_STORAGE_KEY, resolvedRole);
      window.userRole = resolvedRole;

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result;
  };

  const loginWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    return signOut(auth);
  };

  const value = {
    user,
    role,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
