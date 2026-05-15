// Parses GPX files from Outdooractive, Komoot, Strava, Wikiloc, Garmin
// Exposes: parseGpxFile, sampleWeatherPoints, fetchWeatherForPoints

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function parseGpxFile(file) {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');

  const name =
    doc.querySelector('name')?.textContent?.trim() ||
    file.name.replace('.gpx', '');

  const trkpts = [...doc.querySelectorAll('trkpt')];
  if (trkpts.length === 0) throw new Error('No track points found in GPX');

  let totalDist = 0;
  let elevGain = 0;
  let elevLoss = 0;

  const points = trkpts.map((pt, i) => {
    const lat = parseFloat(pt.getAttribute('lat'));
    const lon = parseFloat(pt.getAttribute('lon'));
    const ele = parseFloat(pt.querySelector('ele')?.textContent || '0');
    if (i > 0) {
      const prev = points[i - 1];
      totalDist += haversineKm(prev.lat, prev.lon, lat, lon);
      const diff = ele - prev.ele;
      if (diff > 0) elevGain += diff;
      else elevLoss += Math.abs(diff);
    }
    return { lat, lon, ele, dist: totalDist };
  });

  return { name, points, totalDistKm: totalDist, elevGain: Math.round(elevGain), elevLoss: Math.round(elevLoss) };
}

export function sampleWeatherPoints(gpxData, nbPoints, departureTime, durationMinutes) {
  const { points } = gpxData;
  if (!points.length) return [];

  const n = Math.min(Math.max(3, nbPoints), 10);
  const indices = [];

  // Always include start and end
  indices.push(0);
  for (let i = 1; i < n - 1; i++) {
    indices.push(Math.round((i / (n - 1)) * (points.length - 1)));
  }
  indices.push(points.length - 1);

  const unique = [...new Set(indices)].sort((a, b) => a - b);
  const totalDist = gpxData.totalDistKm;
  const durationMs = durationMinutes * 60 * 1000;
  const depTime = departureTime ? new Date(departureTime) : new Date();

  return unique.map((idx, i) => {
    const pt = points[idx];
    const fraction = totalDist > 0 ? pt.dist / totalDist : i / (unique.length - 1);
    const arrivalTime = new Date(depTime.getTime() + fraction * durationMs);
    const labels = ['Départ', ...Array(unique.length - 2).fill(null).map((_, j) => `Point ${j + 1}`), 'Arrivée'];
    return {
      lat: pt.lat,
      lon: pt.lon,
      ele: pt.ele,
      dist: pt.dist,
      arrivalTime: arrivalTime.toISOString(),
      label: labels[i] || `Point ${i}`,
    };
  });
}

export async function fetchWeatherForPoints(weatherPoints) {
  const results = [];
  for (const pt of weatherPoints) {
    try {
      const dt = new Date(pt.arrivalTime);
      const dateStr = dt.toISOString().slice(0, 10);
      const hour = dt.getHours();
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${pt.lat}&longitude=${pt.lon}&hourly=temperature_2m,weathercode,windspeed_10m,precipitation_probability&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      const idx = data.hourly.time.findIndex((t) => parseInt(t.slice(11, 13)) === hour);
      const tempRaw = idx >= 0 ? (data.hourly.temperature_2m[idx] ?? null) : null;
      // Altitude correction: -0.6°C per 100m above sea level (assuming data is at sea level)
      const tempCorrected = tempRaw != null ? tempRaw - (pt.ele / 100) * 0.6 : null;
      results.push({
        ...pt,
        weather: {
          temp: tempCorrected != null ? Math.round(tempCorrected * 10) / 10 : null,
          weathercode: idx >= 0 ? (data.hourly.weathercode[idx] ?? 0) : 0,
          windspeed: idx >= 0 ? (data.hourly.windspeed_10m[idx] ?? 0) : 0,
          rainProb: idx >= 0 ? (data.hourly.precipitation_probability[idx] ?? 0) : 0,
        },
      });
    } catch {
      results.push({ ...pt, weather: null });
    }
  }
  return results;
}
