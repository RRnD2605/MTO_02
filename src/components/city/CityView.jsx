import { useState, useEffect, useMemo } from 'react';
import LocationTabs from '../shared/LocationTabs.jsx';
import CityHeroCard from './CityHeroCard.jsx';
import DaySelector from './DaySelector.jsx';
import DaySlots from './DaySlots.jsx';
import ForecastList from './ForecastList.jsx';
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
    <div className="flex flex-col gap-4 pb-20 overflow-hidden bg-[var(--color-bg)]">
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
            <div className="flex gap-2 px-4">
              <MetricItem
                label={t('wind')}
                value={formatWind(dayData.windspeed ?? 0, windUnit)}
                sub={windDirection(dayData.winddirection ?? 0)}
                icon="💨"
                extra={dayData.windgusts ? `↑ ${formatWind(dayData.windgusts, windUnit)}` : null}
                accent
              />
              <MetricItem
                label={t('rain')}
                value={`${dayData.rainProb ?? 0}%`}
                icon={null}
                sub={null}
              />
              <MetricItem
                label={t('uv')}
                value={dayData.uvMax != null ? Math.round(dayData.uvMax).toString() : '0'}
                icon="☀️"
                sub={null}
              />
            </div>
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

function MetricItem({ label, value, sub, icon, accent, extra }) {
  return (
    <div className="flex-1 bg-[var(--color-surface-2)] rounded-xl p-2">
      <div className="flex items-center gap-1 mb-1">
        {icon && <span className="text-sm">{icon}</span>}
        {sub && <span className="text-xs text-[var(--color-text-3)]">{sub}</span>}
      </div>
      <div className="text-xs text-[var(--color-text-3)] mb-0.5">{label}</div>
      <div className={`font-mono text-base font-medium ${accent ? 'text-[var(--color-city-text)]' : 'text-[var(--color-text)]'}`}>
        {value}
      </div>
      {extra && <div className="text-xs text-[var(--color-text-3)] mt-0.5">{extra}</div>}
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
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 bg-[var(--color-surface-2)] rounded-xl h-16" />
        ))}
      </div>
    </div>
  );
}
