import type { FC } from 'react';
//imports FC (Function Component) from react

export type Domain =
  | 'workingMemory' //the ability to hold and manipulate information in your mind for a short period of time
  | 'attention' //the ability to focus your attention on a specific task or stimulus
  | 'language' //the ability to understand and use language
  | 'numerical' //the ability to understand and use numbers
  | 'visuospatial' //the ability to understand and use visual information and spatial relationships
  | 'executive' //the ability to plan and organize your thoughts and actions
//defines the domains of the games based off different cognitive abilities

export const DOMAIN_LABELS: Record<Domain, string> = {
  workingMemory: 'Working memory',
  attention: 'Attention',
  language: 'Language',
  numerical: 'Numerical reasoning',
  visuospatial: 'Visuospatial',
  executive: 'Executive function',
};
//defines the labels for the domains of the games based off different cognitive abilities

export type SessionResult = {
  accuracy: number; //the accuracy of the games based off different cognitive abilities
  medianResponseMs: number; //the median response time of the games based off different cognitive abilities
  itemsAttempted: number; //the number of items attempted by the player based off different cognitive abilities
  notes?: string;//the notes of the player based off different cognitive abilities (?=optional)
}; 
//defines the session result of the games based off different cognitive abilities

export type Game = {
  id: string;
  name: string;
  domain: Domain;
  modeledOn: string;
  description: string;
  ready: boolean;
  Component: FC<{
    level: number;
    onAnswer: (correct: boolean, responseMs: number) => void;
    onFinish: (result: SessionResult) => void;
  }>;
};
//defines the game of the games based off different cognitive abilities

export type Session = {
  id: string;
  playerCode: string;
  gameId: string;
  domain: Domain;
  level: number;
  accuracy: number;
  medianResponseMs: number;
  itemsAttempted: number;
  score: number;
  playedAt: string;
  notes?: string;
};

export type Streak = { right: number; wrong: number };

export type Progress = {
  playerCode: string;
  gameId: string;
  level: number;
  streak: Streak;
};