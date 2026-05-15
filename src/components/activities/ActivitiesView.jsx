import { useState } from 'react';
import RandoView from './RandoView.jsx';
import VttView from './VttView.jsx';
import GolfView from '../golf/GolfView.jsx';
import GpxImportScreen from './GpxImportScreen.jsx';

export default function ActivitiesView({ cities, golfs, activities, t, lang, windUnit, onUpdateTimestamp }) {
  const enabledTabs = [
    activities.rando && { id: 'rando', label: '🥾 Rando', color: '#27500A' },
    activities.vtt   && { id: 'vtt',   label: '🚵 VTT',   color: '#8B3A0F' },
    activities.golf  && { id: 'golf',  label: '⛳ Golf',   color: '#1B4D3E' },
  ].filter(Boolean);

  const firstId = enabledTabs[0]?.id ?? 'rando';
  const [activeTab, setActiveTab] = useState(firstId);
  const [gpxActivity, setGpxActivity] = useState(null);

  function openGpx(activity) {
    setGpxActivity(activity);
  }

  if (gpxActivity) {
    return (
      <GpxImportScreen
        activity={gpxActivity}
        onClose={() => setGpxActivity(null)}
        t={t}
        lang={lang}
      />
    );
  }

  const currentTab = enabledTabs.find((tab) => tab.id === activeTab) ?? enabledTabs[0];

  return (
    <div className="flex flex-col min-h-0 bg-[var(--color-bg)]">
      {/* Sub-tab selector */}
      {enabledTabs.length > 1 && (
        <div className="flex px-4 pt-3 gap-2">
          {enabledTabs.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
              style={
                (currentTab?.id ?? firstId) === id
                  ? { backgroundColor: color, color: 'white' }
                  : { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-2)' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-views */}
      {currentTab?.id === 'rando' && (
        <RandoView cities={cities} t={t} lang={lang} windUnit={windUnit} onUpdateTimestamp={onUpdateTimestamp} onGpx={() => openGpx('rando')} />
      )}
      {currentTab?.id === 'vtt' && (
        <VttView cities={cities} t={t} lang={lang} windUnit={windUnit} onUpdateTimestamp={onUpdateTimestamp} onGpx={() => openGpx('vtt')} />
      )}
      {currentTab?.id === 'golf' && (
        <GolfView golfs={golfs} t={t} lang={lang} windUnit={windUnit} onUpdateTimestamp={onUpdateTimestamp} />
      )}
    </div>
  );
}
