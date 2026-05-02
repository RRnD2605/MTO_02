import { getModelName } from '../../services/weatherService.js';

export default function LocationList({ items, onRemove, showModel, t }) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)]">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b last:border-b-0 border-[var(--color-border)]"
        >
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--color-text)]">{item.name}</div>
            {item.label && item.label !== item.name && (
              <div className="text-xs text-[var(--color-text-3)]">{item.label}</div>
            )}
            {showModel && (
              <div className="text-xs text-[var(--color-text-3)] font-mono mt-0.5">
                {t(getModelName(item.lat, item.lon))}
              </div>
            )}
          </div>
          <button
            onClick={() => onRemove(item.id)}
            disabled={items.length <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-3)] hover:bg-[var(--color-alert-bg)] hover:text-[var(--color-alert-text)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            title={items.length <= 1 ? t('delete.confirm') : t('delete')}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
