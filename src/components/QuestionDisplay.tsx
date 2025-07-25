import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { Question, User } from '../types/game';
import { getGameSettings } from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface QuestionDisplayProps {
  user: User;
  question: Question;
  timerDuration: number;
  onAnswerSubmit: (selectedAnswer: number, isCorrect: boolean) => void;
  onReturnToSpinner: () => void;
  initialProgress?: {
    timeLeft: number;
    selectedAnswer: number | null;
  } | null;
  onProgressUpdate?: (timeLeft: number, selectedAnswer: number | null) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  user,
  question,
  timerDuration,
  onAnswerSubmit,
  onReturnToSpinner,
  initialProgress,
  onProgressUpdate,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(
    initialProgress?.selectedAnswer ?? null
  );
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    initialProgress?.timeLeft ?? timerDuration
  );
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const settings = getGameSettings();
  const t = (key: string) => getTranslation(key, settings.language);

  // Update progress callback
  const updateProgress = useCallback(() => {
    if (onProgressUpdate && !isAnswered) {
      onProgressUpdate(timeLeft, selectedAnswer);
    }
  }, [timeLeft, selectedAnswer, isAnswered, onProgressUpdate]);

  // Timer effect
  useEffect(() => {
    if (isAnswered || timeLeft <= 0 || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          handleTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, timeLeft, isPaused]);

  // Update progress when timeLeft or selectedAnswer changes
  useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  // Handle page visibility change (pause timer when tab is not active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true);
      setIsCorrect(false);
      onAnswerSubmit(-1, false);
    }
  }, [isAnswered, onAnswerSubmit]);

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null || isAnswered) return;

    const correct = selectedAnswer === question.correctAnswer;
    setIsAnswered(true);
    setIsCorrect(correct);
    onAnswerSubmit(selectedAnswer, correct);
  }, [selectedAnswer, isAnswered, question.correctAnswer, onAnswerSubmit]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (!isAnswered) {
      setSelectedAnswer(answerIndex);
    }
  }, [isAnswered]);

  const handleReturnConfirmation = () => {
    if (!isAnswered) {
      setShowConfirmation(true);
    } else {
      onReturnToSpinner();
    }
  };

  const confirmReturn = () => {
    setShowConfirmation(false);
    onReturnToSpinner();
  };

  const cancelReturn = () => {
    setShowConfirmation(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (isPaused) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (timeLeft <= 10) return 'bg-red-100 text-red-800 border-red-300';
    if (timeLeft <= 30) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <AlertTriangle size={40} className="mx-auto text-yellow-500 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">{t('leaveQuestion')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {t('leaveQuestionConfirm')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelReturn}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base min-h-[44px] transform hover:scale-105 active:scale-95"
                >
                  {t('stay')}
                </button>
                <button
                  onClick={confirmReturn}
                  className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base min-h-[44px] transform hover:scale-105 active:scale-95"
                >
                  {t('leave')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-800 break-words">{t('currentPlayer')}: {user.name}</h2>
      </div>

      {/* Timer */}
      <div className="flex justify-center">
        <div className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg border-2 ${getTimerColor()}`}>
          <Clock size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
          <span>{formatTime(timeLeft)}</span>
          {isPaused && <span className="text-xs sm:text-sm">(Paused)</span>}
        </div>
      </div>

      {/* Pause Warning */}
      {isPaused && !isAnswered && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 font-medium text-sm sm:text-base">
            {t('timerPaused')}
          </p>
        </div>
      )}

      {/* Question */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6 sm:mb-8 text-gray-800 leading-relaxed">{question.question}</h3>

        {/* Answer Options */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`p-3 sm:p-4 lg:p-5 rounded-lg border-2 text-left transition-all duration-200 text-sm sm:text-base lg:text-lg min-h-[52px] sm:min-h-[60px] transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none ${
                isAnswered
                  ? index === question.correctAnswer
                    ? 'bg-green-100 border-green-500 text-green-800 shadow-lg'
                    : selectedAnswer === index && index !== question.correctAnswer
                    ? 'bg-red-100 border-red-500 text-red-800 shadow-lg'
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                  : selectedAnswer === index
                  ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-lg'
                  : 'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400 cursor-pointer shadow-sm hover:shadow-md'
              }`}
            >
              <span className="font-medium mr-2 sm:mr-3 text-base sm:text-lg">{String.fromCharCode(65 + index)}.</span>
              <span className="leading-relaxed">{option}</span>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        {!isAnswered && (
          <div className="text-center space-y-3 sm:space-y-4">
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg lg:text-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none w-full sm:w-auto min-h-[52px] sm:min-h-[56px]"
            >
              {t('submitAnswer')}
            </button>
            <p className="text-xs sm:text-sm text-gray-500">
              {selectedAnswer === null ? t('pleaseSelectAnswer') : t('clickToSubmit')}
            </p>
          </div>
        )}

        {/* Result Display */}
        {isAnswered && (
          <div className="text-center space-y-4 sm:space-y-6">
            <div className={`flex items-center justify-center space-x-2 sm:space-x-3 text-xl sm:text-2xl lg:text-3xl font-bold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? <CheckCircle size={28} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex-shrink-0" /> : <XCircle size={28} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex-shrink-0" />}
              <span>
                {timeLeft === 0 ? t('timesUp') : isCorrect ? t('correct') : t('incorrect')}
              </span>
            </div>

            {!isCorrect && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6">
                <p className="text-blue-800 font-medium text-sm sm:text-base lg:text-lg">
                  {t('correctAnswerWas')}: <strong>{String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}</strong>
                </p>
              </div>
            )}

            <button
              onClick={handleReturnConfirmation}
              className="flex items-center justify-center space-x-2 sm:space-x-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 mx-auto w-full sm:w-auto text-sm sm:text-base lg:text-lg min-h-[52px]"
            >
              <RotateCcw size={20} className="flex-shrink-0" />
              <span>{t('returnToSpinner')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Emergency Return Button */}
      {!isAnswered && (
        <div className="text-center">
          <button
            onClick={handleReturnConfirmation}
            className="text-gray-500 hover:text-gray-700 active:text-gray-800 underline text-xs sm:text-sm transition-all duration-200 py-2 px-4 min-h-[36px] transform hover:scale-105 active:scale-95"
          >
            {t('returnWithoutAnswering')}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;