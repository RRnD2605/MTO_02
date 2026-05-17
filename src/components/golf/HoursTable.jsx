import { getWeatherIcon } from '../../utils/weatherUtils.js';
import RainDrop from '../shared/RainDrop.jsx';

export default function HoursTable({ hours, windUnit, t }) {
  if (!hours || hours.length === 0) return null;

  const now = new Date();
  const currentHour = now.getHours();
  const golfHours = hours.filter((h) => h.hour >= 7 && h.hour <= 19);

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
          </tr>
        </thead>
        <tbody>
          {golfHours.map((h) => {
            const past  = h.hour < currentHour;
            const isNow = h.hour === currentHour;

            return (
              <tr
                key={h.time}
                className={`border-b last:border-b-0 border-[var(--color-border)] transition-opacity ${
                  past ? 'opacity-50' : ''
                } ${isNow ? 'bg-[var(--color-golf-light)]' : ''}`}
                style={isNow ? { borderLeft: '2px solid var(--color-golf)' } : {}}
              >
                <td className="px-2 py-2 font-mono text-[var(--color-text-2)]">{h.hour}h</td>
                <td className="px-1 py-2 text-center">{getWeatherIcon(h.weathercode ?? 0)}</td>
                <td className="px-1 py-2 text-right font-mono text-[var(--color-text)]">
                  {Math.round(h.temp)}°
                </td>
                <td className="px-1 py-2 text-right font-mono text-[var(--color-text-2)]">
                  {Math.round(h.windspeed)} km/h (↑{Math.round(h.windgusts ?? h.windspeed * 1.3)})
                </td>
                <td className="px-1 py-2 text-right font-mono text-[var(--color-text-2)]">
                  <RainDrop prob={h.rainProb ?? 0} />{h.rainProb ?? 0}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
