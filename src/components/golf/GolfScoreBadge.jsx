import { SCORE_COLORS } from '../../utils/golfScore.js';

export default function GolfScoreBadge({ score, level, icon, labelKey, t }) {
  const color = SCORE_COLORS[level] || SCORE_COLORS.bad;

  const segments = [
    { threshold: 25, level: 'bad',   color: 'var(--color-bad)'   },
    { threshold: 50, level: 'hard',  color: 'var(--color-hard)'  },
    { threshold: 75, level: 'good',  color: 'var(--color-good)'  },
    { threshold: 101, level: 'ideal', color: 'var(--color-ideal)' },
  ];

  return (
    <div className="px-4 pb-2">
      <div className="bg-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <span className="text-white font-medium text-lg">{t(labelKey)}</span>
            </div>
            <div className="text-white/70 text-sm mt-0.5">{t('playability')}</div>
          </div>
          <div className="font-mono text-4xl font-light text-white" style={{ letterSpacing: '-0.02em' }}>
            {score}
          </div>
        </div>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          {segments.map((seg) => (
            <div
              key={seg.level}
              className="flex-1 rounded-full transition-opacity"
              style={{
                backgroundColor: seg.color,
                opacity: score >= seg.threshold - 25 ? 1 : 0.25,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
