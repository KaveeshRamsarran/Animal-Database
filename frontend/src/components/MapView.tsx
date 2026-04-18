import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { HotspotOut } from '../types';

interface Props {
  hotspots: HotspotOut[];
  onMarkerClick?: (h: HotspotOut) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function MapView({ hotspots, onMarkerClick, center = [20, 0], zoom = 2, className = 'h-[600px]' }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapRef.current);
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    // Clear existing markers
    mapRef.current.eachLayer(l => { if (l instanceof L.Marker) mapRef.current!.removeLayer(l); });

    hotspots.forEach(h => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:#2d8a2d;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${h.observation_count > 99 ? '99+' : h.observation_count}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const marker = L.marker([h.latitude, h.longitude], { icon }).addTo(mapRef.current!);
      marker.bindPopup(`
        <div style="text-align:center;min-width:120px">
          ${h.thumbnail_url ? `<img src="${h.thumbnail_url}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin:0 auto 8px" />` : ''}
          <div style="font-weight:600">${h.animal_name}</div>
          <div style="font-size:12px;color:#666">${h.observation_count} observations</div>
        </div>
      `);
      if (onMarkerClick) marker.on('click', () => onMarkerClick(h));
    });
  }, [hotspots, onMarkerClick]);

  return <div ref={containerRef} className={`rounded-lg ${className}`} />;
}
