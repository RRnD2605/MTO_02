import { getWeatherIcon, getWeatherLabel } from '../../utils/weatherUtils.js';
import { computeGolfScore } from '../../utils/golfScore.js';
import GolfScoreBadge from './GolfScoreBadge.jsx';

export default function GolfHeroCard({ dayData, lang, windUnit, t }) {
  if (!dayData) return null;
  const { maxTemp, minTemp, weathercode, currentTemp } = dayData;

  const now = new Date();
  const currentHour = now.getHours();

  // Use current hour for today's real-time score; fall back to 10h or first available
  const currentHourData =
    dayData.hours?.find((h) => h.hour === currentHour) ||
    dayData.hours?.find((h) => h.hour === 10) ||
    dayData.hours?.[0];

  const scoreInputs = currentHourData
    ? {
        windspeed:   currentHourData.windspeed,
        windgusts:   currentHourData.windgusts,
        rainProb:    currentHourData.rainProb,
        uvIndex:     currentHourData.uvIndex,
        weathercode: currentHourData.weathercode,
      }
    : {
        windspeed:   dayData.windspeed ?? 0,
        windgusts:   (dayData.windspeed ?? 0) * 1.3,
        rainProb:    dayData.rainProb ?? 0,
        uvIndex:     dayData.uvMax ?? 0,
        weathercode: dayData.weathercode ?? 0,
      };

  const scoreResult = computeGolfScore(scoreInputs);
  const displayTemp = currentTemp ?? maxTemp;
  const icon = getWeatherIcon(weathercode);
  const label = getWeatherLabel(weathercode, lang);

  return (
    <div className="mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: '#1B4D3E' }}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div
              className="font-mono text-5xl font-light text-white"
              style={{ letterSpacing: '-0.04em' }}
            >
              {Math.round(displayTemp)}°
            </div>
            <div className="mt-1 text-sm text-white/70">{label}</div>
            <div className="mt-0.5 flex gap-2 text-sm font-mono">
              <span className="text-white font-medium">{Math.round(maxTemp)}°</span>
              <span className="text-white/50">/</span>
              <span className="text-white/50">{Math.round(minTemp)}°</span>
            </div>
          </div>
          <div className="text-5xl">{icon}</div>
        </div>
      </div>
      <GolfScoreBadge
        score={scoreResult.score}
        level={scoreResult.level}
        icon={scoreResult.icon}
        labelKey={scoreResult.labelKey}
        scoreInputs={scoreInputs}
        windUnit={windUnit}
        t={t}
      />
    </div>
  );
}
