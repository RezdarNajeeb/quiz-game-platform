import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play, ArrowRight, AlertTriangle } from 'lucide-react';
import { User } from '../types/game';
import { getGameSettings } from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface RouletteWheelProps {
  availableUsers: User[];
  onUserSelected: (user: User) => void;
  onStartQuestion: () => void;
  isSpinning: boolean;
  disabled?: boolean;
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({ 
  availableUsers, 
  onUserSelected, 
  onStartQuestion, 
  isSpinning,
  disabled = false
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const settings = getGameSettings();
  const t = (key: string) => getTranslation(key, settings.language);

  // Reset states when availableUsers changes
  useEffect(() => {
    if (availableUsers.length === 0) {
      setSelectedUser(null);
      setShowStartButton(false);
    }
  }, [availableUsers]);

  const spinWheel = async () => {
    if (availableUsers.length === 0 || isSpinning || disabled || isAnimating) return;

    // Reset previous selection
    setSelectedUser(null);
    setShowStartButton(false);
    setIsAnimating(true);

    // Calculate spin parameters
    const spinDuration = 4000 + Math.random() * 2000; // 4-6 seconds
    const extraRotations = 8 + Math.floor(Math.random() * 8); // 8-16 full rotations
    const segmentAngle = 360 / availableUsers.length;
    
    // Select random user
    const randomUserIndex = Math.floor(Math.random() * availableUsers.length);
    const targetUser = availableUsers[randomUserIndex];
    const targetAngle = segmentAngle * randomUserIndex + (segmentAngle / 2);
    
    const finalRotation = rotation + (360 * extraRotations) + (360 - targetAngle);
    
    setRotation(finalRotation);

    // Wait for animation to complete
    setTimeout(() => {
      setSelectedUser(targetUser);
      setShowStartButton(true);
      setIsAnimating(false);
      onUserSelected(targetUser);
    }, spinDuration);
  };

  const handleStartQuestion = () => {
    if (!selectedUser) return;
    
    setShowStartButton(false);
    onStartQuestion();
  };

  const handleResetConfirmation = () => {
    setShowConfirmation(true);
  };

  const confirmReset = () => {
    setSelectedUser(null);
    setShowStartButton(false);
    setRotation(0);
    setIsAnimating(false);
    setShowConfirmation(false);
  };

  const cancelReset = () => {
    setShowConfirmation(false);
  };

  // Generate alternating colors for user segments
  const getSegmentColor = (index: number) => {
    const colors = [
      'bg-red-600 text-white',
      'bg-blue-600 text-white',
      'bg-green-600 text-white',
      'bg-purple-600 text-white',
      'bg-orange-600 text-white',
      'bg-indigo-600 text-white',
      'bg-pink-600 text-white',
      'bg-teal-600 text-white'
    ];
    return colors[index % colors.length];
  };

  // Enhanced text fitting function
  const getTextStyle = (userName: string, userCount: number) => {
    // Base font sizes depending on number of users
    let fontSize: string;
    let maxWidth: string;
    let displayName = userName;

    if (userCount <= 4) {
      fontSize = '18px';
      maxWidth = '80px';
      if (userName.length > 8) displayName = `${userName.substring(0, 6)}...`;
    } else if (userCount <= 6) {
      fontSize = '16px';
      maxWidth = '70px';
      if (userName.length > 8) displayName = `${userName.substring(0, 6)}...`;
    } else if (userCount <= 8) {
      fontSize = '14px';
      maxWidth = '60px';
      if (userName.length > 7) displayName = `${userName.substring(0, 5)}...`;
    } else if (userCount <= 12) {
      fontSize = '12px';
      maxWidth = '50px';
      if (userName.length > 6) displayName = `${userName.substring(0, 4)}...`;
    } else if (userCount <= 16) {
      fontSize = '10px';
      maxWidth = '40px';
      if (userName.length > 5) displayName = `${userName.substring(0, 3)}...`;
    } else {
      fontSize = '8px';
      maxWidth = '30px';
      if (userName.length > 4) displayName = `${userName.substring(0, 2)}...`;
    }

    return {
      fontSize,
      maxWidth,
      displayName
    };
  };

  const segmentAngle = availableUsers.length > 0 ? 360 / availableUsers.length : 0;

  if (availableUsers.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-6 sm:space-y-8 w-full max-w-md sm:max-w-none mx-auto" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center shadow-lg mx-4">
          <p className="text-yellow-800 font-bold text-xl">{t('allPlayersCompleted')}</p>
          <p className="text-yellow-700 mt-2">{t('readyNewRound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 sm:space-y-8 w-full max-w-md sm:max-w-none mx-auto" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <AlertTriangle size={40} className="mx-auto text-yellow-500 mb-4 sm:w-12 sm:h-12" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">{t('resetSpinnerPosition')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {t('resetSpinnerDescription')}
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={cancelReset}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  {t('reset')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Roulette Wheel */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] mx-auto">
        {/* Outer Decorative Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl p-2">
          {/* Middle Ring */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-700 to-amber-800 p-2">
            {/* Inner Wheel Container */}
            <div className="w-full h-full rounded-full bg-white relative overflow-hidden shadow-inner">
              {/* Spinning Content Container */}
              <div
                ref={wheelRef}
                className="absolute inset-0 transition-transform ease-out"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: isAnimating ? '4000ms' : '0ms',
                  transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)'
                }}
              >
                {/* User Name Segments */}
                {availableUsers.map((user, index) => {
                  const angle = segmentAngle * index;
                  const nextAngle = segmentAngle * (index + 1);
                  const midAngle = angle + segmentAngle / 2;
                  const textStyle = getTextStyle(user.name, availableUsers.length);
                  
                  return (
                    <React.Fragment key={`${user.id}-${index}`}>
                      {/* Background Segment */}
                      <div
                        className={`absolute w-full h-full ${getSegmentColor(index)}`}
                        style={{
                          clipPath: `polygon(50% 50%, ${
                            50 + 48 * Math.cos(((angle - 90) * Math.PI) / 180)
                          }% ${
                            50 + 48 * Math.sin(((angle - 90) * Math.PI) / 180)
                          }%, ${
                            50 + 48 * Math.cos(((nextAngle - 90) * Math.PI) / 180)
                          }% ${
                            50 + 48 * Math.sin(((nextAngle - 90) * Math.PI) / 180)
                          }%)`
                        }}
                      />
                      {/* User Name Text - Positioned separately for better visibility */}
                      <div
                        className="absolute text-white font-black text-center select-none pointer-events-none z-10"
                        style={{
                          left: `calc(50% + ${40 * Math.cos(((midAngle - 90) * Math.PI) / 180)}px)`,
                          top: `calc(50% + ${40 * Math.sin(((midAngle - 90) * Math.PI) / 180)}px)`,
                          transform: `translate(-50%, -50%) rotate(${midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle}deg)`,
                          fontSize: textStyle.fontSize,
                          maxWidth: textStyle.maxWidth,
                          lineHeight: '1.1',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
                          fontWeight: '900',
                          letterSpacing: availableUsers.length > 12 ? '-0.5px' : '0px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          filter: 'drop-shadow(0 0 3px rgba(0,0,0,1))',
                          WebkitTextStroke: '0.5px rgba(0,0,0,0.8)'
                        }}
                        title={user.name}
                      >
                        {textStyle.displayName}
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Separator lines */}
                {availableUsers.map((_, index) => (
                  <div
                    key={`separator-${index}`}
                    className="absolute w-0.5 bg-white origin-bottom opacity-80 shadow-sm"
                    style={{
                      height: '48%',
                      left: '50%',
                      top: '2%',
                      transform: `translateX(-50%) rotate(${segmentAngle * index}deg)`,
                    }}
                  />
                ))}

                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                    <RotateCcw size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10">
          <div className="w-0 h-0 border-l-6 border-r-6 border-b-20 border-l-transparent border-r-transparent border-b-white drop-shadow-lg"></div>
          <div className="w-6 h-6 bg-white rounded-full mx-auto -mt-2 shadow-lg border-2 border-gray-300"></div>
        </div>

        {/* Selection Highlight */}
        {selectedUser && !isAnimating && (
          <div className="absolute inset-2 rounded-full border-4 border-yellow-400 animate-pulse shadow-lg"></div>
        )}
      </div>

      {/* Selection Results */}
      {selectedUser && !isAnimating && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 sm:p-8 text-center shadow-xl max-w-sm sm:max-w-md mx-4">
          <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">{t('selectedPlayer')}</h3>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-4 sm:mb-6 break-words">{selectedUser.name}</p>
          {showStartButton && (
            <button
              onClick={handleStartQuestion}
              disabled={disabled}
              className="flex items-center justify-center space-x-2 sm:space-x-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none mx-auto w-full sm:w-auto"
            >
              <ArrowRight size={20} className="sm:w-6 sm:h-6" />
              <span>{t('startQuestion')}</span>
            </button>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full px-4">
        {/* Spin Button */}
        {!showStartButton && (
          <button
            onClick={spinWheel}
            disabled={availableUsers.length === 0 || isSpinning || disabled || isAnimating}
            className="flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 w-full sm:w-auto max-w-xs sm:max-w-none"
          >
            <Play size={24} className="sm:w-8 sm:h-8" />
            <span>
              {isAnimating ? t('spinning') : t('spinTheWheel')}
            </span>
          </button>
        )}

        {/* Reset Position Button */}
        {(selectedUser || rotation !== 0) && !isAnimating && (
          <button
            onClick={handleResetConfirmation}
            disabled={disabled}
            className="flex items-center justify-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 disabled:bg-opacity-10 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 font-medium border border-white border-opacity-30 text-sm sm:text-base"
          >
            <RotateCcw size={16} />
            <span>{t('resetPosition')}</span>
          </button>
        )}
      </div>

      {/* Status Messages */}
      <div className="text-center space-y-2 sm:space-y-3 px-4">
        <p className="text-base sm:text-lg font-medium text-white">
          {availableUsers.length} {availableUsers.length !== 1 ? t('playersRemaining') : t('player')}
        </p>
        
        {disabled && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center mx-4">
            <p className="text-red-800 font-medium text-sm sm:text-base">{t('spinnerDisabled')}</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isAnimating && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center mx-4">
          <p className="text-blue-800 font-medium text-sm sm:text-base">{t('selectingPlayer')}</p>
        </div>
      )}
    </div>
  );
};

export default RouletteWheel;