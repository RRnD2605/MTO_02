function MapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      <path d="M12 18.5l-3-3a4 4 0 1 1 6 0l-3 3z"/>
      <path d="M12 18.5v3.5"/>
      <path d="M10 22h4"/>
      <path d="M3 7l9-4 9 4"/>
      <path d="M3 7v10"/>
      <path d="M21 7v10"/>
      <path d="M3 17l9 4 9-4"/>
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      <path d="M3 20l6-12 3 5 3-3 6 10H3z"/>
    </svg>
  );
}

export default function NavBar({ activeTab, onTab, t }) {
  const indicatorColor = (id) =>
    id === 'cities'     ? 'bg-[var(--color-city)]'
    : id === 'golf'     ? 'bg-[var(--color-golf)]'
    : id === 'activities' ? 'bg-[#27500A]'
    : 'bg-[var(--color-text-2)]';

  const tabs = [
    { id: 'cities',     labelKey: 'nav.cities',     renderIcon: () => <MapIcon /> },
    { id: 'golf',       labelKey: 'nav.golf',       renderIcon: () => <span className="text-base">⛳</span> },
    { id: 'activities', labelKey: 'nav.activities', renderIcon: () => <MountainIcon /> },
    { id: 'settings',   labelKey: 'nav.settings',   renderIcon: () => <span className="text-base">⚙️</span> },
  ];

  return (
    <nav className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex">
      {tabs.map(({ id, labelKey, renderIcon }) => {
        const active = id === activeTab;
        return (
          <button
            key={id}
            onClick={() => onTab(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium relative transition-colors ${
              active ? 'text-[var(--color-text)]' : 'text-[var(--color-text-3)]'
            }`}
          >
            {renderIcon()}
            <span>{t(labelKey)}</span>
            {active && (
              <span className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-t ${indicatorColor(id)}`} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
