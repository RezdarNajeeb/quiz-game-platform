import React from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { getGameSettings } from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface GameCompleteProps {
  totalRounds: number;
  onResetGame: () => void;
}

const GameComplete: React.FC<GameCompleteProps> = ({ totalRounds, onResetGame }) => {
  const settings = getGameSettings();
  const t = (key: string) => getTranslation(key, settings.language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center max-w-sm sm:max-w-md w-full mx-4">
        <div className="mb-8">
          <Trophy size={64} className="mx-auto text-yellow-500 mb-4 sm:w-20 sm:h-20" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">{t('roundComplete')}</h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('allUsersCompleted')}</p>
        </div>

        <div className="mb-6 sm:mb-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-base sm:text-lg font-semibold text-blue-800">
            {t('totalRoundsPlayed')}: {totalRounds}
          </p>
        </div>

        <button
          onClick={onResetGame}
          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors duration-200 mx-auto shadow-lg w-full sm:w-auto"
        >
          <RotateCcw size={20} className="sm:w-6 sm:h-6" />
          <span>{t('startNewRound')}</span>
        </button>
      </div>
    </div>
  );
};

export default GameComplete;