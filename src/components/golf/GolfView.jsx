import { useState, useEffect, useRef } from 'react';
import { useGeolocate } from '../../hooks/useGeolocate.js';
import GolfHeroCard from './GolfHeroCard.jsx';
import TeeTimeSelector from './TeeTimeSelector.jsx';
import MetricsGrid from './MetricsGrid.jsx';
import HoursTable from './HoursTable.jsx';
import DaySelector from '../city/DaySelector.jsx';
import { useWeather } from '../../hooks/useWeather.js';
import { useGames } from '../../hooks/useGames.js';
import { parseGolfDayData, formatWind, getInitialDayIndex } from '../../utils/weatherUtils.js';
import { computeGolfScore, getScoreForGame, computeDayGolfScore } from '../../utils/golfScore.js';
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

// ─── Score badge color ────────────────────────────────────────────────────────
function scoreBadgeStyle(score) {
  if (score >= 75) return { bg: '#EAF3DE', color: '#27500A' };
  if (score >= 45) return { bg: '#FEF3C7', color: '#92400E' };
  return              { bg: '#FCEBEB',   color: '#A32D2D' };
}

// ─── Upcoming Games section ────────────────────────────────────────────────────
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function UpcomingGames({ games, deleteGame, onGameTap, onShare, t }) {
  if (!games || games.length === 0) return null;

  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  function dateLabel(date) {
    if (date === today)    return "Auj.";
    if (date === tomorrow) return 'Dem.';
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  }

  function startTimeStr(game) {
    return `${game.startHour}h${String(game.startMinute).padStart(2, '0')}`;
  }

  return (
    <div className="flex flex-col gap-2 mx-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-3)]">
        {t('games.upcoming')}
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}
      >
        {games.map((game) => {
          const score = game.savedScore ?? null;
          const badge = score != null ? scoreBadgeStyle(score) : null;
          return (
            <div
              key={game.id}
              onClick={() => onGameTap(game)}
              className="flex items-center gap-2.5 px-3 py-2.5 border-b last:border-0 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span
                className="text-xs font-medium flex-shrink-0 capitalize"
                style={{ width: '3.5rem', color: 'var(--color-text)' }}
              >
                {dateLabel(game.date)}
              </span>
              <span
                className="text-xs flex-1 truncate"
                style={{ color: 'var(--color-text-2)' }}
              >
                {game.courseName}
              </span>
              <span
                className="text-xs font-mono flex-shrink-0"
                style={{ color: 'var(--color-text-3)' }}
              >
                {startTimeStr(game)}
              </span>
              {score != null && badge ? (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                  style={{ backgroundColor: badge.bg, color: badge.color }}
                >
                  {score}
                </div>
              ) : (
                <div className="w-7 h-7 flex-shrink-0" />
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onShare(game); }}
                className="opacity-60 flex-shrink-0"
                style={{ color: 'var(--color-text-3)' }}
                aria-label="Partager"
              >
                <ShareIcon />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteGame(game.id); }}
                className="text-base opacity-50 flex-shrink-0"
                style={{ color: 'var(--color-text-3)' }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
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
        const score = computeDayGolfScore(hourly, date);

        const scoreBg = !score ? '' :
          score.level === 'ideal' ? 'bg-[#EAF3DE] text-[#27500A]' :
          score.level === 'good'  ? 'bg-[#FEF3C7] text-[#92400E]' :
                                    'bg-[#FCEBEB] text-[#A32D2D]';

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
            <span className="text-white/50 text-xs flex-shrink-0">
              💨 {Math.round(daily.windspeed_10m_max[i])} km/h
            </span>
            <div className="flex-1" />
            {score && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreBg}`}>
                {score.score}
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
  const [dayIndex, setDayIndex] = useState(getInitialDayIndex);
  const [showWeekView, setShowWeekView] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [roundType, setRoundType] = useState('18');
  const [startHour, setStartHour] = useState(9);
  const [startMin, setStartMin] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);
  const { gpsLabel, gpsActive, setGpsActive, geolocate, gpsLocation } = useGeolocate();

  const activeGolf = gpsActive
    ? gpsLocation
    : golfs.find((g) => g.id === activeId) || golfs[0] || null;
  const { data, loading, error, updatedAt, refresh } = useWeather(activeGolf, 'golf');
  const { games, addGame, deleteGame } = useGames();

  useEffect(() => {
    if (updatedAt && typeof onUpdateTimestamp === 'function') {
      onUpdateTimestamp(updatedAt, refresh);
    }
  }, [updatedAt, refresh, onUpdateTimestamp]);

  const dayData = parseGolfDayData(data, dayIndex);
  const selectedDate = data?.daily?.time?.[dayIndex] ?? null;
  const heroScore = (data && selectedDate) ? computeDayGolfScore(data.hourly, selectedDate) : null;

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

  function handleGameTap(game) {
    setActiveId(game.courseId);
    const today = new Date().toISOString().slice(0, 10);
    const dayDiff = Math.round(
      (new Date(game.date) - new Date(today)) / (1000 * 60 * 60 * 24)
    );
    setDayIndex(Math.max(0, Math.min(dayDiff, 6)));
    setRoundType(game.roundType);
    setStartHour(game.startHour);
    setStartMin(game.startMinute);
    setTimeout(() => {
      document.getElementById('ma-partie-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function showToast(msg) {
    clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
  }

  async function handleShare(game) {
    const startTime = `${String(game.startHour).padStart(2, '0')}h${String(game.startMinute).padStart(2, '0')}`;
    const dateLabel = new Date(game.date + 'T12:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    const scoreLabel =
      game.savedScoreLevel === 'ideal' ? 'Conditions idéales' :
      game.savedScoreLevel === 'good'  ? 'Bonnes conditions'  :
      game.savedScoreLevel === 'hard'  ? 'Conditions difficiles' : 'Déconseillé';

    const duration  = game.roundType === '9' ? 2.25 : 4.5;
    const gameHours = [];
    for (let h = game.startHour; h <= Math.ceil(game.startHour + duration); h++) {
      gameHours.push(Math.floor(h));
    }
    const temps = [], winds = [], gusts = [], rains = [];
    gameHours.forEach((h) => {
      const targetTime = `${game.date}T${String(h).padStart(2, '0')}:00`;
      const idx = data?.hourly?.time?.indexOf(targetTime);
      if (idx >= 0) {
        temps.push(data.hourly.temperature_2m[idx]);
        winds.push(data.hourly.windspeed_10m[idx]);
        gusts.push(data.hourly.windgusts_10m[idx] ?? data.hourly.windspeed_10m[idx] * 1.3);
        rains.push(data.hourly.precipitation_probability[idx] ?? 0);
      }
    });
    const minTemp = temps.length ? Math.round(Math.min(...temps)) : '—';
    const maxTemp = temps.length ? Math.round(Math.max(...temps)) : '—';
    const avgWind = winds.length ? Math.round(winds.reduce((a, b) => a + b, 0) / winds.length) : '—';
    const avgGusts = gusts.length ? Math.round(gusts.reduce((a, b) => a + b, 0) / gusts.length) : '—';
    const avgRain  = rains.length ? Math.round(rains.reduce((a, b) => a + b, 0) / rains.length) : '—';

    const message = [
      `⛳ Golf — ${game.courseName}`,
      `📅 ${dateLabel}`,
      `🕐 Départ ${startTime} · ${game.roundType} trous`,
      `${scoreLabel} (${game.savedScore}/100)`,
      `🌡️ ${minTemp}° / ${maxTemp}° · 💨 ${avgWind} km/h ↑${avgGusts} km/h · 💧 ${avgRain}%`,
      ``,
      `Préparé avec MTO Outdoor 🌤️`,
      `https://mto-02.vercel.app`,
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: `Golf — ${game.courseName}`, text: message });
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    } else {
      await navigator.clipboard.writeText(message);
      showToast('Copié dans le presse-papiers');
    }
  }

  function handleSaveGame({ startHour, startMin, roundType }) {
    if (!activeGolf || !selectedDate) return;
    const newGame = {
      id: `game_${Date.now()}`,
      courseId:    activeGolf.id,
      courseName:  activeGolf.name,
      courseLabel: activeGolf.label ?? activeGolf.name,
      date:        selectedDate,
      startHour,
      startMinute: startMin,
      roundType,
      duration:    roundType === '9' ? 2.25 : 4.5,
      createdAt:   Date.now(),
    };
    const scoreResult = getScoreForGame(newGame, data);
    newGame.savedScore = scoreResult?.score ?? null;
    newGame.savedScoreLevel = scoreResult?.level ?? null;
    addGame(newGame);
  }

  return (
    <div className="flex flex-col gap-4 pb-20 overflow-hidden bg-[var(--color-bg)]">
      <div className="pt-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-1">
          <button
            onClick={() => { geolocate(); setDayIndex(getInitialDayIndex()); setShowWeekView(false); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              gpsActive
                ? 'bg-[var(--color-golf)] text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-2)]'
            }`}
          >
            📍 {gpsLabel}
          </button>
          {golfs.map((g) => (
            <button
              key={g.id}
              onClick={() => { setGpsActive(false); setActiveId(g.id); setDayIndex(getInitialDayIndex()); setShowWeekView(false); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !gpsActive && g.id === activeId
                  ? 'bg-[var(--color-golf)] text-white'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-2)]'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
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

          <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {showWeekView ? (
              <WeekView data={data} onSelectDay={handleSelectDay} t={t} />
            ) : (
              <GolfHeroCard dayData={dayData} lang={lang} windUnit={windUnit} t={t} activeCourse={activeGolf} selectedDate={selectedDate} heroScore={heroScore} />
            )}
            <ViewDots active={showWeekView ? 1 : 0} />
          </div>

          {games.length > 0 && (
            <UpcomingGames
              games={games}
              deleteGame={deleteGame}
              onGameTap={handleGameTap}
              onShare={handleShare}
              t={t}
            />
          )}

          <div id="ma-partie-section">
            <TeeTimeSelector
              dayData={dayData}
              windUnit={windUnit}
              t={t}
              activeCourse={activeGolf}
              selectedDate={selectedDate}
              onSaveGame={handleSaveGame}
              roundType={roundType}
              setRoundType={setRoundType}
              startHour={startHour}
              setStartHour={setStartHour}
              startMin={startMin}
              setStartMin={setStartMin}
            />
          </div>
          <MetricsGrid dayData={dayData} windUnit={windUnit} t={t} />
          <HoursTable hours={dayData?.hours} windUnit={windUnit} t={t} />
        </>
      )}

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#313C48] text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
      {message}
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
