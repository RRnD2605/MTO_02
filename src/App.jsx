import { useState, useCallback, useRef } from 'react';
import NavBar from './components/layout/NavBar.jsx';
import BottomBar from './components/layout/BottomBar.jsx';
import CityView from './components/city/CityView.jsx';
import GolfView from './components/golf/GolfView.jsx';
import ActivitiesView from './components/activities/ActivitiesView.jsx';
import SettingsView from './components/settings/SettingsView.jsx';
import { useI18n } from './hooks/useI18n.js';
import { useLocations } from './hooks/useLocations.js';

const LS_WIND_KEY = 'meteo_golf_wind_unit_v1';
const LS_ACTIVITIES_KEY = 'meteo_golf_activities_v1';

function getInitialActivities() {
  try {
    const stored = localStorage.getItem(LS_ACTIVITIES_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { rando: true, vtt: false, golf: false };
}

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
  const [activities, setActivitiesState] = useState(getInitialActivities);

  const updateRef = useRef({ updatedAt: null, refresh: null });
  const [updatedAt, setUpdatedAt] = useState(null);

  const setWindUnit = useCallback((u) => {
    localStorage.setItem(LS_WIND_KEY, u);
    setWindUnitState(u);
  }, []);

  const setActivity = useCallback((key, value) => {
    setActivitiesState((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(LS_ACTIVITIES_KEY, JSON.stringify(next));
      return next;
    });
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
        {tab === 'activities' && (
          <ActivitiesView
            cities={cities}
            golfs={golfs}
            activities={activities}
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
            activities={activities}
            setActivity={setActivity}
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
