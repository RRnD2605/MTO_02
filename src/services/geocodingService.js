const OPEN_METEO_GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function searchCity(query, signal) {
  if (!query || query.length < 2) return [];
  const params = new URLSearchParams({
    name: query,
    count: 10,
    language: 'fr',
    format: 'json',
  });
  const res = await fetch(`${OPEN_METEO_GEOCODING}?${params}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: `geo-${r.id}`,
    name: r.name,
    label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
  }));
}

export async function searchGolfCourse(query, signal) {
  if (!query || query.length < 2) return [];
  const params = new URLSearchParams({
    q: `golf ${query}`,
    format: 'json',
    limit: 10,
    addressdetails: 1,
    'accept-language': 'fr,en',
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    signal,
    headers: {
      'User-Agent': 'MeteoGolf/2.0 (golf weather app)',
      'Accept-Language': 'fr,en',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const results = await res.json();

  return results
    .filter((r) => {
      const name = (r.name || r.display_name || '').toLowerCase();
      return (
        name.includes('golf') ||
        r.class === 'leisure' ||
        r.type === 'golf_course'
      );
    })
    .map((r) => ({
      id: `nom-${r.place_id}`,
      name: r.name || r.display_name.split(',')[0],
      label: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    }));
}

// Legacy export for backwards compatibility
export async function searchLocation(query, signal) {
  return searchCity(query, signal);
}

// Photon (Komoot) — recherche générale de lieux
export async function searchPlaces(query, signal) {
  if (!query || query.length < 2) return [];
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=fr`,
    signal ? { signal } : undefined
  );
  const data = await res.json();
  return data.features.map((f) => ({
    name: f.properties.name || f.properties.city || query,
    label: [
      f.properties.name,
      f.properties.city || f.properties.county,
      f.properties.state,
      f.properties.country,
    ].filter(Boolean).join(', '),
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    type: f.properties.osm_value || f.properties.type || 'place',
  }));
}

// Photon + Overpass — recherche spots outdoor précis
const OUTDOOR_TYPES = ['peak', 'saddle', 'alpine_hut', 'water', 'waterfall', 'viewpoint', 'trail', 'path', 'forest', 'nature_reserve'];
const KEYWORD_MAP = {
  col: 'natural=saddle',
  sommet: 'natural=peak',
  pic: 'natural=peak',
  mont: 'natural=peak',
  refuge: 'tourism=alpine_hut',
  lac: 'natural=water',
  cascade: 'waterway=waterfall',
  belvédère: 'tourism=viewpoint',
  viewpoint: 'tourism=viewpoint',
};

export async function searchOutdoorSpots(query, userLat, userLon) {
  if (!query || query.length < 2) return [];

  const photonResults = await searchPlaces(query);
  const outdoorResults = photonResults.filter((r) =>
    OUTDOOR_TYPES.some((t) => r.type?.toLowerCase().includes(t))
  );

  if (outdoorResults.length < 3 && userLat && userLon) {
    try {
      const tag = Object.entries(KEYWORD_MAP).find(([k]) =>
        query.toLowerCase().includes(k)
      )?.[1];

      if (tag) {
        const [tagKey, tagValue] = tag.split('=');
        const overpassQuery = `[out:json][timeout:10];node["${tagKey}"="${tagValue}"](around:50000,${userLat},${userLon});out body 10;`;
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(overpassQuery)}`,
        });
        const data = await res.json();
        const overpassResults = data.elements
          .filter((el) => el.tags?.name?.toLowerCase().includes(query.toLowerCase()))
          .map((el) => ({
            name: el.tags.name,
            label: [el.tags.name, el.tags['name:fr'] || tagValue, el.tags.ele ? el.tags.ele + 'm' : ''].filter(Boolean).join(' · '),
            lat: el.lat,
            lon: el.lon,
            type: tagValue,
          }));

        return [...outdoorResults, ...overpassResults]
          .filter((r, i, arr) => arr.findIndex((x) => x.name === r.name) === i)
          .slice(0, 8);
      }
    } catch (err) {
      console.warn('Overpass error:', err);
    }
  }

  return photonResults.slice(0, 8);
}
