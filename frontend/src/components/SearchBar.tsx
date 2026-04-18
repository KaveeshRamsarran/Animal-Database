import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAnimals } from '../api/animals';
import { useDebounce } from '../hooks/useDebounce';
import type { AnimalCard } from '../types';
import { placeholderImage, proxyImage } from '../utils/helpers';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimalCard[]>([]);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 300);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounced.length < 2) { setResults([]); return; }
    searchAnimals(debounced, 6).then(setResults).catch(() => setResults([]));
  }, [debounced]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        placeholder="Search animals..."
        className="w-48 lg:w-64 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-72 bg-white rounded-lg shadow-xl border z-50 max-h-80 overflow-y-auto">
          {results.map(a => (
            <button
              key={a.id}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 text-left"
              onClick={() => { navigate(`/animal/${a.slug}`); setOpen(false); setQuery(''); }}
            >
              <img src={proxyImage(a.thumbnail_url) || placeholderImage(a.common_name)} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="text-sm font-medium text-gray-800">{a.common_name}</div>
                <div className="text-xs text-gray-500 italic">{a.scientific_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
