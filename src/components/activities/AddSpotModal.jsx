import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { searchOutdoorSpots } from '../../services/geocodingService.js';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function AddSpotModal({ onAdd, onClose, existingIds = [], color = '#27500A' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [spotName, setSpotName] = useState('');
  const [userPos, setUserPos] = useState(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [addError, setAddError] = useState('');

  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Init map once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current, { zoomControl: false }).setView([46.0, 2.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    map.on('click', (e) => handleMapClick(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Centre sur GPS dès qu'il arrive
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setUserPos({ lat, lon });
        mapRef.current?.setView([lat, lon], 12);
      },
      undefined,
      { timeout: 5000 }
    );
  }, []);

  // Déplace/crée le marqueur quand selected change
  useEffect(() => {
    if (!selected || !mapRef.current) return;
    const pos = [selected.lat, selected.lon];
    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    } else {
      markerRef.current = L.marker(pos, { icon: defaultIcon, draggable: true })
        .addTo(mapRef.current)
        .on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          handleMapClick(lat, lng);
        });
    }
    mapRef.current.setView(pos, 13);
  }, [selected]);

  // Recherche debounced
  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchOutdoorSpots(query, userPos?.lat, userPos?.lon);
        setResults(res);
      } catch { setResults([]); }
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, userPos]);

  async function handleMapClick(lat, lon) {
    try {
      const res = await fetch(
        `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&limit=1&lang=fr`
      );
      const data = await res.json();
      const f = data.features?.[0];
      const name = f?.properties?.name
        || f?.properties?.city
        || f?.properties?.county
        || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setSelected({ lat, lon, name, label: name });
      setSpotName((prev) => prev || name);
    } catch {
      const name = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setSelected({ lat, lon, name, label: name });
    }
    setAddError('');
  }

  function handleSelect(r) {
    setSelected(r);
    setSpotName(r.name);
    setResults([]);
    setQuery('');
    setManualLat('');
    setManualLon('');
    setAddError('');
  }

  function handleAddSpot() {
    const lat = selected?.lat ?? (manualLat !== '' ? parseFloat(manualLat) : NaN);
    const lon = selected?.lon ?? (manualLon !== '' ? parseFloat(manualLon) : NaN);
    if (!spotName.trim()) { setAddError('Nom du spot requis'); return; }
    if (isNaN(lat) || isNaN(lon)) { setAddError('Sélectionnez un lieu sur la carte'); return; }
    const id = `spot-${spotName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
    onAdd({ id, name: spotName.trim(), lat, lon });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <h2 className="font-medium text-[var(--color-text)]">Ajouter un spot</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          {/* Recherche */}
          <input
            type="text"
            className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-base border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
            placeholder="Col, sommet, refuge, lac..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setAddError(''); }}
            autoFocus
          />

          {searching && (
            <p className="text-xs text-[var(--color-text-3)] text-center">Recherche...</p>
          )}

          {results.length > 0 && (
            <div className="flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)] max-h-40 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(r)}
                  className="flex flex-col items-start px-3 py-2.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-left border-b last:border-b-0 border-[var(--color-border)]"
                >
                  <span className="text-sm font-medium text-[var(--color-text)]">{r.name}</span>
                  <span className="text-xs text-[var(--color-text-3)] truncate w-full">{r.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Carte Leaflet vanilla */}
          <div
            ref={mapDivRef}
            className="rounded-xl overflow-hidden border border-[var(--color-border)]"
            style={{ height: '200px', width: '100%' }}
          />
          <p className="text-[10px] text-[var(--color-text-3)] text-center -mt-2">
            Tape sur la carte ou déplace le marqueur pour affiner la position
          </p>

          {selected && (
            <p className="text-xs text-[var(--color-text-2)]">
              📍 {selected.lat.toFixed(4)}, {selected.lon.toFixed(4)}
            </p>
          )}

          {/* Nom du spot */}
          <input
            type="text"
            className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-base border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
            placeholder="Nom du spot (ex: Col de l'Espigoulier)"
            value={spotName}
            onChange={(e) => { setSpotName(e.target.value); setAddError(''); }}
          />

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
                step="any"
                value={manualLat}
                onChange={(e) => { setManualLat(e.target.value); setSelected(null); }}
                className="flex-1 bg-[var(--color-surface-2)] rounded-xl px-3 py-2.5 text-base border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
              />
              <input
                type="number"
                placeholder="Longitude"
                step="any"
                value={manualLon}
                onChange={(e) => { setManualLon(e.target.value); setSelected(null); }}
                className="flex-1 bg-[var(--color-surface-2)] rounded-xl px-3 py-2.5 text-base border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:outline-none"
              />
            </div>
          </details>

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
