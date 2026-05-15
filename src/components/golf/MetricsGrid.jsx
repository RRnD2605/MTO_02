import { formatWind, windDirection } from '../../utils/weatherUtils.js';
import RainDrop from '../shared/RainDrop.jsx';

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

function MetricCard({ icon, sub, label, value, extra, accent }) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-2)] p-2">
      <div className="flex items-center gap-1 mb-1">
        {icon && <span className="text-sm">{icon}</span>}
        {sub && <span className="text-xs text-[var(--color-text-3)] truncate">{sub}</span>}
      </div>
      <div className="text-xs text-[var(--color-text-3)] mb-0.5">{label}</div>
      <div className={`font-mono text-base font-medium truncate ${
        accent ? 'text-[var(--color-golf-text)]' : 'text-[var(--color-text)]'
      }`}>
        {value}
      </div>
      {extra && <div className="text-xs text-[var(--color-text-3)] mt-0.5 leading-snug">{extra}</div>}
    </div>
  );
}

export default function MetricsGrid({ dayData, windUnit, t }) {
  if (!dayData) return null;

  const feelsLike = dayData.hours?.find((h) => h.hour >= 12)?.apparentTemp ?? dayData.maxTemp;
  const humidity = dayData.hours?.find((h) => h.hour >= 12)?.humidity ?? 0;
  const rainProb = dayData.rainProb ?? 0;
  const uvNow = dayData.uvMax ?? 0;
  const gusts = dayData.hours?.find((h) => h.hour >= 12)?.windgusts ?? dayData.windspeed * 1.3;

  const uvLabel = uvNow <= 2 ? '🟢 Faible' : uvNow <= 5 ? '🟡 Modéré' : uvNow <= 7 ? '🟠 Élevé' : '🔴 Très élevé';

  return (
    <div className="mx-4 grid grid-cols-2 gap-3">
      <MetricCard
        icon="💨"
        sub={windDirection(dayData.winddirection)}
        label={t('wind')}
        value={formatWind(dayData.windspeed, windUnit)}
        extra={`↑ ${formatWind(gusts, windUnit)}`}
        accent
      />
      <MetricCard
        icon="🌡️"
        sub={<span><RainDrop prob={rainProb} />{Math.round(humidity)}%</span>}
        label={t('feels.like')}
        value={`${Math.round(feelsLike)}°`}
      />
      <MetricCard
        icon="☀️"
        sub={uvLabel}
        label={t('uv')}
        value={Math.round(uvNow).toString()}
      />
      <MetricCard
        icon="🌅"
        sub={`${dayDuration(dayData.sunrise, dayData.sunset)} de jour`}
        label={t('sunTimes')}
        value={`${formatTime(dayData.sunrise)} · ${formatTime(dayData.sunset)}`}
      />
    </div>
  );
}
