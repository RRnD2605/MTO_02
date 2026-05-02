import { useState, useCallback } from 'react';

const LS_KEYS = {
  cities: 'meteo_golf_cities_v3',
  golfs: 'meteo_golf_golfs_v3',
};

const DEFAULT_CITIES = [
  { id: 'marseille',    name: 'Marseille',    lat: 43.2965, lon:  5.3698 },
  { id: 'leognan',      name: 'Léognan',      lat: 44.7333, lon: -0.5833 },
  { id: 'bourg-madame', name: 'Bourg-Madame', lat: 42.432,  lon:  1.932  },
  { id: 'saleilles',   name: 'Saleilles',    lat: 42.648,  lon:  2.924  },
];

const DEFAULT_GOLFS = [
  { id: 'cabre-dor', name: "Cabre d'Or",  label: "La Cabre d'Or — Cabriès",  lat: 43.453, lon: 5.350 },
  { id: 'fontanals', name: 'Fontanals',   label: 'Fontanals de Cerdanya',    lat: 42.28,  lon: 2.18  },
];

const load = (key, defaults) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaults;
  } catch {
    return defaults;
  }
};

const save = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export function useLocations() {
  const [cities, setCitiesState] = useState(() => load(LS_KEYS.cities, DEFAULT_CITIES));
  const [golfs, setGolfsState] = useState(() => load(LS_KEYS.golfs, DEFAULT_GOLFS));

  const setCities = useCallback((updater) => {
    setCitiesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(LS_KEYS.cities, next);
      return next;
    });
  }, []);

  const setGolfs = useCallback((updater) => {
    setGolfsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(LS_KEYS.golfs, next);
      return next;
    });
  }, []);

  const addCity = useCallback(
    (city) => {
      setCities((prev) => {
        if (prev.some((c) => c.id === city.id)) return prev;
        return [...prev, city];
      });
    },
    [setCities]
  );

  const removeCity = useCallback(
    (id) => {
      setCities((prev) => {
        if (prev.length <= 1) return prev;
        return prev.filter((c) => c.id !== id);
      });
    },
    [setCities]
  );

  const addGolf = useCallback(
    (golf) => {
      setGolfs((prev) => {
        if (prev.some((g) => g.id === golf.id)) return prev;
        return [...prev, golf];
      });
    },
    [setGolfs]
  );

  const removeGolf = useCallback(
    (id) => {
      setGolfs((prev) => {
        if (prev.length <= 1) return prev;
        return prev.filter((g) => g.id !== id);
      });
    },
    [setGolfs]
  );

  return { cities, golfs, addCity, removeCity, addGolf, removeGolf };
}
