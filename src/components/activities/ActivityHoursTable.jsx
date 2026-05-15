import { getWeatherIcon, formatWind } from '../../utils/weatherUtils.js';
import RainDrop from '../shared/RainDrop.jsx';
import { SCORE_COLORS } from '../../utils/golfScore.js';

export default function ActivityHoursTable({ hours, windUnit, t, scoreFunc }) {
  if (!hours || hours.length === 0) return null;

  const now = new Date();
  const currentHour = now.getHours();
  const tableHours = hours.filter((h) => h.hour >= 7 && h.hour <= 19);

  return (
    <div className="mx-4 mb-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="px-2 py-2 text-left text-[var(--color-text-3)] font-medium">{t('hour')}</th>
            <th className="px-1 py-2 text-center text-[var(--color-text-3)] font-medium">—</th>
            <th className="px-1 py-2 text-right text-[var(--color-text-3)] font-medium">°C</th>
            <th className="px-1 py-2 text-right text-[var(--color-text-3)] font-medium">{t('wind')}</th>
            <th className="px-1 py-2 text-right text-[var(--color-text-3)] font-medium"><RainDrop prob={1} /></th>
            <th className="px-2 py-2 text-center text-[var(--color-text-3)] font-medium">●</th>
          </tr>
        </thead>
        <tbody>
          {tableHours.map((h) => {
            const past = h.hour < currentHour;
            const isNow = h.hour === currentHour;
            const result = scoreFunc ? scoreFunc(h) : null;
            const dotColor = result ? SCORE_COLORS[result.level] : 'var(--color-text-3)';

            return (
              <tr
                key={h.time || h.hour}
                className={`border-b last:border-b-0 border-[var(--color-border)] ${past ? 'opacity-40' : ''}`}
                style={isNow ? { borderLeft: '2px solid currentColor', backgroundColor: 'var(--color-surface)' } : {}}
              >
                <td className="px-2 py-2 font-mono text-[var(--color-text-2)]">{h.hour}h</td>
                <td className="px-1 py-2 text-center">{getWeatherIcon(h.weathercode ?? 0)}</td>
                <td className="px-1 py-2 text-right font-mono text-[var(--color-text)]">{Math.round(h.temp)}°</td>
                <td className="px-1 py-2 text-right font-mono text-[var(--color-text-2)]">{formatWind(h.windspeed, windUnit)}</td>
                <td className="px-1 py-2 text-right font-mono text-[var(--color-text-2)]">
                  <RainDrop prob={h.rainProb ?? 0} />{h.rainProb ?? 0}%
                </td>
                <td className="px-2 py-2 text-center">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
