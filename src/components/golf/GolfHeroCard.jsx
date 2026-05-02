import { getWeatherIcon, getWeatherLabel } from '../../utils/weatherUtils.js';
import { computeGolfScore } from '../../utils/golfScore.js';
import GolfScoreBadge from './GolfScoreBadge.jsx';

export default function GolfHeroCard({ dayData, lang, t }) {
  if (!dayData) return null;
  const { maxTemp, minTemp, weathercode, currentTemp, windspeed, uvMax, rainProb } = dayData;

  const repHour = dayData.hours?.find((h) => h.hour === 10) || dayData.hours?.[0];
  const scoreResult = repHour
    ? computeGolfScore({
        windspeed: repHour.windspeed,
        windgusts: repHour.windgusts,
        rainProb: repHour.rainProb,
        uvIndex: repHour.uvIndex,
      })
    : computeGolfScore({ windspeed, windgusts: windspeed * 1.3, rainProb, uvIndex: uvMax });

  const displayTemp = currentTemp ?? maxTemp;
  const icon = getWeatherIcon(weathercode);
  const label = getWeatherLabel(weathercode, lang);

  return (
    <div className="mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: '#1B4D3E' }}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div
              className="font-mono text-7xl font-light text-white"
              style={{ letterSpacing: '-0.04em' }}
            >
              {Math.round(displayTemp)}°
            </div>
            <div className="mt-2 text-sm text-white/70">{label}</div>
            <div className="mt-1 flex gap-2 text-sm font-mono">
              <span className="text-white font-medium">{Math.round(maxTemp)}°</span>
              <span className="text-white/50">/</span>
              <span className="text-white/50">{Math.round(minTemp)}°</span>
            </div>
          </div>
          <div className="text-6xl">{icon}</div>
        </div>
      </div>
      <GolfScoreBadge
        score={scoreResult.score}
        level={scoreResult.level}
        icon={scoreResult.icon}
        labelKey={scoreResult.labelKey}
        t={t}
      />
    </div>
  );
}
