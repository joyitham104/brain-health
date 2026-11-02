const DEFAULT_VOICE = '21m00Tcm4TlvDq8ikWAM';
const cache = new Map<string, Blob>();

let player: HTMLAudioElement | null = null;
let objectUrl: string | null = null;
let abort: AbortController | null = null;

export function cancelSpeech() {
  abort?.abort();
  abort = null;
  window.speechSynthesis.cancel();
  if (player) {
    player.pause();
    player.removeAttribute('src');
    player = null;
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}

function browserSay(text: string) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

async function elevenSay(text: string, key: string, signal: AbortSignal) {
  let blob = cache.get(text);
  if (!blob) {
    const voice = import.meta.env.VITE_ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
    const path = `/v1/text-to-speech/${voice}`;
    const url = import.meta.env.DEV
      ? `/elevenlabs${path}`
      : `https://api.elevenlabs.io${path}`;
    const res = await fetch(url, {
      method: 'POST',
      signal,
      headers: {
        'xi-api-key': key,
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.65, similarity_boost: 0.75 },
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
    blob = await res.blob();
    if (cache.size > 50) cache.clear();
    cache.set(text, blob);
  }
  if (signal.aborted) return;
  objectUrl = URL.createObjectURL(blob);
  player = new Audio(objectUrl);
  await player.play();
}

export function say(text: string) {
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!key) {
    cancelSpeech();
    browserSay(text);
    return;
  }
  cancelSpeech();
  abort = new AbortController();
  const { signal } = abort;
  void elevenSay(text, key, signal).catch(() => {
    if (!signal.aborted) browserSay(text);
  });
}

function Recognition() {
  const C = window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  return C ? new C() : null;
}

export function listen(ms = 6000): Promise<string> {
  return new Promise((resolve, reject) => {
    const rec = Recognition();
    if (!rec) {
      reject(new Error('Speech recognition is not available in this browser.'));
      return;
    }
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    let done = false;
    const finish = (spoken: string) => {
      if (done) return;
      done = true;
      rec.stop();
      resolve(spoken.trim().toLowerCase());
    };
    rec.onresult = (e: { results: SpeechRecognitionResultList }) => {
      finish(e.results[0]?.[0]?.transcript ?? '');
    };
    rec.onerror = () => {
      if (!done) {
        done = true;
        reject(new Error('Could not hear that.'));
      }
    };
    rec.onend = () => {
      if (!done) finish('');
    };
    rec.start();
    window.setTimeout(() => rec.stop(), ms);
  });
}

export async function confirm(guess: string): Promise<boolean> {
  say(`Did you say ${guess}?`);
  const answer = await listen(4000);
  return /^(yes|yeah|yep|correct|right)\b/.test(answer);
}

export function parseNumber(spoken: string): number | null {
  const digits = spoken.match(/-?\d+/);
  if (digits) return Number(digits[0]);
  const words: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  };
  for (const [w, n] of Object.entries(words)) {
    if (spoken.includes(w)) return n;
  }
  return null;
}
