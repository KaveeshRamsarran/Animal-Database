import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getContinents, getCountries } from '../api/regions';
import { getAnimals } from '../api/animals';
import type { ContinentOut, CountryOut } from '../types';

/* ──── Continent background images ──── */
const CONTINENT_IMG: Record<string, string> = {
  AF: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=300&fit=crop&q=80',
  AN: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=600&h=300&fit=crop&q=80',
  AS: 'https://images.unsplash.com/photo-1535139262971-c51845536a23?w=600&h=300&fit=crop&q=80',
  EU: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=300&fit=crop&q=80',
  NA: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=300&fit=crop&q=80',
  OC: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&h=300&fit=crop&q=80',
  SA: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&h=300&fit=crop&q=80',
};

export default function LocationPage() {
  const [continents, setContinents] = useState<ContinentOut[]>([]);
  const [countries, setCountries] = useState<CountryOut[]>([]);
  const [allCountries, setAllCountries] = useState<CountryOut[]>([]);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getContinents(),
      getCountries(),
      getAnimals({ page: 1, size: 1 }),
    ]).then(([c, co, a]) => {
      setContinents(c);
      setCountries(co);
      setAllCountries(co);
      setTotalAnimals(a.total);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedContinent) {
      getCountries(selectedContinent).then(setCountries).catch(() => {});
    } else {
      setCountries(allCountries);
    }
  }, [selectedContinent, allCountries]);

  const countriesByContinent: Record<string, number> = {};
  allCountries.forEach(c => {
    if (c.continent_name) countriesByContinent[c.continent_name] = (countriesByContinent[c.continent_name] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-80 bg-forest-900" />
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
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&h=600&fit=crop&q=60')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 flex items-center gap-10">
          {/* Icon */}
          <div className="hidden lg:flex flex-shrink-0 w-28 h-28 rounded-full bg-forest-800/60 border border-forest-600/40 items-center justify-center">
            <svg className="w-14 h-14 text-forest-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <ellipse cx="12" cy="12" rx="4" ry="10" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><ellipse cx="12" cy="12" rx="4" ry="10" /></svg>
              Wildlife Expeditions
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-1">
              Animals by<br /><span className="text-emerald-400">Location</span>
            </h1>
            <p className="text-forest-300 text-lg mt-4 max-w-xl">
              Explore wildlife from every corner of the globe. Discover animals native to each region.
            </p>
          </div>
          {/* Stats */}
          <div className="hidden md:flex flex-col gap-3">
            <div className="bg-forest-800/60 border border-forest-600/40 rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold text-emerald-400 font-display">{totalAnimals}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold">Animals</div>
            </div>
            <div className="bg-forest-800/60 border border-forest-600/40 rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold text-emerald-400 font-display">{continents.length}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold">Regions</div>
            </div>
            <div className="bg-forest-800/60 border border-forest-600/40 rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold text-emerald-400 font-display">{allCountries.length}</div>
              <div className="text-[10px] text-forest-400 uppercase tracking-wider font-bold">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Continent pills ── */}
      <div className="bg-forest-900/80 border-y border-forest-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedContinent(null)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              !selectedContinent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-forest-300 hover:bg-forest-700/50 border border-transparent'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><ellipse cx="12" cy="12" rx="4" ry="10" /></svg>
            All
          </button>
          {continents.map(c => (
            <button
              key={c.code}
              onClick={() => setSelectedContinent(c.code === selectedContinent ? null : c.code)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedContinent === c.code ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-forest-300 hover:bg-forest-700/50 border border-transparent'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Intro text ── */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <div className="max-w-3xl">
          <p className="text-forest-200 text-lg leading-relaxed">
            <span className="text-3xl font-display font-bold text-white float-left mr-2 mt-1 leading-none">A</span>nimals inhabit every continent on Earth. From the savannas of Africa to the rainforests of South America, each region hosts unique species adapted to their environment.
          </p>
          <p className="text-forest-400 italic mt-3 text-sm">
            Simply click on a continent or country below to get started.
          </p>
        </div>
      </div>

      {/* ── Continent cards or country list ── */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {!selectedContinent ? (
          <div className="space-y-3">
            {continents.map(c => (
              <button
                key={c.code}
                onClick={() => setSelectedContinent(c.code)}
                className="w-full group bg-forest-800/50 hover:bg-forest-800/80 border border-forest-700/40 rounded-xl overflow-hidden transition-all"
              >
                <div className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-forest-700/50 flex items-center justify-center border border-forest-600/30">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><ellipse cx="12" cy="12" rx="4" ry="10" /></svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-display font-bold text-xl text-white">{c.name}</h3>
                      <p className="text-forest-400 text-sm">{countriesByContinent[c.name] || 0} countries</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-semibold text-sm">Explore</span>
                    <svg className="w-5 h-5 text-forest-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedContinent(null)} className="mb-6 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to all regions
            </button>
            <h2 className="font-display text-2xl font-bold text-white mb-6">
              {continents.find(c => c.code === selectedContinent)?.name} — {countries.length} Countries
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {countries.map(c => (
                <Link
                  key={c.id}
                  to={`/country/${c.code}`}
                  className="group flex items-center gap-4 bg-forest-800/50 hover:bg-forest-800/80 border border-forest-700/40 rounded-xl px-5 py-4 transition-all"
                >
                  {c.flag_url && <img src={c.flag_url} alt="" className="w-8 h-6 object-cover rounded shadow" />}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white text-sm">{c.name}</div>
                    {c.subregion && <div className="text-xs text-forest-400">{c.subregion}</div>}
                  </div>
                  <svg className="w-4 h-4 text-forest-600 group-hover:text-emerald-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
