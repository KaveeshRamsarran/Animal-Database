import { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import { getHotspots } from '../api/map';
import type { HotspotOut } from '../types';

export default function MapPage() {
  const [hotspots, setHotspots] = useState<HotspotOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotspots().then(setHotspots).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Wildlife Map</h1>
        <p className="text-gray-500">Explore animal habitats and observation areas around the world</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <span className="text-gray-500 font-medium">Areas by density:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#1a7fe6] opacity-60" />
          <span className="text-gray-600">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2d8a2d] opacity-60" />
          <span className="text-gray-600">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ea580c] opacity-60" />
          <span className="text-gray-600">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#dc2626] opacity-60" />
          <span className="text-gray-600">Very High</span>
        </div>
      </div>

      {loading ? (
        <div className="h-[600px] bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <MapView hotspots={hotspots} className="h-[600px]" />
      )}

      <p className="text-xs text-gray-400 mt-3 text-center">
        Circle sizes represent relative observation density. Click an area for details.
      </p>
    </div>
  );
}
