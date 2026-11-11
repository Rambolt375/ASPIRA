'use client';

import { useEffect, useRef } from 'react';

interface Props {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function LocationPickerMap({ lat, lng, onLocationChange, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<import('leaflet').Map | null>(null);
  const markerRef    = useRef<import('leaflet').Marker | null>(null);

  // Initialise map once on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return;

      // Fix default icon paths broken by webpack bundling
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, { zoomControl: true }).setView([lat, lng], 16);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Draggable marker
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.bindPopup('📍 Geser pin atau klik peta untuk pindah titik').openPopup();
      markerRef.current = marker;

      marker.on('dragend', () => {
        const { lat: newLat, lng: newLng } = marker.getLatLng();
        onLocationChange(newLat, newLng);
      });

      // Click anywhere on map → move pin
      map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onLocationChange(e.latlng.lat, e.latlng.lng);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current  = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep marker & view in sync when lat/lng props change externally
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const latlng: [number, number] = [lat, lng];
    markerRef.current.setLatLng(latlng);
    mapRef.current.setView(latlng, mapRef.current.getZoom(), { animate: true });
  }, [lat, lng]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={containerRef}
        className={className ?? 'w-full h-72 rounded-2xl overflow-hidden border border-emerald-300 shadow-sm'}
      />
    </>
  );
}

