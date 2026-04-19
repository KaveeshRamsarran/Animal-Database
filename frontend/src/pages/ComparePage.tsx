import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAnimals } from '../api/animals';
import { compareAnimals } from '../api/animals';
import AnimalGrid from '../components/AnimalGrid';
import CompareTable from '../components/CompareTable';
import LoadingSkeleton from '../components/LoadingSkeleton';
import type { AnimalCard, AnimalCompare } from '../types';

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [compared, setCompared] = useState<AnimalCompare[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    const ids = searchParams.get('ids');
    return ids ? ids.split(',').map(Number).filter(Boolean) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnimals({ size: 100 }).then(r => setAnimals(r.items)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedIds.length >= 2) {
      compareAnimals(selectedIds).then(setCompared).catch(() => {});
      setSearchParams({ ids: selectedIds.join(',') });
    } else {
      setCompared([]);
    }
  }, [selectedIds]);

  const toggle = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  return (
    <div className="bg-forest-950 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-2">Compare Species</h1>
      <p className="text-forest-400 mb-6">Select 2-4 animals to compare side by side ({selectedIds.length}/4 selected)</p>

      {compared.length >= 2 && (
        <div className="mb-10">
          <CompareTable animals={compared} />
        </div>
      )}

      <h2 className="font-display text-xl font-semibold text-white mb-4">Select Animals</h2>
      {loading ? <LoadingSkeleton /> : <AnimalGrid animals={animals} onCompareToggle={toggle} compareIds={selectedIds} />}
    </div></div>
  );
}
