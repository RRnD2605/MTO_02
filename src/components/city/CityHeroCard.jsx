import { getWeatherIcon, getWeatherLabel } from '../../utils/weatherUtils.js';

export default function CityHeroCard({ dayData, lang, t }) {
  if (!dayData) return null;
  const { maxTemp, minTemp, weathercode, currentTemp } = dayData;
  // Pour j0 : température en temps réel. Pour j>0 : tempMax (pas de "current" disponible)
  const displayTemp = currentTemp != null ? currentTemp : maxTemp;
  const icon = getWeatherIcon(weathercode);
  const label = getWeatherLabel(weathercode, lang);

  return (
    <div className="px-4 py-6">
      <div className="bg-[var(--color-city-bg)] rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div
              className="font-mono text-7xl font-light tracking-tight text-[var(--color-city-text)]"
              style={{ letterSpacing: '-0.04em' }}
            >
              {Math.round(displayTemp)}°
            </div>
            <div className="mt-2 text-sm text-[var(--color-text-2)]">{label}</div>
            <div className="mt-1 flex gap-2 text-sm font-mono">
              <span className="text-[var(--color-city-text)] font-medium">{Math.round(maxTemp)}°</span>
              <span className="text-[var(--color-text-3)]">/</span>
              <span className="text-[var(--color-text-3)]">{Math.round(minTemp)}°</span>
            </div>
          </div>
          <div className="text-6xl">{icon}</div>
        </div>
      </div>
    </div>
  );
}
