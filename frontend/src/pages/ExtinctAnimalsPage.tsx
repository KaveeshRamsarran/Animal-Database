import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import { proxyImage, placeholderImage, statusColor } from '../utils/helpers';
import type { AnimalCard } from '../types';

/* ── Extinction category metadata ── */
interface ExtinctMeta {
  code: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  bg: string;
}

const CATEGORIES: ExtinctMeta[] = [
  {
    code: 'EX',
    name: 'Extinct',
    desc: 'No living individuals remain. The last known member of the species has died.',
    icon: '💀',
    color: '#6b7280',
    bg: 'bg-gray-800/30',
  },
  {
    code: 'EW',
    name: 'Extinct in the Wild',
    desc: 'Survives only in captivity or as a naturalized population outside its historic range.',
    icon: '🏚️',
    color: '#7c3aed',
    bg: 'bg-purple-900/20',
  },
  {
    code: 'CR',
    name: 'Critically Endangered',
    desc: 'Facing an extremely high risk of extinction in the wild. One step from disappearing forever.',
    icon: '🔴',
    color: '#991b1b',
    bg: 'bg-red-900/20',
  },
];

/* ── Timeline milestones ── */
const TIMELINE = [
  { year: '1681', event: 'Dodo declared extinct', icon: '🦤' },
  { year: '1768', event: "Steller's Sea Cow vanishes", icon: '🌊' },
  { year: '1883', event: 'Quagga goes extinct', icon: '🦓' },
  { year: '1914', event: 'Last Passenger Pigeon dies', icon: '🕊️' },
  { year: '1936', event: 'Thylacine declared extinct', icon: '🐺' },
  { year: '2011', event: 'Western Black Rhinoceros declared extinct', icon: '🦏' },
];

