export default function NavBar({ activeTab, onTab, t }) {
  const tabs = [
    { id: 'cities', labelKey: 'nav.cities', icon: '🏙️' },
    { id: 'golf',   labelKey: 'nav.golf',   icon: '⛳' },
    { id: 'settings', labelKey: 'nav.settings', icon: '⚙️' },
  ];

  return (
    <nav className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex">
      {tabs.map(({ id, labelKey, icon }) => {
        const active = id === activeTab;
        const indicatorColor =
          id === 'cities' ? 'bg-[var(--color-city)]'
          : id === 'golf' ? 'bg-[var(--color-golf)]'
          : 'bg-[var(--color-text-2)]';
        return (
          <button
            key={id}
            onClick={() => onTab(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium relative transition-colors ${
              active ? 'text-[var(--color-text)]' : 'text-[var(--color-text-3)]'
            }`}
          >
            <span className="text-base">{icon}</span>
            <span>{t(labelKey)}</span>
            {active && (
              <span className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-t ${indicatorColor}`} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
