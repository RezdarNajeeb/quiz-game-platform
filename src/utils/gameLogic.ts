import { User, Question, GameState } from '../types/game';

export const getAvailableUsers = (users: User[]): User[] => {
  return users.filter(user => !user.hasPlayedThisRound);
};

export const getAvailableQuestions = (questions: Question[]): Question[] => {
  return questions.filter(question => !question.usedThisRound);
};

export const selectRandomUser = (availableUsers: User[]): User | null => {
  if (availableUsers.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * availableUsers.length);
  return availableUsers[randomIndex];
};

export const selectRandomQuestion = (availableQuestions: Question[]): Question | null => {
  if (availableQuestions.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

export const markUserAsPlayed = (gameState: GameState, userId: string): GameState => {
  return {
    ...gameState,
    users: gameState.users.map(user =>
      user.id === userId ? { ...user, hasPlayedThisRound: true } : user
    ),
  };
};

export const markQuestionAsUsed = (gameState: GameState, questionId: string): GameState => {
  return {
    ...gameState,
    questions: gameState.questions.map(question =>
      question.id === questionId ? { ...question, usedThisRound: true } : question
    ),
  };
};

export const checkRoundComplete = (gameState: GameState): boolean => {
  const availableUsers = getAvailableUsers(gameState.users);
  const availableQuestions = getAvailableQuestions(gameState.questions);
  return availableUsers.length === 0 || availableQuestions.length === 0;
};