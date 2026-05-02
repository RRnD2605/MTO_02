import { getWeatherIcon } from '../../utils/weatherUtils.js';

const DAY_LABELS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function ForecastList({ weatherData, selectedIndex, onSelect, t }) {
  if (!weatherData) return null;
  const { daily } = weatherData;
  if (!daily?.time) return null;

  return (
    <div className="px-4 pb-4">
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        {daily.time.map((date, i) => {
          const label =
            i === 0 ? t('today')
            : i === 1 ? t('tomorrow')
            : DAY_LABELS_FR[new Date(date).getDay()];
          const rainProb = daily.precipitation_probability_max[i];
          const isSelected = i === selectedIndex;

          return (
            <button
              key={date}
              onClick={() => onSelect(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b last:border-b-0 border-[var(--color-border)] transition-colors text-left ${
                isSelected ? 'bg-[var(--color-city-bg)]' : 'hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <span className="w-12 text-sm font-medium text-[var(--color-text-2)] flex-shrink-0">{label}</span>
              <span className="text-lg">{getWeatherIcon(daily.weathercode[i])}</span>
              <div className="flex-1 mx-2">
                <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-400"
                    style={{ width: `${rainProb}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono text-blue-400 w-8 text-right">{rainProb}%</span>
              <div className="flex gap-1.5 text-sm font-mono flex-shrink-0 w-16 justify-end">
                <span className="font-medium text-[var(--color-text)]">
                  {Math.round(daily.temperature_2m_max[i])}°
                </span>
                <span className="text-[var(--color-text-3)]">
                  {Math.round(daily.temperature_2m_min[i])}°
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
