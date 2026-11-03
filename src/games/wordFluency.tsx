import { useEffect, useRef, useState } from 'react';
import MicButton from '../components/MicButton';
import { median } from '../lib/scoring';
import { cancelSpeech, createSpeechRecognition, listen, say } from '../lib/speech';
import { matchWord, pickCategories, targetFor, type Category } from './categories';
import type { Game } from './types';

function WordFluencyGame({
  level,
  onAnswer,
  onFinish,
}: {
  level: number;
  onAnswer: (correct: boolean, responseMs: number) => void;
  onFinish: (r: {
    accuracy: number;
    medianResponseMs: number;
    itemsAttempted: number;
    notes?: string;
  }) => void;
}) {
  const cats = useRef(pickCategories(level));
  const [idx, setIdx] = useState(0);
  const [heard, setHeard] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const unique = useRef<Set<string>>(new Set());
  const knownCount = useRef(0);
  const gaps = useRef<number[]>([]);
  const lastWord = useRef(0);
  const unknown = useRef<string[]>([]);
  const catRef = useRef<Category>(cats.current[0]);

  function startCategory(i: number) {
    const cat = cats.current[i];
    catRef.current = cat;
    unique.current = new Set();
    setHeard([]);
    lastWord.current = Date.now();
    say(`Name as many ${cat.name} as you can.`);
  }

  useEffect(() => {
    startCategory(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function ingest(text: string) {
    const parts = text.split(/[\s,]+/).filter(Boolean);
    for (const p of parts) {
      const { word, known } = matchWord(p, catRef.current);
      if (!word || unique.current.has(word)) continue;
      unique.current.add(word);
      const now = Date.now();
      gaps.current.push(now - lastWord.current);
      lastWord.current = now;
      if (known) knownCount.current += 1;
      else unknown.current.push(word);
      onAnswer(known, gaps.current.at(-1) ?? 0);
      setHeard([...unique.current]);
    }
  }

  async function listenRound() {
    cancelSpeech();
    const rec = await createSpeechRecognition();
    setListening(true);
    try {
      if (!rec) {
        ingest(await listen(45000));
      } else {
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';
        await new Promise<void>((resolve, reject) => {
          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            resolve();
          };
          rec.onresult = (e: { results: SpeechRecognitionResultList }) => {
            const said = e.results[e.results.length - 1]?.[0]?.transcript ?? '';
            ingest(said);
          };
          rec.onerror = (event: Event) => {
            if (done) return;
            done = true;
            const code = (event as Event & { error?: string }).error;
            reject(
              new Error(
                code === 'not-allowed' || code === 'service-not-allowed'
                  ? 'Microphone access was blocked. Allow microphone access in your browser, then try again.'
                  : code === 'audio-capture'
                    ? 'No working microphone was found. Check your microphone and Windows sound settings.'
                    : 'Listening stopped unexpectedly. Please try again.',
              ),
            );
          };
          rec.onend = finish;
          rec.start();
          window.setTimeout(() => {
            if (!done) rec.stop();
          }, 45000);
        });
      }
    } finally {
      setListening(false);
    }
    const target = targetFor(level);
    const acc = Math.min(1, unique.current.size / target);
    onAnswer(acc >= 0.5, 0);
    if (idx === 0) {
      setIdx(1);
      startCategory(1);
    } else {
      onFinish({
        accuracy: Math.min(1, knownCount.current / (targetFor(level) * 2)),
        medianResponseMs: median(gaps.current),
        itemsAttempted: unique.current.size,
        notes: unknown.current.length ? `unknown: ${unknown.current.join(', ')}` : undefined,
      });
    }
  }

  return (
    <div className="stack">
      <p className="prompt">{cats.current[idx].name}</p>
      <p className="small">Speak as many as you can. There is no on-screen timer.</p>
      <div className="words">
        {heard.map((w) => (
          <span className="chip" key={w}>
            {w}
          </span>
        ))}
      </div>
      <MicButton
        listening={listening}
        disabled={listening}
        onClick={listenRound}
        label="Start speaking"
      />
    </div>
  );
}

const wordFluency: Game = {
  id: 'wordFluency',
  name: 'Word Fluency',
  domain: 'language',
  modeledOn: 'Verbal fluency test',
  description: 'Name as many words as you can in a category, using your voice.',
  ready: true,
  Component: WordFluencyGame,
};

export default wordFluency;
