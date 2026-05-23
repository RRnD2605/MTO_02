import { useState, useCallback } from 'react';

export function useGeolocate() {
  const [gpsLabel, setGpsLabel] = useState('Local');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);

  const geolocate = useCallback(async () => {
    setGpsActive(true);
    setGpsLabel('Localisation...');
    if (!navigator.geolocation) {
      setGpsLabel('GPS indisponible');
      return;
    }
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      setGpsCoords({ lat, lon });
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        const json = await res.json();
        const name =
          json.address?.village ||
          json.address?.town ||
          json.address?.city ||
          json.address?.municipality ||
          'Local';
        setGpsLabel(name);
      } catch {
        setGpsLabel('Local');
      }
    } catch {
      setGpsLabel('Position indisponible');
      setGpsActive(false);
    }
  }, []);

  const gpsLocation = gpsCoords
    ? {
        id: `gps-${gpsCoords.lat.toFixed(4)}-${gpsCoords.lon.toFixed(4)}`,
        name: gpsLabel,
        lat: gpsCoords.lat,
        lon: gpsCoords.lon,
      }
    : null;

  return { gpsLabel, gpsCoords, gpsActive, setGpsActive, geolocate, gpsLocation };
}
