import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import { proxyImage, placeholderImage, statusColor } from '../utils/helpers';
import type { AnimalCard } from '../types';

/* ──── IUCN status metadata ──── */
interface StatusMeta { code: string; name: string; desc: string; color: string; bg: string; ring: string; text: string }

const STATUSES: StatusMeta[] = [
  { code: 'CR', name: 'Critically Endangered', desc: 'Facing an extremely high risk of extinction in the wild.', color: '#991b1b', bg: 'bg-red-900/30', ring: 'ring-red-500/40', text: 'text-red-400' },
  { code: 'EN', name: 'Endangered', desc: 'Facing a very high risk of extinction in the wild.', color: '#dc2626', bg: 'bg-red-800/20', ring: 'ring-red-400/40', text: 'text-red-400' },
  { code: 'VU', name: 'Vulnerable', desc: 'Facing a high risk of extinction in the wild.', color: '#ea580c', bg: 'bg-orange-900/20', ring: 'ring-orange-500/40', text: 'text-orange-400' },
  { code: 'NT', name: 'Near Threatened', desc: 'Close to qualifying for or likely to qualify for a threatened category in the near future.', color: '#ca8a04', bg: 'bg-yellow-900/20', ring: 'ring-yellow-500/40', text: 'text-yellow-400' },
  { code: 'LC', name: 'Least Concern', desc: 'Evaluated with a lower risk of extinction. Widespread and abundant.', color: '#16a34a', bg: 'bg-green-900/20', ring: 'ring-green-500/40', text: 'text-green-400' },
  { code: 'DD', name: 'Data Deficient', desc: 'Not enough data to assess the risk of extinction.', color: '#6b7280', bg: 'bg-gray-800/20', ring: 'ring-gray-500/40', text: 'text-gray-400' },
];

export default function ConservationPage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    getAnimals({ page: 1, size: 500, sort: 'name_asc' })
      .then(data => setAnimals(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = useMemo(() => {
    const m: Record<string, number> = {};
    animals.forEach(a => {
      const c = a.conservation_status?.code;
      if (c) m[c] = (m[c] || 0) + 1;
    });
    return m;
  }, [animals]);

  const endangered = useMemo(() =>
    animals.filter(a => ['CR', 'EN', 'VU'].includes(a.conservation_status?.code || '')).length,
  [animals]);

  const atRisk = useMemo(() =>
    animals.filter(a => ['CR', 'EN', 'VU', 'NT'].includes(a.conservation_status?.code || '')).length,
  [animals]);

  const filtered = selectedStatus ? animals.filter(a => a.conservation_status?.code === selectedStatus) : [];
  const featured = filtered.slice(0, 6);
  const rest = filtered.slice(6);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-[480px] bg-forest-900" />
        <div className="w-full px-6 lg:px-12 py-10 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-forest-950 min-h-screen">
      {/* ── Dramatic hero with background ── */}
      <div className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1600&h=800&fit=crop&q=70"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/70 to-forest-950" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" /></svg>
            Conservation Status
          </div>

          <p className="text-forest-300 text-lg mb-2">Protecting</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
            Endangered<br />Wildlife
          </h1>
          <p className="text-forest-300 text-lg max-w-2xl mx-auto mb-10">
            Explore animals by their IUCN conservation status. Learn about species facing extinction and discover what makes each category unique.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-10 md:gap-16">
            <div>
              <div className="text-4xl font-bold text-red-400 font-display">{endangered}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold mt-1">Endangered Species</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 font-display">{atRisk}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold mt-1">At Risk Overall</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 font-display">{STATUSES.length}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold mt-1">IUCN Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── IUCN Scale explanation ── */}
      {!selectedStatus && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-3">Understanding the Threat Levels</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            IUCN Conservation Status Scale
          </h2>
          <p className="text-forest-400 max-w-2xl mx-auto mb-12">
            The International Union for Conservation of Nature classifies species into these categories based on extinction risk.
          </p>

          {/* Status scale visual */}
          <div className="flex justify-center mb-16">
            <div className="flex items-end gap-1">
              {STATUSES.filter(s => s.code !== 'DD').map((s, i) => (
                <button
                  key={s.code}
                  onClick={() => setSelectedStatus(s.code)}
                  className="group flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div
                    className="w-14 md:w-20 rounded-t-lg transition-all group-hover:scale-105"
                    style={{
                      height: `${140 - i * 24}px`,
                      backgroundColor: s.color,
                      opacity: statusCounts[s.code] ? 1 : 0.3,
                    }}
                  />
                  <div className="text-xs font-bold text-white">{s.code}</div>
                  <div className="text-[10px] text-forest-500 max-w-[80px] leading-tight">{s.name}</div>
                  <div className="text-xs font-bold" style={{ color: s.color }}>{statusCounts[s.code] || 0}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Status cards */}
          <div className="space-y-3 text-left">
            {STATUSES.map(s => (
              <button
                key={s.code}
                onClick={() => setSelectedStatus(s.code)}
                className={`w-full group ${s.bg} border border-forest-700/40 hover:border-forest-600/60 rounded-xl px-6 py-5 transition-all flex items-center gap-5`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg text-white flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  {s.code}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-lg text-white">{s.name}</h3>
                  <p className="text-forest-400 text-sm">{s.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold font-display" style={{ color: s.color }}>{statusCounts[s.code] || 0}</div>
                  <div className="text-forest-500 text-xs">species</div>
                </div>
                <svg className="w-5 h-5 text-forest-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Selected status detail ── */}
      {selectedStatus && (() => {
        const meta = STATUSES.find(s => s.code === selectedStatus)!;
        return (
          <div className="w-full px-6 lg:px-12 py-8">
            <button onClick={() => setSelectedStatus(null)} className="mb-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to all statuses
            </button>

            <div className={`${meta.bg} border border-forest-700/40 rounded-xl px-6 py-6 mb-8 flex items-center gap-5`}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-xl text-white flex-shrink-0" style={{ backgroundColor: meta.color }}>
                {meta.code}
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white">{meta.name}</h2>
                <p className="text-forest-400 mt-1">{meta.desc}</p>
                <p className="font-semibold text-sm mt-1" style={{ color: meta.color }}>{filtered.length} species</p>
              </div>
            </div>

            {/* Featured */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {featured.map(animal => (
                <Link key={animal.slug} to={`/animal/${animal.slug}`} className="group relative rounded-xl overflow-hidden bg-forest-800 aspect-[3/4] block">
                  <img src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)} alt={animal.common_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100" loading="lazy" onError={e => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: meta.color }}>{meta.code}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-sm">{animal.common_name}</h4>
                    <p className="text-white/60 text-xs italic truncate">{animal.scientific_name}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Rest */}
            {rest.length > 0 && (
              <div className="bg-forest-800/30 border border-forest-700/30 rounded-xl divide-y divide-forest-700/30">
                {rest.map(animal => (
                  <Link key={animal.slug} to={`/animal/${animal.slug}`} className="flex items-center gap-4 px-5 py-3 hover:bg-forest-700/20 transition">
                    <img src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)} alt={animal.common_name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }} />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-white">{animal.common_name}</span>
                      <span className="text-forest-600 mx-2">—</span>
                      <span className="text-forest-400 text-sm italic">{animal.scientific_name}</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: meta.color }}>{meta.code}</span>
                    <svg className="w-4 h-4 text-forest-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
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
