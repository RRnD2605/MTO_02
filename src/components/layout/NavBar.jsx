function MapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      <path d="M3 20l6-12 3 5 3-3 6 10H3z"/>
    </svg>
  );
}

function BikeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      <circle cx="5.5" cy="17.5" r="3.5"/>
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <path d="M15 6h-3l-2 5.5"/>
      <path d="M5.5 17.5L9 10l3 4 3-4 1.5 3.5"/>
      <path d="M15 6l2 4"/>
    </svg>
  );
}

const ALL_TABS = [
  { id: 'cities',   labelKey: 'nav.cities',   color: '#2B6CB0', renderIcon: () => <MapIcon /> },
  { id: 'golf',     labelKey: 'nav.golf',     color: '#1B4D3E', renderIcon: () => <span className="text-base leading-none">⛳</span> },
  { id: 'rando',    labelKey: 'nav.rando',    color: '#27500A', renderIcon: () => <MountainIcon /> },
  { id: 'vtt',      labelKey: 'nav.vtt',      color: '#8B3A0F', renderIcon: () => <BikeIcon /> },
  { id: 'settings', labelKey: 'nav.settings', color: null,      renderIcon: () => <span className="text-base leading-none">⚙️</span> },
];

export default function NavBar({ activeTab, onTab, t, enabledTabs }) {
  const visibleTabs = ALL_TABS.filter(
    ({ id }) => id === 'settings' || !enabledTabs || enabledTabs.includes(id)
  );

  return (
    <nav
      className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex"
      style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {visibleTabs.map(({ id, labelKey, color, renderIcon }) => {
        const active = id === activeTab;
        const accentColor = color ?? 'var(--color-text-2)';
        return (
          <button
            key={id}
            onClick={() => onTab(id)}
            className="flex flex-col items-center py-3 gap-0.5 text-xs font-medium relative transition-colors flex-shrink-0"
            style={{
              minWidth: '4rem',
              flex: '1 1 0',
              color: active ? accentColor : 'var(--color-text-3)',
            }}
          >
            {renderIcon()}
            <span style={{ fontSize: '10px' }}>{t(labelKey)}</span>
            {active && (
              <span
                className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
