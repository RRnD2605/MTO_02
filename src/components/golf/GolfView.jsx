import { useState, useEffect } from 'react';
import LocationTabs from '../shared/LocationTabs.jsx';
import GolfHeroCard from './GolfHeroCard.jsx';
import TeeTimeSelector from './TeeTimeSelector.jsx';
import AlertBanner from './AlertBanner.jsx';
import MetricsGrid from './MetricsGrid.jsx';
import HoursTable from './HoursTable.jsx';
import { useWeather } from '../../hooks/useWeather.js';
import { parseGolfDayData, generateAlerts } from '../../utils/weatherUtils.js';

export default function GolfView({ golfs, t, lang, windUnit, onUpdateTimestamp }) {
  const [activeId, setActiveId] = useState(golfs[0]?.id);

  const activeGolf = golfs.find((g) => g.id === activeId) || golfs[0];
  const { data, loading, error, updatedAt, refresh } = useWeather(activeGolf, 'golf');

  useEffect(() => {
    if (updatedAt && typeof onUpdateTimestamp === 'function') {
      onUpdateTimestamp(updatedAt, refresh);
    }
  }, [updatedAt, refresh, onUpdateTimestamp]);

  const dayData = parseGolfDayData(data, 0);
  const alerts = dayData && data ? generateAlerts(data.daily, 0, lang) : [];

  return (
    <div className="flex flex-col gap-4 pb-20 overflow-hidden bg-[var(--color-bg)]">
      <div className="pt-3">
        <LocationTabs
          locations={golfs}
          activeId={activeId}
          onSelect={setActiveId}
          accentClass="bg-[var(--color-golf)] text-white"
        />
      </div>

      {loading && !data && <SkeletonGolf />}

      {error && !data && (
        <div className="mx-4">
          <div className="bg-[var(--color-alert-bg)] rounded-xl p-4 text-center">
            <p className="text-[var(--color-alert-text)] text-sm">{t('error')}</p>
            <button
              onClick={refresh}
              className="mt-2 px-4 py-1.5 rounded-full bg-[var(--color-surface-2)] text-sm font-medium text-[var(--color-text)]"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {data && (
        <>
          <AlertBanner alerts={alerts} t={t} />
          <GolfHeroCard dayData={dayData} lang={lang} windUnit={windUnit} t={t} />
          <TeeTimeSelector dayData={dayData} windUnit={windUnit} t={t} />
          <MetricsGrid dayData={dayData} windUnit={windUnit} t={t} />
          <HoursTable hours={dayData?.hours} windUnit={windUnit} t={t} />
        </>
      )}
    </div>
  );
}

function SkeletonGolf() {
  return (
    <div className="mx-4 animate-pulse flex flex-col gap-4">
      <div className="bg-[var(--color-surface-2)] rounded-2xl h-48" />
      <div className="bg-[var(--color-surface-2)] rounded-xl h-24" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--color-surface-2)] rounded-xl h-16" />
        ))}
      </div>
    </div>
  );
}
