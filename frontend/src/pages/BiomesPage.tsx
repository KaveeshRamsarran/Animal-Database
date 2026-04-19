import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import { proxyImage, placeholderImage, statusColor } from '../utils/helpers';
import type { AnimalCard } from '../types';

/* ───────── Custom SVG biome icons ───────── */
function BiomeIcon({ name, className = 'w-10 h-10' }: { name: string; className?: string }) {
  const p = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    /* Palm tree */
    case 'Tropical Rainforest':
      return <svg {...p}><path d="M12 22v-9" strokeWidth={2} /><path d="M12 13C8 12 4 13 2 15" /><path d="M12 13c4-1 8 0 10 2" /><path d="M12 13C9 10 5 8 2 9" /><path d="M12 13c3-3 7-5 10-4" /><path d="M12 13c-1-4-3-8-5-10" /><path d="M12 13c1-4 3-8 5-10" /></svg>;
    /* Deciduous tree */
    case 'Temperate Forest':
      return <svg {...p}><path d="M12 22v-5" strokeWidth={2} /><circle cx="12" cy="11" r="6" fill="currentColor" opacity={0.15} /><circle cx="12" cy="11" r="6" /><circle cx="9" cy="9" r="3" /><circle cx="15" cy="9" r="3" /><circle cx="12" cy="7" r="3" /></svg>;
    /* Pine tree */
    case 'Boreal Forest':
      return <svg {...p}><path d="M12 22v-3" strokeWidth={2} /><path d="M12 2l-6 9h3l-4 8h14l-4-8h3z" fill="currentColor" opacity={0.15} /><path d="M12 2l-6 9h3l-4 8h14l-4-8h3z" /></svg>;
    /* Flat-topped acacia */
    case 'Savanna':
      return <svg {...p}><path d="M12 22v-8" strokeWidth={2} /><path d="M4 10c0-3 3-5 8-5s8 2 8 5" /><path d="M2 10h20" /><path d="M6 10c0-2 2-4 6-4s6 2 6 4" fill="currentColor" opacity={0.15} /></svg>;
    /* Grass blades */
    case 'Grassland':
      return <svg {...p}><path d="M3 22c0-8 3-14 5-16" /><path d="M8 22c0-10 2-15 4-18" /><path d="M13 22c0-10-2-15-4-18" /><path d="M16 22c0-8-3-14-5-16" /><path d="M21 22c0-8-3-14-5-16" /><path d="M1 22h22" /></svg>;
    /* Cactus */
    case 'Desert':
      return <svg {...p}><path d="M12 22v-18" strokeWidth={2} /><path d="M12 10h-4v-5" /><path d="M12 14h4v-5" /><circle cx="12" cy="4" r="0.5" fill="currentColor" /><path d="M4 22h16" /></svg>;
    /* Snowflake */
    case 'Tundra':
      return <svg {...p}><path d="M12 2v20" /><path d="M2 12h20" /><path d="M5.6 5.6l12.8 12.8" /><path d="M18.4 5.6L5.6 18.4" /><path d="M12 5l-2 2 2 2" /><path d="M12 5l2 2-2 2" /><path d="M12 19l-2-2 2-2" /><path d="M12 19l2-2-2-2" /><path d="M5 12l2-2 2 2" /><path d="M5 12l2 2 2-2" /><path d="M19 12l-2-2-2 2" /><path d="M19 12l-2 2-2-2" /></svg>;
    /* Iceberg */
    case 'Arctic Tundra':
      return <svg {...p}><path d="M3 14h18" /><path d="M6 14l2-6h8l2 6" fill="currentColor" opacity={0.15} /><path d="M6 14l2-6h8l2 6" /><path d="M10 8l1-4h2l1 4" /><path d="M4 14l-1 4h18l-1-4" fill="currentColor" opacity={0.08} /><path d="M5 18h14" /></svg>;
    /* Waves */
    case 'Ocean':
      return <svg {...p}><path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg>;
    /* Water drop */
    case 'Freshwater':
      return <svg {...p}><path d="M12 2C12 2 5 10 5 14a7 7 0 0014 0c0-4-7-12-7-12z" fill="currentColor" opacity={0.15} /><path d="M12 2C12 2 5 10 5 14a7 7 0 0014 0c0-4-7-12-7-12z" /><path d="M9.5 16a3 3 0 004 1" /></svg>;
    /* Coral branch */
    case 'Coral Reef':
      return <svg {...p}><path d="M12 22v-6" strokeWidth={2} /><path d="M12 16c0-4-3-6-5-9" /><path d="M12 16c0-4 3-6 5-9" /><path d="M7 7c-2-1-4 0-4 2" /><path d="M17 7c2-1 4 0 4 2" /><path d="M12 16c-2-3-6-4-8-2" /><path d="M12 16c2-3 6-4 8-2" /><circle cx="7" cy="7" r="1" fill="currentColor" /><circle cx="17" cy="7" r="1" fill="currentColor" /></svg>;
    /* Cattail/reed */
    case 'Wetland':
      return <svg {...p}><path d="M8 22v-12" strokeWidth={2} /><ellipse cx="8" cy="7" rx="2" ry="3.5" fill="currentColor" opacity={0.3} /><ellipse cx="8" cy="7" rx="2" ry="3.5" /><path d="M16 22v-14" strokeWidth={2} /><ellipse cx="16" cy="5" rx="2" ry="3.5" fill="currentColor" opacity={0.3} /><ellipse cx="16" cy="5" rx="2" ry="3.5" /><path d="M2 20c4-2 8-2 10 0s6 2 10 0" /></svg>;
    /* Mountain peak */
    case 'Alpine':
      return <svg {...p}><path d="M2 20l7-14 4 6 3-10 6 18H2z" fill="currentColor" opacity={0.12} /><path d="M2 20l7-14 4 6 3-10 6 18H2z" /><path d="M13 8l-2 3h4z" fill="white" opacity={0.4} /></svg>;
    /* Tropical leaf */
    case 'Tropical Forest':
      return <svg {...p}><path d="M12 22c0 0-8-4-8-12C4 4 12 2 12 2s8 2 8 8c0 8-8 12-8 12z" fill="currentColor" opacity={0.15} /><path d="M12 22c0 0-8-4-8-12C4 4 12 2 12 2s8 2 8 8c0 8-8 12-8 12z" /><path d="M12 4v18" /><path d="M8 8l4 4" /><path d="M16 8l-4 4" /><path d="M7 13l5 3" /><path d="M17 13l-5 3" /></svg>;
    /* Sun over grass */
    case 'Tropical Savanna':
      return <svg {...p}><circle cx="12" cy="7" r="3" fill="currentColor" opacity={0.2} /><circle cx="12" cy="7" r="3" /><path d="M12 2v1" /><path d="M17.7 4.3l-.7.7" /><path d="M20 7h-1" /><path d="M17 10.7l.7.7" /><path d="M7 10.7l-.7.7" /><path d="M4 7h1" /><path d="M6.3 4.3l.7.7" /><path d="M4 18c2-3 5-5 8-5s6 2 8 5" /><path d="M2 22h20" /><path d="M7 22v-3" /><path d="M12 22v-5" /><path d="M17 22v-3" /></svg>;
    /* Penguin silhouette */
    case 'Antarctic':
      return <svg {...p}><ellipse cx="12" cy="14" rx="4" ry="6" fill="currentColor" opacity={0.15} /><ellipse cx="12" cy="14" rx="4" ry="6" /><circle cx="12" cy="9" r="3" /><circle cx="11" cy="8.5" r="0.5" fill="currentColor" /><circle cx="13" cy="8.5" r="0.5" fill="currentColor" /><path d="M7 14l-2 3" /><path d="M17 14l2 3" /><path d="M10 20l-1 2" /><path d="M14 20l1 2" /><path d="M2 22h20" /></svg>;
    /* Small bush */
    case 'Arid Shrubland':
      return <svg {...p}><path d="M12 22v-5" strokeWidth={2} /><path d="M12 17c-5 0-8-3-8-6s3-5 4-7" /><path d="M12 17c5 0 8-3 8-6s-3-5-4-7" /><path d="M12 17c0-5-2-8-3-11" /><path d="M12 17c0-5 2-8 3-11" /><circle cx="6" cy="11" r="1" fill="currentColor" opacity={0.3} /><circle cx="18" cy="11" r="1" fill="currentColor" opacity={0.3} /><circle cx="12" cy="8" r="1" fill="currentColor" opacity={0.3} /><path d="M3 22h18" /></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 4v16" /><path d="M4 12h16" /></svg>;
  }
}

