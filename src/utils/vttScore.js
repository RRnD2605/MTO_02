export function computeVttScore({ windspeed, windgusts, rainProb, recentPrecipMm, temperature, weathercode, uvIndex }) {
  const ws = windspeed ?? 0;
  const wg = windgusts ?? ws * 1.3;
  const rp = rainProb ?? 0;
  const precip = recentPrecipMm ?? 0;
  const t = temperature ?? 15;
  const wc = weathercode ?? 0;
  const uv = uvIndex ?? 0;

  if (wc >= 95) return { score: 0, level: 'bad', icon: '⛈️', labelKey: 'score.bad', stormRisk: 'confirmed' };

  // Sols / pluie récente sur 6h (30 pts)
  let soilScore;
  if (precip === 0)         soilScore = 30;
  else if (precip < 4)      soilScore = 30 - (precip / 4) * 10;
  else if (precip < 10)     soilScore = 20 - ((precip - 4) / 6) * 15;
  else                      soilScore = 0;

  // Pluie en cours (25 pts)
  let rainScore;
  if (rp < 5)       rainScore = 25;
  else if (rp < 25) rainScore = 25 - ((rp - 5) / 20) * 13;
  else if (rp < 50) rainScore = 12 - ((rp - 25) / 25) * 12;
  else              rainScore = 0;

  // Vent / rafales (20 pts)
  let windScore;
  if (ws < 25)      windScore = 20;
  else if (ws < 50) windScore = 20 - ((ws - 25) / 25) * 12;
  else if (ws < 65) windScore = 8  - ((ws - 50) / 15) * 8;
  else              windScore = 0;

  // Température (15 pts) — zone large 5–28°C
  let tempScore;
  if (t >= 5 && t <= 28)    tempScore = 15;
  else if (t >= 0 && t < 5) tempScore = 15 - ((5 - t) / 5) * 8;
  else if (t > 28 && t <= 35) tempScore = 15 - ((t - 28) / 7) * 8;
  else if (t < -2 || t > 38) tempScore = 0;
  else                       tempScore = 4;

  // UV (10 pts)
  let uvScore;
  if (uv <= 7)      uvScore = 10;
  else if (uv <= 8) uvScore = 8;
  else if (uv <= 10) uvScore = 5;
  else              uvScore = 2;

  const total = Math.round(Math.max(0, Math.min(95, soilScore + rainScore + windScore + tempScore + uvScore)));

  const stormSignals = [rp > 60, wg > 50, wc >= 80].filter(Boolean).length;
  let stormRisk = 'none';
  if (stormSignals >= 2)                 stormRisk = 'high';
  else if (stormSignals >= 1 && rp > 40) stormRisk = 'moderate';

  // Soil label
  const soilLabel = precip === 0 ? 'soil.dry' : precip < 4 ? 'soil.damp' : precip < 10 ? 'soil.wet' : 'soil.mud';

  if (total >= 75) return { score: total, level: 'ideal', icon: '🚵', labelKey: 'score.ideal', stormRisk, soilLabel, recentPrecipMm: precip };
  if (total >= 45) return { score: total, level: 'good',  icon: '✅', labelKey: 'score.good',  stormRisk, soilLabel, recentPrecipMm: precip };
  if (total >= 20) return { score: total, level: 'hard',  icon: '⚠️', labelKey: 'score.hard',  stormRisk, soilLabel, recentPrecipMm: precip };
  return            { score: total, level: 'bad',   icon: '⛔', labelKey: 'score.bad',   stormRisk, soilLabel, recentPrecipMm: precip };
}
