import { useState, useCallback, useRef } from 'react';
import NavBar from './components/layout/NavBar.jsx';
import BottomBar from './components/layout/BottomBar.jsx';
import CityView from './components/city/CityView.jsx';
import GolfView from './components/golf/GolfView.jsx';
import SettingsView from './components/settings/SettingsView.jsx';
import { useI18n } from './hooks/useI18n.js';
import { useLocations } from './hooks/useLocations.js';

const LS_WIND_KEY = 'meteo_golf_wind_unit_v1';

function getInitialWindUnit() {
  return localStorage.getItem(LS_WIND_KEY) || 'kmh';
}

export default function App() {
  const [tab, setTab] = useState('cities');
  const { lang, setLang, t } = useI18n();
  const {
    cities, golfs,
    addCity, removeCity, moveCity,
    addGolf, removeGolf, moveGolf,
  } = useLocations();
  const [windUnit, setWindUnitState] = useState(getInitialWindUnit);

  const updateRef = useRef({ updatedAt: null, refresh: null });
  const [updatedAt, setUpdatedAt] = useState(null);

  const setWindUnit = useCallback((u) => {
    localStorage.setItem(LS_WIND_KEY, u);
    setWindUnitState(u);
  }, []);

  const handleUpdateTimestamp = useCallback((ts, refreshFn) => {
    updateRef.current = { updatedAt: ts, refresh: refreshFn };
    setUpdatedAt((prev) => (prev === ts ? prev : ts));
  }, []);

  const handleRefresh = useCallback(() => {
    if (updateRef.current.refresh) updateRef.current.refresh();
  }, []);

  return (
    <div
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans"
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      <NavBar activeTab={tab} onTab={setTab} t={t} />

      <main className="max-w-lg mx-auto" style={{ overflowX: 'hidden' }}>
        {tab === 'cities' && (
          <CityView
            cities={cities}
            t={t}
            lang={lang}
            windUnit={windUnit}
            onUpdateTimestamp={handleUpdateTimestamp}
          />
        )}
        {tab === 'golf' && (
          <GolfView
            golfs={golfs}
            t={t}
            lang={lang}
            windUnit={windUnit}
            onUpdateTimestamp={handleUpdateTimestamp}
          />
        )}
        {tab === 'settings' && (
          <SettingsView
            cities={cities}
            golfs={golfs}
            addCity={addCity}
            removeCity={removeCity}
            moveCity={moveCity}
            addGolf={addGolf}
            removeGolf={removeGolf}
            moveGolf={moveGolf}
            lang={lang}
            setLang={setLang}
            windUnit={windUnit}
            setWindUnit={setWindUnit}
            t={t}
          />
        )}
      </main>

      {tab !== 'settings' && (
        <BottomBar onRefresh={handleRefresh} updatedAt={updatedAt} t={t} />
      )}
    </div>
  );
}
