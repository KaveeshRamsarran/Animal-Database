import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { addFavorite, removeFavorite } from '../api/favorites';

interface Props {
  animalId: number;
  initialFavorited?: boolean;
}

export default function FavoriteButton({ animalId, initialFavorited = false }: Props) {
  const { user } = useAuthStore();
  const [fav, setFav] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      if (fav) {
        await removeFavorite(animalId);
        setFav(false);
      } else {
        await addFavorite(animalId);
        setFav(true);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <button onClick={toggle} disabled={loading} className={`p-2 rounded-full transition ${fav ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`} title={fav ? 'Remove from favorites' : 'Add to favorites'}>
      <svg className="w-6 h-6" fill={fav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
