import { useState, useCallback, useRef } from 'react';

async function reverseGeocode(lat, lon, signal) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'fr' }, signal }
    );
    const json = await res.json();
    return (
      json.address?.village ||
      json.address?.town ||
      json.address?.city ||
      json.address?.municipality ||
      'Local'
    );
  } catch (e) {
    if (e.name === 'AbortError') return null;
    return 'Local';
  }
}

export function useGeolocate() {
  const [gpsLabel, setGpsLabel] = useState('Local');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const geolocateControllerRef = useRef(null);

  const geolocate = useCallback(async () => {
    geolocateControllerRef.current?.abort();
    const controller = new AbortController();
    geolocateControllerRef.current = controller;

    setGpsActive(true);
    setGpsLabel('Localisation...');
    if (!navigator.geolocation) {
      setGpsLabel('GPS indisponible');
      return;
    }
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 30000,
        })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      setGpsCoords({ lat, lon });
      const name = await reverseGeocode(lat, lon, controller.signal);
      if (name !== null) setGpsLabel(name);
    } catch {
      setGpsLabel('Position indisponible');
      setGpsActive(false);
    }
  }, []);

  // Silent background geoloc — does not set gpsActive until coords arrive.
  // Safe to call from useEffect: never blocks render, no immediate state change.
  const autoGeolocate = useCallback(() => {
    if (!navigator.geolocation) return () => {};
    const controller = new AbortController();
    const timer = setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          setGpsCoords({ lat, lon });
          setGpsActive(true);
          const name = await reverseGeocode(lat, lon, controller.signal);
          if (name !== null) setGpsLabel(name);
        },
        () => { /* permission denied or error — stay silent */ },
        { timeout: 8000, maximumAge: 60000 }
      );
    }, 1500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  const gpsLocation = gpsCoords
    ? {
        id: 'gps-current-location',
        name: gpsLabel,
        lat: gpsCoords.lat,
        lon: gpsCoords.lon,
      }
    : null;

  return { gpsLabel, gpsCoords, gpsActive, setGpsActive, geolocate, autoGeolocate, gpsLocation };
}
