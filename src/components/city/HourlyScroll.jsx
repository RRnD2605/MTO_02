import { useRef, useEffect } from 'react';
import { getWeatherIcon } from '../../utils/weatherUtils.js';

export default function HourlyScroll({ hours, isToday }) {
  const now = new Date();
  const currentHour = now.getHours();
  const activeRef = useRef(null);

  // For today: filter from currentHour-1; for other days: show all
  const visibleHours = isToday
    ? hours.filter((h) => h.hour >= Math.max(0, currentHour - 1))
    : hours;

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }, [visibleHours]);

  if (!visibleHours || visibleHours.length === 0) return null;

  return (
    <div className="px-4 overflow-hidden">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {visibleHours.map((h) => {
          const isNow = isToday && h.hour === currentHour;
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
                {h.rainProb ?? 0}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
