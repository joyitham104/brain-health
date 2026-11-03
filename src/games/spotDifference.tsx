import { useEffect, useRef, useState } from 'react';
import MicButton from '../components/MicButton';
import { median } from '../lib/scoring';
import { listen, say } from '../lib/speech';
import type { Game } from './types';

type Diff = { id: string; label: string; x: number; y: number; hints: string[] };

const ALL: Diff[] = [
  { id: 'sun', label: 'sun', x: 82, y: 12, hints: ['sun', 'circle', 'sky', 'upper right'] },
  { id: 'door', label: 'door handle', x: 28, y: 62, hints: ['door', 'handle', 'house'] },
  { id: 'tree', label: 'tree', x: 70, y: 55, hints: ['tree', 'right', 'plant'] },
  { id: 'window', label: 'window', x: 18, y: 38, hints: ['window', 'left', 'square'] },
  { id: 'path', label: 'path stone', x: 40, y: 84, hints: ['path', 'ground', 'stone', 'bottom'] },
  { id: 'bird', label: 'bird', x: 55, y: 18, hints: ['bird', 'sky', 'flying'] },
  { id: 'flower', label: 'flower', x: 12, y: 78, hints: ['flower', 'left', 'bottom'] },
  { id: 'chimney', label: 'chimney', x: 32, y: 18, hints: ['chimney', 'roof', 'smoke'] },
];

function House({ diffs, found, onHit }: { diffs: Diff[]; found: Set<string>; onHit: (d: Diff) => void }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" onClick={(e) => {
      const svg = e.currentTarget;
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      const hit = diffs.find((d) => Math.hypot(d.x - x, d.y - y) < 10);
      if (hit) onHit(hit);
    }}>
      <rect width="100" height="100" fill="#cde7f0" />
      <rect x="0" y="70" width="100" height="30" fill="#6d8f4e" />
      <rect x="12" y="38" width="40" height="40" fill="#d9b48f" stroke="#1b1b1b" />
      <polygon points="12,38 32,18 52,38" fill="#7a1f1f" />
      {diffs.map((d) => (
        <circle
          key={d.id}
          cx={d.x}
          cy={d.y}
          r={found.has(d.id) ? 6 : 5}
          fill={found.has(d.id) ? '#0a5bd3' : '#e23c2c'}
          opacity={found.has(d.id) ? 1 : 0.85}
        />
      ))}
    </svg>
  );
}

function SpotGame({
  level,
  onAnswer,
  onFinish,
}: {
  level: number;
  onAnswer: (correct: boolean, ms: number) => void;
  onFinish: (r: { accuracy: number; medianResponseMs: number; itemsAttempted: number }) => void;
}) {
  const n = Math.min(8, 3 + Math.floor(((level - 1) * 5) / 9));
  const diffs = useRef(ALL.slice(0, n));
  const [found, setFound] = useState<Set<string>>(new Set());
  const tries = useRef(0);
  const times = useRef<number[]>([]);
  const t0 = useRef(Date.now());

  useEffect(() => {
    say(`Find ${n} differences. Tap the right picture, or describe what is different.`);
  }, [n]);

  function mark(d: Diff) {
    const ms = Date.now() - t0.current;
    tries.current += 1;
    if (found.has(d.id)) {
      onAnswer(false, ms);
      return;
    }
    const next = new Set(found);
    next.add(d.id);
    setFound(next);
    times.current.push(ms);
    t0.current = Date.now();
    onAnswer(true, ms);
    say(`Yes, the ${d.label}.`);
    if (next.size >= diffs.current.length) {
      onFinish({
        accuracy: next.size / diffs.current.length,
        medianResponseMs: median(times.current),
        itemsAttempted: tries.current,
      });
    }
  }

  async function voice() {
    const said = await listen();
    if (said.includes('hint')) {
      const missing = diffs.current.find((d) => !found.has(d.id));
      if (missing) say(`Look near the ${missing.label}.`);
      return;
    }
    const hit = diffs.current.find((d) => d.hints.some((h) => said.includes(h)));
    if (hit) mark(hit);
    else {
      tries.current += 1;
      onAnswer(false, Date.now() - t0.current);
      say('I did not match that. Try tapping the picture.');
    }
  }

  return (
    <div className="stack">
      <p className="prompt">
        Found {found.size} of {diffs.current.length}
      </p>
      <div className="grid-2">
        <svg viewBox="0 0 100 100" width="100%">
          <rect width="100" height="100" fill="#cde7f0" />
          <rect x="0" y="70" width="100" height="30" fill="#6d8f4e" />
          <rect x="12" y="38" width="40" height="40" fill="#d9b48f" stroke="#1b1b1b" />
          <polygon points="12,38 32,18 52,38" fill="#7a1f1f" />
        </svg>
        <House diffs={diffs.current} found={found} onHit={mark} />
      </div>
      <MicButton onClick={voice} />
    </div>
  );
}

const spotDifference: Game = {
  id: 'spotDifference',
  name: 'Spot the Difference',
  domain: 'visuospatial',
  modeledOn: 'Visual search discrimination',
  description: 'Find what changed between two pictures.',
  ready: true,
  Component: SpotGame,
};

export default spotDifference;
