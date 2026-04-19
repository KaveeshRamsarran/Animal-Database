import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import { proxyImage, placeholderImage } from '../utils/helpers';
import type { AnimalCard } from '../types';

/* ── Deep-sea zone metadata ── */
interface ZoneMeta {
  name: string;
  depth: string;
  desc: string;
  color: string;
  bgBar: string;
}

const ZONES: ZoneMeta[] = [
  { name: 'Epipelagic', depth: '0 – 200 m', desc: 'The sunlight zone — where most marine life is found.', color: '#38bdf8', bgBar: 'bg-sky-400' },
  { name: 'Mesopelagic', depth: '200 – 1 000 m', desc: 'The twilight zone — faint light, bioluminescence begins.', color: '#2563eb', bgBar: 'bg-blue-600' },
  { name: 'Bathypelagic', depth: '1 000 – 4 000 m', desc: 'The midnight zone — no sunlight, crushing pressure.', color: '#1e3a8a', bgBar: 'bg-blue-900' },
  { name: 'Abyssopelagic', depth: '4 000 – 6 000 m', desc: 'The abyssal zone — near-freezing, sparse life.', color: '#172554', bgBar: 'bg-blue-950' },
  { name: 'Hadopelagic', depth: '6 000 m +', desc: 'The hadal zone — deepest ocean trenches.', color: '#0c1222', bgBar: 'bg-slate-950' },
];

export default function DeepSeaPage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnimals({ page: 1, size: 500, environment_type: 'marine', sort: 'name_asc' })
      .then(data => setAnimals(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const classCounts = useMemo(() => {
    const m: Record<string, number> = {};
    animals.forEach(a => {
      const c = a.class_name || 'Unknown';
      m[c] = (m[c] || 0) + 1;
    });
    return m;
  }, [animals]);

  const sortedClasses = useMemo(
    () => Object.entries(classCounts).sort((a, b) => b[1] - a[1]),
    [classCounts],
  );

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-950 min-h-screen">
        <div className="h-[480px] bg-slate-900" />
        <div className="w-full px-6 lg:px-12 py-10 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-xl" />
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
            src="https://images.unsplash.com/photo-1551244072-5d12893278ab?w=1600&h=800&fit=crop&q=70"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-blue-950/80 to-slate-950" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Marine Life
          </div>

          <p className="text-blue-300/60 text-lg mb-2">Dive Into</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
            The Deep Sea<br />
            <span className="text-blue-400">& Ocean Wildlife</span>
          </h1>
          <p className="text-blue-200/60 text-lg max-w-2xl mx-auto mb-10">
            Explore the mysterious creatures of our oceans — from sunlit shallows to the crushing depths of the abyss. Discover the marine species in our database.
          </p>

          <div className="flex justify-center gap-10 md:gap-16">
            <div>
              <div className="text-4xl font-bold text-blue-400 font-display">{animals.length}</div>
              <div className="text-[10px] text-blue-300/50 uppercase tracking-wider font-bold mt-1">Marine Species</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 font-display">{Object.keys(classCounts).length}</div>
              <div className="text-[10px] text-blue-300/50 uppercase tracking-wider font-bold mt-1">Animal Classes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-sky-300 font-display">71%</div>
              <div className="text-[10px] text-blue-300/50 uppercase tracking-wider font-bold mt-1">Earth Is Ocean</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ocean depth zones infographic ── */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3 text-center">The Ocean's Layers</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 text-center">Depth Zones</h2>
        <p className="text-blue-300/50 max-w-2xl mx-auto mb-10 text-center">
          Life exists at every depth — from the sun-drenched surface to the darkest trenches.
        </p>

        <div className="space-y-2">
          {ZONES.map((zone, i) => (
            <div
              key={zone.name}
              className="rounded-xl overflow-hidden border border-blue-900/40"
              style={{ backgroundColor: zone.color + '18' }}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <div
                  className={`w-10 h-10 rounded-full ${zone.bgBar} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold">{zone.name}</h3>
                  <p className="text-blue-300/50 text-sm">{zone.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: zone.color === '#0c1222' ? '#94a3b8' : zone.color }}>
                    {zone.depth}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Animals by class ── */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3 text-center">Explore by Class</p>
        <h2 className="font-display text-3xl font-bold text-white mb-8 text-center">Marine Species</h2>

        {sortedClasses.length === 0 && (
          <div className="text-center py-16 text-blue-400/50">
            <p className="text-5xl mb-4">🌊</p>
            <p className="text-lg font-medium">No marine species found in the database yet</p>
          </div>
        )}

        {sortedClasses.map(([className, count]) => {
          const classAnimals = animals.filter(a => (a.class_name || 'Unknown') === className);
          return (
            <div key={className} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-display text-xl font-bold text-white">{className}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {count}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {classAnimals.map(animal => (
                  <Link
                    key={animal.slug}
                    to={`/animal/${animal.slug}`}
                    className="group relative rounded-xl overflow-hidden bg-slate-800 aspect-[3/4] block border border-blue-900/30 hover:border-blue-500/40 transition"
                  >
                    <img
                      src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)}
                      alt={animal.common_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80 group-hover:opacity-100"
                      loading="lazy"
                      onError={e => {
                        (e.target as HTMLImageElement).src = placeholderImage(animal.common_name);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-blue-950/20 to-transparent" />
                    {animal.conservation_status && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-blue-600/80">
                          {animal.conservation_status.code}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="text-white font-bold text-sm">{animal.common_name}</h4>
                      <p className="text-blue-300/50 text-xs italic truncate">{animal.scientific_name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Ocean facts footer section ── */}
      <div className="border-t border-blue-900/30">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">Ocean Facts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🌊', title: 'Deepest Point', desc: 'The Mariana Trench reaches 10 994 m — deeper than Mount Everest is tall.' },
              { icon: '🦑', title: 'Giant Squid', desc: 'Can grow up to 13 m long and live at depths of 300–1 000 m.' },
              { icon: '🐋', title: 'Blue Whale', desc: 'The largest animal ever — up to 30 m long and 200 tonnes.' },
              { icon: '💡', title: 'Bioluminescence', desc: 'About 76% of ocean creatures produce their own light.' },
              { icon: '🌡️', title: 'Deep Cold', desc: 'The average deep-ocean temperature is just 1–4 °C.' },
              { icon: '🔬', title: 'Undiscovered', desc: 'Over 80% of the ocean remains unexplored and unmapped.' },
            ].map(fact => (
              <div
                key={fact.title}
                className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-5 hover:border-blue-700/40 transition"
              >
                <div className="text-2xl mb-3">{fact.icon}</div>
                <h3 className="text-white font-bold text-sm mb-1">{fact.title}</h3>
                <p className="text-blue-300/50 text-sm">{fact.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
