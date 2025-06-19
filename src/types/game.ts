export interface User {
  id: string;
  name: string;
  hasPlayedThisRound: boolean;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  usedThisRound: boolean;
}

export interface GameState {
  users: User[];
  questions: Question[];
  currentUser: User | null;
  currentQuestion: Question | null;
  timerDuration: number;
  gameRoundComplete: boolean;
  totalRounds: number;
}

export interface GameSettings {
  timerDuration: number;
  adminPassword: string;
  language: 'en' | 'ckb';
}

export interface QuestionProgress {
  timeLeft: number;
  selectedAnswer: number | null;
  questionId: string;
  userId: string;
}

export interface Translations {
  [key: string]: {
    en: string;
    ckb: string;
  };
}