import { useEffect, useRef, useState } from 'react';
import MicButton from '../components/MicButton';
import { median } from '../lib/scoring';
import { listen, parseNumber, say } from '../lib/speech';
import type { Game } from './types';

const MAX_LEVEL = 8;

function gridSize(level: number) {
  const lv = Math.min(level, MAX_LEVEL);
  if (lv <= 3) return 3;
  if (lv <= 6) return 4;
  return 5;
}

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function SchulteGame({
  level,
  onAnswer,
  onFinish,
}: {
  level: number;
  onAnswer: (correct: boolean, ms: number) => void;
  onFinish: (r: { accuracy: number; medianResponseMs: number; itemsAttempted: number }) => void;
}) {
  const size = gridSize(level);
  const [nums, setNums] = useState(() => shuffle(Array.from({ length: size * size }, (_, i) => i + 1)));
  const [target, setTarget] = useState(1);
  const next = useRef(1);
  const table = useRef(0);
  const taps = useRef(0);
  const hits = useRef(0);
  const times = useRef<number[]>([]);
  const start = useRef(Date.now());
  const tableStart = useRef(Date.now());
  const tableMiss = useRef(false);
  const levelRef = useRef(level);
  levelRef.current = Math.min(level, MAX_LEVEL);

  function resetBoard(lv: number) {
    const s = gridSize(lv);
    next.current = 1;
    tableMiss.current = false;
    setTarget(1);
    setNums(shuffle(Array.from({ length: s * s }, (_, i) => i + 1)));
    start.current = Date.now();
    tableStart.current = Date.now();
    say('Find number 1.');
  }

  useEffect(() => {
    say('Tap the numbers in order, starting at one. You can also say the number.');
  }, []);

  function choose(n: number) {
    const ms = Date.now() - start.current;
    taps.current += 1;
    const ok = n === next.current;
    if (!ok) {
      tableMiss.current = true;
      say(`Look for ${next.current}.`);
      return;
    }
    hits.current += 1;
    times.current.push(ms);
    start.current = Date.now();
    next.current += 1;
    setTarget(next.current);
    const s = gridSize(levelRef.current);
    if (next.current > s * s) {
      table.current += 1;
      onAnswer(!tableMiss.current, Date.now() - tableStart.current);
      say('Table complete.');
      if (table.current >= 3) {
        onFinish({
          accuracy: hits.current / taps.current,
          medianResponseMs: median(times.current),
          itemsAttempted: taps.current,
        });
        return;
      }
      resetBoard(levelRef.current);
      return;
    }
    say(String(next.current));
  }

  async function voice() {
    const said = await listen();
    const parsed = parseNumber(said);
    if (parsed != null) choose(parsed);
  }

  const cls = size <= 3 ? 'grid-3' : size === 4 ? 'grid-4' : 'grid-5';
  const noisy = levelRef.current >= 7;

  return (
    <div className="stack">
      <p className="prompt">Find {target}</p>
      <div className={cls}>
        {nums.map((n) => (
          <button
            key={n}
            className="big-btn pad schulte-cell"
            onClick={() => choose(n)}
            style={{ minHeight: noisy ? 56 : 64, fontSize: noisy ? 20 : 22 }}
          >
            {n}
            {noisy && <span className="decoy">{(n % 9) + 1}</span>}
          </button>
        ))}
      </div>
      <MicButton onClick={() => void voice().catch(() => undefined)} />
    </div>
  );
}

const schulte: Game = {
  id: 'schulte',
  name: "Schulte's Table",
  domain: 'attention',
  modeledOn: 'Visual search number tables',
  description: 'Find numbers in order on a grid. Say or tap each one.',
  ready: true,
  maxLevel: MAX_LEVEL,
  Component: SchulteGame,
};

export default schulte;
