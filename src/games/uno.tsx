import { useEffect, useRef, useState } from 'react';
import BigButton from '../components/BigButton';
import MicButton from '../components/MicButton';
import { median } from '../lib/scoring';
import { listen, parseNumber, say } from '../lib/speech';
import type { Game } from './types';

const COLORS = ['red', 'yellow', 'green', 'blue'] as const;
type Color = (typeof COLORS)[number];
type Card = { color: Color; n: number; id: string };

function card(color: Color, n: number): Card {
  return { color, n, id: `${color}-${n}-${Math.random().toString(36).slice(2, 6)}` };
}

function deck() {
  const d: Card[] = [];
  for (const c of COLORS) for (let n = 0; n <= 9; n++) d.push(card(c, n), card(c, n));
  return d.sort(() => Math.random() - 0.5);
}

function playable(hand: Card[], top: Card) {
  return hand.filter((c) => c.color === top.color || c.n === top.n);
}

function UnoGame({
  level,
  onAnswer,
  onFinish,
}: {
  level: number;
  onAnswer: (correct: boolean, ms: number) => void;
  onFinish: (r: { accuracy: number; medianResponseMs: number; itemsAttempted: number }) => void;
}) {
  const bots = level <= 4 ? 2 : 3;
  const [pile, setPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const botHands = useRef<Card[][]>([]);
  const stock = useRef<Card[]>([]);
  const turns = useRef(0);
  const legal = useRef(0);
  const times = useRef<number[]>([]);
  const t0 = useRef(Date.now());
  const ended = useRef(false);

  function deal() {
    const d = deck();
    const me = d.splice(0, 7);
    botHands.current = Array.from({ length: bots }, () => d.splice(0, 7));
    const top = d.shift()!;
    stock.current = d;
    setHand(me);
    setPile([top]);
    t0.current = Date.now();
    say(`The top card is ${top.color} ${top.n}. Play a matching card, or say draw.`);
  }

  useEffect(() => {
    deal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finishIfNeeded(nextHand: Card[]) {
    if (ended.current) return;
    if (nextHand.length === 0 || turns.current >= 18) {
      ended.current = true;
      onFinish({
        accuracy: legal.current / Math.max(1, turns.current),
        medianResponseMs: median(times.current),
        itemsAttempted: turns.current,
      });
    }
  }

  function botsPlay(top: Card) {
    let cur = top;
    botHands.current = botHands.current.map((h) => {
      const opts = playable(h, cur);
      if (opts.length === 0) {
        const drawn = stock.current.shift();
        return drawn ? [...h, drawn] : h;
      }
      const pick = opts[0];
      cur = pick;
      say(`An opponent played ${pick.color} ${pick.n}.`);
      return h.filter((c) => c.id !== pick.id);
    });
    setPile((p) => [...p, cur]);
    return cur;
  }

  function playCard(c: Card, top: Card) {
    const ms = Date.now() - t0.current;
    turns.current += 1;
    const ok = c.color === top.color || c.n === top.n;
    times.current.push(ms);
    onAnswer(ok, ms);
    if (!ok) {
      say('That card does not match. Try another, or draw.');
      return;
    }
    legal.current += 1;
    const next = hand.filter((x) => x.id !== c.id);
    setHand(next);
    const afterBots = botsPlay(c);
    t0.current = Date.now();
    say(`Top card is ${afterBots.color} ${afterBots.n}.`);
    finishIfNeeded(next);
  }

  function draw() {
    const ms = Date.now() - t0.current;
    turns.current += 1;
    const top = pile[pile.length - 1];
    const could = playable(hand, top).length === 0;
    times.current.push(ms);
    onAnswer(could, ms);
    if (could) legal.current += 1;
    const drawn = stock.current.shift();
    if (drawn) setHand([...hand, drawn]);
    say(drawn ? `You drew ${drawn.color} ${drawn.n}.` : 'The deck is empty.');
    t0.current = Date.now();
  }

  async function voice() {
    const said = await listen();
    const top = pile[pile.length - 1];
    if (!top) return;
    if (said.includes('draw')) {
      draw();
      return;
    }
    if (said.includes('what') || said.includes('playable')) {
      const opts = playable(hand, top);
      say(opts.length ? opts.map((c) => `${c.color} ${c.n}`).join(', ') : 'None. Say draw.');
      return;
    }
    const color = COLORS.find((c) => said.includes(c));
    const n = parseNumber(said);
    const match = hand.find((c) => (color ? c.color === color : true) && (n == null || c.n === n));
    if (match) playCard(match, top);
  }

  const top = pile[pile.length - 1];
  return (
    <div className="stack">
      <p className="prompt">
        Top card: {top ? `${top.color} ${top.n}` : '…'}
      </p>
      <p className="small">{bots} opponents · match color or number</p>
      <div className="stack">
        {hand.map((c) => (
          <BigButton key={c.id} onClick={() => top && playCard(c, top)}>
            {c.color} {c.n}
          </BigButton>
        ))}
      </div>
      <MicButton onClick={voice} />
      <BigButton onClick={draw}>Draw a card</BigButton>
    </div>
  );
}

const uno: Game = {
  id: 'uno',
  name: 'Online Uno',
  domain: 'executive',
  modeledOn: 'Wisconsin Card Sorting Test analog',
  description: 'Play Uno. Match the color or number as the rule changes.',
  ready: true,
  Component: UnoGame,
};

export default uno;
