import { useRef, useEffect } from 'react';
import { getWeatherIcon, formatWind } from '../../utils/weatherUtils.js';

export default function HourlyScroll({ hours, windUnit }) {
  const now = new Date();
  const currentHour = now.getHours();
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }, [hours]);

  if (!hours || hours.length === 0) return null;

  return (
    <div className="px-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {hours.map((h) => {
          const isNow = h.hour === currentHour;
          return (
            <div
              key={h.time}
              ref={isNow ? activeRef : null}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl min-w-[60px] transition-colors ${
                isNow
                  ? 'bg-[var(--color-city-bg)] border-2 border-[var(--color-city)]'
                  : 'bg-[var(--color-surface-2)]'
              }`}
            >
              <span className="text-xs font-mono text-[var(--color-text-3)]">{h.hour}h</span>
              <span className="text-xl">{getWeatherIcon(h.weathercode)}</span>
              <span className="text-sm font-mono font-medium text-[var(--color-text)]">
                {Math.round(h.temp)}°
              </span>
              <span className="text-xs text-[var(--color-text-3)] font-mono">
                {h.rainProb}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
