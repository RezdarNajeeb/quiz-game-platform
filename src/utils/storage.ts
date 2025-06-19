import { GameState, GameSettings, User, Question } from '../types/game';

const GAME_STATE_KEY = 'quiz-game-state';
const GAME_SETTINGS_KEY = 'quiz-game-settings';

const defaultUsers: User[] = Array.from({ length: 19 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `Player ${i + 1}`,
  hasPlayedThisRound: false,
}));

const defaultQuestions: Question[] = [
  {
    id: 'q1',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    usedThisRound: false,
  },
  {
    id: 'q2',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    usedThisRound: false,
  },
  {
    id: 'q3',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    usedThisRound: false,
  },
  {
    id: 'q4',
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correctAnswer: 3,
    usedThisRound: false,
  },
  {
    id: 'q5',
    question: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
    correctAnswer: 1,
    usedThisRound: false,
  },
  {
    id: 'q6',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
    usedThisRound: false,
  },
  {
    id: 'q7',
    question: 'Which country is home to Machu Picchu?',
    options: ['Brazil', 'Peru', 'Chile', 'Argentina'],
    correctAnswer: 1,
    usedThisRound: false,
  },
  {
    id: 'q8',
    question: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    correctAnswer: 2,
    usedThisRound: false,
  },
  {
    id: 'q9',
    question: 'Which instrument has 88 keys?',
    options: ['Guitar', 'Violin', 'Piano', 'Flute'],
    correctAnswer: 2,
    usedThisRound: false,
  },
  {
    id: 'q10',
    question: 'What is the hardest natural substance?',
    options: ['Gold', 'Iron', 'Diamond', 'Platinum'],
    correctAnswer: 2,
    usedThisRound: false,
  },
  {
    id: 'q11',
    question: 'Which gas makes up most of Earth\'s atmosphere?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    correctAnswer: 1,
    usedThisRound: false,
  },
  {
    id: 'q12',
    question: 'In which year did World War II end?',
    options: ['1944', '1945', '1946', '1947'],
    correctAnswer: 1,
    usedThisRound: false,
  },
  {
    id: 'q13',
    question: 'What is the largest mammal in the world?',
    options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
    correctAnswer: 1,
    usedThisRound: false,
  },
  {
    id: 'q14',
    question: 'Which element has the chemical symbol "O"?',
    options: ['Gold', 'Silver', 'Oxygen', 'Iron'],
    correctAnswer: 2,
    usedThisRound: false,
  },
  {
    id: 'q15',
    question: 'What is the speed of light in vacuum?',
    options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
    correctAnswer: 0,
    usedThisRound: false,
  },
  {
    id: 'q16',
    question: 'Which continent is the Sahara Desert located in?',
    options: ['Asia', 'Australia', 'Africa', 'South America'],
    correctAnswer: 2,
    usedThisRound: false,
  },
  {
    id: 'q17',
    question: 'What is the currency of Japan?',
    options: ['Yuan', 'Won', 'Yen', 'Rupee'],
    correctAnswer: 2,
    usedThisRound: false,
  },
  {
    id: 'q18',
    question: 'How many sides does a hexagon have?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 1,
    usedThisRound: false,
  },
  {
    id: 'q19',
    question: 'Which Shakespeare play features the character Hamlet?',
    options: ['Romeo and Juliet', 'Macbeth', 'Hamlet', 'Othello'],
    correctAnswer: 2,
    usedThisRound: false,
  },
];

export const getGameState = (): GameState => {
  try {
    const stored = localStorage.getItem(GAME_STATE_KEY);
    if (stored) {
      const parsedState = JSON.parse(stored);
      // Ensure the state has all required properties
      const completeState: GameState = {
        users: parsedState.users || defaultUsers,
        questions: parsedState.questions || defaultQuestions,
        currentUser: parsedState.currentUser || null,
        currentQuestion: parsedState.currentQuestion || null,
        timerDuration: parsedState.timerDuration || 60,
        gameRoundComplete: parsedState.gameRoundComplete || false,
        totalRounds: parsedState.totalRounds || 0,
      };
      return completeState;
    }
  } catch (error) {
    console.error('Error loading game state from localStorage:', error);
  }

  const initialState: GameState = {
    users: defaultUsers,
    questions: defaultQuestions,
    currentUser: null,
    currentQuestion: null,
    timerDuration: 60,
    gameRoundComplete: false,
    totalRounds: 0,
  };

  saveGameState(initialState);
  return initialState;
};

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state to localStorage:', error);
  }
};

export const getGameSettings = (): GameSettings => {
  try {
    const stored = localStorage.getItem(GAME_SETTINGS_KEY);
    if (stored) {
      const parsedSettings = JSON.parse(stored);
      // Ensure language property exists
      return {
        timerDuration: parsedSettings.timerDuration || 60,
        adminPassword: parsedSettings.adminPassword || 'admin123',
        language: parsedSettings.language || 'en',
      };
    }
  } catch (error) {
    console.error('Error loading game settings from localStorage:', error);
  }

  const defaultSettings: GameSettings = {
    timerDuration: 60,
    adminPassword: 'admin123',
    language: 'en',
  };

  saveGameSettings(defaultSettings);
  return defaultSettings;
};

export const saveGameSettings = (settings: GameSettings): void => {
  try {
    localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving game settings to localStorage:', error);
  }
};

export const resetGameRound = (): void => {
  try {
    const state = getGameState();
    state.users = state.users.map(user => ({ ...user, hasPlayedThisRound: false }));
    state.questions = state.questions.map(question => ({ ...question, usedThisRound: false }));
    state.currentUser = null;
    state.currentQuestion = null;
    state.gameRoundComplete = false;
    saveGameState(state);
  } catch (error) {
    console.error('Error resetting game round:', error);
  }
};

// Utility function to clear all game data (for debugging)
export const clearAllGameData = (): void => {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
    localStorage.removeItem(GAME_SETTINGS_KEY);
  } catch (error) {
    console.error('Error clearing game data:', error);
  }
};