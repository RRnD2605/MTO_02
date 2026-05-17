export function computeGolfScore({ windspeed, windgusts, rainProb, uvIndex, weathercode }) {
  const ws = windspeed ?? 0;
  const wg = windgusts ?? ws * 1.3;
  const rp = rainProb ?? 0;
  const uv = uvIndex ?? 0;
  const wc = weathercode ?? 0;

  // Orage confirmé → score forcé à 0
  if (wc >= 95) return { score: 0, level: 'bad', icon: '⛈️', labelKey: 'score.bad', stormRisk: 'confirmed' };

  // Vent moyen (30 pts)
  let windScore;
  if (ws < 10)      windScore = 30;
  else if (ws < 23) windScore = 30 - ((ws - 10) / 13) * 15;
  else if (ws < 35) windScore = 15 - ((ws - 23) / 12) * 15;
  else              windScore = 0;

  // Stabilité rafales (20 pts)
  const gustRatio = wg / Math.max(ws, 1);
  let gustScore;
  if (gustRatio < 1.3)      gustScore = 20;
  else if (gustRatio < 1.6) gustScore = 20 - ((gustRatio - 1.3) / 0.3) * 16;
  else if (gustRatio < 2.1) gustScore = 4  - ((gustRatio - 1.6) / 0.5) * 4;
  else                      gustScore = 0;

  // Pluie (35 pts)
  let rainScore;
  if (rp < 5)       rainScore = 35;
  else if (rp < 25) rainScore = 35 - ((rp - 5)  / 20) * 20;
  else if (rp < 60) rainScore = 15 - ((rp - 25) / 35) * 15;
  else              rainScore = 0;

  // UV (15 pts)
  let uvScore;
  if (uv <= 7)      uvScore = 15;
  else if (uv <= 8) uvScore = 14;
  else if (uv <= 10) uvScore = 8;
  else              uvScore = 3;

  // Risque orage (niveau 2)
  const stormSignals = [rp > 60, wg > 50, wc >= 80].filter(Boolean).length;
  let stormRisk = 'none';
  if (stormSignals >= 2)                   stormRisk = 'high';
  else if (stormSignals === 1 && rp > 40)  stormRisk = 'moderate';

  const total = Math.round(Math.max(0, Math.min(100, windScore + gustScore + rainScore + uvScore)));

  if (total >= 75) return { score: total, level: 'ideal', icon: '⛳', labelKey: 'score.ideal', stormRisk };
  if (total >= 45) return { score: total, level: 'good',  icon: '✅', labelKey: 'score.good',  stormRisk };
  if (total >= 25) return { score: total, level: 'hard',  icon: '⚠️', labelKey: 'score.hard',  stormRisk };
  return            { score: total, level: 'bad',   icon: '⛔', labelKey: 'score.bad',   stormRisk };
}

function parseSunsetHour(sunsetIso) {
  if (!sunsetIso) return 20.5;
  const [h, m] = sunsetIso.slice(11, 16).split(':').map(Number);
  return h + m / 60;
}

export const SCORE_COLORS = {
  ideal: 'var(--color-ideal)',
  good:  'var(--color-good)',
  hard:  'var(--color-hard)',
  bad:   'var(--color-bad)',
};

export function computeDayGolfScore(hourlyData, dateStr) {
  if (!hourlyData || !dateStr) return null;
  const golfHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  const scores = golfHours
    .map((h) => {
      const targetTime = `${dateStr}T${String(h).padStart(2, '0')}:00`;
      const idx = hourlyData.time.indexOf(targetTime);
      if (idx < 0) return null;
      return computeGolfScore({
        windspeed:   hourlyData.windspeed_10m[idx],
        windgusts:   hourlyData.windgusts_10m[idx],
        rainProb:    hourlyData.precipitation_probability[idx] ?? 0,
        uvIndex:     hourlyData.uv_index[idx] ?? 0,
        weathercode: hourlyData.weathercode[idx] ?? 0,
      });
    })
    .filter(Boolean);

  if (scores.length === 0) return null;

  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
  if (avgScore >= 75) return { score: avgScore, level: 'ideal', icon: '⛳', labelKey: 'score.ideal' };
  if (avgScore >= 45) return { score: avgScore, level: 'good',  icon: '✅', labelKey: 'score.good'  };
  if (avgScore >= 25) return { score: avgScore, level: 'hard',  icon: '⚠️', labelKey: 'score.hard'  };
  return                     { score: avgScore, level: 'bad',   icon: '⛔', labelKey: 'score.bad'   };
}

export function getScoreForGame(game, weatherData) {
  if (!weatherData?.hourly) return null;
  const { hourly } = weatherData;

  const duration     = game.roundType === '9' ? 2.25 : 4.5;
  const startDecimal = game.startHour + (game.startMinute ?? 0) / 60;
  const endDecimal   = startDecimal + duration;

  // Mirror getRoundHourNums in TeeTimeSelector: every hour covered by the round
  const roundHours = [];
  for (let h = Math.floor(startDecimal); h <= Math.ceil(endDecimal); h++) {
    roundHours.push(h);
  }

  const scores = roundHours
    .map((h) => {
      const targetTime = `${game.date}T${String(h).padStart(2, '0')}:00`;
      const idx = hourly.time.indexOf(targetTime);
      if (idx < 0) return null;
      return computeGolfScore({
        windspeed:   hourly.windspeed_10m[idx],
        windgusts:   hourly.windgusts_10m[idx],
        rainProb:    hourly.precipitation_probability[idx] ?? 0,
        uvIndex:     hourly.uv_index[idx] ?? 0,
        weathercode: hourly.weathercode[idx] ?? 0,
      });
    })
    .filter(Boolean);

  if (scores.length === 0) return null;

  const avgScore = Math.round(scores.reduce((sum, r) => sum + r.score, 0) / scores.length);
  if (avgScore >= 75) return { score: avgScore, level: 'ideal', icon: '⛳', labelKey: 'score.ideal', stormRisk: 'none' };
  if (avgScore >= 45) return { score: avgScore, level: 'good',  icon: '✅', labelKey: 'score.good',  stormRisk: 'none' };
  if (avgScore >= 25) return { score: avgScore, level: 'hard',  icon: '⚠️', labelKey: 'score.hard',  stormRisk: 'none' };
  return                     { score: avgScore, level: 'bad',   icon: '⛔', labelKey: 'score.bad',   stormRisk: 'none' };
}
