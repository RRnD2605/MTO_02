export default function GolfScoreBadge({ score, level, icon, labelKey, scoreInputs, windUnit, t }) {
  // Clamp cursor between 1% and 99% so it stays visible
  const cursorPct = Math.min(99, Math.max(1, score));

  return (
    <div className="px-4 pb-4">
      <div className="bg-white/10 rounded-xl p-4">
        {/* Score number + label */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <span className="text-white font-semibold text-lg">{t(labelKey)}</span>
            </div>
            {scoreInputs && (
              <div className="text-white/60 text-xs mt-1 font-mono">
                {Math.round(scoreInputs.windspeed)} km/h · ↑{Math.round(scoreInputs.windgusts)} km/h · 💧{scoreInputs.rainProb}%
              </div>
            )}
          </div>
          <div
            className="font-mono text-4xl font-light text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            {score}
          </div>
        </div>

        {/* Gradient gauge */}
        <div className="relative mb-1">
          <div
            className="h-3 rounded-full w-full"
            style={{
              background:
                'linear-gradient(to right, var(--color-bad) 0%, var(--color-hard) 33%, var(--color-good) 66%, var(--color-ideal) 100%)',
            }}
          />
          {/* Cursor: white vertical bar */}
          <div
            className="absolute top-0 h-3 w-0.5 bg-white rounded shadow-lg -translate-x-1/2"
            style={{ left: `${cursorPct}%` }}
          />
          {/* Triangle below cursor */}
          <div
            className="absolute -translate-x-1/2 mt-0.5"
            style={{ left: `${cursorPct}%`, top: '100%' }}
          >
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '6px solid white',
                transform: 'rotate(180deg)',
              }}
            />
          </div>
        </div>

        {/* Zone labels */}
        <div className="flex justify-between mt-3">
          <span className="text-white/50 text-xs">{t('score.bad')}</span>
          <span className="text-white/50 text-xs hidden sm:block">{t('score.hard')}</span>
          <span className="text-white/50 text-xs hidden sm:block">{t('score.good')}</span>
          <span className="text-white/50 text-xs">{t('score.ideal')}</span>
        </div>
      </div>
    </div>
  );
}
