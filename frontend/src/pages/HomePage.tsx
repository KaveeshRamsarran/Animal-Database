import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import AnimalGrid from '../components/AnimalGrid';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getFeaturedAnimals } from '../api/animals';
import { getStats } from '../api/admin';
import type { AnimalCard, StatsOut } from '../types';

export default function HomePage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFeaturedAnimals(8), getStats()])
      .then(([a, s]) => { setAnimals(a); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-forest-950 min-h-screen">
      <HeroSection />

      {/* Stats Banner */}
      {stats && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: stats.total_animals, label: 'Species', icon: '🦁' },
                { value: stats.total_countries, label: 'Countries', icon: '🌍' },
                { value: stats.total_occurrences, label: 'Observations', icon: '📍' },
                { value: stats.total_images, label: 'Photos', icon: '📷' },
              ].map(s => (
                <div key={s.label} className="bg-forest-800/40 border border-forest-700/40 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-bold text-white">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
                  <div className="text-sm text-forest-400 uppercase tracking-wide mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Wildlife */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Featured Wildlife</h2>
            <p className="text-forest-400 mt-1">Discover some of the most fascinating species on Earth</p>
          </div>
          <Link to="/browse" className="hidden md:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-500/30 transition">
            View All Animals
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        {loading ? <LoadingSkeleton /> : <AnimalGrid animals={animals} />}
        <div className="md:hidden text-center mt-6">
          <Link to="/browse" className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-500/30 transition">
            View All Animals →
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/map" className="group info-card flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🗺️</div>
            <div>
              <h3 className="font-bold text-white group-hover:text-emerald-400 transition">Wildlife Map</h3>
              <p className="text-sm text-forest-400">Explore animal habitats across the globe</p>
            </div>
          </Link>
          <Link to="/compare" className="group info-card flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">⚖️</div>
            <div>
              <h3 className="font-bold text-white group-hover:text-emerald-400 transition">Compare Species</h3>
              <p className="text-sm text-forest-400">Compare up to 3 animals side by side</p>
            </div>
          </Link>
          <Link to="/explore" className="group info-card flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🌎</div>
            <div>
              <h3 className="font-bold text-white group-hover:text-emerald-400 transition">By Region</h3>
              <p className="text-sm text-forest-400">Browse animals by continent and country</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
