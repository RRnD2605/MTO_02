import { formatWind, windDirection } from '../../utils/weatherUtils.js';

function formatTime(isoStr) {
  if (!isoStr) return '—';
  return isoStr.slice(11, 16);
}

export default function MetricsGrid({ dayData, windUnit, t }) {
  if (!dayData) return null;

  const metrics = [
    {
      label: t('wind'),
      value: formatWind(dayData.windspeed, windUnit),
      sub: windDirection(dayData.winddirection),
      accent: true,
    },
    {
      label: t('feels.like'),
      value: dayData.hours?.[0]
        ? `${Math.round(dayData.hours.find(h => h.hour >= 12)?.apparentTemp ?? dayData.maxTemp)}°`
        : `${Math.round(dayData.maxTemp)}°`,
      sub: '🌡️',
    },
    {
      label: t('uv'),
      value: dayData.uvMax?.toFixed(0) ?? '—',
      sub: '☀️',
    },
    {
      label: `${t('sunrise')} / ${t('sunset')}`,
      value: `${formatTime(dayData.sunrise)} / ${formatTime(dayData.sunset)}`,
      sub: '🌅',
      wide: true,
    },
  ];

  return (
    <div className="mx-4 grid grid-cols-2 gap-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className={`rounded-xl bg-[var(--color-surface-2)] p-3 ${m.wide ? 'col-span-2' : ''}`}
        >
          <div className="text-xs text-[var(--color-text-3)] mb-1">{m.label}</div>
          <div
            className={`font-mono text-base font-medium ${
              m.accent ? 'text-[var(--color-golf-text)]' : 'text-[var(--color-text)]'
            }`}
          >
            {m.value}
          </div>
          <div className="text-xs text-[var(--color-text-3)] mt-0.5">{m.sub}</div>
        </div>
      ))}
    </div>
  );
}
