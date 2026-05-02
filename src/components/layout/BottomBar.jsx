export default function BottomBar({ onRefresh, updatedAt, t }) {
  const timeStr = updatedAt
    ? updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-between px-4 py-2 safe-bottom">
      <span className="text-xs text-[var(--color-text-3)] font-mono">
        {timeStr ? `${t('updated.at')} ${timeStr}` : ''}
      </span>
      <button
        onClick={onRefresh}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-2)] text-sm font-medium hover:bg-[var(--color-border)] transition-colors"
      >
        <span>↻</span>
        <span>{t('refresh')}</span>
      </button>
    </div>
  );
}
