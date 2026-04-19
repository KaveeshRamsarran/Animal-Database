import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import { proxyImage, placeholderImage, statusColor } from '../utils/helpers';
import type { AnimalCard } from '../types';

const CLASS_LABELS: Record<string, string> = {
  Mammalia: 'Mammals',
  Aves: 'Birds',
  Reptilia: 'Reptiles',
  Amphibia: 'Amphibians',
  Actinopterygii: 'Fish',
  Insecta: 'Insects',
  Arachnida: 'Arachnids',
  Chondrichthyes: 'Sharks & Rays',
  Malacostraca: 'Crustaceans',
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BrowsePage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const classFilter = searchParams.get('class_name');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, unknown> = { page: 1, size: 500, sort: 'name_asc' };
    if (classFilter) params.class_name = classFilter;
    getAnimals(params as any)
      .then(data => setAnimals(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classFilter]);

  // Scroll to hash anchor after load
  useEffect(() => {
    if (!loading && location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [loading, location.hash]);

  const grouped = useMemo(() => {
    const map: Record<string, AnimalCard[]> = {};
    LETTERS.forEach(l => { map[l] = []; });
    animals.forEach(a => {
      const first = a.common_name.charAt(0).toUpperCase();
      if (map[first]) map[first].push(a);
    });
    return map;
  }, [animals]);

  const totalSpecies = animals.length;

  if (loading) {
    return (
      <div className="bg-forest-950 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-forest-800 rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-forest-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div></div>
    );
  }

  return (
    <div className="bg-forest-950 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Stats Banner */}
      <div className="bg-gradient-to-r from-forest-800 to-forest-900 text-white rounded-2xl p-8 mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">
          {classFilter ? (CLASS_LABELS[classFilter] || classFilter) : 'Animals A-Z'}
        </h1>
        <p className="text-forest-200 text-lg mb-6">
          {classFilter
            ? `Browse all ${(CLASS_LABELS[classFilter] || classFilter).toLowerCase()} in our encyclopedia`
            : 'Browse our complete encyclopedia of wildlife species'}
        </p>
        {classFilter && (
          <button
            onClick={() => setSearchParams({})}
            className="mb-4 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-full text-sm font-medium transition"
          >
            Showing: {CLASS_LABELS[classFilter] || classFilter}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-bold">{totalSpecies}</div>
            <div className="text-sm text-forest-300 uppercase tracking-wide">Species</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{LETTERS.filter(l => grouped[l].length > 0).length}</div>
            <div className="text-sm text-forest-300 uppercase tracking-wide">Letters</div>
          </div>
          <div>
            <div className="text-3xl font-bold">7</div>
            <div className="text-sm text-forest-300 uppercase tracking-wide">Continents</div>
          </div>
        </div>
      </div>

      {/* Letter Sections */}
      {LETTERS.map(letter => {
        const items = grouped[letter];
        if (items.length === 0) return null;

        // Featured animals (first 4 with images)
        const featured = items.slice(0, 4);
        const rest = items.slice(4);

        return (
          <section key={letter} id={`letter-${letter}`} className="mb-12 scroll-mt-28">
            {/* Letter Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-forest-700 text-white rounded-xl flex items-center justify-center text-2xl font-bold font-display">
                {letter}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{items.length} Animal{items.length !== 1 ? 's' : ''}</h2>
                <p className="text-sm text-forest-400">Starting with the letter {letter}</p>
              </div>
            </div>

            {/* Featured Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {featured.map(animal => (
                <Link
                  key={animal.id}
                  to={`/animal/${animal.slug}`}
                  className="group relative rounded-xl overflow-hidden bg-forest-800 aspect-[4/3] block"
                >
                  <img
                    src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)}
                    alt={animal.common_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg leading-tight">{animal.common_name}</h3>
                    <p className="text-white/70 text-sm italic">{animal.scientific_name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {animal.conservation_status && (
                        <span className={`status-badge text-[10px] ${statusColor(animal.conservation_status.code)}`}>
                          {animal.conservation_status.code}
                        </span>
                      )}
                      {animal.class_name && (
                        <span className="text-white/60 text-xs">{animal.class_name}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Additional Animals List */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {rest.map(animal => (
                  <Link
                    key={animal.id}
                    to={`/animal/${animal.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-forest-700/30 text-sm text-forest-300 hover:text-emerald-400 transition group"
                  >
                    <svg className="w-3 h-3 text-forest-500 opacity-0 group-hover:opacity-100 transition" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    <span className="truncate">{animal.common_name}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div></div>
  );
}
