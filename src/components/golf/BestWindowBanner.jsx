export default function BestWindowBanner({ window, t }) {
  if (!window) return null;
  return (
    <div className="mx-4 rounded-xl bg-[var(--color-golf-light)] px-4 py-3 flex items-center gap-3">
      <span className="text-2xl">⛳</span>
      <div>
        <div className="font-medium text-[var(--color-golf-text)] text-sm">{t('best.window')}</div>
        <div className="text-[var(--color-golf-text)] font-mono text-lg font-medium">
          {window.start} → {window.end}
        </div>
        <div className="text-xs text-[var(--color-text-3)]">
          {t('best.window.subtitle')} · {window.score}/100
        </div>
      </div>
    </div>
  );
}
