export default function AlertBanner({ alerts, t }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="mx-4 flex flex-col gap-2">
      {alerts.map((a, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--color-alert-bg)] text-[var(--color-alert-text)] text-sm font-medium"
        >
          <span className="text-base">{a.icon}</span>
          <span>{t(a.key, a.vars)}</span>
        </div>
      ))}
    </div>
  );
}
