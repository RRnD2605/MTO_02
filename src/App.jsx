import { useState, useCallback, useRef } from 'react';
import NavBar from './components/layout/NavBar.jsx';
import BottomBar from './components/layout/BottomBar.jsx';
import CityView from './components/city/CityView.jsx';
import GolfView from './components/golf/GolfView.jsx';
import RandoView from './components/activities/RandoView.jsx';
import VttView from './components/activities/VttView.jsx';
import SettingsView from './components/settings/SettingsView.jsx';
import { useI18n } from './hooks/useI18n.js';
import { useLocations } from './hooks/useLocations.js';
import { useSpots } from './hooks/useSpots.js';

const LS_WIND_KEY = 'meteo_golf_wind_unit_v1';
const LS_NAV_TABS_KEY = 'meteo_nav_tabs_v1';

const ALL_CONTENT_TABS = ['cities', 'golf', 'rando', 'vtt'];

function getInitialEnabledTabs() {
  try {
    const stored = localStorage.getItem(LS_NAV_TABS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return ['cities', 'golf', 'rando', 'vtt'];
}

function getInitialWindUnit() {
  return localStorage.getItem(LS_WIND_KEY) || 'kmh';
}

export default function App() {
  const [enabledTabs, setEnabledTabsState] = useState(getInitialEnabledTabs);
  const [tab, setTab] = useState(() => {
    const tabs = getInitialEnabledTabs();
    return tabs[0] ?? 'cities';
  });

  const { lang, setLang, t } = useI18n();
  const {
    cities, golfs,
    addCity, removeCity, setCities,
    addGolf, removeGolf, setGolfs,
  } = useLocations();
  const { spots: randoSpots, addSpot: addRandoSpot, removeSpot: removeRandoSpot } = useSpots('meteo_rando_spots_v1');
  const { spots: vttSpots, addSpot: addVttSpot, removeSpot: removeVttSpot } = useSpots('meteo_vtt_spots_v1');
  const [windUnit, setWindUnitState] = useState(getInitialWindUnit);

  const updateRef = useRef({ updatedAt: null, refresh: null });
  const [updatedAt, setUpdatedAt] = useState(null);

  const setWindUnit = useCallback((u) => {
    localStorage.setItem(LS_WIND_KEY, u);
    setWindUnitState(u);
  }, []);

  const toggleTab = useCallback((id, value) => {
    setEnabledTabsState((prev) => {
      const next = value
        ? (prev.includes(id) ? prev : [...prev, id])
        : prev.filter((t) => t !== id);
      // Enforce minimum 1 active content tab
      const safe = next.length > 0 ? next : prev;
      localStorage.setItem(LS_NAV_TABS_KEY, JSON.stringify(safe));
      // If current tab was disabled, switch to first enabled
      setTab((currentTab) => {
        if (currentTab !== id) return currentTab;
        return safe[0] ?? 'cities';
      });
      return safe;
    });
  }, []);

  const handleUpdateTimestamp = useCallback((ts, refreshFn) => {
    updateRef.current = { updatedAt: ts, refresh: refreshFn };
    setUpdatedAt((prev) => (prev === ts ? prev : ts));
  }, []);

  const handleRefresh = useCallback(() => {
    if (updateRef.current.refresh) updateRef.current.refresh();
  }, []);

  const sharedProps = { t, lang, windUnit, onUpdateTimestamp: handleUpdateTimestamp };

  return (
    <div
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans"
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      <NavBar activeTab={tab} onTab={setTab} t={t} enabledTabs={enabledTabs} />

      <main className="max-w-lg mx-auto" style={{ overflowX: 'hidden' }}>
        {tab === 'cities' && <CityView cities={cities} {...sharedProps} />}
        {tab === 'golf'   && <GolfView golfs={golfs}   {...sharedProps} />}
        {tab === 'rando'  && <RandoView spots={randoSpots} addSpot={addRandoSpot} removeSpot={removeRandoSpot} {...sharedProps} onGpx={() => {}} />}
        {tab === 'vtt'    && <VttView   spots={vttSpots}  addSpot={addVttSpot}   removeSpot={removeVttSpot}  {...sharedProps} onGpx={() => {}} />}
        {tab === 'settings' && (
          <SettingsView
            cities={cities}
            golfs={golfs}
            addCity={addCity}
            removeCity={removeCity}
            setCities={setCities}
            addGolf={addGolf}
            removeGolf={removeGolf}
            setGolfs={setGolfs}
            randoSpots={randoSpots}
            removeRandoSpot={removeRandoSpot}
            vttSpots={vttSpots}
            removeVttSpot={removeVttSpot}
            lang={lang}
            setLang={setLang}
            windUnit={windUnit}
            setWindUnit={setWindUnit}
            enabledTabs={enabledTabs}
            toggleTab={toggleTab}
            allContentTabs={ALL_CONTENT_TABS}
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
