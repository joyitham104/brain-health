import type { FC } from 'react';
//imports FC (Function Component) from react

export type Domain =
  | 'workingMemory'
  | 'attention'
  | 'language'
  | 'numerical'
  | 'visuospatial'
  | 'executive';

export const DOMAIN_LABELS: Record<Domain, string> = {
  workingMemory: 'Working memory',
  attention: 'Attention',
  language: 'Language',
  numerical: 'Numerical reasoning',
  visuospatial: 'Visuospatial',
  executive: 'Executive function',
};
//defines the display names for the domains of the games (more professional) 

export type SessionResult = {
  accuracy: number; 
  medianResponseMs: number; //(time taken to respond in milliseconds)
  itemsAttempted: number; //total attempted items
  notes?: string;//notes of the player (?=optional)
}; 
//defines the session result during the game (standardized format, easier to analyze and compare)

export type Game = {
  id: string;
  name: string;
  domain: Domain; //cognitive ability measured
  modeledOn: string; //clinical test the game is modeled after
  description: string; 
  ready: boolean;
  maxLevel?: number;
  Component: FC<{
    level: number;
    onAnswer: (correct: boolean, responseMs: number) => void; //records single question response time and correctness
    onFinish: (result: SessionResult) => void; //sends results to the parent component
    //properties of the component
  }>;
  //responsible for running andrendering the game, level, onAnswer, onFinish are the props passed to the component
};
//defines the layout of the games 

export type Session = {
  id: string; //for session identification
  playerCode: string;
  gameId: string; //which game was played
  domain: Domain;
  level: number;
  accuracy: number;
  medianResponseMs: number;
  itemsAttempted: number;
  score: number;
  playedAt: string; //date and time of the session
  notes?: string;
};
//completed game stored in the database (after)

export type Streak = { right: number; wrong: number };
//streak used to adjust the difficulty of the game (adaptive)

export type Progress = {
  playerCode: string;
  gameId: string;
  level: number;
  streak: Streak;
};
//tracks the progress of the player in the game