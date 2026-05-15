import { getWeatherIcon, getWeatherLabel } from '../../utils/weatherUtils.js';
import { SCORE_COLORS } from '../../utils/golfScore.js';

export default function ActivityHeroCard({ dayData, scoreResult, color, lang, windUnit, t }) {
  if (!dayData) return null;
  const { maxTemp, minTemp, weathercode, currentTemp } = dayData;
  const displayTemp = currentTemp ?? maxTemp;
  const icon = getWeatherIcon(weathercode);
  const label = getWeatherLabel(weathercode, lang);
  const cursorPct = Math.min(99, Math.max(1, scoreResult?.score ?? 0));

  return (
    <div className="mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: color }}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-5xl font-light text-white" style={{ letterSpacing: '-0.04em' }}>
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

      {scoreResult && (
        <div className="px-4 pb-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{scoreResult.icon}</span>
                  <span className="text-white font-semibold text-lg">{t(scoreResult.labelKey)}</span>
                </div>
              </div>
              <div className="font-mono text-4xl font-light text-white" style={{ letterSpacing: '-0.02em' }}>
                {scoreResult.score}
              </div>
            </div>
            <div className="relative mb-1">
              <div className="h-3 rounded-full w-full" style={{
                background: 'linear-gradient(to right, var(--color-bad) 0%, var(--color-hard) 33%, var(--color-good) 66%, var(--color-ideal) 100%)',
              }} />
              <div className="absolute top-0 h-3 w-0.5 bg-white rounded shadow-lg -translate-x-1/2" style={{ left: `${cursorPct}%` }} />
              <div className="absolute -translate-x-1/2 mt-0.5" style={{ left: `${cursorPct}%`, top: '100%' }}>
                <div className="w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '6px solid white', transform: 'rotate(180deg)' }} />
              </div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-white/50 text-xs">{t('score.bad')}</span>
              <span className="text-white/50 text-xs">{t('score.ideal')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
