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
  randoSpots, removeRandoSpot,
  vttSpots, removeVttSpot,
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

      {/* Spots Rando */}
      {enabledTabs.includes('rando') && (
        <Section title="Spots Rando">
          <div className="flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)]">
            {randoSpots.length === 0 ? (
              <div className="px-4 py-3 bg-[var(--color-surface)] text-xs text-[var(--color-text-3)]">
                Aucun spot sauvegardé
              </div>
            ) : randoSpots.map((spot) => (
              <div key={spot.id} className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b last:border-b-0 border-[var(--color-border)]">
                <span className="flex-1 text-sm text-[var(--color-text)] truncate">{spot.name}</span>
                <button
                  onClick={() => removeRandoSpot(spot.id)}
                  className="w-6 h-6 rounded-full bg-[#D94F4F] flex items-center justify-center flex-shrink-0"
                  aria-label="Supprimer"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <line x1="2" y1="2" x2="8" y2="8"/>
                    <line x1="8" y1="2" x2="2" y2="8"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Spots VTT */}
      {enabledTabs.includes('vtt') && (
        <Section title="Spots VTT">
          <div className="flex flex-col rounded-xl overflow-hidden border border-[var(--color-border)]">
            {vttSpots.length === 0 ? (
              <div className="px-4 py-3 bg-[var(--color-surface)] text-xs text-[var(--color-text-3)]">
                Aucun spot sauvegardé
              </div>
            ) : vttSpots.map((spot) => (
              <div key={spot.id} className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b last:border-b-0 border-[var(--color-border)]">
                <span className="flex-1 text-sm text-[var(--color-text)] truncate">{spot.name}</span>
                <button
                  onClick={() => removeVttSpot(spot.id)}
                  className="w-6 h-6 rounded-full bg-[#D94F4F] flex items-center justify-center flex-shrink-0"
                  aria-label="Supprimer"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <line x1="2" y1="2" x2="8" y2="8"/>
                    <line x1="8" y1="2" x2="2" y2="8"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

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

      {/* Guide des conditions */}
      <div className="pb-2">
        <h2 className="text-[10px] font-semibold text-[var(--color-text-3)] tracking-widest uppercase mb-3 mt-2">
          Guide des conditions
        </h2>
        <div className="flex flex-col gap-3">

          {/* ── GOLF ── */}
          <ConditionsAccordion title="Golf" icon="⛳" color="#1B4D3E">
            <CritRow
              icon="💨" label="Vent moyen + stabilité rafales" weight={50}
              zones={['#D94F4F','#D4891A','#8BBF3A','#52A855']}
              thresholds={[
                { label: '< 10 km/h · Idéal', bg: '#EAF3DE', color: '#27500A' },
                { label: '23 km/h · Limite',  bg: '#FEF3C7', color: '#92400E' },
                { label: '> 35 km/h · Stop',  bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <CritRow
              icon="💧" label="Pluie" weight={35}
              zones={['#D94F4F','#D4891A','#8BBF3A','#52A855']}
              thresholds={[
                { label: '< 5% · Idéal',  bg: '#EAF3DE', color: '#27500A' },
                { label: '25% · Limite',  bg: '#FEF3C7', color: '#92400E' },
                { label: '> 60% · Stop',  bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <CritRow
              icon="🔆" label="UV" weight={15}
              zones={['#52A855','#52A855','#8BBF3A','#D94F4F']}
              thresholds={[
                { label: '≤ 7 · OK',       bg: '#EAF3DE', color: '#27500A' },
                { label: '9–10 · Élevé',   bg: '#FEF3C7', color: '#92400E' },
                { label: '> 10 · Extrême', bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <TipBox
              title="⛈️ Orage"
              text="Si un orage est prévu (code météo ≥ 95), le score passe automatiquement à 0 et une alerte rouge s'affiche, quelle que soit la valeur des autres critères."
            />
            <TipBox
              title="📊 Score journée"
              text="Le score de la hero card est calculé sur les heures 9h–17h (70% moyenne + 30% pire heure), pour refléter les vraies conditions d'une partie."
            />
          </ConditionsAccordion>

          {/* ── RANDO ── */}
          <ConditionsAccordion title="Randonnée" icon="🥾" color="#27500A">
            <CritRow
              icon="💨" label="Vent" weight={25}
              zones={['#D94F4F','#D4891A','#8BBF3A','#52A855']}
              thresholds={[
                { label: '< 15 km/h · Idéal',    bg: '#EAF3DE', color: '#27500A' },
                { label: '30 km/h · Limite',      bg: '#FEF3C7', color: '#92400E' },
                { label: '> 50 km/h · Dangereux', bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <CritRow
              icon="💧" label="Pluie" weight={25}
              zones={['#D94F4F','#D4891A','#8BBF3A','#52A855']}
              thresholds={[
                { label: '< 10% · Idéal', bg: '#EAF3DE', color: '#27500A' },
                { label: '40% · Limite',  bg: '#FEF3C7', color: '#92400E' },
                { label: '> 70% · Stop',  bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <CritRow
              icon="🌡️" label="Température" weight={20}
              zones={['#D94F4F','#D4891A','#52A855','#D4891A']}
              thresholds={[
                { label: '8–22°C · Zone idéale', bg: '#EAF3DE', color: '#27500A' },
                { label: '< 0°C · Froid',        bg: '#FCEBEB', color: '#A32D2D' },
                { label: '> 28°C · Chaud',        bg: '#FEF3C7', color: '#92400E' },
              ]}
            />
            <CritRow
              icon="🌫️" label="Visibilité" weight={15}
              zones={['#D94F4F','#52A855','#52A855','#52A855']}
              note="Brouillard (code météo 45–49) = 0 pt automatiquement. Sinon = 15 pts."
            />
            <CritRow
              icon="🔆" label="UV" weight={15}
              zones={['#52A855','#52A855','#8BBF3A','#D94F4F']}
              thresholds={[
                { label: '≤ 7 · OK',       bg: '#EAF3DE', color: '#27500A' },
                { label: '9–10 · Élevé',   bg: '#FEF3C7', color: '#92400E' },
                { label: '> 10 · Extrême', bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <TipBox
              title="⛰️ Altitude"
              text="Le vent est particulièrement dangereux en crête. Au-dessus de 1500m, même 30 km/h peuvent déstabiliser. Prenez toujours un coupe-vent."
            />
          </ConditionsAccordion>

          {/* ── VTT ── */}
          <ConditionsAccordion title="VTT" icon="🚵" color="#8B3A0F">
            <CritRow
              icon="🌱" label="État des sols (pluie /6h)" weight={30}
              zones={['#D94F4F','#D4891A','#8BBF3A','#52A855']}
              thresholds={[
                { label: '0 mm · Secs · Idéal',    bg: '#EAF3DE', color: '#27500A' },
                { label: '4 mm · Humides',          bg: '#FEF3C7', color: '#92400E' },
                { label: '> 10 mm · Impraticable',  bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <CritRow
              icon="💧" label="Pluie en cours" weight={25}
              zones={['#D94F4F','#D4891A','#8BBF3A','#52A855']}
              thresholds={[
                { label: '< 5% · Idéal', bg: '#EAF3DE', color: '#27500A' },
                { label: '25% · Limite', bg: '#FEF3C7', color: '#92400E' },
                { label: '> 50% · Stop', bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <CritRow
              icon="💨" label="Vent / Rafales" weight={20}
              zones={['#D94F4F','#D4891A','#8BBF3A','#52A855']}
              thresholds={[
                { label: '< 25 km/h · Idéal',     bg: '#EAF3DE', color: '#27500A' },
                { label: '50 km/h · Limite',       bg: '#FEF3C7', color: '#92400E' },
                { label: '> 65 km/h · Dangereux',  bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <CritRow
              icon="🌡️" label="Température" weight={15}
              zones={['#D94F4F','#D4891A','#52A855','#D4891A']}
              thresholds={[
                { label: '5–28°C · Zone idéale',    bg: '#EAF3DE', color: '#27500A' },
                { label: '< -2°C ou > 38°C · Stop', bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <CritRow
              icon="🔆" label="UV" weight={10}
              zones={['#52A855','#52A855','#8BBF3A','#D94F4F']}
              thresholds={[
                { label: '≤ 7 · OK',       bg: '#EAF3DE', color: '#27500A' },
                { label: '> 10 · Extrême', bg: '#FCEBEB', color: '#A32D2D' },
              ]}
            />
            <TipBox
              title="🌧️ Sols humides"
              text="Les sols humides sont le critère #1 en VTT — boue = adhérence réduite, freinage allongé, risque de chute. Attendre 6h après une pluie avant de sortir."
            />
          </ConditionsAccordion>

        </div>
      </div>
    </div>
  );
}

function ConditionsAccordion({ title, icon, color, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
        style={{ background: color }}
      >
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-semibold text-white flex-1">{title}</span>
        <span className="text-white text-lg" style={{ opacity: 0.6 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="bg-[var(--color-surface-2)] divide-y divide-[var(--color-border)]">
          {children}
        </div>
      )}
    </div>
  );
}

function CritRow({ icon, label, weight, zones, thresholds, note }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--color-text)]">{icon} {label}</span>
        <span className="text-[10px] text-[var(--color-text-3)] bg-[var(--color-surface)] px-2 py-0.5 rounded-full">
          {weight} pts
        </span>
      </div>
      <div className="h-1.5 rounded-full flex overflow-hidden mb-1.5">
        {zones.map((z, i) => (
          <div key={i} className="flex-1" style={{ background: z }} />
        ))}
      </div>
      {thresholds && (
        <div className="flex gap-1.5 flex-wrap mt-1.5">
          {thresholds.map((t, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded font-mono"
                  style={{ background: t.bg, color: t.color }}>
              {t.label}
            </span>
          ))}
        </div>
      )}
      {note && (
        <p className="text-[10px] text-[var(--color-text-3)] mt-1.5">{note}</p>
      )}
    </div>
  );
}

function TipBox({ title, text }) {
  return (
    <div className="mx-4 mb-3 mt-1 bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)]">
      <div className="text-xs font-semibold text-[var(--color-text)] mb-1">{title}</div>
      <p className="text-[11px] text-[var(--color-text-2)] leading-relaxed">{text}</p>
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
