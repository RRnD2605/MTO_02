import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCityWeather, fetchGolfWeather, fetchActivityWeather, invalidateCache } from '../services/weatherService.js';

export function useWeather(location, type = 'city') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const abortRef = useRef(null);

  const fetchFn = type === 'golf' ? fetchGolfWeather : type === 'activity' ? fetchActivityWeather : fetchCityWeather;

  // Use primitive dependencies so load() only recreates when the location actually changes,
  // not on every render due to a new object reference.
  const locationId = location?.id ?? null;
  const lat = location?.lat ?? null;
  const lon = location?.lon ?? null;

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!locationId || lat === null || lon === null) return;
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (forceRefresh) invalidateCache(lat, lon);

      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn(lat, lon, controller.signal);
        setData(result);
        setUpdatedAt(new Date());
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Network error');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [locationId, lat, lon, fetchFn] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    load();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, error, updatedAt, refresh };
}
