'use client';

import { useEffect, useRef } from 'react';
import type { GeoPoint } from '@/types';

// Leaflet must be imported client-side only (no SSR) — use dynamic import or 'use client'
// wrapper. This component is always a Client Component.

interface Props {
  center: GeoPoint;
  zoom?: number;
  marker?: GeoPoint;
  onLocationSelect?: (point: GeoPoint) => void;
  className?: string;
}

export default function ReportMap({ center, zoom = 15, marker, onLocationSelect, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import keeps Leaflet out of the SSR bundle
    import('leaflet').then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!).setView([center.lat, center.lng], zoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      if (marker) {
        L.marker([marker.lat, marker.lng]).addTo(map);
      }

      if (onLocationSelect) {
        map.on('click', (e) => {
          onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Leaflet CSS — loaded once globally in layout is preferred, but this works too */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={containerRef}
        className={className ?? 'w-full h-64 rounded-xl overflow-hidden'}
      />
    </>
  );
}
