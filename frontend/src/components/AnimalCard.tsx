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
    <div className="group relative rounded-xl overflow-hidden bg-forest-800/40 border border-forest-700/40 hover:border-forest-600/60 transition-all duration-300">
      {onCompareToggle && (
        <button
          onClick={(e) => { e.preventDefault(); onCompareToggle(animal.id); }}
          className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
            isCompareSelected ? 'bg-ocean-500 text-white' : 'bg-black/50 text-forest-300 hover:bg-ocean-500/30'
          }`}
          title="Add to compare"
        >
          ⚖
        </button>
      )}
      <Link to={`/animal/${animal.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-forest-800">
          <img
            src={proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name)}
            alt={animal.common_name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-90 group-hover:opacity-100"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage(animal.common_name); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-lg text-white group-hover:text-emerald-400 transition truncate">{animal.common_name}</h3>
              <p className="text-sm text-forest-400 italic truncate">{animal.scientific_name}</p>
            </div>
            {animal.conservation_status && (
              <span className={`status-badge text-[10px] flex-shrink-0 ${statusColor(animal.conservation_status.code)}`}>
                {animal.conservation_status.code}
              </span>
            )}
          </div>
          {animal.habitat_summary && (
            <p className="text-xs text-forest-500 mt-2 line-clamp-2">{animal.habitat_summary}</p>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {animal.class_name && <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs font-medium">{animal.class_name}</span>}
            {animal.diet && <span className="bg-forest-700/50 text-forest-300 px-2 py-0.5 rounded text-xs font-medium">{animal.diet}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}
