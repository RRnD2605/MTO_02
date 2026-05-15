export function wmoIcon(code) {
  if (code === 0)    return '☀️';
  if (code === 1)    return '🌤️';
  if (code === 2)    return '⛅';
  if (code === 3)    return '☁️';
  if (code <= 49)    return '🌫️';
  if (code <= 55)    return '🌦️';
  if (code <= 65)    return '🌧️';
  if (code <= 77)    return '❄️';
  if (code <= 82)    return '🌧️';
  if (code <= 86)    return '🌨️';
  if (code === 95)   return '⛈️';
  if (code >= 96)    return '⛈️';
  return '🌡️';
}

export function wmoLabel(code, lang = 'fr') {
  if (lang === 'en') {
    if (code === 0)   return 'Sunny';
    if (code === 1)   return 'Mainly clear';
    if (code === 2)   return 'Partly cloudy';
    if (code === 3)   return 'Overcast';
    if (code <= 49)   return 'Fog';
    if (code <= 55)   return 'Drizzle';
    if (code === 61)  return 'Light rain';
    if (code === 63)  return 'Moderate rain';
    if (code === 65)  return 'Heavy rain';
    if (code <= 77)   return 'Snow';
    if (code <= 82)   return 'Showers';
    if (code <= 86)   return 'Snow showers';
    if (code === 95)  return 'Thunderstorm';
    if (code >= 96)   return 'Thunderstorm with hail';
    return 'Unknown';
  }
  if (code === 0)   return 'Ensoleillé';
  if (code === 1)   return 'Peu nuageux';
  if (code === 2)   return 'Partiellement nuageux';
  if (code === 3)   return 'Couvert';
  if (code <= 49)   return 'Brouillard';
  if (code <= 55)   return 'Bruine';
  if (code === 61)  return 'Pluie légère';
  if (code === 63)  return 'Pluie modérée';
  if (code === 65)  return 'Pluie forte';
  if (code <= 77)   return 'Neige';
  if (code <= 82)   return 'Averses';
  if (code <= 86)   return 'Averses de neige';
  if (code === 95)  return 'Orage';
  if (code >= 96)   return 'Orage avec grêle';
  return 'Inconnu';
}

// Aliases conservés pour compatibilité avec les composants existants
export const getWeatherIcon = wmoIcon;
export function getWeatherLabel(code, lang = 'fr') {
  return wmoLabel(code, lang);
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
  const date = daily.time?.[dayIndex];
  if (!date) return null;

  const dayHours = hourly.time
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.startsWith(date))
    .map(({ i }) => ({
      time: hourly.time[i],
      hour: parseInt(hourly.time[i].slice(11, 13), 10),
      temp: hourly.temperature_2m[i] ?? 0,
      weathercode: hourly.weathercode[i] ?? 0,
      windspeed: hourly.windspeed_10m[i] ?? 0,
      winddirection: hourly.winddirection_10m[i] ?? 0,
      rainProb: hourly.precipitation_probability[i] ?? 0,
    }));

  return {
    date,
    maxTemp: daily.temperature_2m_max[dayIndex] ?? 0,
    minTemp: daily.temperature_2m_min[dayIndex] ?? 0,
    weathercode: daily.weathercode[dayIndex] ?? 0,
    rainProb: daily.precipitation_probability_max?.[dayIndex] ?? 0,
    windspeed: daily.windspeed_10m_max[dayIndex] ?? 0,
    winddirection: daily.winddirection_10m_dominant[dayIndex] ?? 0,
    windgusts: daily.windspeed_10m_max?.[dayIndex] ?? 0,
    uvMax: daily.uv_index_max?.[dayIndex] ?? 0,
    hours: dayHours,
    // currentTemp uniquement pour aujourd'hui (j0)
    currentTemp: dayIndex === 0 ? (current_weather?.temperature ?? null) : null,
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
      windspeed: hourly.windspeed_10m[i] ?? 0,
      winddirection: hourly.winddirection_10m[i] ?? 0,
      windgusts: hourly.windgusts_10m[i] ?? (hourly.windspeed_10m[i] ?? 0) * 1.3,
      rainProb: hourly.precipitation_probability[i] ?? 0,
      humidity: hourly.relativehumidity_2m[i] ?? 0,
      uvIndex: hourly.uv_index[i] ?? 0,
      weathercode: hourly.weathercode?.[i] ?? 0,
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
