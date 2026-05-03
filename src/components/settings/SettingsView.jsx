import { useState } from 'react';
import LocationList from './LocationList.jsx';
import AddLocationModal from './AddLocationModal.jsx';
import { getModelName } from '../../services/weatherService.js';

export default function SettingsView({
  cities, golfs,
  addCity, removeCity, moveCity,
  addGolf, removeGolf, moveGolf,
  lang, setLang,
  windUnit, setWindUnit,
  t,
}) {
  const [modal, setModal] = useState(null);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 overflow-hidden">
      <Section title={t('settings.cities')}>
        <LocationList items={cities} onRemove={removeCity} onMove={moveCity} showModel t={t} />
        <AddButton onClick={() => setModal('city')} label={t('add.city')} color="city" />
      </Section>

      <Section title={t('settings.golfs')}>
        <LocationList items={golfs} onRemove={removeGolf} onMove={moveGolf} showModel t={t} />
        <AddButton onClick={() => setModal('golf')} label={t('add.golf')} color="golf" />
      </Section>

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
                {t(getModelName(loc.lat, loc.lon))}
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
