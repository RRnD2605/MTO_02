import { useState, useEffect, useMemo, useRef } from 'react';
import DaySelector from '../city/DaySelector.jsx';
import ActivityHeroCard from './ActivityHeroCard.jsx';
import ActivityHoursTable from './ActivityHoursTable.jsx';
import StormAlert from './StormAlert.jsx';
import AddSpotModal from './AddSpotModal.jsx';
import GpxImportScreen from './GpxImportScreen.jsx';
import { useWeather } from '../../hooks/useWeather.js';
import { useGeolocate } from '../../hooks/useGeolocate.js';
import { parseActivityDayData, formatWind, windDirection, getInitialDayIndex } from '../../utils/weatherUtils.js';
import { computeRandoScore } from '../../utils/randoScore.js';

const RANDO_COLOR = '#27500A';

function uvLabel(uv) {
  if (uv <= 2) return 'Faible';
  if (uv <= 5) return 'Modéré';
  if (uv <= 7) return 'Élevé';
  return 'Très élevé';
}

function MetricCard({ icon, sub, label, value, extra, accent }) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3">
      <div className="flex items-center gap-1 mb-1">
        {icon && <span className="text-xs">{icon}</span>}
        {sub && <span className="text-[10px] text-[var(--color-text-3)] truncate">{sub}</span>}
      </div>
      <div className="text-[10px] text-[var(--color-text-3)] mb-1">{label}</div>
      <div className="text-base font-medium truncate" style={{ color: accent ? RANDO_COLOR : 'var(--color-text)' }}>
        {value}
      </div>
      {extra && <div className="text-[10px] text-[var(--color-text-3)] mt-1">{extra}</div>}
    </div>
  );
}

export default function RandoView({ t, lang, windUnit, onUpdateTimestamp, spots, addSpot, removeSpot }) {
  const [activeSpotId, setActiveSpotId] = useState(null);
  const [dayIndex, setDayIndex] = useState(getInitialDayIndex);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const longPressTimer = useRef(null);
  const { gpsLabel, gpsActive, setGpsActive, geolocate, autoGeolocate, gpsLocation } = useGeolocate();

  useEffect(() => {
    const cleanup = autoGeolocate();
    return cleanup;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeLocation = useMemo(() => {
    if (gpsActive) return gpsLocation;
    if (activeSpotId) return spots.find((s) => s.id === activeSpotId) || null;
    return null;
  }, [gpsActive, gpsLocation, activeSpotId, spots]);

  const { data, loading, error, updatedAt, refresh } = useWeather(activeLocation, 'activity');

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

  function handleDeleteSpot(id) {
    removeSpot(id);
    if (activeSpotId === id) setActiveSpotId(null);
  }

  return (
    <div className="flex flex-col gap-4 pb-20 overflow-hidden bg-[var(--color-bg)]">
      <div className="pt-3 flex items-center gap-2 px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
          <button
            onClick={() => { geolocate(); setActiveSpotId(null); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              gpsActive
                ? 'bg-[#27500A] text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-2)]'
            }`}
          >
            📍 {gpsLabel}
          </button>
          {spots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => { setGpsActive(false); setActiveSpotId(spot.id); }}
              onContextMenu={(e) => { e.preventDefault(); handleDeleteSpot(spot.id); }}
              onTouchStart={() => { longPressTimer.current = setTimeout(() => handleDeleteSpot(spot.id), 600); }}
              onTouchEnd={() => clearTimeout(longPressTimer.current)}
              onTouchMove={() => clearTimeout(longPressTimer.current)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !gpsActive && spot.id === activeSpotId
                  ? 'bg-[#27500A] text-white'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-2)]'
              }`}
            >
              {spot.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-[var(--color-border)] text-[var(--color-text-3)]"
          >
            + Spot
          </button>
        </div>
        <button
          onClick={() => setShowTrace(true)}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[var(--color-surface-2)] rounded-xl text-xs font-medium text-[var(--color-text-2)] border border-[var(--color-border)]"
        >
          📂 Trace
        </button>
      </div>

      {!activeLocation && (
        <div className="mx-4 p-6 text-center text-sm text-[var(--color-text-2)] rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          {spots.length === 0
            ? 'Ajoutez vos spots favoris avec + ou touchez 📍 Local'
            : 'Sélectionnez un spot ou touchez 📍 Local'}
        </div>
      )}

      {loading && !data && activeLocation && <SkeletonActivity />}

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
          <ActivityHeroCard
            dayData={dayData} scoreResult={scoreResult} color={RANDO_COLOR}
            lang={lang} windUnit={windUnit} t={t}
            locationName={activeLocation?.name}
            selectedDate={data?.daily?.time?.[dayIndex] ?? null}
          />

          {dayData && (
            <div className="mx-4 grid grid-cols-2 gap-2">
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
                icon="🌫️" sub={null}
                label="Visibilité" value={visGood ? t('vis.good') : t('vis.fog')}
              />
            </div>
          )}

          <ActivityHoursTable hours={dayData?.hours} windUnit={windUnit} t={t} />
        </>
      )}

      {showAddModal && (
        <AddSpotModal
          color={RANDO_COLOR}
          onAdd={addSpot}
          onClose={() => setShowAddModal(false)}
          existingIds={spots.map((s) => s.id)}
        />
      )}

      {showTrace && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setShowTrace(false)}
        >
          <div
            className="bg-[var(--color-surface)] rounded-t-2xl flex flex-col shadow-2xl overflow-hidden"
            style={{ maxHeight: '67vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-9 h-1 bg-[var(--color-border)] rounded-full" />
            </div>
            <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--color-border)] flex-shrink-0">
              <span className="text-sm font-semibold text-[var(--color-text)]">📂 Analyser une trace</span>
              <button
                onClick={() => setShowTrace(false)}
                className="text-xs text-[var(--color-text-2)] bg-[var(--color-surface-2)] px-3 py-1.5 rounded-full"
              >
                Fermer ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <GpxImportScreen
                activity="rando"
                onClose={() => setShowTrace(false)}
                t={t}
                lang={lang}
                windUnit={windUnit}
                visible
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SkeletonActivity() {
  return (
    <div className="mx-4 animate-pulse flex flex-col gap-4">
      <div className="bg-[var(--color-surface-2)] rounded-2xl h-48" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="bg-[var(--color-surface-2)] rounded-xl h-16" />)}
      </div>
    </div>
  );
}
