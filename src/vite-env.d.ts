/// <reference types="vite/client" />

interface SpeechRec extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface Window {
  webkitSpeechRecognition?: new () => SpeechRec;
  SpeechRecognition?: new () => SpeechRec;
}
