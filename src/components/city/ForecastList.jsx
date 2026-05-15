import { getWeatherIcon } from '../../utils/weatherUtils.js';

function rainColor(prob) {
  if (prob < 20) return '#B5D4F4';
  if (prob < 50) return '#378ADD';
  if (prob < 75) return '#185FA5';
  return '#0C447C';
}

function dayLabel(date, i, t) {
  if (i === 0) return t('today');       // "Aujourd'hui" ou "Today"
  if (i === 1) return t('tomorrow');    // "Demain"
  // Abbréviations 3 lettres toujours dans la locale fr
  return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' });
}

export default function ForecastList({ weatherData, selectedIndex, onSelect, t }) {
  if (!weatherData) return null;
  const { daily } = weatherData;
  if (!daily?.time) return null;

  // Exclure les jours sans données valides (tempMax et tempMin tous deux à 0)
  const validDays = daily.time
    .map((date, i) => ({ date, i }))
    .filter(({ i }) => {
      const max = daily.temperature_2m_max?.[i];
      const min = daily.temperature_2m_min?.[i];
      return max != null && min != null;
    });

  return (
    <div className="px-4 pb-4 overflow-hidden">
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        {validDays.map(({ date, i }) => {
          const label = dayLabel(date, i, t);
          const rainProb = daily.precipitation_probability_max?.[i] ?? 0;
          const isSelected = i === selectedIndex;

          return (
            <button
              key={date}
              onClick={() => onSelect(i)}
              className={`w-full flex items-center gap-3 px-3 py-3 border-b last:border-b-0 border-[var(--color-border)] transition-colors text-left ${
                isSelected ? 'bg-[var(--color-city-bg)]' : 'hover:bg-[var(--color-surface-2)]'
              }`}
            >
              {/* Label jour — nowrap pour éviter toute coupure */}
              <span
                className="text-sm font-medium text-[var(--color-text-2)] flex-shrink-0"
                style={{ minWidth: '5rem' }}
              >
                {label}
              </span>

              <span className="text-lg flex-shrink-0">{getWeatherIcon(daily.weathercode[i])}</span>

              {/* Pastille pluie + % */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span
                  className="inline-block rounded-full"
                  style={{ width: 8, height: 8, backgroundColor: rainColor(rainProb) }}
                />
                <span className="text-xs font-mono" style={{ color: rainColor(rainProb) }}>
                  {rainProb}%
                </span>
              </div>

              <div className="flex-1" />

              {/* Températures */}
              <div className="flex gap-1.5 text-sm font-mono flex-shrink-0">
                <span className="font-medium text-[var(--color-text)]">
                  ↑{Math.round(daily.temperature_2m_max[i])}°
                </span>
                <span className="text-[var(--color-text-3)]">
                  ↓{Math.round(daily.temperature_2m_min[i])}°
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
