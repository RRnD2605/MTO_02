const DAY_LABELS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function DaySelector({ dates, selectedIndex, onSelect, t }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-4">
      {dates.map((date, i) => {
        const label =
          i === 0 ? t('today')
          : i === 1 ? t('tomorrow')
          : DAY_LABELS_FR[new Date(date).getDay()];
        const active = i === selectedIndex;
        return (
          <button
            key={date}
            onClick={() => onSelect(i)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border"
            style={
              active
                ? { backgroundColor: '#313C48', color: 'white', borderColor: 'transparent' }
                : { backgroundColor: 'transparent', color: 'var(--color-text-2)', borderColor: 'rgba(49,60,72,0.2)' }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
