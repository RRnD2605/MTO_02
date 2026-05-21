import { getWeatherIcon, getWeatherLabel } from '../../utils/weatherUtils.js';

function dayLabelFromDate(date) {
  if (!date) return '';
  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (date === today)    return "Aujourd'hui";
  if (date === tomorrow) return 'Demain';
  return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' });
}

export default function ActivityHeroCard({ dayData, scoreResult, color, lang, windUnit, t, locationName, selectedDate }) {
  if (!dayData) return null;
  const { maxTemp, minTemp, weathercode, currentTemp } = dayData;

  const detailHour =
    dayData.hours?.find((h) => h.hour === 12) ||
    dayData.hours?.find((h) => h.hour === 10) ||
    dayData.hours?.[0];

  const displayTemp  = currentTemp ?? maxTemp;
  const icon         = getWeatherIcon(weathercode);
  const weatherDesc  = getWeatherLabel(weathercode, lang);
  const scorePercent = scoreResult ? Math.min(99, Math.max(1, scoreResult.score)) : null;
  const windLabel    = detailHour ? `${Math.round(detailHour.windspeed)} km/h` : '—';
  const gustLabel    = detailHour ? `${Math.round(detailHour.windgusts ?? detailHour.windspeed * 1.3)} km/h` : '—';
  const rainLabel    = detailHour ? `${detailHour.rainProb ?? 0}%` : '—';
  const dayLabel     = dayLabelFromDate(selectedDate);

  const levelLabel =
    scoreResult?.level === 'ideal' ? 'Conditions idéales' :
    scoreResult?.level === 'good'  ? 'Bonnes conditions'  :
    scoreResult?.level === 'hard'  ? 'Conditions difficiles' :
                                     'Déconseillé';

  return (
    <div className="rounded-2xl p-4 mx-4 text-white" style={{ backgroundColor: color }}>
      {/* Ligne du haut : temp + infos + icône */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="font-light leading-none" style={{ fontSize: 48, letterSpacing: '-0.03em' }}>
            {Math.round(displayTemp)}<sup className="text-lg align-super font-normal">°</sup>
          </div>
          <div>
            {(locationName || dayLabel) && (
              <div className="text-[11px] mb-0.5" style={{ opacity: 0.45 }}>
                {[locationName, dayLabel].filter(Boolean).join(' · ')}
              </div>
            )}
            <div className="text-sm" style={{ opacity: 0.65 }}>{weatherDesc}</div>
            <div className="flex gap-2 text-sm font-medium mt-0.5">
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>↑ {Math.round(maxTemp)}°</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>↓ {Math.round(minTemp)}°</span>
            </div>
          </div>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>

      {scoreResult && (
        <>
          {/* Score badge + numéro */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className="px-2.5 py-1 rounded-md text-[12px] font-medium border"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)',
                borderColor: 'rgba(255,255,255,0.25)',
              }}
            >
              {scoreResult.icon} {levelLabel}
            </div>
            <div className="text-[26px] font-light text-white ml-auto">{scoreResult.score}</div>
          </div>

          {/* Détail vent/rafales/pluie */}
          <div className="text-[11px] mb-2" style={{ opacity: 0.5 }}>
            {windLabel} · ↑{gustLabel} · 💧{rainLabel}
          </div>

          {/* Jauge 4 zones */}
          <div className="h-1 rounded-full flex relative overflow-visible">
            <div className="flex-1 rounded-l-full" style={{ backgroundColor: '#D94F4F' }} />
            <div className="flex-1" style={{ backgroundColor: '#D4891A' }} />
            <div className="flex-1" style={{ backgroundColor: '#8BBF3A' }} />
            <div className="flex-1 rounded-r-full" style={{ backgroundColor: '#52A855' }} />
            <div
              style={{ left: `${scorePercent}%` }}
              className="absolute top-[-2px] w-[2px] h-[8px] bg-white rounded-sm -translate-x-1/2"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px]" style={{ opacity: 0.4 }}>Déconseillé</span>
            <span className="text-[9px]" style={{ opacity: 0.4 }}>Conditions idéales</span>
          </div>
        </>
      )}
    </div>
  );
}
