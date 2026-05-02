export const WMO_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️',
  77: '🌨️',
  80: '🌦️', 81: '🌦️', 82: '🌧️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

export const WMO_LABELS_FR = {
  0: 'Ciel dégagé', 1: 'Peu nuageux', 2: 'Partiellement nuageux', 3: 'Couvert',
  45: 'Brouillard', 48: 'Brouillard givrant',
  51: 'Bruine légère', 53: 'Bruine modérée', 55: 'Bruine dense',
  61: 'Pluie légère', 63: 'Pluie modérée', 65: 'Pluie forte',
  71: 'Neige légère', 73: 'Neige modérée', 75: 'Neige forte',
  77: 'Grains de neige',
  80: 'Averses légères', 81: 'Averses modérées', 82: 'Averses violentes',
  85: 'Averses de neige légères', 86: 'Averses de neige fortes',
  95: 'Orage', 96: 'Orage avec grêle légère', 99: 'Orage avec grêle forte',
};

export const WMO_LABELS_EN = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Moderate snow', 75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers', 81: 'Moderate showers', 82: 'Violent showers',
  85: 'Light snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
};

export function getWeatherIcon(code) {
  return WMO_ICONS[code] ?? '🌡️';
}

export function getWeatherLabel(code, lang = 'fr') {
  const labels = lang === 'fr' ? WMO_LABELS_FR : WMO_LABELS_EN;
  return labels[code] ?? code;
}

export function windDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(deg / 45) % 8];
}

export function kmhToKnots(kmh) {
  return Math.round(kmh / 1.852);
}

export function formatWind(kmh, unit) {
  if (unit === 'knots') return `${kmhToKnots(kmh)} kt`;
  return `${Math.round(kmh)} km/h`;
}

export function generateAlerts(daily, dayIndex, lang) {
  const alerts = [];
  if (!daily) return alerts;

  const windspeed = daily.windspeed_10m_max?.[dayIndex];
  const rainProb = daily.precipitation_probability_max?.[dayIndex];
  const weathercode = daily.weathercode?.[dayIndex];
  const tempMin = daily.temperature_2m_min?.[dayIndex];
  const uvMax = daily.uv_index_max?.[dayIndex];

  if (windspeed > 40) {
    alerts.push({
      key: 'alert.wind',
      vars: { speed: Math.round(windspeed) },
      icon: '💨',
      color: 'orange',
    });
  }
  if (rainProb > 70 && weathercode >= 95) {
    alerts.push({
      key: 'alert.storm',
      vars: { time: '18h' },
      icon: '⛈️',
      color: 'red',
    });
  }
  if (tempMin < 2) {
    alerts.push({
      key: 'alert.frost',
      vars: {},
      icon: '🧊',
      color: 'blue',
    });
  }
  if (uvMax >= 9) {
    alerts.push({
      key: 'alert.uv',
      vars: {},
      icon: '☀️',
      color: 'yellow',
    });
  }

  return alerts;
}

export function parseDayData(weatherData, dayIndex) {
  if (!weatherData) return null;
  const { daily, hourly, current_weather } = weatherData;
  const date = daily.time[dayIndex];

  const dayHours = hourly.time
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.startsWith(date))
    .map(({ i }) => ({
      time: hourly.time[i],
      hour: parseInt(hourly.time[i].slice(11, 13), 10),
      temp: hourly.temperature_2m[i],
      weathercode: hourly.weathercode[i],
      windspeed: hourly.windspeed_10m[i],
      winddirection: hourly.winddirection_10m[i],
      rainProb: hourly.precipitation_probability[i],
    }));

  return {
    date,
    maxTemp: daily.temperature_2m_max[dayIndex],
    minTemp: daily.temperature_2m_min[dayIndex],
    weathercode: daily.weathercode[dayIndex],
    rainProb: daily.precipitation_probability_max[dayIndex],
    windspeed: daily.windspeed_10m_max[dayIndex],
    winddirection: daily.winddirection_10m_dominant[dayIndex],
    uvMax: daily.uv_index_max[dayIndex],
    hours: dayHours,
    currentTemp: dayIndex === 0 ? current_weather?.temperature : null,
    currentWeathercode: dayIndex === 0 ? current_weather?.weathercode : null,
  };
}

export function parseGolfDayData(weatherData, dayIndex) {
  if (!weatherData) return null;
  const { daily, hourly, current_weather } = weatherData;
  const date = daily.time[dayIndex];

  const dayHours = hourly.time
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.startsWith(date))
    .map(({ i }) => ({
      time: hourly.time[i],
      hour: parseInt(hourly.time[i].slice(11, 13), 10),
      temp: hourly.temperature_2m[i],
      apparentTemp: hourly.apparent_temperature[i],
      windspeed: hourly.windspeed_10m[i],
      winddirection: hourly.winddirection_10m[i],
      windgusts: hourly.windgusts_10m[i],
      rainProb: hourly.precipitation_probability[i],
      humidity: hourly.relativehumidity_2m[i],
      uvIndex: hourly.uv_index[i],
    }));

  return {
    date,
    maxTemp: daily.temperature_2m_max[dayIndex],
    minTemp: daily.temperature_2m_min[dayIndex],
    weathercode: daily.weathercode[dayIndex],
    rainProb: daily.precipitation_probability_max[dayIndex],
    windspeed: daily.windspeed_10m_max[dayIndex],
    winddirection: daily.winddirection_10m_dominant[dayIndex],
    uvMax: daily.uv_index_max[dayIndex],
    sunrise: daily.sunrise?.[dayIndex],
    sunset: daily.sunset?.[dayIndex],
    hours: dayHours,
    currentTemp: dayIndex === 0 ? current_weather?.temperature : null,
    currentWeathercode: dayIndex === 0 ? current_weather?.weathercode : null,
  };
}
