import { useState } from 'react';
import { findBestTeeTime } from '../../utils/golfScore.js';
import { formatWind } from '../../utils/weatherUtils.js';

export default function TeeTimeSelector({ dayData, windUnit, t }) {
  const [roundType, setRoundType] = useState('18');

  if (!dayData?.hours) return null;

  const result = findBestTeeTime(dayData.hours, dayData.sunset, roundType);
  const sunsetStr = dayData.sunset ? dayData.sunset.slice(11, 16) : '—';

  return (
    <div className="mx-4 rounded-xl bg-[var(--color-golf-light)] p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-golf-text)] mb-3">
        {t('tee.time.title')}
      </div>

      {/* Toggle 9 / 18 trous */}
      <div className="flex rounded-lg overflow-hidden border border-[var(--color-golf)] mb-4">
        {[
          { key: '9',  label: t('tee.9holes')  },
          { key: '18', label: t('tee.18holes') },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRoundType(key)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              roundType === key
                ? 'bg-[var(--color-golf)] text-white'
                : 'text-[var(--color-golf-text)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {result ? (
        <>
          <div className="flex items-baseline gap-3 mb-1">
            <div className="font-mono text-2xl font-semibold text-[var(--color-golf-text)]">
              {result.teeTime}
            </div>
            <div className="text-[var(--color-text-3)] text-sm">→ {result.endTime}</div>
          </div>
          <div className="text-xs text-[var(--color-text-3)] mb-2">
            {t('tee.sunset')} {sunsetStr} (−30min)
          </div>
          <div className="text-xs text-[var(--color-golf-text)] font-medium">
            {t('wind')} {formatWind(result.avgWind, windUnit)} · {t('gusts')} {formatWind(result.avgGusts, windUnit)} · 💧{result.avgRain}% · UV {result.avgUv}
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--color-text-3)]">{t('tee.no.slot')}</p>
      )}
    </div>
  );
}
