const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

function getWeatherEndpoint(lat, lon) {
  const inAromeZone = lat >= 36 && lat <= 55 && lon >= -10 && lon <= 16;
  return inAromeZone
    ? 'https://api.open-meteo.com/v1/meteofrance'
    : 'https://api.open-meteo.com/v1/forecast';
}

export function getModelName(lat, lon) {
  const inAromeZone = lat >= 36 && lat <= 55 && lon >= -10 && lon <= 16;
  return inAromeZone ? 'model.arome' : 'model.ecmwf';
}

function buildCacheKey(lat, lon, type) {
  return `${lat},${lon},${type}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(lat, lon) {
  const cityKey = buildCacheKey(lat, lon, 'city');
  const golfKey = buildCacheKey(lat, lon, 'golf');
  cache.delete(cityKey);
  cache.delete(golfKey);
}

export async function fetchCityWeather(lat, lon, signal) {
  const cacheKey = buildCacheKey(lat, lon, 'city');
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const base = getWeatherEndpoint(lat, lon);
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: [
      'weathercode',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'windspeed_10m_max',
      'winddirection_10m_dominant',
      'uv_index_max',
    ].join(','),
    hourly: [
      'temperature_2m',
      'weathercode',
      'windspeed_10m',
      'winddirection_10m',
      'precipitation_probability',
    ].join(','),
    current_weather: true,
    forecast_days: 5,
    timezone: 'auto',
  });

  const res = await fetch(`${base}?${params}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}

export async function fetchGolfWeather(lat, lon, signal) {
  const cacheKey = buildCacheKey(lat, lon, 'golf');
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const base = getWeatherEndpoint(lat, lon);
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: [
      'weathercode',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'windspeed_10m_max',
      'winddirection_10m_dominant',
      'uv_index_max',
      'sunrise',
      'sunset',
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'windspeed_10m',
      'winddirection_10m',
      'windgusts_10m',
      'precipitation_probability',
      'relativehumidity_2m',
      'uv_index',
    ].join(','),
    current_weather: true,
    forecast_days: 4,
    timezone: 'auto',
  });

  const res = await fetch(`${base}?${params}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}
