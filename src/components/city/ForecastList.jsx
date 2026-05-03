import { getWeatherIcon } from '../../utils/weatherUtils.js';

const DAY_LABELS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function rainColor(prob) {
  if (prob < 20) return '#B5D4F4';
  if (prob < 50) return '#378ADD';
  if (prob < 75) return '#185FA5';
  return '#0C447C';
}

export default function ForecastList({ weatherData, selectedIndex, onSelect, t }) {
  if (!weatherData) return null;
  const { daily } = weatherData;
  if (!daily?.time) return null;

  return (
    <div className="px-4 pb-4 overflow-hidden">
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
        {daily.time.map((date, i) => {
          const label =
            i === 0 ? t('today')
            : i === 1 ? t('tomorrow')
            : DAY_LABELS_FR[new Date(date).getDay()];
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
              {/* Day label — wider to avoid truncation */}
              <span className="w-16 text-sm font-medium text-[var(--color-text-2)] flex-shrink-0 truncate">
                {label}
              </span>
              <span className="text-lg flex-shrink-0">{getWeatherIcon(daily.weathercode[i])}</span>
              {/* Rain dot + % */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span
                  className="inline-block rounded-full flex-shrink-0"
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: rainColor(rainProb),
                  }}
                />
                <span className="text-xs font-mono" style={{ color: rainColor(rainProb) }}>
                  {rainProb}%
                </span>
              </div>
              {/* Spacer */}
              <div className="flex-1" />
              {/* Temps */}
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
