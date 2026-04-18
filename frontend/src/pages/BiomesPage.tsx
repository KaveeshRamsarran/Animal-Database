import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import { proxyImage, placeholderImage, statusColor } from '../utils/helpers';
import type { AnimalCard } from '../types';

const BIOMES = [
  { name: 'Tropical Rainforest', emoji: '🌴', color: 'from-green-600 to-green-800', desc: 'Lush equatorial forests with the highest biodiversity on Earth.' },
  { name: 'Temperate Forest', emoji: '🌲', color: 'from-emerald-600 to-emerald-800', desc: 'Deciduous and mixed forests with seasonal change.' },
  { name: 'Boreal Forest', emoji: '🌿', color: 'from-teal-700 to-teal-900', desc: 'Cold northern conifer forests spanning vast territories.' },
  { name: 'Savanna', emoji: '🦁', color: 'from-amber-500 to-amber-700', desc: 'Tropical grasslands with scattered trees and large herbivores.' },
  { name: 'Grassland', emoji: '🌾', color: 'from-lime-600 to-lime-800', desc: 'Open plains dominated by grasses and grazing animals.' },
  { name: 'Desert', emoji: '🏜️', color: 'from-orange-500 to-orange-700', desc: 'Arid landscapes with specially adapted survivors.' },
  { name: 'Tundra', emoji: '❄️', color: 'from-sky-400 to-sky-600', desc: 'Frozen treeless expanses of the high Arctic.' },
  { name: 'Arctic Tundra', emoji: '🧊', color: 'from-blue-400 to-blue-600', desc: 'Permafrost terrain home to polar bears and caribou.' },
  { name: 'Ocean', emoji: '🌊', color: 'from-blue-600 to-blue-800', desc: 'The vast marine realm covering 70% of Earth.' },
  { name: 'Freshwater', emoji: '🐟', color: 'from-cyan-500 to-cyan-700', desc: 'Rivers, lakes, and wetlands teeming with aquatic life.' },
  { name: 'Coral Reef', emoji: '🪸', color: 'from-pink-500 to-pink-700', desc: 'Underwater cities of color and biodiversity.' },
  { name: 'Wetland', emoji: '🐊', color: 'from-emerald-500 to-emerald-700', desc: 'Marshes and swamps bridging land and water.' },
  { name: 'Alpine', emoji: '🏔️', color: 'from-slate-500 to-slate-700', desc: 'High-altitude ecosystems above the tree line.' },
  { name: 'Tropical Forest', emoji: '🌺', color: 'from-green-500 to-green-700', desc: 'Warm forests with seasonal rainfall patterns.' },
  { name: 'Tropical Savanna', emoji: '🐘', color: 'from-yellow-500 to-yellow-700', desc: 'Warm grasslands with wet and dry seasons.' },
  { name: 'Antarctic', emoji: '🐧', color: 'from-indigo-400 to-indigo-600', desc: 'The frozen southern continent and its surrounding waters.' },
  { name: 'Arid Shrubland', emoji: '🌵', color: 'from-yellow-600 to-yellow-800', desc: 'Semi-arid scrublands with drought-resistant vegetation.' },
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
    if (a.biome) {
      biomeCounts[a.biome] = (biomeCounts[a.biome] || 0) + 1;
    }
  });

  const filtered = selectedBiome
    ? animals.filter(a => a.biome === selectedBiome)
    : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-forest-800 to-forest-900 text-white rounded-2xl p-8 mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">Biomes</h1>
        <p className="text-forest-200 text-lg mb-6">Explore wildlife by their natural habitats and ecosystems</p>
        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-bold">{Object.keys(biomeCounts).length}</div>
            <div className="text-sm text-forest-300 uppercase tracking-wide">Biomes</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{animals.length}</div>
            <div className="text-sm text-forest-300 uppercase tracking-wide">Species</div>
          </div>
        </div>
      </div>

      {/* Biome Grid */}
      {!selectedBiome && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
          {BIOMES.filter(b => biomeCounts[b.name]).map(biome => (
            <button
              key={biome.name}
              onClick={() => setSelectedBiome(biome.name)}
              className={`bg-gradient-to-br ${biome.color} text-white rounded-2xl p-6 text-left hover:scale-[1.03] transition-transform shadow-lg`}
            >
              <div className="text-3xl mb-3">{biome.emoji}</div>
              <h3 className="font-display font-bold text-lg mb-1">{biome.name}</h3>
              <p className="text-sm opacity-80 mb-3 line-clamp-2">{biome.desc}</p>
              <div className="bg-white/20 rounded-full px-3 py-1 inline-block text-sm font-semibold">
                {biomeCounts[biome.name] || 0} species
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected Biome View */}
      {selectedBiome && (
        <div>
          <button
            onClick={() => setSelectedBiome(null)}
            className="mb-6 flex items-center gap-2 text-forest-700 hover:text-forest-900 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to all biomes
          </button>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{BIOMES.find(b => b.name === selectedBiome)?.emoji}</span>
            <div>
              <h2 className="font-display text-3xl font-bold text-gray-900">{selectedBiome}</h2>
              <p className="text-gray-500">{filtered.length} species found</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(animal => (
              <Link
                key={animal.slug}
                to={`/animal/${animal.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden border border-gray-100"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={animal.thumbnail_url ? proxyImage(animal.thumbnail_url) : placeholderImage(animal.common_name)}
                    alt={animal.common_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{animal.common_name}</h3>
                  <p className="text-xs text-gray-500 italic truncate">{animal.scientific_name}</p>
                  {animal.conservation_status?.code && (
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full ${statusColor(animal.conservation_status.code)}`}>
                      {animal.conservation_status.code}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
