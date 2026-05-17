import { wmoIcon, formatWind } from '../../utils/weatherUtils.js';
import RainDrop from '../shared/RainDrop.jsx';

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
          <div
            key={key}
            className="rounded-xl p-2 opacity-30"
            style={{ backgroundColor: '#E8ECF0', border: '1px solid rgba(49,60,72,0.1)' }}
          >
            <div className="text-sm mb-1">·</div>
            <div className="text-xs" style={{ color: '#8A909A' }}>{label}</div>
          </div>
        );
        return (
          <div
            key={key}
            className="rounded-xl p-2"
            style={{ backgroundColor: '#E8ECF0', border: '1px solid rgba(49,60,72,0.1)' }}
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm">{wmoIcon(slot.weathercode)}</span>
              <span className="text-xs truncate" style={{ color: '#8A909A' }}>{label}</span>
            </div>
            <div className="text-sm font-mono font-medium text-[var(--color-text)]">
              {Math.round(slot.temp)}°
            </div>
            <div className="text-xs font-medium mt-0.5 truncate" style={{ color: '#313C48' }}>
              {formatWind(slot.windspeed, windUnit)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#8A909A' }}>
              <RainDrop prob={slot.rainProb} />{slot.rainProb}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
