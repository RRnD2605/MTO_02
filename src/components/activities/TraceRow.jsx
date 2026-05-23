import { useState, useRef } from 'react';

export default function TraceRow({ trace, color, onDelete, onRename, onSelect }) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(trace.name);
  const longPressTimer = useRef(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setRenaming(true), 600);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  if (renaming) {
    return (
      <div className="flex items-center gap-2 p-3 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)]">
        <input
          className="flex-1 text-sm bg-transparent outline-none text-[var(--color-text)]"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          autoFocus
        />
        <button
          onClick={() => { onRename(newName); setRenaming(false); }}
          className="text-xs font-medium text-white px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: color }}
        >
          OK
        </button>
        <button
          onClick={() => setRenaming(false)}
          className="text-xs text-[var(--color-text-3)]"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 p-3 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] cursor-pointer active:opacity-70"
      onClick={onSelect}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={(e) => { e.preventDefault(); setRenaming(true); }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--color-text)] truncate">{trace.name}</div>
        <div className="text-xs text-[var(--color-text-3)] mt-0.5">
          {trace.distance?.toFixed(1)} km · {trace.elevationGain} m D+ · {new Date(trace.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="text-[var(--color-text-3)] opacity-40 text-sm flex-shrink-0 px-1"
      >
        ✕
      </button>
    </div>
  );
}
