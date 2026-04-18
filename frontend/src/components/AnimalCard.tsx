import { Link } from 'react-router-dom';
import type { AnimalCard as AnimalCardType } from '../types';
import { statusColor, placeholderImage, proxyImage } from '../utils/helpers';

interface Props {
  animal: AnimalCardType;
  onCompareToggle?: (id: number) => void;
  isCompareSelected?: boolean;
}

export default function AnimalCard({ animal, onCompareToggle, isCompareSelected }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group relative">
      {onCompareToggle && (
        <button
          onClick={(e) => { e.preventDefault(); onCompareToggle(animal.id); }}
          className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
            isCompareSelected ? 'bg-ocean-500 text-white' : 'bg-white/80 text-gray-500 hover:bg-ocean-100'
          }`}
          title="Add to compare"
        >
          ⚖
        </button>
      )}
      <Link to={`/animal/${animal.slug}`}>
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)}
            alt={animal.common_name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }}
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-lg text-gray-800">{animal.common_name}</h3>
              <p className="text-sm text-gray-500 italic">{animal.scientific_name}</p>
            </div>
            {animal.conservation_status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusColor(animal.conservation_status.code)}`}>
                {animal.conservation_status.code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            {animal.class_name && <span className="bg-forest-50 text-forest-700 px-2 py-0.5 rounded">{animal.class_name}</span>}
            {animal.diet && <span>{animal.diet}</span>}
            {animal.environment_type && <span>{animal.environment_type}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}
