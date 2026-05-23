import { useState, useCallback } from 'react';

const MAX_TRACES = 7;

export function useTraces(activity) {
  const LS_KEY = `mto_${activity}_traces_v1`;

  const [traces, setTraces] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const saveTrace = useCallback((traceData) => {
    setTraces((prev) => {
      const updated = [
        { ...traceData, id: `trace_${Date.now()}`, createdAt: Date.now() },
        ...prev,
      ].slice(0, MAX_TRACES);
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [LS_KEY]);

  const renameTrace = useCallback((id, newName) => {
    setTraces((prev) => {
      const updated = prev.map((t) => t.id === id ? { ...t, name: newName } : t);
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [LS_KEY]);

  const deleteTrace = useCallback((id) => {
    setTraces((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [LS_KEY]);

  return { traces, saveTrace, renameTrace, deleteTrace };
}
