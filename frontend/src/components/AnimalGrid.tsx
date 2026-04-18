import type { AnimalCard as AnimalCardType } from '../types';
import AnimalCard from './AnimalCard';

interface Props {
  animals: AnimalCardType[];
  onCompareToggle?: (id: number) => void;
  compareIds?: number[];
}

export default function AnimalGrid({ animals, onCompareToggle, compareIds = [] }: Props) {
  if (animals.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-lg font-medium">No animals found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {animals.map(a => (
        <AnimalCard key={a.id} animal={a} onCompareToggle={onCompareToggle} isCompareSelected={compareIds.includes(a.id)} />
      ))}
    </div>
  );
}
