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
      <div className="bg-slate-950 min-h-screen">
        <div className="h-[400px] bg-slate-900 animate-pulse" />
        <div className="w-full px-6 lg:px-12 py-10 space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-14 bg-slate-800 rounded-xl w-48" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-48 bg-slate-800 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=1600&h=800&fit=crop&q=70"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-emerald-950/80 to-slate-950" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Encyclopedia
          </div>

          {classFilter && (
            <button
              onClick={() => setSearchParams({})}
              className="block mx-auto mb-4 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-full text-sm font-medium transition animate-fade-in"
            >
              Showing: {CLASS_LABELS[classFilter] || classFilter} &times;
            </button>
          )}

          <h1 className="font-display text-6xl md:text-7xl font-bold text-white leading-tight mb-4 animate-fade-in-up">
            {classFilter
              ? (CLASS_LABELS[classFilter] || classFilter)
              : <>Animals <span className="text-emerald-400">A–Z</span></>}
          </h1>
          <p className="text-emerald-200/50 text-lg max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
            {classFilter
              ? `Browse all ${(CLASS_LABELS[classFilter] || classFilter).toLowerCase()} in our encyclopedia`
              : 'Browse our complete encyclopedia of wildlife species'}
          </p>

          <div className="flex justify-center gap-10 md:gap-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div>
              <div className="text-4xl font-bold text-emerald-400 font-display">{totalSpecies}</div>
              <div className="text-[10px] text-emerald-300/50 uppercase tracking-wider font-bold mt-1">Species</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 font-display">{LETTERS.filter(l => grouped[l].length > 0).length}</div>
              <div className="text-[10px] text-emerald-300/50 uppercase tracking-wider font-bold mt-1">Letters</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-300 font-display">7</div>
              <div className="text-[10px] text-emerald-300/50 uppercase tracking-wider font-bold mt-1">Continents</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── A-Z Quick Nav ── */}
      <div className="sticky top-[64px] z-30 bg-slate-950/90 backdrop-blur-md border-b border-emerald-900/30">
        <div className="w-full px-6 lg:px-12 py-2 flex gap-1 overflow-x-auto scrollbar-hide">
          {LETTERS.map(l => {
            const hasAnimals = grouped[l].length > 0;
            return (
              <a
                key={l}
                href={hasAnimals ? `#letter-${l}` : undefined}
                className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition ${
                  hasAnimals
                    ? 'text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 cursor-pointer'
                    : 'text-slate-600 cursor-default'
                }`}
              >
                {l}
              </a>
            );
          })}
        </div>
      </div>

      {/* ── Letter Sections ── */}
      <div className="w-full px-6 lg:px-12 py-10">
        {LETTERS.map(letter => {
          const items = grouped[letter];
          if (items.length === 0) return null;

          return (
            <section key={letter} id={`letter-${letter}`} className="mb-14 scroll-mt-32 animate-fade-in-up">
              {/* Letter Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center text-2xl font-bold font-display">
                  {letter}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{items.length} Animal{items.length !== 1 ? 's' : ''}</h2>
                  <p className="text-sm text-emerald-300/50">Starting with the letter {letter}</p>
                </div>
              </div>

              {/* Bento / Masonry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[150px] sm:auto-rows-[180px]">
                {items.map((animal, i) => {
                  const isTall = (i % 7 === 0) || (i % 7 === 3);
                  return (
                    <Link
                      key={animal.id}
                      to={`/animal/${animal.slug}`}
                      className={`group relative rounded-xl overflow-hidden block ${isTall ? 'row-span-2' : ''}`}
                    >
                      <img
                        src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)}
                        alt={animal.common_name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-300" />
                      {animal.conservation_status && (
                        <div className="absolute top-2 right-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor(animal.conservation_status.code)}`}>
                            {animal.conservation_status.code}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className={`text-white font-bold leading-tight ${isTall ? 'text-base' : 'text-sm'}`}>{animal.common_name}</h3>
                        <p className="text-white/50 text-xs italic truncate">{animal.scientific_name}</p>
                        {animal.class_name && (
                          <span className="text-emerald-300/60 text-[10px] font-medium">{animal.class_name}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
