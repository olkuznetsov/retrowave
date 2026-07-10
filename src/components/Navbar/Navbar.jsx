import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { GAMES, CONSOLES } from '../../data/consoles';
import styles from './Navbar.module.css';

// Flatten all games across all consoles for search
const ALL_GAMES = Object.entries(GAMES).flatMap(([consoleId, games]) => {
  const consoleData = CONSOLES.find(c => c.id === consoleId);
  return games.map(g => ({ ...g, consoleId, consoleName: consoleData?.shortName || consoleId }));
});

export default function Navbar({ onLoginClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return ALL_GAMES.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.genre?.toLowerCase().includes(q) ||
      g.consoleName.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (game) => {
    navigate(`/play/${game.consoleId}/${game.id}`);
    setQuery('');
    setOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoWave}>~</span>
          <span className={styles.logoText}>RetroWave</span>
          <span className={styles.logoWave}>~</span>
        </Link>

        {/* Search */}
        <div className={styles.searchWrap} ref={searchRef}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search games…"
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => query.length >= 2 && setOpen(true)}
            />
            {query && (
              <button className={styles.searchClear} onClick={() => { setQuery(''); setOpen(false); }}>✕</button>
            )}
          </div>

          {open && results.length > 0 && (
            <div className={styles.dropdown}>
              {results.map(game => (
                <button key={`${game.consoleId}-${game.id}`} className={styles.result} onClick={() => handleSelect(game)}>
                  {game.cover
                    ? <img src={game.cover} alt={game.title} className={styles.resultCover} />
                    : <div className={styles.resultCoverFallback} />
                  }
                  <div className={styles.resultInfo}>
                    <span className={styles.resultTitle}>{game.title}</span>
                    <span className={styles.resultMeta}>{game.consoleName} · {game.year}</span>
                  </div>
                  <span className={styles.resultBadge}>{game.consoleName}</span>
                </button>
              ))}
            </div>
          )}

          {open && query.length >= 2 && results.length === 0 && (
            <div className={styles.dropdown}>
              <div className={styles.noResults}>No games found for "{query}"</div>
            </div>
          )}
        </div>

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
