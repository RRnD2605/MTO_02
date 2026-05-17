const TAB_COLORS = {
  cities:   '#0E7490',
  golf:     '#1B4D3E',
  rando:    '#27500A',
  vtt:      '#8B3A0F',
  settings: '#6B6860',
};

function CitiesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 22v-2M19.07 19.07l-1.41-1.41M22 12h-2M19.07 4.93l-1.41 1.41"/>
      <path d="M9 18H7a4 4 0 0 1 0-8 5 5 0 0 1 9.9-1A3.5 3.5 0 0 1 18 16.5"/>
      <path d="M9 18a3 3 0 0 0 6 0"/>
    </svg>
  );
}

function GolfIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 18v-6M12 12l6-3-6-3v6z"/>
      <path d="M5 21c2-1 4-1.5 7-1.5s5 .5 7 1.5"/>
    </svg>
  );
}

function RandoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 20l4-8 4 4 4-6 4 10"/>
    </svg>
  );
}

function VttIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5" cy="17" r="3"/>
      <circle cx="19" cy="17" r="3"/>
      <path d="M5 17l4-10h3l3 6h3M12 7l2 4"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

const ALL_TABS = [
  { id: 'cities',   labelKey: 'nav.cities',   Icon: CitiesIcon  },
  { id: 'golf',     labelKey: 'nav.golf',     Icon: GolfIcon    },
  { id: 'rando',    labelKey: 'nav.rando',    Icon: RandoIcon   },
  { id: 'vtt',      labelKey: 'nav.vtt',      Icon: VttIcon     },
  { id: 'settings', labelKey: 'nav.settings', Icon: SettingsIcon },
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
      {visibleTabs.map(({ id, labelKey, Icon }) => {
        const active = id === activeTab;
        const color = active ? TAB_COLORS[id] : 'var(--color-text-3)';
        return (
          <button
            key={id}
            onClick={() => onTab(id)}
            className="flex flex-col items-center py-3 gap-0.5 font-medium relative transition-colors flex-shrink-0"
            style={{ minWidth: '4rem', flex: '1 1 0', color }}
          >
            <Icon />
            <span style={{ fontSize: '10px' }}>{t(labelKey)}</span>
            {active && (
              <span
                className="absolute bottom-0 left-3 right-3 rounded-t"
                style={{ height: '2px', backgroundColor: TAB_COLORS[id] }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
