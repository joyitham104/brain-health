import mathRiddles from './mathRiddles';
import patternRecall from './patternRecall';
import schulte from './schulte';
import spotDifference from './spotDifference';
import trainTrack from './trainTrack';
import type { Game } from './types';
import uno from './uno';
import wordFluency from './wordFluency';

export type { Domain, Game, SessionResult } from './types';
export { DOMAIN_LABELS } from './types';

export const games: Game[] = [
  patternRecall,
  wordFluency,
  mathRiddles,
  schulte,
  trainTrack,
  uno,
  spotDifference,
];
