import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import { proxyImage, placeholderImage, statusColor } from '../utils/helpers';
import type { AnimalCard } from '../types';

/* ──── Class metadata ──── */
interface ClassMeta { label: string; scientific: string; desc: string; icon: JSX.Element }

const CLASS_META: Record<string, ClassMeta> = {
  Mammalia: {
    label: 'Mammals', scientific: 'Mammalia',
    desc: 'Warm-blooded vertebrates with hair or fur that nurse their young.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="13" rx="7" ry="5" /><circle cx="9" cy="11" r="1" fill="currentColor" /><path d="M6 8c-1-3 0-5 2-5s2 3 2 5" /><path d="M14 8c0-2 0-5 2-5s3 2 2 5" /><path d="M8 18l-1 3" /><path d="M16 18l1 3" /></svg>,
  },
  Aves: {
    label: 'Birds', scientific: 'Aves',
    desc: 'Feathered, winged, and egg-laying vertebrates found worldwide.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M16 7c2-4 6-3 6 0s-4 4-8 5l-4 1" /><ellipse cx="10" cy="13" rx="6" ry="4" /><circle cx="14" cy="6" r="0.5" fill="currentColor" /><path d="M4 13l-2 5h4" /><path d="M8 17l-1 4" /><path d="M12 17l1 4" /></svg>,
  },
  Reptilia: {
    label: 'Reptiles', scientific: 'Reptilia',
    desc: 'Cold-blooded, scaly creatures including snakes, lizards, and turtles.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12c2-4 6-5 10-3 3 2 6 1 8-1" /><circle cx="19" cy="8" r="0.5" fill="currentColor" /><path d="M8 9c0-2 1-3 2-3" /><path d="M3 12c0 3 2 5 4 6" /><path d="M7 18l-2 3" /><path d="M11 16l1 3" /></svg>,
  },
  Amphibia: {
    label: 'Amphibians', scientific: 'Amphibia',
    desc: 'Dual-life vertebrates that transition between water and land.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="7" ry="5" /><circle cx="9" cy="9" r="1.5" /><circle cx="15" cy="9" r="1.5" /><circle cx="9" cy="9" r="0.5" fill="currentColor" /><circle cx="15" cy="9" r="0.5" fill="currentColor" /><path d="M5 12l-3 3" /><path d="M19 12l3 3" /><path d="M8 17l-2 4" /><path d="M16 17l2 4" /></svg>,
  },
  Actinopterygii: {
    label: 'Ray-finned Fish', scientific: 'Actinopterygii',
    desc: 'The largest class of fish with bony, ray-supported fins.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c4-5 10-6 14-4 2 1 4 4 4 4s-2 3-4 4c-4 2-10 1-14-4z" /><circle cx="17" cy="11" r="1" fill="currentColor" /><path d="M2 12l3-3" /><path d="M2 12l3 3" /></svg>,
  },
  Chondrichthyes: {
    label: 'Sharks & Rays', scientific: 'Chondrichthyes',
    desc: 'Cartilaginous fish including sharks, rays, and skates.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M2 14c5-6 12-7 18-2" /><path d="M20 12c-3 5-10 6-16 2" /><path d="M12 8V4" /><circle cx="17" cy="11" r="0.5" fill="currentColor" /></svg>,
  },
  Insecta: {
    label: 'Insects', scientific: 'Insecta',
    desc: 'Six-legged arthropods — the most diverse animal group on Earth.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="15" rx="3" ry="4" /><circle cx="12" cy="8" r="3" /><path d="M9 5l-3-3" /><path d="M15 5l3-3" /><path d="M9 13l-4-1" /><path d="M15 13l4-1" /><path d="M9 17l-3 2" /><path d="M15 17l3 2" /></svg>,
  },
  Arachnida: {
    label: 'Arachnids', scientific: 'Arachnida',
    desc: 'Eight-legged creatures including spiders and scorpions.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M8 9l-4-5" /><path d="M16 9l4-5" /><path d="M8 12l-6 0" /><path d="M16 12l6 0" /><path d="M8 15l-4 5" /><path d="M16 15l4 5" /><path d="M10 16l-2 6" /><path d="M14 16l2 6" /></svg>,
  },
  Malacostraca: {
    label: 'Crustaceans', scientific: 'Malacostraca',
    desc: 'Hard-shelled marine and freshwater arthropods.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="13" rx="7" ry="4" /><path d="M5 13c-2-3-1-6 1-7" /><path d="M19 13c2-3 1-6-1-7" /><path d="M8 17l-1 3" /><path d="M12 17v3" /><path d="M16 17l1 3" /></svg>,
  },
  Cephalopoda: {
    label: 'Cephalopods', scientific: 'Cephalopoda',
    desc: 'Intelligent molluscs including octopuses and squid.',
    icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="8" rx="5" ry="4" /><path d="M7 12c-2 3-3 6-1 8" /><path d="M10 12c0 4-1 7 1 8" /><path d="M14 12c0 4 1 7-1 8" /><path d="M17 12c2 3 3 6 1 8" /><circle cx="10" cy="7" r="1" fill="currentColor" /><circle cx="14" cy="7" r="1" fill="currentColor" /></svg>,
  },
};

