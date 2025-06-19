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
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 text-center max-w-sm sm:max-w-md lg:max-w-lg w-full mx-4">
        <div className="mb-6 sm:mb-8">
          <Trophy size={64} className="mx-auto text-yellow-500 mb-4 sm:w-20 sm:h-20 lg:w-24 lg:h-24" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">{t('roundComplete')}</h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{t('allUsersCompleted')}</p>
        </div>

        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <p className="text-base sm:text-lg lg:text-xl font-semibold text-blue-800">
            {t('totalRoundsPlayed')}: {totalRounds}
          </p>
        </div>

        <button
          onClick={onResetGame}
          className="flex items-center justify-center space-x-2 sm:space-x-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-lg font-semibold text-base sm:text-lg lg:text-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 mx-auto w-full sm:w-auto min-h-[52px] sm:min-h-[56px] lg:min-h-[60px]"
        >
          <RotateCcw size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0" />
          <span>{t('startNewRound')}</span>
        </button>
      </div>
    </div>
  );
};

export default GameComplete;