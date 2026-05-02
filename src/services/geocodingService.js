const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export async function searchLocation(query, signal) {
  if (!query || query.length < 2) return [];
  const params = new URLSearchParams({
    name: query,
    count: 10,
    language: 'fr',
    format: 'json',
  });
  const res = await fetch(`${GEOCODING_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: `geo-${r.id}`,
    name: r.name,
    label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
    country: r.country_code,
  }));
}