export default function ExtinctAnimalsPage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    getAnimals({ page: 1, size: 500, sort: 'name_asc' })
      .then(data => setAnimals(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoryCounts = useMemo(() => {
    const m: Record<string, number> = {};
    animals.forEach(a => {
      const c = a.conservation_status?.code;
      if (c && ['EX', 'EW', 'CR'].includes(c)) m[c] = (m[c] || 0) + 1;
    });
    return m;
  }, [animals]);

  const totalAtRisk = useMemo(
    () => animals.filter(a => ['EX', 'EW', 'CR'].includes(a.conservation_status?.code || '')).length,
    [animals],
  );

  const filtered = selectedCategory
    ? animals.filter(a => a.conservation_status?.code === selectedCategory)
    : [];
  const featured = filtered.slice(0, 6);
  const rest = filtered.slice(6);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-[480px] bg-forest-900" />
        <div className="w-full px-6 lg:px-12 py-10 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-forest-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-forest-950 min-h-screen">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1598894000396-bc30e0996899?w=1600&h=800&fit=crop&q=70"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/80 to-forest-950" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-500/20 text-gray-300 border border-gray-500/30 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Lost to Time
          </div>

          <p className="text-forest-400 text-lg mb-2">Remembering</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
            Extinct &amp; Critically<br />Endangered Wildlife
          </h1>
          <p className="text-forest-300 text-lg max-w-2xl mx-auto mb-10">
            Explore species that have disappeared forever, survive only in captivity, or teeter on the brink of extinction. Their stories remind us what's at stake.
          </p>

          <div className="flex justify-center gap-10 md:gap-16">
            <div>
              <div className="text-4xl font-bold text-gray-400 font-display">{categoryCounts['EX'] || 0}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold mt-1">Extinct</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 font-display">{categoryCounts['EW'] || 0}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold mt-1">Extinct in Wild</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-400 font-display">{categoryCounts['CR'] || 0}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold mt-1">Critically Endangered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white font-display">{totalAtRisk}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold mt-1">Total at Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overview mode ── */}
      {!selectedCategory && (
        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* Extinction timeline */}
          <div className="text-center mb-16">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-3">A History of Loss</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Extinction Timeline</h2>
            <p className="text-forest-400 max-w-2xl mx-auto mb-10">
              Notable species lost throughout history — a sobering reminder of our impact on the natural world.
            </p>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-forest-700/40 -translate-x-1/2 hidden md:block" />

              <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-16 md:gap-y-8">
                {TIMELINE.map((item, i) => (
                  <div
                    key={item.year}
                    className={`relative flex items-center gap-4 ${i % 2 === 0 ? 'md:flex-row-reverse md:text-right' : ''}`}
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-forest-800/60 border border-forest-700/40 rounded-full flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.year}</div>
                      <div className="text-white font-semibold">{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category cards */}
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-3 text-center">Browse by Status</p>
          <h2 className="font-display text-3xl font-bold text-white mb-8 text-center">Threat Categories</h2>

          <div className="space-y-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.code}
                onClick={() => setSelectedCategory(cat.code)}
                className={`w-full group ${cat.bg} border border-forest-700/40 hover:border-forest-600/60 rounded-xl px-6 py-5 transition-all flex items-center gap-5`}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 bg-forest-800/60 border border-forest-700/40">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-display font-bold text-lg text-white">{cat.name}</h3>
                  <p className="text-forest-400 text-sm">{cat.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold font-display" style={{ color: cat.color }}>
                    {categoryCounts[cat.code] || 0}
                  </div>
                  <div className="text-forest-500 text-xs">species</div>
                </div>
                <svg className="w-5 h-5 text-forest-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Selected category detail ── */}
      {selectedCategory &&
        (() => {
          const meta = CATEGORIES.find(c => c.code === selectedCategory)!;
          return (
            <div className="w-full px-6 lg:px-12 py-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className="mb-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to overview
              </button>

              <div className={`${meta.bg} border border-forest-700/40 rounded-xl px-6 py-6 mb-8 flex items-center gap-5`}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 bg-forest-800/60 border border-forest-700/40">
                  {meta.icon}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">{meta.name}</h2>
                  <p className="text-forest-400 mt-1">{meta.desc}</p>
                  <p className="font-semibold text-sm mt-1" style={{ color: meta.color }}>
                    {filtered.length} species
                  </p>
                </div>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16 text-forest-500">
                  <p className="text-5xl mb-4">{meta.icon}</p>
                  <p className="text-lg font-medium text-forest-400">No {meta.name.toLowerCase()} species in our database yet</p>
                </div>
              )}

              {/* Featured grid */}
              {featured.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                  {featured.map(animal => (
                    <Link
                      key={animal.slug}
                      to={`/animal/${animal.slug}`}
                      className="group relative rounded-xl overflow-hidden bg-forest-800 aspect-[3/4] block"
                    >
                      <img
                        src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)}
                        alt={animal.common_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100"
                        loading="lazy"
                        onError={e => {
                          (e.target as HTMLImageElement).src = placeholderImage(animal.common_name);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-2 right-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: meta.color }}
                        >
                          {meta.code}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-white font-bold text-sm">{animal.common_name}</h4>
                        <p className="text-white/60 text-xs italic truncate">{animal.scientific_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Rest list */}
              {rest.length > 0 && (
                <div className="bg-forest-800/30 border border-forest-700/30 rounded-xl divide-y divide-forest-700/30">
                  {rest.map(animal => (
                    <Link
                      key={animal.slug}
                      to={`/animal/${animal.slug}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-forest-700/20 transition"
                    >
                      <img
                        src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)}
                        alt={animal.common_name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        onError={e => {
                          (e.target as HTMLImageElement).src = placeholderImage(animal.common_name);
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-white">{animal.common_name}</span>
                        <span className="text-forest-600 mx-2">—</span>
                        <span className="text-forest-400 text-sm italic">{animal.scientific_name}</span>
                      </div>
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: meta.color }}
                      >
                        {meta.code}
                      </span>
                      <svg className="w-4 h-4 text-forest-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
    </div>
  );
}
