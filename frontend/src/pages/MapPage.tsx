import { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import { getHotspots } from '../api/map';
import type { HotspotOut } from '../types';

const LEGEND = [
  { code: 'CR', label: 'Critically Endangered', color: '#991b1b' },
  { code: 'EN', label: 'Endangered', color: '#dc2626' },
  { code: 'VU', label: 'Vulnerable', color: '#ea580c' },
  { code: 'NT', label: 'Near Threatened', color: '#ca8a04' },
  { code: 'LC', label: 'Least Concern', color: '#16a34a' },
  { code: 'DD', label: 'Data Deficient', color: '#6b7280' },
];

export default function MapPage() {
  const [hotspots, setHotspots] = useState<HotspotOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    getHotspots().then(setHotspots).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter
    ? hotspots.filter(h => h.conservation_status_code === statusFilter)
    : hotspots;

  return (
    <div className="bg-forest-950 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Wildlife Map</h1>
        <p className="text-forest-400">Explore species around the world, colour-coded by conservation status</p>
      </div>

      {/* Conservation Status Legend / Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <span className="text-forest-400 font-medium mr-1">Filter by status:</span>
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
            !statusFilter ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-forest-800/40 text-forest-300 border-forest-700/40 hover:border-forest-600/60'
          }`}
        >
          All ({hotspots.length})
        </button>
        {LEGEND.map(l => {
          const count = hotspots.filter(h => h.conservation_status_code === l.code).length;
          if (!count) return null;
          return (
            <button
              key={l.code}
              onClick={() => setStatusFilter(statusFilter === l.code ? null : l.code)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                statusFilter === l.code
                  ? 'text-white border-transparent'
                  : 'bg-forest-800/40 text-forest-300 border-forest-700/40 hover:border-forest-600/60'
              }`}
              style={statusFilter === l.code ? { background: l.color, borderColor: l.color } : {}}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
              {l.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="h-[600px] bg-forest-800 rounded-xl animate-pulse" />
      ) : (
        <MapView hotspots={filtered} className="h-[600px]" />
      )}

      <p className="text-xs text-forest-500 mt-3 text-center">
        Each dot represents a recorded location. Colour indicates IUCN conservation status. Click for details.
      </p>
    </div></div>
  );
}
