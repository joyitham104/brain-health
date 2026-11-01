export function say(text: string) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function Recognition() {
  const C =
    window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
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
    const finish = (text: string) => {
      if (done) return;
      done = true;
      rec.stop();
      resolve(text.trim().toLowerCase());
    };
    rec.onresult = (e: { results: SpeechRecognitionResultList }) => {
      const said = e.results[0]?.[0]?.transcript ?? '';
      finish(said);
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
