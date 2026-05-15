import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCityWeather, fetchGolfWeather, fetchActivityWeather, invalidateCache } from '../services/weatherService.js';

export function useWeather(location, type = 'city') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const abortRef = useRef(null);

  const fetchFn = type === 'golf' ? fetchGolfWeather : type === 'activity' ? fetchActivityWeather : fetchCityWeather;

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!location) return;
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (forceRefresh) invalidateCache(location.lat, location.lon);

      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn(location.lat, location.lon, controller.signal);
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
    [location, fetchFn]
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
