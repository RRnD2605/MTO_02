import { useState, useCallback, useRef, useEffect } from 'react';
import { searchCity } from '../../services/geocodingService.js';

const W3W_KEY = import.meta.env.VITE_W3W_API_KEY;

export default function AddSpotModal({ onAdd, onClose, existingIds = [], color = '#27500A' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [w3wQuery, setW3wQuery] = useState('');
  const [w3wResult, setW3wResult] = useState(null);
  const [w3wError, setW3wError] = useState('');
  const [w3wLoading, setW3wLoading] = useState(false);

  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');

  const [spotName, setSpotName] = useState('');
  const [pendingCoords, setPendingCoords] = useState(null);
  const [addError, setAddError] = useState('');

  const abortRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (abortRef.current) abortRef.current.abort();
    if (!q || q.length < 2) { setResults([]); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    setSearching(true);
    try {
      const res = await searchCity(q, controller.signal);
      setResults(res);
    } catch (e) {
      if (e.name !== 'AbortError') setResults([]);
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  function handleSelect(loc) {
    setPendingCoords({ lat: loc.lat, lon: loc.lon });
    setSpotName(loc.name);
    setResults([]);
    setQuery('');
    setW3wResult(null);
    setManualLat('');
    setManualLon('');
    setAddError('');
  }

  async function handleW3wSearch() {
    const words = w3wQuery.trim().replace(/^\/+/, '');
    if (!words) return;
    setW3wLoading(true);
    setW3wError('');
    setW3wResult(null);
    try {
      const res = await fetch(
        `https://api.what3words.com/v3/convert-to-coordinates?words=${encodeURIComponent(words)}&key=${W3W_KEY}`
      );
      const data = await res.json();
      if (data.coordinates) {
        const result = { lat: data.coordinates.lat, lon: data.coordinates.lng, nearestPlace: data.nearestPlace };
        setW3wResult(result);
        setPendingCoords({ lat: result.lat, lon: result.lon });
        if (!spotName) setSpotName(data.nearestPlace || '');
        setResults([]);
        setQuery('');
        setManualLat('');
        setManualLon('');
        setAddError('');
      } else {
        setW3wError(data.error?.message || 'Mots introuvables');
      }
    } catch {
      setW3wError('Erreur réseau');
    } finally {
      setW3wLoading(false);
    }
  }

  function handleAddSpot() {
    const lat = pendingCoords?.lat ?? (manualLat !== '' ? parseFloat(manualLat) : NaN);
    const lon = pendingCoords?.lon ?? (manualLon !== '' ? parseFloat(manualLon) : NaN);
    if (!spotName.trim()) { setAddError('Nom du spot requis'); return; }
    if (isNaN(lat) || isNaN(lon) || lat === null) { setAddError('Sélectionnez un lieu'); return; }
    const id = `spot-${spotName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
    onAdd({ id, name: spotName.trim(), lat, lon });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-medium text-[var(--color-text)]">Ajouter un spot</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          {/* Recherche par nom */}
          <input
            type="text"
            className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-base border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
            placeholder="Rechercher un lieu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {searching && (
            <p className="text-xs text-[var(--color-text-3)] text-center">Recherche...</p>
          )}

          {results.length > 0 && (
            <div className="flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)]">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  disabled={existingIds.includes(r.id)}
                  className="flex flex-col items-start px-3 py-2.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-left border-b last:border-b-0 border-[var(--color-border)] disabled:opacity-40"
                >
                  <span className="text-sm font-medium text-[var(--color-text)]">{r.name}</span>
                  <span className="text-xs text-[var(--color-text-3)]">{r.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* What3words */}
          {W3W_KEY && (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-xs text-[var(--color-text-3)]">ou</span>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E11F26] flex-shrink-0">///</span>
                  <input
                    type="text"
                    className="flex-1 bg-[var(--color-surface-2)] rounded-xl px-3 py-3 text-base border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
                    placeholder="table.chaise.lampe"
                    value={w3wQuery}
                    onChange={(e) => setW3wQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleW3wSearch()}
                  />
                  <button
                    onClick={handleW3wSearch}
                    disabled={w3wLoading || !w3wQuery.trim()}
                    className="px-3 py-3 bg-[#E11F26] text-white rounded-xl text-sm font-bold flex-shrink-0 disabled:opacity-50"
                  >
                    {w3wLoading ? '…' : '///'}
                  </button>
                </div>
                {w3wError && (
                  <p className="text-xs text-[var(--color-alert-text)] px-1">{w3wError}</p>
                )}
                {w3wResult && (
                  <div className="text-xs text-[var(--color-text-2)] px-1">
                    📍 {w3wResult.nearestPlace} · {w3wResult.lat.toFixed(4)}, {w3wResult.lon.toFixed(4)}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Coordonnées manuelles */}
          <details>
            <summary className="text-xs text-[var(--color-text-3)] cursor-pointer select-none list-none flex items-center gap-1">
              <span>▶</span>
              <span>Coordonnées manuelles</span>
            </summary>
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                placeholder="Latitude"
                value={manualLat}
                onChange={(e) => { setManualLat(e.target.value); setPendingCoords(null); setW3wResult(null); }}
                className="flex-1 bg-[var(--color-surface-2)] rounded-xl px-3 py-2.5 text-base border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={manualLon}
                onChange={(e) => { setManualLon(e.target.value); setPendingCoords(null); setW3wResult(null); }}
                className="flex-1 bg-[var(--color-surface-2)] rounded-xl px-3 py-2.5 text-base border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
              />
            </div>
          </details>

          {/* Nom du spot */}
          <input
            type="text"
            className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-base border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
            placeholder="Nom du spot (ex: Col de l'Espigoulier)"
            value={spotName}
            onChange={(e) => { setSpotName(e.target.value); setAddError(''); }}
          />

          {addError && (
            <p className="text-xs text-[var(--color-alert-text)]">{addError}</p>
          )}

          <button
            onClick={handleAddSpot}
            className="w-full py-3 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: color }}
          >
            Ajouter ce spot
          </button>
        </div>
      </div>
    </div>
  );
}
