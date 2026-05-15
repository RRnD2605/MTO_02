import { useState, useEffect } from 'react';
import LocationTabs from '../shared/LocationTabs.jsx';
import GolfHeroCard from './GolfHeroCard.jsx';
import TeeTimeSelector from './TeeTimeSelector.jsx';
import MetricsGrid from './MetricsGrid.jsx';
import HoursTable from './HoursTable.jsx';
import DaySelector from '../city/DaySelector.jsx';
import { useWeather } from '../../hooks/useWeather.js';
import { parseGolfDayData } from '../../utils/weatherUtils.js';
import { computeGolfScore, SCORE_COLORS } from '../../utils/golfScore.js';
import { wmoIcon } from '../../utils/weatherUtils.js';

// ─── Storm Alert ──────────────────────────────────────────────────────────────
function StormAlert({ stormRisk, t }) {
  if (!stormRisk || stormRisk === 'none') return null;
  const configs = {
    confirmed: { bg: '#FEE2E2', text: '#991B1B', icon: '⛈️', key: 'alert.storm.confirmed' },
    high:      { bg: '#FEF3C7', text: '#92400E', icon: '⚡', key: 'alert.storm.high'      },
    moderate:  { bg: '#FFF7ED', text: '#C2410C', icon: '🌩️', key: 'alert.storm.moderate'  },
  };
  const config = configs[stormRisk];
  if (!config) return null;
  return (
    <div
      className="mx-4 mb-1 rounded-xl px-4 py-3 flex items-start gap-3"
      style={{ background: config.bg }}
    >
      <span className="text-base flex-shrink-0">{config.icon}</span>
      <span className="text-sm font-medium" style={{ color: config.text }}>
        {t(config.key)}
      </span>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────
function WeekView({ data, onSelectDay, t }) {
  const [viewMode, setViewMode] = useState('weekend');
  const { daily, hourly } = data;

  const days = daily.time.map((date, i) => {
    const d = new Date(date + 'T12:00:00');
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    return { date, i, isWeekend, dayName };
  });

  const visibleDays = viewMode === 'weekend' ? days.filter((d) => d.isWeekend) : days;

  return (
    <div className="mx-4 rounded-2xl p-4" style={{ backgroundColor: '#1B4D3E' }}>
      {/* Toggle WE / Semaine */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'weekend', label: t('week.weekend') },
          { key: 'week',    label: t('week.week')    },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === key ? 'bg-white/20 text-white' : 'text-white/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visibleDays.length === 0 && (
        <p className="text-white/50 text-sm text-center py-4">—</p>
      )}

      {visibleDays.map(({ date, i, dayName }) => {
        const noonIdx = hourly.time.findIndex((t) => t === `${date}T09:00`);
        const score = noonIdx >= 0 ? computeGolfScore({
          windspeed:   hourly.windspeed_10m[noonIdx],
          windgusts:   hourly.windgusts_10m[noonIdx],
          rainProb:    hourly.precipitation_probability[noonIdx],
          uvIndex:     hourly.uv_index[noonIdx],
          weathercode: hourly.weathercode[noonIdx],
        }) : null;

        const bgClass = score
          ? score.level === 'ideal' ? 'bg-green-400/20 text-green-300'
          : score.level === 'good'  ? 'bg-yellow-400/20 text-yellow-300'
          : score.level === 'hard'  ? 'bg-orange-400/20 text-orange-300'
          :                           'bg-red-400/20 text-red-300'
          : '';

        return (
          <button
            key={date}
            onClick={() => onSelectDay(i)}
            className="w-full flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0 text-left"
          >
            <span className="text-white/70 text-xs w-20 flex-shrink-0 capitalize">{dayName}</span>
            <span className="text-base flex-shrink-0">{wmoIcon(daily.weathercode[i])}</span>
            <span className="text-white/60 text-xs flex-shrink-0">
              ↑{Math.round(daily.temperature_2m_max[i])}° ↓{Math.round(daily.temperature_2m_min[i])}°
            </span>
            <div className="flex-1" />
            {score && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bgClass}`}>
                {score.icon} {score.score}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Dot indicator ────────────────────────────────────────────────────────────
function ViewDots({ active }) {
  return (
    <div className="flex justify-center gap-1.5 mt-1">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === active ? 16 : 6,
            height: 6,
            backgroundColor: i === active ? 'var(--color-golf)' : 'var(--color-border)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main GolfView ────────────────────────────────────────────────────────────
export default function GolfView({ golfs, t, lang, windUnit, onUpdateTimestamp }) {
  const [activeId, setActiveId] = useState(golfs[0]?.id);
  const [dayIndex, setDayIndex] = useState(0);
  const [showWeekView, setShowWeekView] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const activeGolf = golfs.find((g) => g.id === activeId) || golfs[0];
  const { data, loading, error, updatedAt, refresh } = useWeather(activeGolf, 'golf');

  useEffect(() => {
    if (updatedAt && typeof onUpdateTimestamp === 'function') {
      onUpdateTimestamp(updatedAt, refresh);
    }
  }, [updatedAt, refresh, onUpdateTimestamp]);

  const dayData = parseGolfDayData(data, dayIndex);

  // Storm risk from current hour data
  const stormRisk = (() => {
    if (!dayData?.hours) return 'none';
    const now = new Date().getHours();
    const h = dayData.hours.find((x) => x.hour === now) || dayData.hours[0];
    if (!h) return 'none';
    return computeGolfScore({
      windspeed: h.windspeed, windgusts: h.windgusts,
      rainProb: h.rainProb, uvIndex: h.uvIndex, weathercode: h.weathercode,
    }).stormRisk;
  })();

  function handleTouchStart(e) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) setShowWeekView(diff > 0);
    setTouchStartX(null);
  }

  function handleSelectDay(i) {
    setDayIndex(i);
    setShowWeekView(false);
  }

  return (
    <div className="flex flex-col gap-4 pb-20 overflow-hidden bg-[var(--color-bg)]">
      <div className="pt-3">
        <LocationTabs
          locations={golfs}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setDayIndex(0); setShowWeekView(false); }}
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
          <DaySelector
            dates={data.daily.time}
            selectedIndex={dayIndex}
            onSelect={(i) => { setDayIndex(i); setShowWeekView(false); }}
            t={t}
          />

          <StormAlert stormRisk={stormRisk} t={t} />

          {/* Hero card / Week view — swipeable */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {showWeekView ? (
              <WeekView data={data} onSelectDay={handleSelectDay} t={t} />
            ) : (
              <GolfHeroCard dayData={dayData} lang={lang} windUnit={windUnit} t={t} />
            )}
            <ViewDots active={showWeekView ? 1 : 0} />
          </div>

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
