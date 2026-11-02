import type { Progress, Session } from '../games/types';

const SESSIONS_KEY = 'sessions';
const PROGRESS_KEY = 'progress';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSessions(playerCode?: string): Session[] {
  const all = read<Session[]>(SESSIONS_KEY, []);
  return playerCode ? all.filter((s) => s.playerCode === playerCode) : all;
}

export function addSession(session: Session) {
  write(SESSIONS_KEY, [...getSessions(), session]);
}

export function playerCodes(): string[] {
  const codes = new Set(getSessions().map((s) => s.playerCode));
  return [...codes].sort();
}

export function getProgressList(playerCode: string): Progress[] {
  return read<Progress[]>(PROGRESS_KEY, []).filter((p) => p.playerCode === playerCode);
}

export function getProgress(playerCode: string, gameId: string): Progress {
  const all = read<Progress[]>(PROGRESS_KEY, []);
  return (
    all.find((p) => p.playerCode === playerCode && p.gameId === gameId) ?? {
      playerCode,
      gameId,
      level: 1,
      streak: { right: 0, wrong: 0 },
    }
  );
}

export function setProgress(progress: Progress) {
  const all = read<Progress[]>(PROGRESS_KEY, []);
  const next = all.filter(
    (p) => !(p.playerCode === progress.playerCode && p.gameId === progress.gameId),
  );
  next.push(progress);
  write(PROGRESS_KEY, next);
}

export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
