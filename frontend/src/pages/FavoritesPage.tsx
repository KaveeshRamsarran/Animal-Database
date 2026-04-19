import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites } from '../api/favorites';
import { placeholderImage } from '../utils/helpers';
import type { FavoriteOut } from '../types';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites().then(setFavorites).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-forest-950 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-16 text-center text-forest-400">Loading...</div></div>;

  return (
    <div className="bg-forest-950 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-6">My Favorites</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-16 text-forest-400">
          <p className="text-5xl mb-4">❤️</p>
          <p className="text-lg font-medium">No favorites yet</p>
          <Link to="/browse" className="text-emerald-400 hover:underline mt-2 inline-block">Browse animals to add some</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map(f => (
            <Link key={f.id} to={`/animal/${f.animal_slug}`} className="bg-forest-800/40 border border-forest-700/40 rounded-xl p-4 hover:border-forest-600/60 transition flex items-center gap-4">
              <img src={f.animal_thumbnail || placeholderImage(f.animal_name || 'Animal')} alt="" className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <div className="font-medium text-white">{f.animal_name}</div>
                <div className="text-xs text-forest-400">{f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div></div>
  );
}
