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

/* Conservation-status colour palette */
const STATUS_COLORS: Record<string, string> = {
  CR: '#991b1b', // dark red – Critically Endangered
  EN: '#dc2626', // red – Endangered
  VU: '#ea580c', // orange – Vulnerable
  NT: '#ca8a04', // amber – Near Threatened
  LC: '#16a34a', // green – Least Concern
  DD: '#6b7280', // grey – Data Deficient
  NE: '#9ca3af', // light grey – Not Evaluated
  EW: '#7e22ce', // purple – Extinct in Wild
  EX: '#1f2937', // near-black – Extinct
};

const STATUS_LABELS: Record<string, string> = {
  CR: 'Critically Endangered',
  EN: 'Endangered',
  VU: 'Vulnerable',
  NT: 'Near Threatened',
  LC: 'Least Concern',
  DD: 'Data Deficient',
  NE: 'Not Evaluated',
  EW: 'Extinct in Wild',
  EX: 'Extinct',
};

function getStatusColor(code?: string): string {
  return code ? (STATUS_COLORS[code] || '#6b7280') : '#6b7280';
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
      const code = h.conservation_status_code;
      const color = getStatusColor(code);
      const label = code ? (STATUS_LABELS[code] || code) : 'Unknown';

      const circle = L.circleMarker([h.latitude, h.longitude], {
        radius: 7,
        color: color,
        weight: 2,
        opacity: 0.9,
        fillColor: color,
        fillOpacity: 0.5,
      }).addTo(layerGroupRef.current!);

      circle.bindPopup(`
        <div style="text-align:center;min-width:150px;padding:4px">
          ${h.thumbnail_url ? `<img src="/api/v1/images/proxy?url=${encodeURIComponent(h.thumbnail_url)}" style="width:100px;height:75px;object-fit:cover;border-radius:8px;margin:0 auto 8px" />` : ''}
          <div style="font-weight:700;font-size:14px;margin-bottom:2px">${h.animal_name}</div>
          <div style="display:inline-block;background:${color};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;margin-bottom:4px">${label}</div>
          <div><a href="/animal/${h.animal_slug}" style="font-size:12px;color:#2d8a2d;text-decoration:none;font-weight:600">View Profile →</a></div>
        </div>
      `);

      if (onMarkerClick) circle.on('click', () => onMarkerClick(h));
    });
  }, [hotspots, onMarkerClick]);

  return <div ref={containerRef} className={`rounded-xl ${className}`} />;
}
