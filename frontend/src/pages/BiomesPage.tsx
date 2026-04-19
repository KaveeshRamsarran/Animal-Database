import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import type { AnimalCard } from '../types';
import { BIOME_DATA } from './BiomeDetailPage';

/* ───────── Custom SVG biome icons ───────── */
function BiomeIcon({ name, className = 'w-10 h-10' }: { name: string; className?: string }) {
  const p = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'Tropical Rainforest':
      return <svg {...p}><path d="M12 22v-9" strokeWidth={2} /><path d="M12 13C8 12 4 13 2 15" /><path d="M12 13c4-1 8 0 10 2" /><path d="M12 13C9 10 5 8 2 9" /><path d="M12 13c3-3 7-5 10-4" /><path d="M12 13c-1-4-3-8-5-10" /><path d="M12 13c1-4 3-8 5-10" /></svg>;
    case 'Temperate Forest':
      return <svg {...p}><path d="M12 22v-5" strokeWidth={2} /><circle cx="12" cy="11" r="6" fill="currentColor" opacity={0.15} /><circle cx="12" cy="11" r="6" /><circle cx="9" cy="9" r="3" /><circle cx="15" cy="9" r="3" /><circle cx="12" cy="7" r="3" /></svg>;
    case 'Boreal Forest':
      return <svg {...p}><path d="M12 22v-3" strokeWidth={2} /><path d="M12 2l-6 9h3l-4 8h14l-4-8h3z" fill="currentColor" opacity={0.15} /><path d="M12 2l-6 9h3l-4 8h14l-4-8h3z" /></svg>;
    case 'Savanna':
      return <svg {...p}><path d="M12 22v-8" strokeWidth={2} /><path d="M4 10c0-3 3-5 8-5s8 2 8 5" /><path d="M2 10h20" /><path d="M6 10c0-2 2-4 6-4s6 2 6 4" fill="currentColor" opacity={0.15} /></svg>;
    case 'Grassland':
      return <svg {...p}><path d="M3 22c0-8 3-14 5-16" /><path d="M8 22c0-10 2-15 4-18" /><path d="M13 22c0-10-2-15-4-18" /><path d="M16 22c0-8-3-14-5-16" /><path d="M21 22c0-8-3-14-5-16" /><path d="M1 22h22" /></svg>;
    case 'Desert':
      return <svg {...p}><path d="M12 22v-18" strokeWidth={2} /><path d="M12 10h-4v-5" /><path d="M12 14h4v-5" /><circle cx="12" cy="4" r="0.5" fill="currentColor" /><path d="M4 22h16" /></svg>;
    case 'Tundra':
      return <svg {...p}><path d="M12 2v20" /><path d="M2 12h20" /><path d="M5.6 5.6l12.8 12.8" /><path d="M18.4 5.6L5.6 18.4" /><path d="M12 5l-2 2 2 2" /><path d="M12 5l2 2-2 2" /><path d="M12 19l-2-2 2-2" /><path d="M12 19l2-2-2-2" /><path d="M5 12l2-2 2 2" /><path d="M5 12l2 2 2-2" /><path d="M19 12l-2-2-2 2" /><path d="M19 12l-2 2-2-2" /></svg>;
    case 'Arctic Tundra':
      return <svg {...p}><path d="M3 14h18" /><path d="M6 14l2-6h8l2 6" fill="currentColor" opacity={0.15} /><path d="M6 14l2-6h8l2 6" /><path d="M10 8l1-4h2l1 4" /><path d="M4 14l-1 4h18l-1-4" fill="currentColor" opacity={0.08} /><path d="M5 18h14" /></svg>;
    case 'Ocean':
      return <svg {...p}><path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg>;
    case 'Freshwater':
      return <svg {...p}><path d="M12 2C12 2 5 10 5 14a7 7 0 0014 0c0-4-7-12-7-12z" fill="currentColor" opacity={0.15} /><path d="M12 2C12 2 5 10 5 14a7 7 0 0014 0c0-4-7-12-7-12z" /><path d="M9.5 16a3 3 0 004 1" /></svg>;
    case 'Coral Reef':
      return <svg {...p}><path d="M12 22v-6" strokeWidth={2} /><path d="M12 16c0-4-3-6-5-9" /><path d="M12 16c0-4 3-6 5-9" /><path d="M7 7c-2-1-4 0-4 2" /><path d="M17 7c2-1 4 0 4 2" /><path d="M12 16c-2-3-6-4-8-2" /><path d="M12 16c2-3 6-4 8-2" /><circle cx="7" cy="7" r="1" fill="currentColor" /><circle cx="17" cy="7" r="1" fill="currentColor" /></svg>;
    case 'Wetland':
      return <svg {...p}><path d="M8 22v-12" strokeWidth={2} /><ellipse cx="8" cy="7" rx="2" ry="3.5" fill="currentColor" opacity={0.3} /><ellipse cx="8" cy="7" rx="2" ry="3.5" /><path d="M16 22v-14" strokeWidth={2} /><ellipse cx="16" cy="5" rx="2" ry="3.5" fill="currentColor" opacity={0.3} /><ellipse cx="16" cy="5" rx="2" ry="3.5" /><path d="M2 20c4-2 8-2 10 0s6 2 10 0" /></svg>;
    case 'Alpine':
      return <svg {...p}><path d="M2 20l7-14 4 6 3-10 6 18H2z" fill="currentColor" opacity={0.12} /><path d="M2 20l7-14 4 6 3-10 6 18H2z" /><path d="M13 8l-2 3h4z" fill="white" opacity={0.4} /></svg>;
    case 'Tropical Forest':
      return <svg {...p}><path d="M12 22c0 0-8-4-8-12C4 4 12 2 12 2s8 2 8 8c0 8-8 12-8 12z" fill="currentColor" opacity={0.15} /><path d="M12 22c0 0-8-4-8-12C4 4 12 2 12 2s8 2 8 8c0 8-8 12-8 12z" /><path d="M12 4v18" /><path d="M8 8l4 4" /><path d="M16 8l-4 4" /><path d="M7 13l5 3" /><path d="M17 13l-5 3" /></svg>;
    case 'Tropical Savanna':
      return <svg {...p}><circle cx="12" cy="7" r="3" fill="currentColor" opacity={0.2} /><circle cx="12" cy="7" r="3" /><path d="M12 2v1" /><path d="M17.7 4.3l-.7.7" /><path d="M20 7h-1" /><path d="M17 10.7l.7.7" /><path d="M7 10.7l-.7.7" /><path d="M4 7h1" /><path d="M6.3 4.3l.7.7" /><path d="M4 18c2-3 5-5 8-5s6 2 8 5" /><path d="M2 22h20" /><path d="M7 22v-3" /><path d="M12 22v-5" /><path d="M17 22v-3" /></svg>;
    case 'Antarctic':
      return <svg {...p}><ellipse cx="12" cy="14" rx="4" ry="6" fill="currentColor" opacity={0.15} /><ellipse cx="12" cy="14" rx="4" ry="6" /><circle cx="12" cy="9" r="3" /><circle cx="11" cy="8.5" r="0.5" fill="currentColor" /><circle cx="13" cy="8.5" r="0.5" fill="currentColor" /><path d="M7 14l-2 3" /><path d="M17 14l2 3" /><path d="M10 20l-1 2" /><path d="M14 20l1 2" /><path d="M2 22h20" /></svg>;
    case 'Arid Shrubland':
      return <svg {...p}><path d="M12 22v-5" strokeWidth={2} /><path d="M12 17c-5 0-8-3-8-6s3-5 4-7" /><path d="M12 17c5 0 8-3 8-6s-3-5-4-7" /><path d="M12 17c0-5-2-8-3-11" /><path d="M12 17c0-5 2-8 3-11" /><circle cx="6" cy="11" r="1" fill="currentColor" opacity={0.3} /><circle cx="18" cy="11" r="1" fill="currentColor" opacity={0.3} /><circle cx="12" cy="8" r="1" fill="currentColor" opacity={0.3} /><path d="M3 22h18" /></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 4v16" /><path d="M4 12h16" /></svg>;
  }
}

