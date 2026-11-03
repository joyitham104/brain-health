/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELEVENLABS_API_KEY?: string;
  readonly VITE_ELEVENLABS_VOICE_ID?: string;
}

interface SpeechRec extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  processLocally?: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecConstructor {
  new (): SpeechRec;
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>;
  install?: (options: { langs: string[] }) => Promise<boolean>;
}

interface Window {
  webkitSpeechRecognition?: SpeechRecConstructor;
  SpeechRecognition?: SpeechRecConstructor;
}
