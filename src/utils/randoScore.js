export function computeRandoScore({ windspeed, windgusts, rainProb, temperature, weathercode, uvIndex }) {
  const ws = windspeed ?? 0;
  const wg = windgusts ?? ws * 1.3;
  const rp = rainProb ?? 0;
  const t = temperature ?? 15;
  const wc = weathercode ?? 0;
  const uv = uvIndex ?? 0;

  if (wc >= 95) return { score: 0, level: 'bad', icon: '⛈️', labelKey: 'score.bad', stormRisk: 'confirmed' };

  // Vent (25 pts)
  let windScore;
  if (ws < 15)      windScore = 25;
  else if (ws < 30) windScore = 25 - ((ws - 15) / 15) * 13;
  else if (ws < 50) windScore = 12 - ((ws - 30) / 20) * 12;
  else              windScore = 0;

  // Pluie (25 pts)
  let rainScore;
  if (rp < 10)      rainScore = 25;
  else if (rp < 40) rainScore = 25 - ((rp - 10) / 30) * 15;
  else if (rp < 70) rainScore = 10 - ((rp - 40) / 30) * 10;
  else              rainScore = 0;

  // Température (20 pts) — zone idéale 8–22°C
  let tempScore;
  if (t >= 8 && t <= 22)    tempScore = 20;
  else if (t >= 4 && t < 8) tempScore = 20 - ((8 - t) / 4) * 10;
  else if (t > 22 && t <= 28) tempScore = 20 - ((t - 22) / 6) * 10;
  else if (t < 0 || t > 32) tempScore = 0;
  else                       tempScore = 5;

  // Visibilité (15 pts) — brouillard = 0
  const visScore = (wc >= 45 && wc <= 49) ? 0 : 15;

  // UV (15 pts)
  let uvScore;
  if (uv <= 7)      uvScore = 15;
  else if (uv <= 8) uvScore = 14;
  else if (uv <= 10) uvScore = 8;
  else              uvScore = 3;

  const total = Math.round(Math.max(0, Math.min(100, windScore + rainScore + tempScore + visScore + uvScore)));

  // Storm risk
  const stormSignals = [rp > 60, wg > 50, wc >= 80].filter(Boolean).length;
  let stormRisk = 'none';
  if (stormSignals >= 2)                 stormRisk = 'high';
  else if (stormSignals >= 1 && rp > 40) stormRisk = 'moderate';

  if (total >= 75) return { score: total, level: 'ideal', icon: '🥾', labelKey: 'score.ideal', stormRisk };
  if (total >= 45) return { score: total, level: 'good',  icon: '✅', labelKey: 'score.good',  stormRisk };
  if (total >= 20) return { score: total, level: 'hard',  icon: '⚠️', labelKey: 'score.hard',  stormRisk };
  return            { score: total, level: 'bad',   icon: '⛔', labelKey: 'score.bad',   stormRisk };
}