/* Default for unknown classes */
const DEFAULT_META: ClassMeta = {
  label: 'Other', scientific: '',
  desc: 'Other animal classes.',
  icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="8" /><path d="M12 8v4" /><circle cx="12" cy="16" r="0.5" fill="currentColor" /></svg>,
};

function getMeta(className: string): ClassMeta {
  return CLASS_META[className] || { ...DEFAULT_META, label: className, scientific: className };
}

export default function ClassificationPage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    getAnimals({ page: 1, size: 500, sort: 'name_asc' })
      .then(data => setAnimals(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const classCounts = useMemo(() => {
    const m: Record<string, number> = {};
    animals.forEach(a => { if (a.class_name) m[a.class_name] = (m[a.class_name] || 0) + 1; });
    return m;
  }, [animals]);

  const sortedClasses = useMemo(() =>
    Object.entries(classCounts).sort(([, a], [, b]) => b - a),
  [classCounts]);

  const filtered = selectedClass ? animals.filter(a => a.class_name === selectedClass) : [];
  const featured = filtered.slice(0, 6);
  const rest = filtered.slice(6);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-72 bg-forest-900" />
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-forest-950 min-h-screen">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-forest-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=1600&h=600&fit=crop&q=60')] bg-cover bg-center opacity-15" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 flex items-center gap-10">
          <div className="hidden lg:flex flex-shrink-0 w-28 h-28 rounded-full bg-forest-800/60 border border-forest-600/40 items-center justify-center">
            <svg className="w-14 h-14 text-forest-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M9 3v18" /><path d="M3 9h18" /><path d="M3 15h6" />
              <path d="M15 9v9" /><path d="M9 12h6" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 10h16M4 14h10M4 18h6" /></svg>
              Taxonomic Classification
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-1">
              Animals by<br /><span className="text-emerald-400 italic">Scientific Class</span>
            </h1>
            <p className="text-forest-300 text-lg mt-4 max-w-xl">
              Explore our animal encyclopedia organized by taxonomic class. From mammals to reptiles, birds to fish, discover the diversity of the animal kingdom.
            </p>
          </div>
          <div className="hidden md:flex flex-col gap-3">
            <div className="bg-forest-800/60 border border-forest-600/40 rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold text-emerald-400 font-display">{animals.length}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold">Species</div>
            </div>
            <div className="bg-forest-800/60 border border-forest-600/40 rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold text-emerald-400 font-display">{sortedClasses.length}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold">Classes</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Class pills ── */}
      <div className="bg-forest-900/80 border-y border-forest-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-forest-500 text-xs font-bold uppercase tracking-wider mr-2 flex-shrink-0">Classes</span>
          <span className="bg-forest-700/50 text-forest-300 px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0">{sortedClasses.length}</span>
          <div className="w-px h-5 bg-forest-700/50 mx-1" />
          {sortedClasses.map(([cls, count]) => {
            const meta = getMeta(cls);
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(selectedClass === cls ? null : cls)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedClass === cls
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-forest-300 hover:bg-forest-700/50 border border-transparent'
                }`}
              >
                {meta.icon && <span className="w-4 h-4 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">{meta.icon}</span>}
                {meta.label}
                <span className="text-forest-500 text-xs">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Browse shortcuts ── */}
      {!selectedClass && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
            <Link to="/browse" className="flex items-center gap-4 bg-forest-800/40 hover:bg-forest-800/60 border border-forest-700/40 rounded-xl px-5 py-4 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">By Common Name</h3>
                <p className="text-forest-400 text-xs">Browse animals A-Z by their common names</p>
              </div>
            </Link>
            <Link to="/browse" className="flex items-center gap-4 bg-forest-800/40 hover:bg-forest-800/60 border border-forest-700/40 rounded-xl px-5 py-4 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 2l-2 7H3l6 4-2 7 5-4 5 4-2-7 6-4h-7z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">By Scientific Name</h3>
                <p className="text-forest-400 text-xs">Find species by Latin nomenclature</p>
              </div>
            </Link>
            <Link to="/conservation" className="flex items-center gap-4 bg-forest-800/40 hover:bg-forest-800/60 border border-forest-700/40 rounded-xl px-5 py-4 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">By Conservation Status</h3>
                <p className="text-forest-400 text-xs">From endangered to thriving</p>
              </div>
            </Link>
          </div>

          {/* Class cards */}
          {sortedClasses.map(([cls, count]) => {
            const meta = getMeta(cls);
            const classAnimals = animals.filter(a => a.class_name === cls);
            const preview = classAnimals.slice(0, 3);
            return (
              <div key={cls} className="mb-6">
                <div className="flex items-center justify-between bg-forest-800/40 border border-forest-700/40 rounded-xl px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      {meta.icon}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">
                        {meta.label} <span className="text-forest-400 font-normal italic text-sm">({meta.scientific})</span>
                      </h3>
                      <p className="text-forest-400 text-sm">{meta.desc}</p>
                      <p className="text-forest-500 text-xs mt-0.5">{count} species</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedClass(cls)}
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1 transition"
                  >
                    View all
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                {/* Preview cards */}
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {preview.map(animal => (
                    <Link key={animal.slug} to={`/animal/${animal.slug}`} className="group relative rounded-xl overflow-hidden bg-forest-800 aspect-[4/3] block">
                      <img src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)} alt={animal.common_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100" loading="lazy" onError={e => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-white font-bold text-sm leading-tight">{animal.common_name}</h4>
                        <p className="text-white/60 text-xs italic truncate">{animal.scientific_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Selected class detail ── */}
      {selectedClass && (() => {
        const meta = getMeta(selectedClass);
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <button onClick={() => setSelectedClass(null)} className="mb-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to all classes
            </button>

            <div className="bg-forest-800/40 border border-forest-700/40 rounded-xl px-6 py-6 mb-8 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 [&>svg]:w-8 [&>svg]:h-8">
                {meta.icon}
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white">{meta.label} <span className="text-forest-400 font-normal italic text-lg">({meta.scientific})</span></h2>
                <p className="text-forest-400 mt-1">{meta.desc}</p>
                <p className="text-emerald-400 font-semibold text-sm mt-1">{filtered.length} species</p>
              </div>
            </div>

            {/* Featured */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {featured.map(animal => (
                <Link key={animal.slug} to={`/animal/${animal.slug}`} className="group relative rounded-xl overflow-hidden bg-forest-800 aspect-[3/4] block">
                  <img src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)} alt={animal.common_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100" loading="lazy" onError={e => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-sm">{animal.common_name}</h4>
                    <p className="text-white/60 text-xs italic truncate">{animal.scientific_name}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Rest list */}
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
                    {animal.conservation_status && (
                      <span className={`status-badge text-[10px] flex-shrink-0 ${statusColor(animal.conservation_status.code)}`}>{animal.conservation_status.code}</span>
                    )}
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
