import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { searchOutdoorSpots } from '../../services/geocodingService.js';

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTR = '© OpenStreetMap';
const IGN_URL =
  'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0' +
  '&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png' +
  '&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';
const IGN_ATTR = '© IGN Géoplateforme';

const SPOT_ICON = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function addOrMoveMarker(map, markerRef, pos, onDragEnd) {
  if (markerRef.current) {
    markerRef.current.setLatLng(pos);
  } else {
    markerRef.current = L.marker(pos, { icon: SPOT_ICON, draggable: !!onDragEnd })
      .addTo(map);
    if (onDragEnd) {
      markerRef.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        onDragEnd(lat, lng);
      });
    }
  }
}

function setTileLayer(map, tileRef, layer) {
  if (tileRef.current) map.removeLayer(tileRef.current);
  const url = layer === 'ign' ? IGN_URL : OSM_URL;
  const attr = layer === 'ign' ? IGN_ATTR : OSM_ATTR;
  const maxZoom = layer === 'ign' ? 18 : 19;
  tileRef.current = L.tileLayer(url, { attribution: attr, maxZoom }).addTo(map);
}

function isInFrance(lat, lon) {
  return lat >= 41.3 && lat <= 51.1 && lon >= -5.2 && lon <= 9.7;
}

export default function AddSpotModal({ onAdd, onClose, existingIds = [], color = '#27500A' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [spotName, setSpotName] = useState('');
  const [userPos, setUserPos] = useState(null);
  const [addError, setAddError] = useState('');
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [mapLayer, setMapLayer] = useState('osm');

  // Compact map (display-only, no click interaction)
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const tileRef = useRef(null);

  // Fullscreen map (interactive)
  const fsDivRef = useRef(null);
  const fsMapRef = useRef(null);
  const fsMarkerRef = useRef(null);
  const fsTileRef = useRef(null);

  const handleMapClick = useCallback(async (lat, lon) => {
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
  }, []);

  // Init compact map (display-only, interactions disabled)
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current, {
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
    }).setView([46.0, 2.5], 6);
    setTileLayer(map, tileRef, 'osm');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      tileRef.current = null;
    };
  }, []);

  // Init fullscreen map (fully interactive)
  useEffect(() => {
    if (!mapFullscreen || !fsDivRef.current || fsMapRef.current) return;
    const center = selected
      ? [selected.lat, selected.lon]
      : userPos ? [userPos.lat, userPos.lon] : [46.0, 2.5];
    const zoom = selected ? 13 : userPos ? 12 : 6;
    const map = L.map(fsDivRef.current, { zoomControl: true }).setView(center, zoom);
    setTileLayer(map, fsTileRef, mapLayer);
    map.on('click', (e) => handleMapClick(e.latlng.lat, e.latlng.lng));
    if (selected) {
      addOrMoveMarker(map, fsMarkerRef, [selected.lat, selected.lon], handleMapClick);
    }
    fsMapRef.current = map;
    return () => {
      map.remove();
      fsMapRef.current = null;
      fsMarkerRef.current = null;
      fsTileRef.current = null;
    };
  }, [mapFullscreen]); // eslint-disable-line react-hooks/exhaustive-deps

  // GPS centering on open + IGN default if in France
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

  useEffect(() => {
    if (userPos && isInFrance(userPos.lat, userPos.lon)) {
      setMapLayer('ign');
    }
  }, [userPos]);

  // Sync tile layer on toggle (both maps)
  useEffect(() => {
    if (mapRef.current) setTileLayer(mapRef.current, tileRef, mapLayer);
    if (fsMapRef.current) setTileLayer(fsMapRef.current, fsTileRef, mapLayer);
  }, [mapLayer]);

  // Sync marker when selected changes (both maps)
  useEffect(() => {
    if (!selected) return;
    const pos = [selected.lat, selected.lon];
    if (mapRef.current) {
      addOrMoveMarker(mapRef.current, markerRef, pos, null);
      mapRef.current.setView(pos, 13);
    }
    if (fsMapRef.current) {
      addOrMoveMarker(fsMapRef.current, fsMarkerRef, pos, handleMapClick);
      fsMapRef.current.setView(pos, 13);
    }
  }, [selected, handleMapClick]);

  // Debounced search
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
    setResults([]);
    setQuery('');
    setAddError('');
  }

  function handleAddSpot() {
    if (!spotName.trim()) { setAddError('Nom du spot requis'); return; }
    if (!selected) { setAddError('Sélectionnez un lieu sur la carte'); return; }
    const id = `spot-${spotName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
    onAdd({ id, name: spotName.trim(), lat: selected.lat, lon: selected.lon });
    onClose();
  }

  function LayerToggle() {
    return (
      <div
        className="absolute top-2 right-2 z-[1001] flex rounded-lg overflow-hidden shadow-md border border-[var(--color-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {['osm', 'ign'].map((l) => (
          <button
            key={l}
            onClick={() => setMapLayer(l)}
            className={`px-2.5 py-1.5 text-[11px] font-medium uppercase transition-colors ${
              mapLayer === l
                ? 'bg-[var(--color-text)] text-[var(--color-surface)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-2)]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── Main modal ── */}
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
            />
            {searching && (
              <p className="text-xs text-[var(--color-text-3)] text-center">Recherche...</p>
            )}
            {results.length > 0 && (
              <div className="flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)] max-h-36 overflow-y-auto">
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

            {/* Carte compacte (display-only) */}
            <div
              className="relative rounded-xl overflow-hidden border border-[var(--color-border)] cursor-pointer"
              style={{ height: '260px' }}
              onClick={() => setMapFullscreen(true)}
            >
              <div ref={mapDivRef} style={{ height: '100%', width: '100%', pointerEvents: 'none' }} />
              <LayerToggle />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none whitespace-nowrap">
                Tap pour agrandir
              </div>
            </div>

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

            {addError && <p className="text-xs text-[var(--color-alert-text)]">{addError}</p>}

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

      {/* ── Fullscreen map ── */}
      {mapFullscreen && (
        <div className="fixed inset-0 z-[60] bg-[var(--color-bg)] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0 bg-[var(--color-surface)]">
            <span className="text-sm font-medium text-[var(--color-text)]">Sélectionner un spot</span>
            <button
              onClick={() => setMapFullscreen(false)}
              className="text-sm font-medium text-[var(--color-text-2)] px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)]"
            >
              ✕ Fermer
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <div ref={fsDivRef} style={{ height: '100%', width: '100%' }} />
            <LayerToggle />
          </div>

          <div className="px-4 py-3 border-t border-[var(--color-border)] flex-shrink-0 bg-[var(--color-surface)]">
            {selected ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] text-[var(--color-text-3)] mb-0.5">Spot sélectionné</div>
                  <div className="text-sm font-medium text-[var(--color-text)] truncate">{spotName || selected.name}</div>
                </div>
                <button
                  onClick={() => setMapFullscreen(false)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  Confirmer
                </button>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-3)] text-center py-1">
                Tape sur la carte pour sélectionner un spot
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
