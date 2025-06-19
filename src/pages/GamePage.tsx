import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Settings, AlertTriangle } from 'lucide-react';
import Spinner from '../components/Spinner';
import QuestionDisplay from '../components/QuestionDisplay';
import GameComplete from '../components/GameComplete';
import { GameState, User, Question } from '../types/game';
import { getGameState, saveGameState, resetGameRound, getGameSettings } from '../utils/storage';
import { getTranslation } from '../utils/translations';
import {
  getAvailableUsers,
  getAvailableQuestions,
  selectRandomQuestion,
  markUserAsPlayed,
  markQuestionAsUsed,
  checkRoundComplete,
} from '../utils/gameLogic';

const GamePage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gamePhase, setGamePhase] = useState<'spinner' | 'question' | 'complete'>('spinner');
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questionProgress, setQuestionProgress] = useState<{
    timeLeft: number;
    selectedAnswer: number | null;
  } | null>(null);

  const settings = getGameSettings();
  const t = (key: string) => getTranslation(key, settings.language);

  // Load game state on mount
  useEffect(() => {
    try {
      const state = getGameState();
      setGameState(state);
      
      if (checkRoundComplete(state)) {
        setGamePhase('complete');
      }
      
      // Check if there's a saved question in progress
      const savedProgress = localStorage.getItem('question-progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setQuestionProgress(progress);
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle page reload during question phase
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gamePhase === 'question' && currentQuestion) {
        // Save current progress
        if (questionProgress) {
          localStorage.setItem('question-progress', JSON.stringify(questionProgress));
        }
        
        e.preventDefault();
        e.returnValue = 'You have an active question. Your progress will be saved, but the timer will pause. Continue?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gamePhase, currentQuestion, questionProgress]);

  const handleUserSelected = useCallback((user: User) => {
    if (!gameState) return;

    const availableQuestions = getAvailableQuestions(gameState.questions);
    const selectedQuestion = selectRandomQuestion(availableQuestions);

    if (!selectedQuestion) {
      setGamePhase('complete');
      return;
    }

    setIsSpinning(true);
    setCurrentUser(user);
    setCurrentQuestion(selectedQuestion);

    // Clear any previous question progress
    localStorage.removeItem('question-progress');
    setQuestionProgress(null);

    // Simulate spinner animation delay
    setTimeout(() => {
      setIsSpinning(false);
    }, 4000);
  }, [gameState]);

  const handleStartQuestion = useCallback(() => {
    if (!currentUser || !currentQuestion) return;
    setGamePhase('question');
  }, [currentUser, currentQuestion]);

  const handleAnswerSubmit = useCallback((selectedAnswer: number, isCorrect: boolean) => {
    if (!gameState || !currentUser || !currentQuestion) return;

    // Clear question progress
    localStorage.removeItem('question-progress');
    setQuestionProgress(null);

    // Mark user as played and question as used
    let updatedState = markUserAsPlayed(gameState, currentUser.id);
    updatedState = markQuestionAsUsed(updatedState, currentQuestion.id);

    // Check if round is complete
    if (checkRoundComplete(updatedState)) {
      updatedState.gameRoundComplete = true;
      updatedState.totalRounds += 1;
      setGamePhase('complete');
    }

    setGameState(updatedState);
    saveGameState(updatedState);
  }, [gameState, currentUser, currentQuestion]);

  const handleReturnToSpinner = useCallback(() => {
    setCurrentUser(null);
    setCurrentQuestion(null);
    setGamePhase('spinner');
    
    // Clear any question progress
    localStorage.removeItem('question-progress');
    setQuestionProgress(null);
  }, []);

  const handleResetGame = useCallback(() => {
    try {
      resetGameRound();
      const state = getGameState();
      setGameState(state);
      setCurrentUser(null);
      setCurrentQuestion(null);
      setGamePhase('spinner');
      
      // Clear any saved progress
      localStorage.removeItem('question-progress');
      setQuestionProgress(null);
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  }, []);

  // Handle question progress updates
  const handleQuestionProgress = useCallback((timeLeft: number, selectedAnswer: number | null) => {
    const progress = { timeLeft, selectedAnswer };
    setQuestionProgress(progress);
    
    // Save to localStorage for reload recovery
    if (gamePhase === 'question') {
      localStorage.setItem('question-progress', JSON.stringify(progress));
    }
  }, [gamePhase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <div className="text-2xl font-bold text-gray-800 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            {t('loadingQuizGame')}
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('errorLoadingGame')}</h2>
          <p className="text-gray-600 mb-4">{t('unableToLoadGame')}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] min-w-[120px]"
          >
            {t('refreshPage')}
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'complete') {
    return (
      <GameComplete
        totalRounds={gameState.totalRounds}
        onResetGame={handleResetGame}
      />
    );
  }

  if (gamePhase === 'question' && currentUser && currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-100 p-4" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto py-8">
          <QuestionDisplay
            user={currentUser}
            question={currentQuestion}
            timerDuration={settings.timerDuration}
            onAnswerSubmit={handleAnswerSubmit}
            onReturnToSpinner={handleReturnToSpinner}
            initialProgress={questionProgress}
            onProgressUpdate={handleQuestionProgress}
          />
        </div>
      </div>
    );
  }

  const availableUsers = getAvailableUsers(gameState.users);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      {/* Admin Link - Fixed positioning with proper z-index and touch targets */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          to="/admin"
          className="flex items-center justify-center space-x-1 sm:space-x-2 bg-white bg-opacity-90 hover:bg-opacity-100 active:bg-opacity-80 text-gray-800 px-3 py-3 sm:px-4 sm:py-2 rounded-lg backdrop-blur-sm transition-all duration-200 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px] sm:min-w-auto"
        >
          <Settings size={20} className="flex-shrink-0" />
          <span className="hidden sm:inline">{t('admin')}</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-20 sm:pt-4">
        <div className="text-center space-y-8 w-full max-w-4xl">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 drop-shadow-lg px-4">{t('quizRoulette')}</h1>
            <p className="text-base sm:text-lg lg:text-xl text-white opacity-90 font-medium px-4">
              {t('spinToSelect')}
            </p>
          </div>

          <Spinner
            availableUsers={availableUsers}
            onUserSelected={handleUserSelected}
            onStartQuestion={handleStartQuestion}
            isSpinning={isSpinning}
            disabled={isLoading}
          />

          {/* Game Statistics */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-white mx-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-bold">{gameState.totalRounds}</p>
                <p className="text-xs sm:text-sm opacity-80">{t('roundsCompleted')}</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{gameState.users.filter(u => u.hasPlayedThisRound).length}</p>
                <p className="text-xs sm:text-sm opacity-80">{t('playersCompleted')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;