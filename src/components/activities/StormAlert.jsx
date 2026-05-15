export default function StormAlert({ stormRisk, t }) {
  if (!stormRisk || stormRisk === 'none') return null;
  const configs = {
    confirmed: { bg: '#FEE2E2', text: '#991B1B', icon: '⛈️', key: 'alert.storm.confirmed' },
    high:      { bg: '#FEF3C7', text: '#92400E', icon: '⚡', key: 'alert.storm.high' },
    moderate:  { bg: '#FFF7ED', text: '#C2410C', icon: '🌩️', key: 'alert.storm.moderate' },
  };
  const config = configs[stormRisk];
  if (!config) return null;
  return (
    <div className="mx-4 mb-1 rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: config.bg }}>
      <span className="text-base flex-shrink-0">{config.icon}</span>
      <span className="text-sm font-medium" style={{ color: config.text }}>{t(config.key)}</span>
    </div>
  );
}
