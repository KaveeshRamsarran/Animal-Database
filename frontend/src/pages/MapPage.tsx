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
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Wildlife Map</h1>
      <p className="text-gray-500 mb-6">Explore animal observation hotspots around the world</p>
      {loading ? (
        <div className="h-[600px] bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <MapView hotspots={hotspots} className="h-[600px]" />
      )}
    </div>
  );
}
