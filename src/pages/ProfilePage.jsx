import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { getConsole, getGame } from '../data/consoles';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className={styles.notLoggedIn}>
        <h2>Sign in to view your profile</h2>
        <p>Create an account to save your favorite games and track your progress.</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      {/* User Header */}
      <div className={styles.userHeader}>
        <div className={styles.avatar}>
          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h1 className={styles.userName}>
            {user.displayName || user.email?.split('@')[0]}
          </h1>
          <p className={styles.userEmail}>{user.email}</p>
        </div>
      </div>

      {/* Favorites Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff6b9d" stroke="#ff6b9d" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Favorite Games ({favorites.length})
        </h2>

        {favorites.length === 0 ? (
          <div className={styles.emptyFavs}>
            <p>No favorites yet.</p>
            <p className={styles.emptyHint}>
              Browse consoles and click the heart icon to add games!
            </p>
          </div>
        ) : (
          <div className={styles.favsGrid}>
            {favorites.map((fav) => {
              const console = getConsole(fav.consoleId);
              const game = getGame(fav.consoleId, fav.gameId);
              if (!console || !game) return null;

              return (
                <div
                  key={fav.id}
                  className={`glass-panel ${styles.favCard}`}
                  onClick={() => navigate(`/console/${fav.consoleId}`)}
                >
                  <div className={styles.favCover}>
                    <span>{game.title.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className={styles.favInfo}>
                    <h4 className={styles.favTitle}>{game.title}</h4>
                    <span className={styles.favConsole}>{console.shortName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
