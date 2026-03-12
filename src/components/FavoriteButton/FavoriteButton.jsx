import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';
import styles from './FavoriteButton.module.css';

export default function FavoriteButton({ consoleId, gameId, size = 24 }) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!user) return null;

  const favorited = isFavorite(consoleId, gameId);

  return (
    <button
      className={`${styles.favBtn} ${favorited ? styles.active : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(consoleId, gameId);
      }}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
