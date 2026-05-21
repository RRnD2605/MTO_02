import { useState } from 'react';

export function useSpots(storageKey) {
  const [spots, setSpotsState] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const persist = (next) => {
    setSpotsState(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };

  return {
    spots,
    setSpots: persist,
    addSpot: (s) => persist([...spots, s]),
    removeSpot: (id) => persist(spots.filter((s) => s.id !== id)),
  };
}
