import { useState, useEffect, useMemo } from 'react';
import LocationTabs from '../shared/LocationTabs.jsx';
import CityHeroCard from './CityHeroCard.jsx';
import DaySelector from './DaySelector.jsx';
import DaySlots from './DaySlots.jsx';
import ForecastList from './ForecastList.jsx';
import RainDrop from '../shared/RainDrop.jsx';
import { useWeather } from '../../hooks/useWeather.js';
import { parseDayData, formatWind, windDirection } from '../../utils/weatherUtils.js';

const getInitialDayIndex = () => new Date().getHours() >= 21 ? 1 : 0;

export default function CityView({ cities, t, lang, windUnit, onUpdateTimestamp }) {
  const [activeId, setActiveId] = useState(cities[0]?.id);
  const [dayIndex, setDayIndex] = useState(getInitialDayIndex);

  const activeCity = cities.find((c) => c.id === activeId) || cities[0];
  const { data, loading, error, updatedAt, refresh } = useWeather(activeCity, 'city');

  useEffect(() => {
    if (updatedAt && typeof onUpdateTimestamp === 'function') {
      onUpdateTimestamp(updatedAt, refresh);
    }
  }, [updatedAt, refresh, onUpdateTimestamp]);

  const dayData = useMemo(() => parseDayData(data, dayIndex), [data, dayIndex]);

  return (
    <div className="flex flex-col gap-2 pb-20 overflow-hidden bg-[var(--color-bg)]">
      <div className="pt-3">
        <LocationTabs
          locations={cities}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setDayIndex(0); }}
          accentClass="bg-[var(--color-city)] text-white"
        />
      </div>

      {loading && !data && <SkeletonCity />}

      {error && !data && (
        <div className="px-4">
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
          <DaySelector
            dates={data.daily.time}
            selectedIndex={dayIndex}
            onSelect={setDayIndex}
            t={t}
          />

          <CityHeroCard dayData={dayData} lang={lang} t={t} />

          {dayData && (
            <MetricsBand
              windspeed={dayData.windspeed ?? 0}
              winddirection={dayData.winddirection ?? 0}
              windgusts={dayData.windgusts ?? 0}
              rainProb={dayData.rainProb ?? 0}
              uvMax={dayData.uvMax ?? 0}
              windUnit={windUnit}
              t={t}
            />
          )}

          {dayData && <DaySlots hours={dayData.hours} lang={lang} windUnit={windUnit} />}

          <ForecastList
            weatherData={data}
            selectedIndex={dayIndex}
            onSelect={setDayIndex}
            t={t}
          />
        </>
      )}
    </div>
  );
}

function MetricsBand({ windspeed, winddirection, windgusts, rainProb, uvMax, windUnit, t }) {
  return (
    <div className="mx-4 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)] flex items-stretch">
      {/* Vent */}
      <div className="flex-1 px-3 py-2.5 border-r border-[var(--color-border)]">
        <div className="text-[10px] text-[var(--color-text-3)] mb-1">{t('wind')}</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-mono font-medium text-[var(--color-city-text)]">
              {formatWind(windspeed, windUnit)}
            </div>
            <div className="text-[10px] text-[var(--color-text-3)]">
              {windDirection(winddirection)} · ↑ {formatWind(windgusts, windUnit)}
            </div>
          </div>
          <span className="text-lg">💨</span>
        </div>
      </div>

      {/* Pluie */}
      <div className="flex-1 px-3 py-2.5 border-r border-[var(--color-border)]">
        <div className="text-[10px] text-[var(--color-text-3)] mb-1">{t('rain')}</div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-mono font-medium text-[var(--color-text)]">
            {rainProb}%
          </div>
          <RainDrop prob={rainProb} />
        </div>
      </div>

      {/* UV */}
      <div className="flex-1 px-3 py-2.5">
        <div className="text-[10px] text-[var(--color-text-3)] mb-1">{t('uv')}</div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-mono font-medium text-[var(--color-text)]">
            {Math.round(uvMax)}
          </div>
          <span className="text-lg">☀️</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCity() {
  return (
    <div className="px-4 animate-pulse flex flex-col gap-4">
      <div className="bg-[var(--color-surface-2)] rounded-2xl h-40" />
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--color-surface-2)] rounded-full h-8 w-16 flex-shrink-0" />
        ))}
      </div>
      <div className="bg-[var(--color-surface-2)] rounded-xl h-16" />
    </div>
  );
}
