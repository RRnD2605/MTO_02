const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

// /v1/forecast = endpoint "best match" ECMWF — fournit precipitation_probability
// et uv_index que /v1/meteofrance (AROME) ne fournit pas.
// Pour la France, /v1/forecast incorpore quand même les données AROME pour
// température et vent via le blending multi-modèles d'Open-Meteo.
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export function getModelName() {
  return 'model.ecmwf';
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
  cache.delete(buildCacheKey(lat, lon, 'city'));
  cache.delete(buildCacheKey(lat, lon, 'golf'));
  cache.delete(buildCacheKey(lat, lon, 'activity'));
}

// Virgules littérales dans l'URL — Open-Meteo n'accepte pas %2C
function buildUrl(lat, lon, daily, hourly, extra = '') {
  return `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&daily=${daily}&hourly=${hourly}&current_weather=true&timezone=auto${extra}`;
}

const CITY_DAILY  = 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant,uv_index_max';
const CITY_HOURLY = 'temperature_2m,weathercode,windspeed_10m,winddirection_10m,precipitation_probability';

const GOLF_DAILY  = 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant,uv_index_max,sunrise,sunset';
const GOLF_HOURLY = 'temperature_2m,apparent_temperature,windspeed_10m,winddirection_10m,windgusts_10m,precipitation_probability,relativehumidity_2m,uv_index,weathercode';

export async function fetchCityWeather(lat, lon, signal) {
  const cacheKey = buildCacheKey(lat, lon, 'city');
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = buildUrl(lat, lon, CITY_DAILY, CITY_HOURLY, '&forecast_days=5');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}

export async function fetchGolfWeather(lat, lon, signal) {
  const cacheKey = buildCacheKey(lat, lon, 'golf');
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = buildUrl(lat, lon, GOLF_DAILY, GOLF_HOURLY, '&forecast_days=7');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}

const ACTIVITY_DAILY  = 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant,uv_index_max';
const ACTIVITY_HOURLY = 'temperature_2m,apparent_temperature,weathercode,windspeed_10m,winddirection_10m,windgusts_10m,precipitation_probability,precipitation,relativehumidity_2m,uv_index';

export async function fetchActivityWeather(lat, lon, signal) {
  const cacheKey = buildCacheKey(lat, lon, 'activity');
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = buildUrl(lat, lon, ACTIVITY_DAILY, ACTIVITY_HOURLY, '&forecast_days=7');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}
