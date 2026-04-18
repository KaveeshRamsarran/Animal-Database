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
    <div className="group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300">
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
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)}
            alt={animal.common_name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-forest-700 transition truncate">{animal.common_name}</h3>
              <p className="text-sm text-gray-500 italic truncate">{animal.scientific_name}</p>
            </div>
            {animal.conservation_status && (
              <span className={`status-badge text-[10px] flex-shrink-0 ${statusColor(animal.conservation_status.code)}`}>
                {animal.conservation_status.code}
              </span>
            )}
          </div>
          {animal.habitat_summary && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{animal.habitat_summary}</p>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {animal.class_name && <span className="bg-forest-50 text-forest-700 px-2 py-0.5 rounded text-xs font-medium">{animal.class_name}</span>}
            {animal.diet && <span className="bg-sand-50 text-sand-700 px-2 py-0.5 rounded text-xs font-medium">{animal.diet}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}
