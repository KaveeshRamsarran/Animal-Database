import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnimalGrid from '../components/AnimalGrid';
import FilterSidebar from '../components/FilterSidebar';
import PaginationControls from '../components/PaginationControls';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorBanner from '../components/ErrorBanner';
import { getAnimals, type AnimalFilters } from '../api/animals';
import type { AnimalCard, PaginatedResponse } from '../types';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResponse<AnimalCard> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters: Record<string, string> = {};
  for (const [k, v] of searchParams.entries()) filters[k] = v;
  const page = parseInt(filters.page || '1');

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    const params: AnimalFilters = { ...filters, page, size: 20 };
    getAnimals(params).then(setData).catch(() => setError('Failed to load animals')).finally(() => setLoading(false));
  }, [searchParams.toString()]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterChange = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Browse Animals</h1>
      <div className="flex gap-6">
        <div className="hidden md:block w-56 flex-shrink-0">
          <FilterSidebar filters={filters} onChange={handleFilterChange} />
        </div>
        <div className="flex-1">
          {error && <ErrorBanner message={error} onRetry={fetchData} />}
          {loading ? <LoadingSkeleton /> : data && (
            <>
              <p className="text-sm text-gray-500 mb-4">{data.total} animals found</p>
              <AnimalGrid animals={data.items} />
              <PaginationControls page={data.page} pages={data.pages} onChange={p => handleFilterChange('page', String(p))} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