/* ───────── Biome data ───────── */
const BIOMES = [
  { name: 'Tropical Rainforest', fallback: 'from-green-700 to-green-900', desc: 'Lush equatorial forests with the highest biodiversity on Earth.', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=400&fit=crop&q=80' },
  { name: 'Temperate Forest', fallback: 'from-emerald-700 to-emerald-900', desc: 'Deciduous and mixed forests with seasonal change.', image: 'https://images.unsplash.com/photo-1476362174823-3a23f4aa6d76?w=1200&h=400&fit=crop&q=80' },
  { name: 'Boreal Forest', fallback: 'from-teal-700 to-teal-900', desc: 'Cold northern conifer forests spanning vast territories.', image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1200&h=400&fit=crop&q=80' },
  { name: 'Savanna', fallback: 'from-amber-600 to-amber-800', desc: 'Tropical grasslands with scattered trees and large herbivores.', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&h=400&fit=crop&q=80' },
  { name: 'Grassland', fallback: 'from-lime-600 to-lime-800', desc: 'Open plains dominated by grasses and grazing animals.', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=400&fit=crop&q=80' },
  { name: 'Desert', fallback: 'from-orange-600 to-orange-800', desc: 'Arid landscapes with specially adapted survivors.', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&h=400&fit=crop&q=80' },
  { name: 'Tundra', fallback: 'from-sky-500 to-sky-700', desc: 'Frozen treeless expanses of the high Arctic.', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=400&fit=crop&q=80' },
  { name: 'Arctic Tundra', fallback: 'from-blue-500 to-blue-700', desc: 'Permafrost terrain home to polar bears and caribou.', image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1200&h=400&fit=crop&q=80' },
  { name: 'Ocean', fallback: 'from-blue-700 to-blue-900', desc: 'The vast marine realm covering 70 % of Earth.', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=400&fit=crop&q=80' },
  { name: 'Freshwater', fallback: 'from-cyan-600 to-cyan-800', desc: 'Rivers, lakes, and wetlands teeming with aquatic life.', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop&q=80' },
  { name: 'Coral Reef', fallback: 'from-pink-500 to-pink-700', desc: 'Underwater cities of colour and biodiversity.', image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&h=400&fit=crop&q=80' },
  { name: 'Wetland', fallback: 'from-emerald-600 to-emerald-800', desc: 'Marshes and swamps bridging land and water.', image: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21c67?w=1200&h=400&fit=crop&q=80' },
  { name: 'Alpine', fallback: 'from-slate-600 to-slate-800', desc: 'High-altitude ecosystems above the tree line.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=400&fit=crop&q=80' },
  { name: 'Tropical Forest', fallback: 'from-green-600 to-green-800', desc: 'Warm forests with seasonal rainfall patterns.', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop&q=80' },
  { name: 'Tropical Savanna', fallback: 'from-yellow-600 to-yellow-800', desc: 'Warm grasslands with wet and dry seasons.', image: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1200&h=400&fit=crop&q=80' },
  { name: 'Antarctic', fallback: 'from-indigo-500 to-indigo-700', desc: 'The frozen southern continent and its surrounding waters.', image: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1200&h=400&fit=crop&q=80' },
  { name: 'Arid Shrubland', fallback: 'from-yellow-700 to-yellow-900', desc: 'Semi-arid scrublands with drought-resistant vegetation.', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&h=400&fit=crop&q=80' },
];

export default function BiomesPage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBiome, setSelectedBiome] = useState<string | null>(null);

  useEffect(() => {
    getAnimals({ page: 1, size: 500, sort: 'name_asc' })
      .then(data => setAnimals(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const biomeCounts: Record<string, number> = {};
  animals.forEach(a => {
    if (a.biome) biomeCounts[a.biome] = (biomeCounts[a.biome] || 0) + 1;
  });

  const filtered = selectedBiome ? animals.filter(a => a.biome === selectedBiome) : [];
  const activeBiomes = BIOMES.filter(b => biomeCounts[b.name]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-5">
          <div className="h-10 bg-gray-200 rounded w-64" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-forest-800 to-forest-900 text-white rounded-2xl p-8 mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">Explore Biomes</h1>
        <p className="text-forest-200 text-lg mb-6">Discover wildlife organised by their natural habitats and ecosystems</p>
        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-bold">{activeBiomes.length}</div>
            <div className="text-sm text-forest-300 uppercase tracking-wide">Biomes</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{animals.length}</div>
            <div className="text-sm text-forest-300 uppercase tracking-wide">Species</div>
          </div>
        </div>
      </div>

      {/* ── Vertical biome cards ── */}
      {!selectedBiome && (
        <div className="space-y-4">
          {activeBiomes.map(biome => (
            <button
              key={biome.name}
              onClick={() => setSelectedBiome(biome.name)}
              className="w-full relative overflow-hidden rounded-2xl h-44 group text-left cursor-pointer"
            >
              {/* Background photo */}
              <img
                src={biome.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 group-hover:from-black/70 transition-all duration-300" />
              {/* Fallback gradient behind image */}
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${biome.fallback}`} />

              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-between px-6 md:px-8 py-6">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="flex-shrink-0 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <BiomeIcon name={biome.name} className="w-8 h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-xl md:text-2xl text-white mb-1 truncate">{biome.name}</h3>
                    <p className="text-white/70 text-sm hidden sm:block max-w-lg line-clamp-2">{biome.desc}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4">
                  <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/20 inline-flex items-center gap-1.5">
                    <span className="text-white font-bold text-lg">{biomeCounts[biome.name]}</span>
                    <span className="text-white/70 text-sm">species</span>
                  </div>
                  <div className="text-white/50 text-xs mt-2 group-hover:text-white/80 transition flex items-center justify-end gap-1">
                    Explore
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Selected biome detail ── */}
      {selectedBiome && (() => {
        const biomeData = BIOMES.find(b => b.name === selectedBiome);
        const featured = filtered.slice(0, 6);
        const rest = filtered.slice(6);
        return (
          <div>
            <button
              onClick={() => setSelectedBiome(null)}
              className="mb-6 flex items-center gap-2 text-forest-700 hover:text-forest-900 font-medium transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to all biomes
            </button>

            {/* Biome banner */}
            <div className="relative overflow-hidden rounded-2xl h-52 mb-8">
              <img src={biomeData?.image} alt={selectedBiome} className="absolute inset-0 w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${biomeData?.fallback || 'from-gray-700 to-gray-900'}`} />
              <div className="relative z-10 h-full flex items-center px-8 gap-6">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <BiomeIcon name={selectedBiome} className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold text-white">{selectedBiome}</h2>
                  <p className="text-white/70 mt-1 max-w-xl">{biomeData?.desc}</p>
                  <p className="text-white/90 font-semibold mt-2">{filtered.length} species found</p>
                </div>
              </div>
            </div>

            {/* Featured cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {featured.map(animal => (
                <Link key={animal.slug} to={`/animal/${animal.slug}`} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-[3/4] block">
                  <img src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)} alt={animal.common_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" onError={e => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm leading-tight">{animal.common_name}</h3>
                    <p className="text-white/60 text-xs italic truncate">{animal.scientific_name}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Remaining animals list */}
            {rest.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {rest.map(animal => (
                  <Link key={animal.slug} to={`/animal/${animal.slug}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition">
                    <img src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)} alt={animal.common_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }} />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-gray-900">{animal.common_name}</span>
                      <span className="text-gray-400 mx-2">—</span>
                      <span className="text-gray-500 text-sm italic">{animal.scientific_name}</span>
                    </div>
                    {animal.conservation_status && (
                      <span className={`status-badge text-[10px] flex-shrink-0 ${statusColor(animal.conservation_status.code)}`}>{animal.conservation_status.code}</span>
                    )}
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
