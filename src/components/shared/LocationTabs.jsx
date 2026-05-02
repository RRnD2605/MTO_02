export default function LocationTabs({ locations, activeId, onSelect, accentClass }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-4">
      {locations.map((loc) => (
        <button
          key={loc.id}
          onClick={() => onSelect(loc.id)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            loc.id === activeId
              ? accentClass
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-2)]'
          }`}
        >
          {loc.name}
        </button>
      ))}
    </div>
  );
}
