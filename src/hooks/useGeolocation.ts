'use client';

import { useState, useCallback } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null, lng: null, error: null, loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolokasi tidak didukung oleh perangkat ini.' }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => setState({
        lat:     pos.coords.latitude,
        lng:     pos.coords.longitude,
        error:   null,
        loading: false,
      }),
      (err) => setState({
        lat: null, lng: null,
        error:   `Gagal mendapatkan lokasi: ${err.message}`,
        loading: false,
      }),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  return { ...state, getLocation };
}
