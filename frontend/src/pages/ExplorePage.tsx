import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getContinents, getCountries } from '../api/regions';
import type { ContinentOut, CountryOut } from '../types';

export default function ExplorePage() {
  const [continents, setContinents] = useState<ContinentOut[]>([]);
  const [countries, setCountries] = useState<CountryOut[]>([]);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContinents().then(setContinents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCountries(selectedContinent || undefined).then(setCountries).catch(() => {});
  }, [selectedContinent]);

  const continentEmoji: Record<string, string> = {
    AF: '🌍', AN: '🧊', AS: '🌏', EU: '🏰', NA: '🗽', OC: '🏝️', SA: '🌎',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Explore by Region</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
        <button onClick={() => setSelectedContinent('')} className={`p-3 rounded-xl text-center transition ${!selectedContinent ? 'bg-forest-600 text-white' : 'bg-white border hover:border-forest-300'}`}>
          <div className="text-2xl mb-1">🌐</div>
          <div className="text-xs font-medium">All</div>
        </button>
        {continents.map(c => (
          <button key={c.id} onClick={() => setSelectedContinent(c.code)} className={`p-3 rounded-xl text-center transition ${selectedContinent === c.code ? 'bg-forest-600 text-white' : 'bg-white border hover:border-forest-300'}`}>
            <div className="text-2xl mb-1">{continentEmoji[c.code] || '🌍'}</div>
            <div className="text-xs font-medium">{c.name}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {countries.map(c => (
          <Link key={c.id} to={`/country/${c.code}`} className="bg-white rounded-xl border p-4 hover:shadow-md transition">
            <div className="flex items-center gap-3">
              {c.flag_url && <img src={c.flag_url} alt="" className="w-8 h-6 object-cover rounded" />}
              <div>
                <div className="font-medium text-gray-800">{c.name}</div>
                <div className="text-xs text-gray-500">{c.region}{c.subregion ? ` · ${c.subregion}` : ''}</div>
              </div>
            </div>
          </Link>
        ))}
        {countries.length === 0 && !loading && <p className="text-gray-400 col-span-full text-center py-8">No countries found</p>}
      </div>
    </div>
  );
}
