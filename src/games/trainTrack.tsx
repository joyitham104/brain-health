import { useEffect, useRef, useState } from 'react';
import BigButton from '../components/BigButton';
import MicButton from '../components/MicButton';
import { median } from '../lib/scoring';
import { listen, say } from '../lib/speech';
import type { Game } from './types';

type Cell = { r: number; c: number };

function key(c: Cell) {
  return `${c.r},${c.c}`;
}

function neighbors(c: Cell, n: number) {
  return [
    { r: c.r - 1, c: c.c },
    { r: c.r + 1, c: c.c },
    { r: c.r, c: c.c - 1 },
    { r: c.r, c: c.c + 1 },
  ].filter((x) => x.r >= 0 && x.c >= 0 && x.r < n && x.c < n);
}

function TrainTrackGame({
  level,
  onAnswer,
  onFinish,
}: {
  level: number;
  onAnswer: (correct: boolean, ms: number) => void;
  onFinish: (r: { accuracy: number; medianResponseMs: number; itemsAttempted: number }) => void;
}) {
  const n = level <= 4 ? 4 : 5;
  const start: Cell = { r: 0, c: 0 };
  const end: Cell = { r: n - 1, c: n - 1 };
  const blocked = useRef(new Set<string>());
  const [path, setPath] = useState<Cell[]>([start]);
  const round = useRef(0);
  const attempts = useRef(0);
  const hits = useRef(0);
  const times = useRef<number[]>([]);
  const t0 = useRef(Date.now());
  const levelRef = useRef(level);
  levelRef.current = level;

  function layout(lv: number) {
    const size = lv <= 4 ? 4 : 5;
    const block = new Set<string>();
    const count = lv >= 7 ? 4 : lv >= 4 ? 2 : 0;
    while (block.size < count) {
      const r = 1 + Math.floor(Math.random() * (size - 2));
      const c = 1 + Math.floor(Math.random() * (size - 2));
      const k = `${r},${c}`;
      if (k !== '0,0' && k !== `${size - 1},${size - 1}`) block.add(k);
    }
    blocked.current = block;
    setPath([{ r: 0, c: 0 }]);
    t0.current = Date.now();
  }

  useEffect(() => {
    layout(level);
    say('Lay a track from the station to the destination. Tap a neighboring square, or say up, down, left, or right.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function moveTo(cell: Cell) {
    const last = path[path.length - 1];
    const okAdj = neighbors(last, n).some((x) => x.r === cell.r && x.c === cell.c);
    const okClear = !blocked.current.has(key(cell));
    attempts.current += 1;
    const ms = Date.now() - t0.current;
    if (!okAdj || !okClear) {
      onAnswer(false, ms);
      say('That square is not open.');
      return;
    }
    const next = [...path, cell];
    setPath(next);
    onAnswer(true, ms);
    if (cell.r === end.r && cell.c === end.c) {
      hits.current += 1;
      times.current.push(Date.now() - t0.current);
      round.current += 1;
      say('The train can reach the station.');
      if (round.current >= 2) {
        onFinish({
          accuracy: hits.current / Math.max(1, attempts.current),
          medianResponseMs: median(times.current),
          itemsAttempted: attempts.current,
        });
        return;
      }
      layout(levelRef.current);
    }
  }

  async function voice() {
    const said = await listen();
    const last = path[path.length - 1];
    const dir =
      said.includes('up') || said.includes('north')
        ? { r: last.r - 1, c: last.c }
        : said.includes('down') || said.includes('south')
          ? { r: last.r + 1, c: last.c }
          : said.includes('left') || said.includes('west')
            ? { r: last.r, c: last.c - 1 }
            : said.includes('right') || said.includes('east')
              ? { r: last.r, c: last.c + 1 }
              : null;
    if (dir) moveTo(dir);
  }

  return (
    <div className="stack">
      <p className="prompt">Connect the station to the destination</p>
      <div className={n === 4 ? 'grid-4' : 'grid-5'}>
        {Array.from({ length: n * n }, (_, i) => {
          const cell = { r: Math.floor(i / n), c: i % n };
          const onPath = path.some((p) => p.r === cell.r && p.c === cell.c);
          const isBlock = blocked.current.has(key(cell));
          const isStart = cell.r === 0 && cell.c === 0;
          const isEnd = cell.r === n - 1 && cell.c === n - 1;
          return (
            <button
              key={i}
              className="big-btn"
              style={{
                minHeight: 64,
                background: isBlock ? '#9f1239' : onPath ? '#0a5bd3' : '#ffffff',
                color: isBlock || onPath ? '#ffffff' : '#0b1f3a',
              }}
              onClick={() => moveTo(cell)}
            >
              {isStart ? 'S' : isEnd ? 'E' : isBlock ? 'X' : ''}
            </button>
          );
        })}
      </div>
      <MicButton onClick={() => void voice().catch(() => undefined)} />
      <BigButton onClick={() => layout(levelRef.current)}>Undo / reset track</BigButton>
    </div>
  );
}

const trainTrack: Game = {
  id: 'trainTrack',
  name: 'Train Track',
  domain: 'visuospatial',
  modeledOn: 'Trail Making Test',
  description: 'Build a path from the station to the destination.',
  ready: true,
  Component: TrainTrackGame,
};

export default trainTrack;
