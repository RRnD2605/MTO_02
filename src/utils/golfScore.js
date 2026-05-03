export function computeGolfScore({ windspeed, windgusts, rainProb, uvIndex }) {
  const ws = windspeed ?? 0;
  const wg = windgusts ?? ws * 1.3;
  const rp = rainProb ?? 0;
  const uv = uvIndex ?? 0;

  const windScore =
    ws < 10 ? 30
    : ws < 20 ? 30 - (ws - 10) * 1.5
    : ws < 35 ? 15 - (ws - 20) * 0.8
    : 0;

  const gustRatio = wg / Math.max(ws, 1);
  const gustScore =
    gustRatio < 1.3 ? 20
    : gustRatio < 1.6 ? 20 - (gustRatio - 1.3) * 40
    : gustRatio < 2.2 ? 8 - (gustRatio - 1.6) * 10
    : 0;

  const rainScore =
    rp < 10 ? 35
    : rp < 30 ? 35 - (rp - 10) * 1.0
    : rp < 60 ? 15 - (rp - 30) * 0.4
    : 0;

  const uvScore =
    uv <= 3 ? 15
    : uv <= 6 ? 15
    : uv <= 8 ? 12
    : uv <= 10 ? 6
    : 3;

  const total = Math.round(
    Math.max(0, Math.min(100, windScore + Math.max(0, gustScore) + rainScore + uvScore))
  );

  if (total >= 75) return { score: total, level: 'ideal', icon: '⛳', labelKey: 'score.ideal' };
  if (total >= 50) return { score: total, level: 'good',  icon: '✅', labelKey: 'score.good'  };
  if (total >= 25) return { score: total, level: 'hard',  icon: '⚠️', labelKey: 'score.hard'  };
  return              { score: total, level: 'bad',   icon: '⛔', labelKey: 'score.bad'   };
}

function parseSunsetHour(sunsetIso) {
  if (!sunsetIso) return 20.5;
  const time = sunsetIso.slice(11, 16);
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

export function findBestTeeTime(hours, sunsetIso, roundType) {
  const durationH = roundType === '9' ? 2.5 : 5;
  const deadlineHour = parseSunsetHour(sunsetIso) - 0.5;

  const golfHours = hours.filter((h) => h.hour >= 6 && h.hour <= 19);
  if (golfHours.length === 0) return null;

  let bestStart = null;
  let bestScore = -1;

  for (let i = 0; i < golfHours.length; i++) {
    const startHour = golfHours[i].hour;
    const endHour = startHour + durationH;
    if (endHour > deadlineHour) continue;

    const windowHours = golfHours.filter(
      (h) => h.hour >= startHour && h.hour < startHour + Math.ceil(durationH)
    );
    if (windowHours.length < Math.floor(durationH)) continue;

    const avgScore =
      windowHours.reduce((sum, h) => {
        const { score } = computeGolfScore({
          windspeed: h.windspeed,
          windgusts: h.windgusts,
          rainProb: h.rainProb,
          uvIndex: h.uvIndex,
        });
        return sum + score;
      }, 0) / windowHours.length;

    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestStart = startHour;
    }
  }

  if (bestStart === null) return null;

  const endTotal = bestStart + durationH;
  const endH = Math.floor(endTotal);
  const endMin = endTotal % 1 !== 0 ? '30' : '00';

  const windowHours = golfHours.filter(
    (h) => h.hour >= bestStart && h.hour < bestStart + Math.ceil(durationH)
  );
  const avgWind = Math.round(
    windowHours.reduce((s, h) => s + (h.windspeed ?? 0), 0) / windowHours.length
  );
  const avgRain = Math.round(
    windowHours.reduce((s, h) => s + (h.rainProb ?? 0), 0) / windowHours.length
  );
  const avgUv = (
    windowHours.reduce((s, h) => s + (h.uvIndex ?? 0), 0) / windowHours.length
  ).toFixed(1);
  const avgGusts = Math.round(
    windowHours.reduce((s, h) => s + (h.windgusts ?? 0), 0) / windowHours.length
  );

  return {
    teeTime: `${bestStart}h00`,
    endTime: `${endH}h${endMin}`,
    score: Math.round(bestScore),
    avgWind,
    avgGusts,
    avgRain,
    avgUv,
  };
}

export const SCORE_COLORS = {
  ideal: 'var(--color-ideal)',
  good:  'var(--color-good)',
  hard:  'var(--color-hard)',
  bad:   'var(--color-bad)',
};
