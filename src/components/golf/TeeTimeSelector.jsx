import { useState } from 'react';
import { computeGolfScore } from '../../utils/golfScore.js';
import { wmoIcon, formatWind } from '../../utils/weatherUtils.js';

const ROUND_DURATION = { '9': 2.25, '18': 4.5 };

function parseSunsetHour(sunsetIso) {
  if (!sunsetIso) return 20.5;
  const [h, m] = sunsetIso.slice(11, 16).split(':').map(Number);
  return h + m / 60;
}

function getRoundHourNums(startHour, startMin, roundType) {
  const duration = ROUND_DURATION[roundType];
  const startDecimal = startHour + startMin / 60;
  const seen = new Set();
  const result = [];
  for (let offset = 0; offset < duration; offset += 1) {
    const h = Math.floor(startDecimal + offset);
    if (!seen.has(h)) { seen.add(h); result.push(h); }
  }
  return result;
}

function levelFromScore(avg) {
  if (avg >= 75) return { icon: '⛳', labelKey: 'score.ideal' };
  if (avg >= 45) return { icon: '✅', labelKey: 'score.good'  };
  if (avg >= 25) return { icon: '⚠️', labelKey: 'score.hard'  };
  return              { icon: '⛔', labelKey: 'score.bad'   };
}

export default function TeeTimeSelector({ dayData, windUnit, t }) {
  const [roundType, setRoundType] = useState('18');
  const [startHour, setStartHour] = useState(9);
  const [startMin, setStartMin] = useState(0);

  if (!dayData?.hours) return null;

  const sunsetDecimal = parseSunsetHour(dayData.sunset);
  const duration = ROUND_DURATION[roundType];
  const maxStartDecimal = sunsetDecimal - duration - 0.5;
  const maxStartHour = Math.floor(maxStartDecimal);

  const endDecimal = startHour + startMin / 60 + duration;
  const endH = Math.floor(endDecimal);
  const endM = Math.round((endDecimal % 1) * 60);
  const endStr = `${endH}h${String(endM).padStart(2, '0')}`;

  const roundHourNums = getRoundHourNums(startHour, startMin, roundType);
  const roundSlots = roundHourNums
    .map((h) => dayData.hours.find((d) => d.hour === h))
    .filter(Boolean);

  const scored = roundSlots.map((slot) => ({
    ...slot,
    result: computeGolfScore({
      windspeed: slot.windspeed,
      windgusts: slot.windgusts,
      rainProb: slot.rainProb,
      uvIndex: slot.uvIndex,
      weathercode: slot.weathercode,
    }),
  }));

  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((a, b) => a + b.result.score, 0) / scored.length)
    : 0;

  const overall = levelFromScore(avgScore);

  const worst = scored.length > 0
    ? scored.reduce((a, b) => (a.result.score < b.result.score ? a : b))
    : null;
  const showWarning = worst && (avgScore - worst.result.score) > 15;

  function adjustHour(delta) {
    let h = startHour + delta;
    if (h < 7) h = 7;
    if (h > maxStartHour) h = maxStartHour;
    if (h === 7 && startMin === 0) setStartMin(30);
    setStartHour(h);
  }

  function toggleMin() {
    if (startHour === 7) return;
    setStartMin((m) => (m === 0 ? 30 : 0));
  }

  const canDecrement = !(startHour <= 7 && startMin <= 30);
  const canIncrement = startHour < maxStartHour;

  return (
    <div className="mx-4 rounded-xl bg-[var(--color-golf-light)] p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-golf-text)] mb-3">
        {t('my.round')}
      </div>

      {/* Toggle 9 / 18 trous */}
      <div className="flex rounded-lg overflow-hidden border border-[var(--color-golf)] mb-4">
        {[{ key: '9', label: t('tee.9holes') }, { key: '18', label: t('tee.18holes') }].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRoundType(key)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              roundType === key ? 'bg-[var(--color-golf)] text-white' : 'text-[var(--color-golf-text)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Saisie heure de départ */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-[var(--color-text-3)] mr-1">{t('tee.start')} :</span>
        <button
          onClick={() => adjustHour(-1)}
          disabled={!canDecrement}
          className="w-7 h-7 rounded-full bg-[var(--color-golf)] text-white font-bold leading-none disabled:opacity-30"
        >
          −
        </button>
        <span className="font-mono text-xl font-semibold text-[var(--color-golf-text)] w-6 text-center">
          {startHour}
        </span>
        <button
          onClick={() => adjustHour(1)}
          disabled={!canIncrement}
          className="w-7 h-7 rounded-full bg-[var(--color-golf)] text-white font-bold leading-none disabled:opacity-30"
        >
          +
        </button>
        <span className="text-[var(--color-golf-text)] font-mono font-semibold">h</span>
        <button
          onClick={toggleMin}
          disabled={startHour === 7}
          className={`font-mono text-xl font-semibold w-8 text-center rounded px-1 transition-opacity ${
            startHour === 7 ? 'opacity-30 cursor-not-allowed' : 'text-[var(--color-golf-text)]'
          }`}
        >
          {String(startMin).padStart(2, '0')}
        </button>
        <span className="text-[var(--color-text-3)] text-sm ml-auto">→ {endStr}</span>
      </div>

      {/* Score global */}
      <div className="flex items-center gap-2 py-2 mb-3 border-t border-b border-[var(--color-golf)]/20">
        <span className="text-base">{overall.icon}</span>
        <span className="text-sm font-medium text-[var(--color-golf-text)]">
          {t('tee.round.score')} : {avgScore}/100
        </span>
      </div>

      {/* Tableau horaire */}
      {scored.length > 0 ? (
        <div className="flex flex-col">
          {scored.map(({ hour, temp, windspeed, rainProb, weathercode, result }) => (
            <div
              key={hour}
              className="flex items-center gap-2 text-xs font-mono py-1.5 border-b border-[var(--color-golf)]/10 last:border-0"
            >
              <span className="text-[var(--color-text-3)] w-5">{hour}h</span>
              <span className="w-5">{wmoIcon(weathercode)}</span>
              <span className="text-[var(--color-text)] w-7">{Math.round(temp)}°</span>
              <span className="text-[var(--color-golf-text)] flex-1">
                {formatWind(windspeed, windUnit)}
              </span>
              <span className="text-[var(--color-text-3)] w-9">💧{rainProb}%</span>
              <span className="w-4 text-right">{result.icon}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-3)]">{t('tee.no.slot')}</p>
      )}

      {/* Avertissement dégradation */}
      {showWarning && (
        <div className="mt-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2"
             style={{ background: '#FFF7ED', color: '#C2410C' }}>
          <span>⚠️</span>
          <span>{t('tee.warning', { hour: worst.hour })}</span>
        </div>
      )}
    </div>
  );
}
