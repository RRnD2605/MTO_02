import { wmoIcon, windDirection, formatWind } from '../../utils/weatherUtils.js';

const SLOTS = [
  { key: 'morning',   labelFr: 'Matin',      labelEn: 'Morning',   hour: 8  },
  { key: 'noon',      labelFr: 'Midi',        labelEn: 'Noon',      hour: 13 },
  { key: 'afternoon', labelFr: 'Après-midi',  labelEn: 'Afternoon', hour: 16 },
  { key: 'evening',   labelFr: 'Soir',        labelEn: 'Evening',   hour: 20 },
];

export default function DaySlots({ hours, lang, windUnit }) {
  return (
    <div className="px-4 grid grid-cols-4 gap-2">
      {SLOTS.map(({ key, labelFr, labelEn, hour }) => {
        const slot = hours.find((h) => h.hour === hour);
        const label = lang === 'en' ? labelEn : labelFr;
        if (!slot) return (
          <div key={key} className="bg-[var(--color-surface-2)] rounded-xl p-2 text-center opacity-30">
            <div className="text-xs text-[var(--color-text-3)]">{label}</div>
          </div>
        );
        return (
          <div key={key} className="bg-[var(--color-surface-2)] rounded-xl p-2 text-center">
            <div className="text-xs text-[var(--color-text-3)] mb-1">{label}</div>
            <div className="text-lg">{wmoIcon(slot.weathercode)}</div>
            <div className="text-sm font-mono font-medium text-[var(--color-text)] mt-1">
              {Math.round(slot.temp)}°
            </div>
            <div className="text-xs text-[var(--color-city-text)] mt-0.5">
              {formatWind(slot.windspeed, windUnit)}
            </div>
            <div className="text-xs text-[var(--color-text-3)]">
              💧{slot.rainProb}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
