import { describe, expect, it } from 'vitest';
import { nextLevel } from './adaptive';
import { sessionScore, slope } from './scoring';

const zero = { right: 0, wrong: 0 };

describe('nextLevel', () => {
  it('stays put after one correct', () => {
    expect(nextLevel(3, zero, true)).toEqual({
      level: 3,
      streak: { right: 1, wrong: 0 },
    });
  });

  it('levels up after three correct in a row', () => {
    expect(nextLevel(3, { right: 2, wrong: 0 }, true)).toEqual({
      level: 4,
      streak: zero,
    });
  });

  it('does not go above 10', () => {
    expect(nextLevel(10, { right: 2, wrong: 0 }, true).level).toBe(10);
  });

  it('a miss resets the right streak', () => {
    expect(nextLevel(4, { right: 2, wrong: 0 }, false)).toEqual({
      level: 4,
      streak: { right: 0, wrong: 1 },
    });
  });

  it('levels down after two wrong in a row', () => {
    expect(nextLevel(4, { right: 0, wrong: 1 }, false)).toEqual({
      level: 3,
      streak: zero,
    });
  });

  it('does not go below 1', () => {
    expect(nextLevel(1, { right: 0, wrong: 1 }, false).level).toBe(1);
  });
});

describe('slope and sessionScore', () => {
  it('sessionScore is 0 at level 1 with no accuracy', () => {
    expect(sessionScore(1, 0)).toBe(0);
  });

  it('sessionScore is 100 at level 10 perfect', () => {
    expect(sessionScore(10, 1)).toBe(100);
  });

  it('sessionScore is 38 at level 4 with 80%', () => {
    expect(sessionScore(4, 0.8)).toBe(38);
  });

  it('slope is 0 with fewer than 3 points', () => {
    expect(slope([{ x: 0, y: 10 }, { x: 1, y: 12 }])).toBe(0);
  });

  it('slope is 2 for y = 2x', () => {
    const points = [0, 1, 2, 3].map((x) => ({ x, y: 2 * x }));
    expect(slope(points)).toBeCloseTo(2);
  });
});
