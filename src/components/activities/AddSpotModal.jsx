import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { searchOutdoorSpots } from '../../services/geocodingService.js';

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.setView(target, 13, { animate: true });
  }, [target, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export default function AddSpotModal({ onAdd, onClose, existingIds = [], color = '#27500A' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selected, setSelected] = useState(null);
  const [spotName, setSpotName] = useState('');

  const [userPos, setUserPos] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);

  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [addError, setAddError] = useState('');

  // Centre la carte sur la position GPS dès l'ouverture
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setUserPos({ lat, lon });
        setMapTarget([lat, lon]);
      },
      undefined,
      { timeout: 5000 }
    );
  }, []);

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

  function handleSelect(r) {
    setSelected(r);
    setSpotName(r.name);
    setMarkerPos([r.lat, r.lon]);
    setMapTarget([r.lat, r.lon]);
    setResults([]);
    setQuery('');
    setManualLat('');
    setManualLon('');
    setAddError('');
  }

  async function handleMapClick(lat, lon) {
    setMarkerPos([lat, lon]);
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

  function handleAddSpot() {
    const lat = selected?.lat ?? (manualLat !== '' ? parseFloat(manualLat) : NaN);
    const lon = selected?.lon ?? (manualLon !== '' ? parseFloat(manualLon) : NaN);
    if (!spotName.trim()) { setAddError('Nom du spot requis'); return; }
    if (isNaN(lat) || isNaN(lon)) { setAddError('Sélectionnez un lieu sur la carte'); return; }
    const id = `spot-${spotName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
    onAdd({ id, name: spotName.trim(), lat, lon });
    onClose();
  }

  const mapCenter = userPos ? [userPos.lat, userPos.lon] : [46.0, 2.5];
  const mapZoom = userPos ? 12 : 6;

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
            onChange={(e) => { setQuery(e.target.value); setSelected(null); setAddError(''); }}
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

          {/* Carte Leaflet */}
          <div className="rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ height: 200 }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"
              />
              <MapController target={mapTarget} />
              <MapClickHandler onMapClick={handleMapClick} />
              {markerPos && (
                <Marker
                  position={markerPos}
                  draggable
                  eventHandlers={{
                    dragend(e) {
                      const { lat, lng } = e.target.getLatLng();
                      handleMapClick(lat, lng);
                    },
                  }}
                />
              )}
            </MapContainer>
          </div>
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
