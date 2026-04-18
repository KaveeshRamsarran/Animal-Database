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
    <div>
      <HeroSection />
      {stats && (
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><div className="text-3xl font-bold text-forest-700">{stats.total_animals}</div><div className="text-sm text-gray-500">Species</div></div>
            <div><div className="text-3xl font-bold text-ocean-600">{stats.total_countries}</div><div className="text-sm text-gray-500">Countries</div></div>
            <div><div className="text-3xl font-bold text-sand-600">{stats.total_occurrences.toLocaleString()}</div><div className="text-sm text-gray-500">Observations</div></div>
            <div><div className="text-3xl font-bold text-purple-600">{stats.total_images}</div><div className="text-sm text-gray-500">Images</div></div>
          </div>
        </section>
      )}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-gray-800">Featured Wildlife</h2>
          <Link to="/browse" className="text-forest-600 font-medium text-sm hover:underline">View all →</Link>
        </div>
        {loading ? <LoadingSkeleton /> : <AnimalGrid animals={animals} />}
      </section>
    </div>
  );
}
