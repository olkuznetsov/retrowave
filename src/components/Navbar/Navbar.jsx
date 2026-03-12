import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Navbar.module.css';

export default function Navbar({ onLoginClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoWave}>~</span>
          <span className={styles.logoText}>RetroWave</span>
          <span className={styles.logoWave}>~</span>
        </Link>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link
            to="/"
            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
          >
            Consoles
          </Link>
          {user && (
            <Link
              to="/profile"
              className={`${styles.navLink} ${location.pathname === '/profile' ? styles.active : ''}`}
            >
              My Games
            </Link>
          )}
        </div>

        {/* Auth Section */}
        <div className={styles.authSection}>
          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button onClick={logout} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={onLoginClick} className={styles.loginBtn}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
