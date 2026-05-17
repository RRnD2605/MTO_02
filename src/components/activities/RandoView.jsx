import { useState, useEffect, useMemo } from 'react';
import LocationTabs from '../shared/LocationTabs.jsx';
import DaySelector from '../city/DaySelector.jsx';
import ActivityHeroCard from './ActivityHeroCard.jsx';
import ActivityHoursTable from './ActivityHoursTable.jsx';
import StormAlert from './StormAlert.jsx';
import { useWeather } from '../../hooks/useWeather.js';
import { parseActivityDayData, formatWind, windDirection, getInitialDayIndex } from '../../utils/weatherUtils.js';
import { computeRandoScore } from '../../utils/randoScore.js';

const RANDO_COLOR = '#27500A';

function uvLabel(uv) {
  if (uv <= 2) return '🟢 Faible';
  if (uv <= 5) return '🟡 Modéré';
  if (uv <= 7) return '🟠 Élevé';
  return '🔴 Très élevé';
}

function MetricCard({ icon, sub, label, value, extra, accent }) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-2)] p-2">
      <div className="flex items-center gap-1 mb-1">
        {icon && <span className="text-sm">{icon}</span>}
        {sub && <span className="text-xs text-[var(--color-text-3)] truncate">{sub}</span>}
      </div>
      <div className="text-xs text-[var(--color-text-3)] mb-0.5">{label}</div>
      <div className="font-mono text-base font-medium truncate" style={{ color: accent ? RANDO_COLOR : 'var(--color-text)' }}>
        {value}
      </div>
      {extra && <div className="text-xs text-[var(--color-text-3)] mt-0.5 leading-snug">{extra}</div>}
    </div>
  );
}

export default function RandoView({ cities, t, lang, windUnit, onUpdateTimestamp, onGpx }) {
  const [activeId, setActiveId] = useState(cities[0]?.id);
  const [dayIndex, setDayIndex] = useState(getInitialDayIndex);

  const activeCity = cities.find((c) => c.id === activeId) || cities[0];
  const { data, loading, error, updatedAt, refresh } = useWeather(activeCity, 'activity');

  useEffect(() => {
    if (updatedAt && typeof onUpdateTimestamp === 'function') {
      onUpdateTimestamp(updatedAt, refresh);
    }
  }, [updatedAt, refresh, onUpdateTimestamp]);

  const dayData = useMemo(() => parseActivityDayData(data, dayIndex), [data, dayIndex]);

  const currentHour = new Date().getHours();
  const currentHourData = dayData?.hours?.find((h) => h.hour === currentHour)
    || dayData?.hours?.find((h) => h.hour === 10)
    || dayData?.hours?.[0];

  const scoreResult = currentHourData ? computeRandoScore({
    windspeed: currentHourData.windspeed,
    windgusts: currentHourData.windgusts,
    rainProb: currentHourData.rainProb,
    temperature: currentHourData.temp,
    weathercode: currentHourData.weathercode,
    uvIndex: currentHourData.uvIndex,
  }) : null;

  const stormRisk = scoreResult?.stormRisk ?? 'none';
  const uvNow = dayData?.uvMax ?? 0;
  const gusts = currentHourData?.windgusts ?? (dayData?.windspeed ?? 0) * 1.3;
  const feelsLike = currentHourData?.apparentTemp ?? dayData?.maxTemp ?? 0;
  const wc = dayData?.weathercode ?? 0;
  const visGood = !(wc >= 45 && wc <= 49);

  return (
    <div className="flex flex-col gap-4 pb-20 overflow-hidden bg-[var(--color-bg)]">
      <div className="pt-3">
        <LocationTabs
          locations={cities}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setDayIndex(getInitialDayIndex()); }}
          accentClass="bg-[#27500A] text-white"
        />
      </div>

      {loading && !data && <SkeletonActivity />}

      {error && !data && (
        <div className="px-4">
          <div className="bg-[var(--color-alert-bg)] rounded-xl p-4 text-center">
            <p className="text-[var(--color-alert-text)] text-sm">{t('error')}</p>
            <button onClick={refresh} className="mt-2 px-4 py-1.5 rounded-full bg-[var(--color-surface-2)] text-sm font-medium text-[var(--color-text)]">
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {data && (
        <>
          <DaySelector dates={data.daily.time} selectedIndex={dayIndex} onSelect={setDayIndex} t={t} />
          <StormAlert stormRisk={stormRisk} t={t} />
          <ActivityHeroCard dayData={dayData} scoreResult={scoreResult} color={RANDO_COLOR} lang={lang} windUnit={windUnit} t={t} />

          {dayData && (
            <div className="mx-4 grid grid-cols-2 gap-3">
              <MetricCard
                icon="💨" sub={windDirection(dayData.winddirection)}
                label={t('wind')} value={formatWind(dayData.windspeed, windUnit)}
                extra={`↑ ${formatWind(gusts, windUnit)}`} accent
              />
              <MetricCard
                icon="🌡️" sub={`${t('feels.like')} ${Math.round(feelsLike)}°`}
                label="Température" value={`${Math.round(dayData.maxTemp)}°`}
              />
              <MetricCard
                icon="☀️" sub={uvLabel(uvNow)}
                label={t('uv')} value={Math.round(uvNow).toString()}
              />
              <MetricCard
                icon={visGood ? '👁️' : '🌫️'} sub={null}
                label="Visibilité" value={visGood ? t('vis.good') : t('vis.fog')}
              />
            </div>
          )}

          <ActivityHoursTable
            hours={dayData?.hours}
            windUnit={windUnit}
            t={t}
            scoreFunc={(h) => computeRandoScore({
              windspeed: h.windspeed, windgusts: h.windgusts,
              rainProb: h.rainProb, temperature: h.temp,
              weathercode: h.weathercode, uvIndex: h.uvIndex,
            })}
          />

          <div className="px-4 pb-4">
            <button
              onClick={onGpx}
              className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: RANDO_COLOR }}
            >
              <span>🗺️</span>
              <span>{t('gpx.analyze')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SkeletonActivity() {
  return (
    <div className="mx-4 animate-pulse flex flex-col gap-4">
      <div className="bg-[var(--color-surface-2)] rounded-2xl h-48" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => <div key={i} className="bg-[var(--color-surface-2)] rounded-xl h-16" />)}
      </div>
    </div>
  );
}
