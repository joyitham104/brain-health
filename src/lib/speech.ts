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

export async function createSpeechRecognition() {
  const C = window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  if (!C) return null;
  const rec = new C();

  // Newer Chrome versions can recognize speech on-device. Prefer that mode
  // because the default Web Speech service can fail with a network error.
  if ('processLocally' in rec && C.available) {
    try {
      const options = { langs: ['en-US'], processLocally: true };
      let status = await C.available(options);
      if ((status === 'downloadable' || status === 'downloading') && C.install) {
        const installed = await C.install({ langs: options.langs });
        if (installed) status = 'available';
      }
      if (status === 'available') rec.processLocally = true;
    } catch {
      // Fall back to Chrome's online recognition service.
    }
  }

  return rec;
}

async function recordAudio(ms: number) {
  if (!window.isSecureContext) {
    throw new Error(
      'Chrome blocks microphones on insecure addresses. Open this app at http://localhost:5173 or use HTTPS.',
    );
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Chrome cannot access media devices. Check site microphone permissions and reload the page.');
  }
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('This browser cannot record audio. Update Chrome or Microsoft Edge and try again.');
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
  } catch (reason) {
    const name = reason instanceof DOMException ? reason.name : '';
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      throw new Error('Microphone access was blocked. Allow microphone access in Chrome, then try again.');
    }
    throw new Error('No working microphone was found. Check your microphone and Windows sound settings.');
  }

  const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
  const chunks: Blob[] = [];
  try {
    return await new Promise<Blob>((resolve, reject) => {
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const timer = window.setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, ms);
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error('The microphone stopped unexpectedly. Please try again.'));
      };
      recorder.onstop = () => {
        window.clearTimeout(timer);
        resolve(new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' }));
      };
      recorder.start();
    });
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

async function elevenTranscribe(ms: number, key: string) {
  const audio = await recordAudio(ms);
  if (!audio.size) throw recognitionError('no-speech');

  const extension = audio.type.includes('mp4') ? 'm4a' : 'webm';
  const form = new FormData();
  form.append('file', audio, `speech.${extension}`);
  form.append('model_id', 'scribe_v1');
  form.append('language_code', 'eng');
  const path = '/v1/speech-to-text';
  const url = import.meta.env.DEV ? `/elevenlabs${path}` : `https://api.elevenlabs.io${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': key },
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Speech transcription failed (${response.status}). Please try again.`);
  }
  const result = (await response.json()) as { text?: string };
  const transcript = result.text?.trim().toLowerCase() ?? '';
  if (!transcript) throw recognitionError('no-speech');
  return transcript;
}

function recognitionError(code?: string) {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return new Error('Microphone access was blocked. Allow microphone access in your browser, then try again.');
    case 'audio-capture':
      return new Error('No working microphone was found. Check your microphone and Windows sound settings.');
    case 'network':
      return new Error('Speech recognition needs an internet connection. Check your connection and try again.');
    case 'no-speech':
      return new Error('I did not hear anything. Tap Speak and try again.');
    case 'aborted':
      return new Error('Listening was interrupted. Please try again.');
    default:
      return new Error('I could not understand that. Please try again.');
  }
}

export async function listen(ms = 6000): Promise<string> {
  // Do not let spoken instructions feed back into recognition.
  cancelSpeech();
  const rec = await createSpeechRecognition();
  if (!rec) {
    const key = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (key) return elevenTranscribe(ms, key);
    throw new Error('Speech recognition is unavailable and speech transcription is not configured.');
  }
  return new Promise((resolve, reject) => {
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    let done = false;
    let timer = 0;
    const finish = (spoken: string, stop = true) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      if (stop) {
        try {
          rec.stop();
        } catch {
          // Recognition may already have ended.
        }
      }
      const transcript = spoken.trim().toLowerCase();
      if (transcript) resolve(transcript);
      else reject(recognitionError('no-speech'));
    };
    rec.onresult = (e: { results: SpeechRecognitionResultList }) => {
      finish(e.results[0]?.[0]?.transcript ?? '');
    };
    rec.onerror = (event: Event) => {
      if (!done) {
        done = true;
        window.clearTimeout(timer);
        reject(recognitionError((event as Event & { error?: string }).error));
      }
    };
    rec.onend = () => {
      if (!done) finish('', false);
    };
    try {
      rec.start();
      timer = window.setTimeout(() => {
        if (!done) finish('');
      }, ms);
    } catch {
      done = true;
      reject(new Error('The microphone could not start. Check browser microphone permission and try again.'));
    }
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
