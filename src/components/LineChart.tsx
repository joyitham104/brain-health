type Point = { x: number; y: number; label?: string };

export default function LineChart({ points }: { points: Point[] }) {
  const w = 320;
  const h = 160;
  const pad = 28;
  if (points.length === 0) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(100, ...ys);
  const sx = (x: number) =>
    pad + ((x - minX) / (maxX - minX || 1)) * (w - pad * 2);
  const sy = (y: number) =>
    h - pad - ((y - minY) / (maxY - minY || 1)) * (h - pad * 2);
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x)} ${sy(p.y)}`)
    .join(' ');
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Trend">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#1b1b1b" strokeWidth="2" />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#1b1b1b" strokeWidth="2" />
      <text x={pad} y={16} fontSize="12" fill="#1b1b1b">Score</text>
      <text x={w - 70} y={h - 8} fontSize="12" fill="#1b1b1b">Days</text>
      <path d={d} fill="none" stroke="#1f4e3d" strokeWidth="3" />
      {points.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4" fill="#1b1b1b" />
      ))}
    </svg>
  );
}
