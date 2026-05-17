import { useState } from 'react';
import LocationList from './LocationList.jsx';
import AddLocationModal from './AddLocationModal.jsx';
import { getModelName } from '../../services/weatherService.js';

const TAB_META = {
  cities: { labelKey: 'nav.cities',   color: '#2B6CB0' },
  golf:   { labelKey: 'nav.golf',     color: '#1B4D3E' },
  rando:  { labelKey: 'nav.rando',    color: '#27500A' },
  vtt:    { labelKey: 'nav.vtt',      color: '#8B3A0F' },
};

export default function SettingsView({
  cities, golfs,
  addCity, removeCity, setCities,
  addGolf, removeGolf, setGolfs,
  lang, setLang,
  windUnit, setWindUnit,
  enabledTabs, toggleTab, allContentTabs,
  t,
}) {
  const [modal, setModal] = useState(null);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 overflow-hidden bg-[var(--color-bg)]">

      {/* Onglets actifs */}
      <Section title={t('settings.tabs')}>
        <div className="flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)]">
          {allContentTabs.map((id) => {
            const meta = TAB_META[id];
            const enabled = enabledTabs.includes(id);
            const isLast = enabled && enabledTabs.length <= 1;
            return (
              <div
                key={id}
                className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-b last:border-b-0 border-[var(--color-border)]"
              >
                <span className="text-sm text-[var(--color-text)]">{t(meta.labelKey)}</span>
                <button
                  onClick={() => { if (!isLast) toggleTab(id, !enabled); }}
                  disabled={isLast}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isLast ? 'opacity-40' : ''}`}
                  style={{ backgroundColor: enabled ? meta.color : 'var(--color-border)' }}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Villes */}
      <Section title={t('settings.cities')}>
        <LocationList
          items={cities}
          onRemove={removeCity}
          onReorder={setCities}
        />
        <AddButton onClick={() => setModal('city')} label={t('add.city')} color="city" />
      </Section>

      {/* Golfs */}
      <Section title={t('settings.golfs')}>
        <LocationList
          items={golfs}
          onRemove={removeGolf}
          onReorder={setGolfs}
        />
        <AddButton onClick={() => setModal('golf')} label={t('add.golf')} color="golf" />
      </Section>

      {/* Unité de vent */}
      <Section title={t('settings.wind.unit')}>
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)]">
          {['kmh', 'knots'].map((u) => (
            <button
              key={u}
              onClick={() => setWindUnit(u)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                windUnit === u
                  ? 'bg-[var(--color-city)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-2)]'
              }`}
            >
              {t(`settings.wind.${u}`)}
            </button>
          ))}
        </div>
      </Section>

      {/* Langue */}
      <Section title={t('settings.lang')}>
        <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)]">
          {['fr', 'en'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                lang === l
                  ? 'bg-[var(--color-city)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-2)]'
              }`}
            >
              {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </Section>

      {/* Sources météo */}
      <Section title={t('settings.sources')}>
        <p className="text-xs text-[var(--color-text-3)] mb-2">{t('settings.sources.subtitle')}</p>
        <div className="flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)]">
          {[
            ...cities.map((l) => ({ ...l, type: 'city' })),
            ...golfs.map((l) => ({ ...l, type: 'golf' })),
          ].map((loc) => (
            <div
              key={`${loc.type}-${loc.id}`}
              className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-surface)] border-b last:border-b-0 border-[var(--color-border)]"
            >
              <span className="text-sm text-[var(--color-text)] truncate mr-2">{loc.name}</span>
              <span className="text-xs font-mono text-[var(--color-text-3)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full flex-shrink-0">
                {t(getModelName())}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {modal && (
        <AddLocationModal
          type={modal}
          onAdd={modal === 'golf' ? addGolf : addCity}
          onClose={() => setModal(null)}
          t={t}
          existingIds={(modal === 'golf' ? golfs : cities).map((l) => l.id)}
        />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-3)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function AddButton({ onClick, label, color }) {
  const bg = color === 'golf' ? 'var(--color-golf-light)' : 'var(--color-city-bg)';
  const fg = color === 'golf' ? 'var(--color-golf-text)' : 'var(--color-city-text)';
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
      style={{ backgroundColor: bg, color: fg }}
    >
      <span>+</span>
      <span>{label}</span>
    </button>
  );
}
