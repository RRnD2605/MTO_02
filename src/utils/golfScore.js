export function computeGolfScore({ windspeed, windgusts, rainProb, uvIndex }) {
  const windScore =
    windspeed < 10 ? 30
    : windspeed < 20 ? 30 - (windspeed - 10) * 1.5
    : windspeed < 35 ? 15 - (windspeed - 20) * 0.8
    : 0;

  const gustRatio = windgusts / Math.max(windspeed, 1);
  const gustScore =
    gustRatio < 1.3 ? 20
    : gustRatio < 1.6 ? 20 - (gustRatio - 1.3) * 40
    : gustRatio < 2.2 ? 8 - (gustRatio - 1.6) * 10
    : 0;

  const rainScore =
    rainProb < 10 ? 35
    : rainProb < 30 ? 35 - (rainProb - 10) * 1.0
    : rainProb < 60 ? 15 - (rainProb - 30) * 0.4
    : 0;

  const uvScore =
    uvIndex <= 3 ? 15
    : uvIndex <= 6 ? 15
    : uvIndex <= 8 ? 12
    : uvIndex <= 10 ? 6
    : 3;

  const total = Math.round(
    Math.max(0, Math.min(100, windScore + gustScore + rainScore + uvScore))
  );

  if (total >= 75) return { score: total, level: 'ideal', icon: '⛳', labelKey: 'score.ideal' };
  if (total >= 50) return { score: total, level: 'good',  icon: '✅', labelKey: 'score.good'  };
  if (total >= 25) return { score: total, level: 'hard',  icon: '⚠️', labelKey: 'score.hard'  };
  return              { score: total, level: 'bad',   icon: '⛔', labelKey: 'score.bad'   };
}

export function findBestWindow(hours) {
  const golfHours = hours.filter((h) => h.hour >= 7 && h.hour < 19);
  if (golfHours.length < 3) return null;

  let bestStart = null;
  let bestScore = -1;

  for (let i = 0; i <= golfHours.length - 3; i++) {
    const window = golfHours.slice(i, i + 3);
    const avgScore =
      window.reduce((sum, h) => {
        const { score } = computeGolfScore({
          windspeed: h.windspeed,
          windgusts: h.windgusts,
          rainProb: h.rainProb,
          uvIndex: h.uvIndex,
        });
        return sum + score;
      }, 0) / 3;

    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestStart = window[0];
    }
  }

  if (!bestStart) return null;

  const startHour = bestStart.hour;
  const endHour = startHour + 3;

  const reasons = [];
  const midHour = golfHours.find((h) => h.hour === startHour + 1) || bestStart;
  if (midHour.windspeed < 15) reasons.push('windKey');
  if (midHour.rainProb < 20) reasons.push('rainKey');
  if (midHour.uvIndex < 8) reasons.push('uvKey');

  return {
    start: `${startHour}h`,
    end: `${endHour}h`,
    score: Math.round(bestScore),
    reasons,
  };
}

export const SCORE_COLORS = {
  ideal: 'var(--color-ideal)',
  good:  'var(--color-good)',
  hard:  'var(--color-hard)',
  bad:   'var(--color-bad)',
};
