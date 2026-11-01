import type { Streak } from '../games/types';

// Asymmetric on purpose: seniors quit from frustration faster than from boredom.
export function nextLevel(level: number, streak: Streak, correct: boolean) {
  const s = correct
    ? { right: streak.right + 1, wrong: 0 }
    : { right: 0, wrong: streak.wrong + 1 };
  if (s.right >= 3) {
    return { level: Math.min(level + 1, 10), streak: { right: 0, wrong: 0 } };
  }
  if (s.wrong >= 2) {
    return { level: Math.max(level - 1, 1), streak: { right: 0, wrong: 0 } };
  }
  return { level, streak: s };
}
