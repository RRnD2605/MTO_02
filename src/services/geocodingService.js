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
