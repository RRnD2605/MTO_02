import { useState, useCallback, useRef, useEffect } from 'react';
import { searchLocation } from '../../services/geocodingService.js';

export default function AddLocationModal({ type, onAdd, onClose, t, existingIds }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ name: '', lat: '', lon: '' });
  const [manualError, setManualError] = useState('');
  const abortRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (abortRef.current) abortRef.current.abort();
    if (!q || q.length < 2) { setResults([]); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    setSearching(true);
    try {
      const res = await searchLocation(q, controller.signal);
      setResults(res);
    } catch (e) {
      if (e.name !== 'AbortError') setResults([]);
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const handleSelect = (loc) => {
    if (existingIds.includes(loc.id)) return;
    onAdd({ ...loc, label: loc.label || loc.name });
    onClose();
  };

  const handleManualAdd = () => {
    const lat = parseFloat(manual.lat);
    const lon = parseFloat(manual.lon);
    if (!manual.name.trim()) { setManualError('Nom requis'); return; }
    if (isNaN(lat) || lat < -90 || lat > 90) { setManualError('Latitude invalide'); return; }
    if (isNaN(lon) || lon < -180 || lon > 180) { setManualError('Longitude invalide'); return; }
    const id = `manual-${manual.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    if (existingIds.includes(id)) { setManualError('Lieu déjà ajouté'); return; }
    onAdd({ id, name: manual.name.trim(), label: manual.name.trim(), lat, lon });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-medium text-[var(--color-text)]">
            {type === 'golf' ? t('add.golf') : t('add.city')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-city)]"
            autoFocus
          />

          {searching && (
            <p className="text-sm text-[var(--color-text-3)] text-center">{t('search.searching')}</p>
          )}

          {results.length > 0 && (
            <div className="flex flex-col">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  disabled={existingIds.includes(r.id)}
                  className="flex flex-col items-start px-3 py-2.5 rounded-lg hover:bg-[var(--color-surface-2)] text-left transition-colors disabled:opacity-40"
                >
                  <span className="text-sm font-medium text-[var(--color-text)]">{r.name}</span>
                  <span className="text-xs text-[var(--color-text-3)]">{r.label}</span>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !searching && results.length === 0 && (
            <p className="text-sm text-[var(--color-text-3)] text-center">{t('search.no.results')}</p>
          )}

          <button
            onClick={() => setShowManual(!showManual)}
            className="text-sm text-[var(--color-text-2)] text-left flex items-center gap-1"
          >
            <span>{showManual ? '▾' : '▸'}</span>
            <span>{t('search.manual')}</span>
          </button>

          {showManual && (
            <div className="flex flex-col gap-2">
              {manualError && (
                <p className="text-xs text-[var(--color-alert-text)]">{manualError}</p>
              )}
              <input
                type="text"
                placeholder={t('search.name')}
                value={manual.name}
                onChange={(e) => setManual({ ...manual, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t('search.lat')}
                  value={manual.lat}
                  onChange={(e) => setManual({ ...manual, lat: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder={t('search.lon')}
                  value={manual.lon}
                  onChange={(e) => setManual({ ...manual, lon: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
                />
              </div>
              <button
                onClick={handleManualAdd}
                className="px-4 py-2 rounded-xl bg-[var(--color-golf)] text-white text-sm font-medium"
              >
                {t('search.add')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
