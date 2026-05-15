export default function RainDrop({ prob }) {
  if (prob === 0) {
    return (
      <span style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ filter: 'grayscale(1)', opacity: 0.3 }}>💧</span>
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '-10%',
          width: '120%',
          height: '1.5px',
          background: 'var(--color-text-3)',
          transform: 'translateY(-50%) rotate(-45deg)',
          display: 'block',
          borderRadius: '1px',
        }} />
      </span>
    );
  }
  return <span>💧</span>;
}
