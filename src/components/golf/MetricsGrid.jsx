import { formatWind, windDirection } from '../../utils/weatherUtils.js';

function formatTime(isoStr) {
  if (!isoStr) return '—';
  return isoStr.slice(11, 16);
}

function dayDuration(sunriseIso, sunsetIso) {
  if (!sunriseIso || !sunsetIso) return '—';
  const rise = new Date(sunriseIso);
  const set = new Date(sunsetIso);
  const mins = Math.round((set - rise) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}`;
}

export default function MetricsGrid({ dayData, windUnit, t }) {
  if (!dayData) return null;

  const feelsLike = dayData.hours?.find((h) => h.hour >= 12)?.apparentTemp ?? dayData.maxTemp;
  const humidity = dayData.hours?.find((h) => h.hour >= 12)?.humidity ?? 0;
  const uvNow = dayData.uvMax ?? 0;

  const gusts = dayData.hours?.find((h) => h.hour >= 12)?.windgusts
    ?? dayData.windspeed * 1.3;

  const metrics = [
    {
      label: t('wind'),
      value: formatWind(dayData.windspeed, windUnit),
      sub: `${windDirection(dayData.winddirection)} · ${t('gusts')} ${formatWind(gusts, windUnit)}`,
      accent: true,
    },
    {
      label: t('feels.like'),
      value: `${Math.round(feelsLike)}°`,
      sub: `💧 ${Math.round(humidity)}%`,
    },
    {
      label: t('uv'),
      value: Math.round(uvNow).toString(),
      sub: uvNow <= 2 ? '🟢 Faible' : uvNow <= 5 ? '🟡 Modéré' : uvNow <= 7 ? '🟠 Élevé' : '🔴 Très élevé',
    },
    {
      label: t('sunTimes'),
      value: `${formatTime(dayData.sunrise)} · ${formatTime(dayData.sunset)}`,
      sub: `${dayDuration(dayData.sunrise, dayData.sunset)} de jour`,
    },
  ];

  return (
    <div className="mx-4 grid grid-cols-2 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-xl bg-[var(--color-surface-2)] p-3">
          <div className="text-xs text-[var(--color-text-3)] mb-1">{m.label}</div>
          <div
            className={`font-mono text-base font-medium truncate ${
              m.accent ? 'text-[var(--color-golf-text)]' : 'text-[var(--color-text)]'
            }`}
          >
            {m.value}
          </div>
          <div className="text-xs text-[var(--color-text-3)] mt-0.5 leading-snug">{m.sub}</div>
        </div>
      ))}
    </div>
  );
}
