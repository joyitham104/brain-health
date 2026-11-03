import { useEffect, useRef, useState } from 'react';
import BigButton from '../components/BigButton';
import MicButton from '../components/MicButton';
import { median } from '../lib/scoring';
import { listen, parseNumber, say } from '../lib/speech';
import type { Game } from './types';

type Riddle = { text: string; answer: number; picture: 'apples' | 'coins' | 'none'; shown: number };

function makeRiddle(level: number): Riddle {
  if (level <= 3) {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * 9);
    const noun = a === 1 ? 'apple' : 'apples';
    return {
      text: `There ${a === 1 ? 'is' : 'are'} ${a} ${noun}. You get ${b} more. How many now?`,
      answer: a + b,
      picture: 'apples',
      shown: a,
    };
  }
  if (level <= 6) {
    const a = 10 + Math.floor(Math.random() * 20);
    const b = 2 + Math.floor(Math.random() * 8);
    return { text: `You have ${a} cents. You spend ${b} cents. How many cents are left?`, answer: a - b, picture: 'coins', shown: a };
  }
  const dollars = 5 + Math.floor(Math.random() * 10);
  const spend = 1 + Math.floor(Math.random() * 4);
  const extra = 2 + Math.floor(Math.random() * 5);
  return {
    text: `A snack costs ${dollars} dollars. You pay, then buy ${spend} more dollars of fruit, then find ${extra} dollars. How many dollars did you spend?`,
    answer: dollars + spend,
    picture: 'none',
    shown: 0,
  };
}

function choices(answer: number) {
  const set = new Set([answer]);
  while (set.size < 4) set.add(Math.max(0, answer + Math.floor(Math.random() * 11) - 5));
  return [...set].sort(() => Math.random() - 0.5);
}

function Picture({ kind, n }: { kind: Riddle['picture']; n: number }) {
  if (kind === 'none') return null;
  const count = Math.min(12, Math.max(1, n));
  return (
    <svg viewBox="0 0 240 80" width="100%" height="80" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={20 + (i % 8) * 28}
          cy={i < 8 ? 24 : 56}
          r="12"
          fill={kind === 'apples' ? '#b42318' : '#ca8a04'}
          stroke="#1b1b1b"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function MathRiddlesGame({
  level,
  onAnswer,
  onFinish,
}: {
  level: number;
  onAnswer: (correct: boolean, ms: number) => void;
  onFinish: (r: { accuracy: number; medianResponseMs: number; itemsAttempted: number }) => void;
}) {
  const [q, setQ] = useState(() => makeRiddle(level));
  const [opts, setOpts] = useState(() => choices(q.answer));
  const n = useRef(0);
  const right = useRef(0);
  const times = useRef<number[]>([]);
  const start = useRef(Date.now());
  const levelRef = useRef(level);
  levelRef.current = level;

  function show(next: Riddle) {
    setQ(next);
    setOpts(choices(next.answer));
    start.current = Date.now();
    say(next.text);
  }

  useEffect(() => {
    say(q.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(nVal: number) {
    const ms = Date.now() - start.current;
    const ok = nVal === q.answer;
    times.current.push(ms);
    if (ok) right.current += 1;
    onAnswer(ok, ms);
    n.current += 1;
    say(ok ? 'Yes.' : `The answer was ${q.answer}.`);
    if (n.current >= 8) {
      onFinish({ accuracy: right.current / 8, medianResponseMs: median(times.current), itemsAttempted: 8 });
      return;
    }
    show(makeRiddle(levelRef.current));
  }

  async function voice() {
    const said = await listen();
    const nVal = parseNumber(said);
    if (nVal != null) pick(nVal);
  }

  return (
    <div className="stack">
      <p className="prompt">{q.text}</p>
      <Picture kind={q.picture} n={q.shown} />
      <div className="grid-2">
        {opts.map((o) => (
          <BigButton key={o} onClick={() => pick(o)}>
            {o}
          </BigButton>
        ))}
      </div>
      <MicButton onClick={voice} />
    </div>
  );
}

const mathRiddles: Game = {
  id: 'mathRiddles',
  name: 'Math Riddles',
  domain: 'numerical',
  modeledOn: 'Arithmetic word problems',
  description: 'Solve a short number story. Say the answer or tap it.',
  ready: true,
  Component: MathRiddlesGame,
};

export default mathRiddles;
