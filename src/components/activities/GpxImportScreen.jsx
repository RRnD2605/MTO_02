import { useState, useRef, useCallback, memo } from 'react';
import { parseGpxFile, sampleWeatherPoints, fetchWeatherForPoints } from '../../utils/gpx-parser.js';
import { computeRandoScore } from '../../utils/randoScore.js';
import { computeVttScore } from '../../utils/vttScore.js';
import GpxTimeline from './GpxTimeline.jsx';
import TraceRow from './TraceRow.jsx';
import { useTraces } from '../../hooks/useTraces.js';

const ACTIVITY_COLORS = {
  rando: '#27500A',
  vtt: '#8B3A0F',
};

const DURATION_PRESETS = [
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '3h', minutes: 180 },
  { label: '4h', minutes: 240 },
  { label: '6h', minutes: 360 },
];

function getScoreFunc(activity) {
  if (activity === 'vtt') return (w) => computeVttScore({ windspeed: w.windspeed, rainProb: w.rainProb, temperature: w.temp, weathercode: w.weathercode, uvIndex: w.rainProb });
  return (w) => computeRandoScore({ windspeed: w.windspeed, rainProb: w.rainProb, temperature: w.temp, weathercode: w.weathercode, uvIndex: w.rainProb });
}

function toLocalDatetimeInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function GpxImportScreen({ activity, onClose, t, lang, windUnit }) {
  const color = ACTIVITY_COLORS[activity] ?? '#1B4D3E';
  const inputRef = useRef(null);
  const { traces, saveTrace, renameTrace, deleteTrace } = useTraces(activity);

  // Step: 'drop' | 'config' | 'loading' | 'results'
  const [step, setStep] = useState('drop');
  const [gpxData, setGpxData] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState(null);

  // Config
  const defaultDep = new Date();
  defaultDep.setMinutes(0, 0, 0);
  defaultDep.setHours(defaultDep.getHours() + 1);
  const [departureTime, setDepartureTime] = useState(toLocalDatetimeInput(defaultDep));
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [nbPoints, setNbPoints] = useState(5);

  // Results
  const [weatherPoints, setWeatherPoints] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.name.endsWith('.gpx')) {
      setParseError(t('gpx.error.not.gpx'));
      return;
    }
    setParseError(null);
    try {
      const data = await parseGpxFile(file);
      setGpxData(data);
      setStep('config');
    } catch (e) {
      setParseError(e.message || t('gpx.error.parse'));
    }
  }, [t]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!gpxData) return;
    setStep('loading');
    setFetchError(null);
    try {
      const depIso = new Date(departureTime).toISOString();
      const pts = sampleWeatherPoints(gpxData, nbPoints, depIso, durationMinutes);
      const results = await fetchWeatherForPoints(pts);
      setWeatherPoints(results);
      setStep('results');
      saveTrace({
        name: gpxData.name,
        originalName: gpxData.name,
        distance: gpxData.totalDistKm,
        elevationGain: gpxData.elevGain,
        altMax: gpxData.altMax ?? 0,
        pointsCount: pts.length,
        activity,
        sampledPoints: pts.map((p) => ({ lat: p.lat, lon: p.lon, ele: p.ele, dist: p.dist, label: p.label })),
      });
    } catch (e) {
      setFetchError(e.message || t('error'));
      setStep('config');
    }
  };

  const handleSelectTrace = async (trace) => {
    if (!trace.sampledPoints?.length) return;
    setStep('loading');
    setFetchError(null);
    try {
      const depTime = new Date(departureTime);
      const durationMs = durationMinutes * 60 * 1000;
      const totalDist = trace.sampledPoints[trace.sampledPoints.length - 1]?.dist ?? 1;
      const pts = trace.sampledPoints.map((p, i) => {
        const fraction = totalDist > 0 ? (p.dist ?? 0) / totalDist : i / (trace.sampledPoints.length - 1);
        return {
          ...p,
          arrivalTime: new Date(depTime.getTime() + fraction * durationMs).toISOString(),
          label: p.label ?? `Point ${i + 1}`,
        };
      });
      const results = await fetchWeatherForPoints(pts);
      setWeatherPoints(results);
      setGpxData({ name: trace.name, totalDistKm: trace.distance, elevGain: trace.elevationGain, elevLoss: 0 });
      setStep('results');
    } catch (e) {
      setFetchError(e.message || t('error'));
      setStep('drop');
    }
  };

  const scoreFunc = getScoreFunc(activity);

  return (
    <div className="flex flex-col bg-[var(--color-bg)]">

      {/* STEP: Drop */}
      {step === 'drop' && (
        <div className="flex flex-col gap-4 p-4">
          {/* 1. Zone de drop */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 cursor-pointer transition-colors select-none"
            style={{
              borderColor: dragOver ? color : 'var(--color-border)',
              backgroundColor: dragOver ? `${color}10` : 'var(--color-surface-2)',
            }}
          >
            <span className="text-5xl">🗺️</span>
            <span className="text-sm font-medium text-[var(--color-text)]">{t('gpx.drop')}</span>
            <span className="text-xs text-[var(--color-text-3)]">{t('gpx.drop.sub')}</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".gpx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {parseError && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{parseError}</div>
          )}

          {/* 2. Tracés récents */}
          {traces.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-3)] mb-2">
                Tracés récents
              </p>
              <div className="flex flex-col gap-2">
                {traces.map((trace) => (
                  <TraceRow
                    key={trace.id}
                    trace={trace}
                    color={color}
                    onDelete={() => deleteTrace(trace.id)}
                    onRename={(name) => renameTrace(trace.id, name)}
                    onSelect={() => handleSelectTrace(trace)}
                  />
                ))}
              </div>
              <p className="text-[10px] text-[var(--color-text-3)] text-center mt-3">
                Appui long sur un tracé pour le renommer
              </p>
            </div>
          )}
        </div>
      )}

      {/* STEP: Config */}
      {step === 'config' && gpxData && (
        <div className="p-4 flex flex-col gap-5">
          <div className="rounded-2xl p-4" style={{ backgroundColor: `${color}15` }}>
            <div className="font-semibold text-[var(--color-text)] mb-1 truncate">{gpxData.name}</div>
            <div className="flex gap-4 text-sm text-[var(--color-text-2)]">
              <span>📏 {gpxData.totalDistKm?.toFixed(1)} km</span>
              <span>⬆️ {gpxData.elevGain} m</span>
              <span>⬇️ {gpxData.elevLoss} m</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-3)]">
              {t('gpx.departure')}
            </label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="rounded-xl px-3 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-3)]">
              {t('gpx.duration')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_PRESETS.map(({ label, minutes }) => (
                <button
                  key={minutes}
                  onClick={() => setDurationMinutes(minutes)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={
                    durationMinutes === minutes
                      ? { backgroundColor: color, color: 'white' }
                      : { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-2)' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-3)]">
              {t('gpx.points')} — {nbPoints}
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={nbPoints}
              onChange={(e) => setNbPoints(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: color }}
            />
            <div className="flex justify-between text-xs text-[var(--color-text-3)]">
              <span>3</span>
              <span>10</span>
            </div>
          </div>

          {fetchError && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{fetchError}</div>
          )}

          <button
            onClick={handleAnalyze}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-base"
            style={{ backgroundColor: color }}
          >
            {t('gpx.analyze')}
          </button>

          <button
            onClick={() => setStep('drop')}
            className="text-center text-sm text-[var(--color-text-3)] py-1"
          >
            {t('gpx.change.file')}
          </button>
        </div>
      )}

      {/* STEP: Loading */}
      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center gap-4 p-12">
          <div className="text-4xl animate-spin">🌐</div>
          <p className="text-sm text-[var(--color-text-2)]">{t('gpx.loading')}</p>
        </div>
      )}

      {/* STEP: Results */}
      {step === 'results' && weatherPoints && (
        <div className="flex flex-col gap-4 pt-4 pb-4">
          <div className="px-4">
            <div className="rounded-2xl p-4" style={{ backgroundColor: `${color}15` }}>
              <div className="font-semibold text-[var(--color-text)] mb-1 truncate">{gpxData?.name}</div>
              <div className="flex gap-4 text-sm text-[var(--color-text-2)]">
                <span>📏 {gpxData?.totalDistKm?.toFixed(1)} km</span>
                <span>⬆️ {gpxData?.elevGain} m</span>
                <span>
                  🕐 {Math.floor(durationMinutes / 60)}h{durationMinutes % 60 > 0 ? String(durationMinutes % 60).padStart(2, '0') : ''}
                </span>
              </div>
            </div>
          </div>

          <GpxTimeline
            points={weatherPoints}
            windUnit={windUnit}
            lang={lang}
            scoreFunc={scoreFunc}
            color={color}
          />

          <div className="px-4 flex flex-col gap-2">
            <button
              onClick={() => setStep('config')}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-2)' }}
            >
              {t('gpx.modify')}
            </button>
            <button
              onClick={() => { setStep('drop'); setGpxData(null); setWeatherPoints(null); }}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-2)' }}
            >
              {t('gpx.new')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default memo(GpxImportScreen);
