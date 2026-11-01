import type { Domain, Session } from '../games/types';

export function sessionScore(level: number, accuracy: number) {
  return (level - 1) * 10 + accuracy * 10;
}

export function median(values: number[]) {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function domainScore(sessions: Session[], domain: Domain) {
  const recent = sessions
    .filter((s) => s.domain === domain)
    .slice(-5);
  if (recent.length === 0) return null;
  return recent.reduce((a, s) => a + s.score, 0) / recent.length;
}

export function brainHealthIndex(sessions: Session[]) {
  const domains: Domain[] = [
    'workingMemory',
    'attention',
    'language',
    'numerical',
    'visuospatial',
    'executive',
  ];
  const scores: number[] = [];
  for (const d of domains) {
    const n = sessions.filter((s) => s.domain === d).length;
    if (n < 3) continue;
    const score = domainScore(sessions, d);
    if (score != null) scores.push(score);
  }
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function slope(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 3) return 0;
  const mx = points.reduce((a, p) => a + p.x, 0) / n;
  const my = points.reduce((a, p) => a + p.y, 0) / n;
  const num = points.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0);
  const den = points.reduce((a, p) => a + (p.x - mx) ** 2, 0);
  return den === 0 ? 0 : num / den;
}

export function pointsPerWeek(sessions: Session[], domain: Domain) {
  const inDomain = sessions.filter((s) => s.domain === domain).slice(-8);
  if (inDomain.length < 3) return 0;
  const first = new Date(sessions[0].playedAt).getTime();
  const points = inDomain.map((s) => ({
    x: (new Date(s.playedAt).getTime() - first) / 86_400_000,
    y: s.score,
  }));
  return slope(points) * 7;
}