export default function BiomesPage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnimals({ page: 1, size: 500, sort: 'name_asc' })
      .then(data => setAnimals(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const biomeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    animals.forEach(a => {
      if (a.biome) m[a.biome] = (m[a.biome] || 0) + 1;
    });
    return m;
  }, [animals]);

  const activeBiomes = useMemo(
    () => BIOME_DATA.filter(b => biomeCounts[b.name]),
    [biomeCounts],
  );

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-950 min-h-screen">
        <div className="h-[480px] bg-slate-900" />
        <div className="w-full px-6 lg:px-12 py-10 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-800 rounded-2xl" />
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
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=800&fit=crop&q=70"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-emerald-950/80 to-slate-950" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ecosystems
          </div>

          <p className="text-emerald-300/60 text-lg mb-2">Explore Earth's</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
            Biomes &<br />
            <span className="text-emerald-400">Ecosystems</span>
          </h1>
          <p className="text-emerald-200/50 text-lg max-w-2xl mx-auto mb-10">
            Journey through every habitat on Earth — from tropical rainforests to frozen tundra. Discover the wildlife that calls each biome home.
          </p>

          <div className="flex justify-center gap-10 md:gap-16">
            <div>
              <div className="text-4xl font-bold text-emerald-400 font-display">{activeBiomes.length}</div>
              <div className="text-[10px] text-emerald-300/50 uppercase tracking-wider font-bold mt-1">Biomes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 font-display">{animals.length}</div>
              <div className="text-[10px] text-emerald-300/50 uppercase tracking-wider font-bold mt-1">Total Species</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-300 font-display">7</div>
              <div className="text-[10px] text-emerald-300/50 uppercase tracking-wider font-bold mt-1">Continents</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Biome grid ── */}
      <div className="w-full px-6 lg:px-12 py-16">
        <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-3 text-center">Choose a Biome</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 text-center">All Biomes</h2>
        <p className="text-emerald-300/50 max-w-2xl mx-auto mb-12 text-center">
          Each biome hosts its own unique community of species adapted to local conditions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[180px] sm:auto-rows-[200px]">
          {activeBiomes.map((biome, i) => {
            /* Bento pattern: positions 0, 2, 5, 7, 10, 12... are tall */
            const isTall = (i % 5 === 0) || (i % 5 === 2);
            return (
              <Link
                key={biome.name}
                to={`/biome/${biome.slug}`}
                className={`group relative overflow-hidden rounded-2xl block ${isTall ? 'row-span-2' : ''}`}
              >
                {/* Background */}
                <img
                  src={biome.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-300" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-6">
                  <h3 className={`font-display font-extrabold text-white uppercase tracking-wide ${isTall ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                    {biome.name}
                  </h3>
                  <p className="text-white/70 text-sm font-medium mt-1">
                    {biomeCounts[biome.name]} Species
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Earth facts footer ── */}
      <div className="border-t border-emerald-900/30">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">Earth's Biomes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🌍', title: '17 Major Biomes', desc: 'Earth\'s surface can be divided into 17 distinct biome types based on climate and vegetation.' },
              { icon: '🌳', title: 'Forests Cover 31%', desc: 'Forests of all types cover about 4 billion hectares — 31% of land area.' },
              { icon: '🏜️', title: 'Deserts: 33%', desc: 'Deserts and arid regions make up roughly one-third of the land surface.' },
              { icon: '🌊', title: '71% Ocean', desc: 'The ocean is Earth\'s largest biome, covering 361 million km².' },
              { icon: '🌡️', title: 'Climate Zones', desc: 'Biome distribution is primarily determined by temperature and precipitation patterns.' },
              { icon: '🦋', title: '8.7M Species', desc: 'An estimated 8.7 million species inhabit Earth\'s diverse biomes.' },
            ].map(fact => (
              <div
                key={fact.title}
                className="bg-slate-900/60 border border-emerald-900/30 rounded-xl p-5 hover:border-emerald-700/40 transition"
              >
                <div className="text-2xl mb-3">{fact.icon}</div>
                <h3 className="text-white font-bold text-sm mb-1">{fact.title}</h3>
                <p className="text-emerald-300/50 text-sm">{fact.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
