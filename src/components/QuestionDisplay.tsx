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
    if (isPaused) return 'bg-yellow-100 text-yellow-800';
    if (timeLeft <= 10) return 'bg-red-100 text-red-800';
    if (timeLeft <= 30) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-4">{t('leaveQuestion')}</h3>
              <p className="text-gray-600 mb-6">
                {t('leaveQuestionConfirm')}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={cancelReturn}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('stay')}
                </button>
                <button
                  onClick={confirmReturn}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('leave')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <h2 className="text-2xl font-bold text-blue-800">{t('currentPlayer')}: {user.name}</h2>
      </div>

      {/* Timer */}
      <div className="flex justify-center">
        <div className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-lg ${getTimerColor()}`}>
          <Clock size={24} />
          <span>{formatTime(timeLeft)}</span>
          {isPaused && <span className="text-sm">(Paused)</span>}
        </div>
      </div>

      {/* Pause Warning */}
      {isPaused && !isAnswered && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 font-medium">
            {t('timerPaused')}
          </p>
        </div>
      )}

      {/* Question */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-semibold mb-8 text-gray-800">{question.question}</h3>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                isAnswered
                  ? index === question.correctAnswer
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : selectedAnswer === index && index !== question.correctAnswer
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : 'bg-gray-100 border-gray-300 text-gray-600'
                  : selectedAnswer === index
                  ? 'bg-blue-100 border-blue-500 text-blue-800'
                  : 'bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100 cursor-pointer'
              }`}
            >
              <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        {!isAnswered && (
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {t('submitAnswer')}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              {selectedAnswer === null ? t('pleaseSelectAnswer') : t('clickToSubmit')}
            </p>
          </div>
        )}

        {/* Result Display */}
        {isAnswered && (
          <div className="text-center space-y-6">
            <div className={`flex items-center justify-center space-x-3 text-2xl font-bold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? <CheckCircle size={32} /> : <XCircle size={32} />}
              <span>
                {timeLeft === 0 ? t('timesUp') : isCorrect ? t('correct') : t('incorrect')}
              </span>
            </div>

            {!isCorrect && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">
                  {t('correctAnswerWas')}: <strong>{String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}</strong>
                </p>
              </div>
            )}

            <button
              onClick={handleReturnConfirmation}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 mx-auto"
            >
              <RotateCcw size={20} />
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
            className="text-gray-500 hover:text-gray-700 underline text-sm transition-colors"
          >
            {t('returnWithoutAnswering')}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;