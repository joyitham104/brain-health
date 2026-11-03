import { useEffect, useRef, useState } from 'react';
import MicButton from '../components/MicButton';
import { median } from '../lib/scoring';
import { listen, say } from '../lib/speech';
import type { Game } from './types';

const COLORS = [
  { name: 'red', hex: '#b42318' },
  { name: 'blue', hex: '#1d4ed8' },
  { name: 'yellow', hex: '#ca8a04' },
  { name: 'green', hex: '#15803d' },
  { name: 'orange', hex: '#c2410c' },
  { name: 'purple', hex: '#6d28d9' },
  { name: 'brown', hex: '#7c2d12' },
  { name: 'pink', hex: '#be185d' },
  { name: 'teal', hex: '#0f766e' },
];

function seqLen(level: number) {
  return 2 + Math.round(((level - 1) * 5) / 9);
}

function PatternRecallGame({
  level,
  onAnswer,
  onFinish,
}: {
  level: number;
  onAnswer: (correct: boolean, responseMs: number) => void;
  onFinish: (r: { accuracy: number; medianResponseMs: number; itemsAttempted: number }) => void;
}) {
  const size = level <= 3 ? 2 : 3;
  const tiles = COLORS.slice(0, size * size);
  const [lit, setLit] = useState<number | null>(null);
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<'watch' | 'repeat'>('watch');
  const trial = useRef(0);
  const correctCount = useRef(0);
  const times = useRef<number[]>([]);
  const startMs = useRef(0);
  const levelRef = useRef(level);
  levelRef.current = level;

  function playSeq(next: number[]) {
    setPhase('watch');
    setInput([]);
    setSeq(next);
    let i = 0;
    const tick = () => {
      setLit(next[i]);
      window.setTimeout(() => {
        setLit(null);
        i += 1;
        if (i < next.length) window.setTimeout(tick, 280);
        else {
          setPhase('repeat');
          startMs.current = Date.now();
          say('Your turn. Tap the colors or say them.');
        }
      }, 520);
    };
    window.setTimeout(tick, 400);
  }

  function startTrial() {
    const n = seqLen(levelRef.current);
    const next = Array.from({ length: n }, () => Math.floor(Math.random() * tiles.length));
    playSeq(next);
  }

  useEffect(() => {
    say('Watch the colors, then repeat them.');
    startTrial();
    // one session start only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(nextInput: number[]) {
    if (phase !== 'repeat') return;
    if (nextInput.length < seq.length) {
      setInput(nextInput);
      return;
    }
    const ok = nextInput.every((v, i) => v === seq[i]);
    const ms = Date.now() - startMs.current;
    times.current.push(ms);
    if (ok) correctCount.current += 1;
    onAnswer(ok, ms);
    trial.current += 1;
    say(ok ? 'Yes.' : 'Not quite.');
    if (trial.current >= 6) {
      onFinish({
        accuracy: correctCount.current / 6,
        medianResponseMs: median(times.current),
        itemsAttempted: 6,
      });
      return;
    }
    window.setTimeout(startTrial, 700);
  }

  async function voice() {
    const said = await listen(5000);
    const idx = tiles.findIndex((c) => said.includes(c.name));
    if (idx >= 0) submit([...input, idx]);
  }

  return (
    <div className="stack">
      <p className="prompt">{phase === 'watch' ? 'Watch' : 'Repeat the pattern'}</p>
      <div className={size === 2 ? 'grid-2' : 'grid-3'}>
        {tiles.map((c, i) => (
          <button
            key={c.name}
            className="big-btn"
            style={{
              background: c.hex,
              color: '#fff8e7',
              outline: lit === i ? '6px solid #1b1b1b' : undefined,
              minHeight: 90,
            }}
            onClick={() => submit([...input, i])}
          >
            {c.name}
          </button>
        ))}
      </div>
      <MicButton onClick={voice} />
    </div>
  );
}

const patternRecall: Game = {
  id: 'patternRecall',
  name: 'Pattern Recall',
  domain: 'workingMemory',
  modeledOn: 'Corsi block tapping',
  description: 'Watch a sequence of colors, then repeat it.',
  ready: true,
  Component: PatternRecallGame,
};

export default patternRecall;
