import { useState, useEffect, useMemo, useRef } from 'react';
import DaySelector from '../city/DaySelector.jsx';
import ActivityHeroCard from './ActivityHeroCard.jsx';
import ActivityHoursTable from './ActivityHoursTable.jsx';
import StormAlert from './StormAlert.jsx';
import AddSpotModal from './AddSpotModal.jsx';
import { useWeather } from '../../hooks/useWeather.js';
import { parseActivityDayData, formatWind, windDirection, getInitialDayIndex } from '../../utils/weatherUtils.js';
import { computeVttScore } from '../../utils/vttScore.js';

const VTT_COLOR = '#8B3A0F';

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
      <div className="text-base font-medium truncate" style={{ color: accent ? VTT_COLOR : 'var(--color-text)' }}>
        {value}
      </div>
      {extra && <div className="text-[10px] text-[var(--color-text-3)] mt-1">{extra}</div>}
    </div>
  );
}

export default function VttView({ t, lang, windUnit, onUpdateTimestamp, onGpx, spots, addSpot, removeSpot }) {
  const [activeId, setActiveId] = useState('gps');
  const [dayIndex, setDayIndex] = useState(getInitialDayIndex);
  const [gpsLabel, setGpsLabel] = useState('Ma position');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const longPressTimer = useRef(null);

  const activeLocation = useMemo(() => {
    if (activeId === 'gps') {
      if (!gpsCoords) return null;
      return { id: `gps-${gpsCoords.lat.toFixed(4)}-${gpsCoords.lon.toFixed(4)}`, name: gpsLabel, lat: gpsCoords.lat, lon: gpsCoords.lon };
    }
    const spot = spots.find((s) => s.id === activeId);
    return spot || null;
  }, [activeId, gpsCoords, gpsLabel, spots]);

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

  const recentPrecipMm = useMemo(() => {
    if (!dayData?.hours) return 0;
    const recent = dayData.hours.filter((h) => h.hour <= currentHour).slice(-6);
    return Math.round(recent.reduce((s, h) => s + (h.precipitation ?? 0), 0) * 10) / 10;
  }, [dayData, currentHour]);

  const scoreResult = currentHourData ? computeVttScore({
    windspeed: currentHourData.windspeed,
    windgusts: currentHourData.windgusts,
    rainProb: currentHourData.rainProb,
    recentPrecipMm,
    temperature: currentHourData.temp,
    weathercode: currentHourData.weathercode,
    uvIndex: currentHourData.uvIndex,
  }) : null;

  const stormRisk = scoreResult?.stormRisk ?? 'none';
  const uvNow = dayData?.uvMax ?? 0;
  const gusts = currentHourData?.windgusts ?? (dayData?.windspeed ?? 0) * 1.3;
  const feelsLike = currentHourData?.apparentTemp ?? dayData?.maxTemp ?? 0;
  const soilLabelKey = scoreResult?.soilLabel ?? 'soil.dry';

  function handleDeleteSpot(id) {
    removeSpot(id);
    if (activeId === id) setActiveId('gps');
  }

  async function handleGeolocate() {
    setActiveId('gps');
    setGpsLabel('Localisation...');
    if (!navigator.geolocation) {
      setGpsLabel('GPS non disponible');
      return;
    }
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const { latitude, longitude } = pos.coords;
      setGpsCoords({ lat: latitude, lon: longitude });
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        const json = await res.json();
        const name = json.address?.village
          || json.address?.town
          || json.address?.city
          || json.address?.municipality
          || 'Ma position';
        setGpsLabel(name);
      } catch {
        setGpsLabel('Ma position');
      }
    } catch (err) {
      setGpsLabel('Position indisponible');
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-20 overflow-hidden bg-[var(--color-bg)]">
      <div className="pt-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1">
          <button
            onClick={handleGeolocate}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeId === 'gps'
                ? 'bg-[#8B3A0F] text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-2)]'
            }`}
          >
            📍 {gpsLabel}
          </button>
          {spots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => setActiveId(spot.id)}
              onContextMenu={(e) => { e.preventDefault(); handleDeleteSpot(spot.id); }}
              onTouchStart={() => { longPressTimer.current = setTimeout(() => handleDeleteSpot(spot.id), 600); }}
              onTouchEnd={() => clearTimeout(longPressTimer.current)}
              onTouchMove={() => clearTimeout(longPressTimer.current)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                spot.id === activeId
                  ? 'bg-[#8B3A0F] text-white'
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
      </div>

      {!activeLocation && (
        <div className="mx-4 p-6 text-center text-sm text-[var(--color-text-2)] rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          {spots.length === 0
            ? 'Ajoutez vos spots favoris avec + ou touchez 📍 Ma position'
            : 'Sélectionnez un spot ou touchez 📍 Ma position'}
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
            dayData={dayData} scoreResult={scoreResult} color={VTT_COLOR}
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
                icon="🌱" sub={`${recentPrecipMm} mm /6h`}
                label="Sols" value={t(soilLabelKey)}
              />
              <MetricCard
                icon="🌡️" sub={`${t('feels.like')} ${Math.round(feelsLike)}°`}
                label="Température" value={`${Math.round(dayData.maxTemp)}°`}
              />
              <MetricCard
                icon="☀️" sub={uvLabel(uvNow)}
                label={t('uv')} value={Math.round(uvNow).toString()}
              />
            </div>
          )}

          <ActivityHoursTable hours={dayData?.hours} windUnit={windUnit} t={t} />

          <div className="px-4 pb-4">
            <button
              onClick={onGpx}
              className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: VTT_COLOR }}
            >
              <span>🗺️</span>
              <span>{t('gpx.analyze')}</span>
            </button>
          </div>
        </>
      )}

      {showAddModal && (
        <AddSpotModal
          color={VTT_COLOR}
          onAdd={addSpot}
          onClose={() => setShowAddModal(false)}
          existingIds={spots.map((s) => s.id)}
        />
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
