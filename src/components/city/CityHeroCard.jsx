import { getWeatherIcon, getWeatherLabel } from '../../utils/weatherUtils.js';

export default function CityHeroCard({ dayData, lang, t }) {
  if (!dayData) return null;
  const { maxTemp, minTemp, weathercode, currentTemp } = dayData;
  const displayTemp = currentTemp != null ? currentTemp : maxTemp;
  const icon = getWeatherIcon(weathercode);
  const label = getWeatherLabel(weathercode, lang);

  return (
    <div className="px-4 py-1">
      <div className="rounded-2xl p-4" style={{ backgroundColor: '#313C48' }}>
        <div className="flex items-start justify-between">
          <div>
            <div
              className="font-mono text-7xl font-light tracking-tight text-white"
              style={{ letterSpacing: '-0.04em' }}
            >
              {Math.round(displayTemp)}°
            </div>
            <div className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {label}
            </div>
            <div className="mt-1 flex gap-2 text-sm font-mono">
              <span className="font-medium" style={{ color: '#9DB8CC' }}>
                {Math.round(maxTemp)}°
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                {Math.round(minTemp)}°
              </span>
            </div>
          </div>
          <div className="text-6xl">{icon}</div>
        </div>
      </div>
    </div>
  );
}
