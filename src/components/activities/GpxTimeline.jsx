import { wmoIcon, wmoLabel, formatWind } from '../../utils/weatherUtils.js';

function ScoreDot({ score }) {
  const color =
    score >= 75 ? '#22c55e'
    : score >= 45 ? '#84cc16'
    : score >= 20 ? '#f97316'
    : '#ef4444';
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {score}
    </div>
  );
}

export default function GpxTimeline({ points, windUnit, lang, scoreFunc, color }) {
  if (!points || points.length === 0) return null;

  return (
    <div className="mx-4 flex flex-col">
      {points.map((pt, i) => {
        const isFirst = i === 0;
        const isLast = i === points.length - 1;
        const w = pt.weather;
        const score = w && scoreFunc ? scoreFunc(w) : null;

        const arrivalDate = pt.arrivalTime ? new Date(pt.arrivalTime) : null;
        const timeStr = arrivalDate
          ? `${arrivalDate.getHours()}h${String(arrivalDate.getMinutes()).padStart(2, '0')}`
          : '';

        return (
          <div key={i} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center" style={{ width: 24 }}>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-4"
                style={{ backgroundColor: isFirst || isLast ? color : 'var(--color-border)', border: `2px solid ${color}` }}
              />
              {!isLast && <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: 'var(--color-border)' }} />}
            </div>

            {/* Card */}
            <div className="flex-1 mb-3">
              <div className="rounded-xl bg-[var(--color-surface-2)] p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{pt.label}</span>
                    {pt.dist > 0 && (
                      <span className="text-xs text-[var(--color-text-3)]">{pt.dist.toFixed(1)} km</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {timeStr && (
                      <span className="text-xs font-mono text-[var(--color-text-3)]">{timeStr}</span>
                    )}
                    {score && <ScoreDot score={score.score} />}
                  </div>
                </div>

                {pt.ele > 0 && (
                  <div className="text-xs text-[var(--color-text-3)] mb-2">
                    ⛰️ {Math.round(pt.ele)} m
                  </div>
                )}

                {w ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg">{wmoIcon(w.weathercode)}</span>
                    <span className="text-sm text-[var(--color-text)]">
                      {w.temp != null ? `${w.temp}°` : '—'}
                    </span>
                    <span className="text-xs text-[var(--color-text-3)]">
                      {wmoLabel(w.weathercode, lang)}
                    </span>
                    {w.windspeed != null && (
                      <span className="text-xs text-[var(--color-text-3)]">
                        💨 {formatWind(w.windspeed, windUnit)}
                      </span>
                    )}
                    {w.rainProb != null && w.rainProb > 0 && (
                      <span className="text-xs text-[var(--color-text-3)]">
                        💧 {w.rainProb}%
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[var(--color-text-3)]">Météo non disponible</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
