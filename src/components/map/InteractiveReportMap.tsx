'use client';

import { useEffect, useRef } from 'react';
import type { Report } from '@/types';

interface Props {
  reports: Report[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

export default function InteractiveReportMap({
  reports,
  center = { lat: -6.5971, lng: 106.806 },
  zoom = 13,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<import('leaflet').LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !containerRef.current) return;

      if (!mapRef.current) {
        // Fix standard marker icon broken URL issue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const map = L.map(containerRef.current).setView([center.lat, center.lng], zoom);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors | ASPIRA Kota Bogor',
          maxZoom: 19,
        }).addTo(map);

        markersRef.current = L.layerGroup().addTo(map);
      }

      // Update markers
      if (markersRef.current) {
        markersRef.current.clearLayers();

        reports.forEach((report) => {
          if (!report.location?.lat || !report.location?.lng) return;

          const isResolved = report.status === 'DIATASI' || report.status === 'PERAWATAN';
          const isCritical = report.severity === 'KRITIS' || report.severity === 'TINGGI';

          // Custom HTML marker badge
          const colorClass = isResolved
            ? '#059669' // emerald
            : isCritical
            ? '#dc2626' // red
            : '#d97706'; // amber

          const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="background-color: ${colorClass}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">
              ${report.category === 'JALAN' ? '🛣️' : report.category === 'LAMPU_JALAN' ? '💡' : report.category === 'DRAINASE' ? '🌊' : '📋'}
            </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14],
          });

          const popupContent = `
            <div style="font-family: inherit; max-width: 240px; padding: 4px;">
              <span style="font-size: 10px; font-weight: bold; background: #e2e8f0; color: #334155; padding: 2px 6px; border-radius: 4px;">
                ${report.ticketNumber}
              </span>
              <h4 style="font-size: 13px; font-weight: bold; margin: 6px 0 2px 0; color: #0f172a; line-height: 1.3;">
                ${report.title}
              </h4>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
                📍 ${report.address || 'Kota Bogor'}
              </p>
              <div style="font-size: 11px; font-weight: bold; color: ${colorClass}; margin-bottom: 8px;">
                Status: ${report.status}
              </div>
              <a href="/laporan/${report.id}" style="display: block; text-align: center; background: #059669; color: white; padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: bold; text-decoration: none;">
                Lihat Rincian Laporan →
              </a>
            </div>
          `;

          L.marker([report.location.lat, report.location.lng], { icon: customIcon })
            .bindPopup(popupContent)
            .addTo(markersRef.current!);
        });
      }
    });

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [reports, center.lat, center.lng, zoom]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={containerRef}
        className={`relative z-0 isolate ${className ?? 'w-full h-[600px] rounded-3xl overflow-hidden shadow-sm border border-slate-200'}`}
      />
    </>
  );
}

