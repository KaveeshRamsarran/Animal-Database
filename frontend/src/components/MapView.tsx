import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { HotspotOut } from '../types';

interface Props {
  hotspots: HotspotOut[];
  onMarkerClick?: (h: HotspotOut) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Color by observation count
function getAreaColor(count: number): string {
  if (count >= 50) return '#dc2626';
  if (count >= 20) return '#ea580c';
  if (count >= 5) return '#2d8a2d';
  return '#1a7fe6';
}

export default function MapView({ hotspots, onMarkerClick, center = [20, 0], zoom = 2, className = 'h-[600px]' }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapRef.current);
    layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    hotspots.forEach(h => {
      const color = getAreaColor(h.observation_count);
      // Radius based on observation count (min 50km, max 300km)
      const radius = Math.min(300000, Math.max(50000, h.observation_count * 15000));

      const circle = L.circle([h.latitude, h.longitude], {
        radius,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillColor: color,
        fillOpacity: 0.25,
      }).addTo(layerGroupRef.current!);

      circle.bindPopup(`
        <div style="text-align:center;min-width:140px;padding:4px">
          ${h.thumbnail_url ? `<img src="/api/v1/images/proxy?url=${encodeURIComponent(h.thumbnail_url)}" style="width:100px;height:75px;object-fit:cover;border-radius:8px;margin:0 auto 8px" />` : ''}
          <div style="font-weight:700;font-size:14px;margin-bottom:2px">${h.animal_name}</div>
          <div style="font-size:12px;color:#666">${h.observation_count} observations</div>
          <a href="/animal/${h.animal_slug}" style="font-size:12px;color:#2d8a2d;text-decoration:none;font-weight:600">View Profile →</a>
        </div>
      `);

      if (onMarkerClick) circle.on('click', () => onMarkerClick(h));
    });
  }, [hotspots, onMarkerClick]);

  return <div ref={containerRef} className={`rounded-xl ${className}`} />;
}
