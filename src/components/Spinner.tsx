import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play, ArrowRight, AlertTriangle } from 'lucide-react';
import { User } from '../types/game';
import { getGameSettings } from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface SpinnerProps {
  availableUsers: User[];
  onUserSelected: (user: User) => void;
  onStartQuestion: () => void;
  isSpinning: boolean;
  disabled?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ 
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
  const spinnerRef = useRef<HTMLDivElement>(null);

  const settings = getGameSettings();
  const t = (key: string) => getTranslation(key, settings.language);

  // Reset states when availableUsers changes
  useEffect(() => {
    if (availableUsers.length === 0) {
      setSelectedUser(null);
      setShowStartButton(false);
    }
  }, [availableUsers]);

  const spinForUser = async () => {
    if (availableUsers.length === 0 || isSpinning || disabled || isAnimating) return;

    // Reset previous selection
    setSelectedUser(null);
    setShowStartButton(false);
    setIsAnimating(true);

    // Calculate spin parameters
    const spinDuration = 3500 + Math.random() * 1500; // 3.5-5 seconds
    const extraRotations = 10 + Math.floor(Math.random() * 6); // 10-16 full rotations
    const segmentAngle = 360 / availableUsers.length;
    
    // Select random user and calculate target angle
    const randomUserIndex = Math.floor(Math.random() * availableUsers.length);
    const targetUser = availableUsers[randomUserIndex];
    const targetAngle = segmentAngle * randomUserIndex + (segmentAngle / 2); // Center of segment
    
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
    if (!selectedUser || disabled) return;
    
    setShowStartButton(false);
    onStartQuestion();
  };

  const handleResetConfirmation = () => {
    if (disabled) return;
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

  // Calculate positions for user names around the circle
  const getUserPositions = () => {
    if (availableUsers.length === 0) return [];
    
    return availableUsers.map((user, index) => {
      const angle = (360 / availableUsers.length) * index;
      const radius = 130; // Distance from center
      const radians = ((angle - 90) * Math.PI) / 180;
      const x = Math.cos(radians) * radius;
      const y = Math.sin(radians) * radius;
      return { user, x, y, angle, index };
    });
  };

  const userPositions = getUserPositions();
  const segmentAngle = availableUsers.length > 0 ? 360 / availableUsers.length : 0;

  // Show empty state when no users available
  if (availableUsers.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-6 sm:space-y-8 w-full max-w-md sm:max-w-lg mx-auto px-4" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 sm:p-8 text-center shadow-lg w-full">
          <p className="text-yellow-800 font-bold text-lg sm:text-xl mb-2">{t('allPlayersCompleted')}</p>
          <p className="text-yellow-700 text-sm sm:text-base">{t('readyNewRound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 sm:space-y-8 w-full max-w-md sm:max-w-lg mx-auto px-4" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <AlertTriangle size={40} className="mx-auto text-yellow-500 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">{t('resetSpinnerPosition')}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {t('resetSpinnerDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelReset}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base min-h-[44px] transform hover:scale-105 active:scale-95"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base min-h-[44px] transform hover:scale-105 active:scale-95"
                >
                  {t('reset')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Spinner */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mx-auto">
        {/* Outer Ring with Gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 shadow-2xl p-2 sm:p-3">
          {/* Inner White Circle */}
          <div className="w-full h-full rounded-full bg-white relative overflow-hidden shadow-inner">
            {/* Spinning Content Container */}
            <div
              ref={spinnerRef}
              className="absolute inset-0 transition-transform ease-out"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isAnimating ? '3500ms' : '0ms',
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              {/* Segment Backgrounds */}
              {userPositions.map(({ index }) => (
                <div
                  key={`segment-${index}`}
                  className={`absolute w-full h-full ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                  style={{
                    clipPath: `polygon(50% 50%, ${
                      50 + 45 * Math.cos(((segmentAngle * index - 90) * Math.PI) / 180)
                    }% ${
                      50 + 45 * Math.sin(((segmentAngle * index - 90) * Math.PI) / 180)
                    }%, ${
                      50 + 45 * Math.cos(((segmentAngle * (index + 1) - 90) * Math.PI) / 180)
                    }% ${
                      50 + 45 * Math.sin(((segmentAngle * (index + 1) - 90) * Math.PI) / 180)
                    }%)`
                  }}
                />
              ))}

              {/* User Names positioned around the circle */}
              {userPositions.map(({ user, x, y, angle, index }) => {
                // Adjust font size based on number of users and name length
                let fontSize = '12px';
                let maxWidth = '80px';
                
                if (availableUsers.length <= 6) {
                  fontSize = '14px';
                  maxWidth = '90px';
                } else if (availableUsers.length <= 10) {
                  fontSize = '12px';
                  maxWidth = '70px';
                } else {
                  fontSize = '10px';
                  maxWidth = '60px';
                }

                return (
                  <div
                    key={user.id}
                    className="absolute font-bold text-gray-800 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 select-none overflow-hidden text-ellipsis"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                      textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                      fontSize,
                      maxWidth
                    }}
                    title={user.name}
                  >
                    {user.name.length > 12 ? `${user.name.substring(0, 10)}...` : user.name}
                  </div>
                );
              })}

              {/* Divider lines between segments */}
              {userPositions.map(({ index }) => (
                <div
                  key={`divider-${index}`}
                  className="absolute w-0.5 bg-gray-400 origin-bottom"
                  style={{
                    height: '45%',
                    left: '50%',
                    top: '5%',
                    transform: `translateX(-50%) rotate(${segmentAngle * index}deg)`,
                  }}
                />
              ))}

              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <RotateCcw size={20} className="text-white sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-10">
          <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 sm:border-l-8 sm:border-r-8 sm:border-b-16 border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"></div>
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full mx-auto -mt-1 shadow-lg"></div>
        </div>

        {/* Selection Highlight */}
        {selectedUser && !isAnimating && (
          <div className="absolute inset-2 sm:inset-3 rounded-full border-4 border-green-400 animate-pulse shadow-lg"></div>
        )}
      </div>

      {/* Selected User Display */}
      {selectedUser && !isAnimating && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 sm:p-6 lg:p-8 text-center shadow-xl w-full">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 mb-2 sm:mb-3">{t('selectedPlayer')}</h3>
          <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-green-700 mb-4 sm:mb-6 break-words px-2">{selectedUser.name}</p>
          {showStartButton && (
            <button
              onClick={handleStartQuestion}
              disabled={disabled}
              className="flex items-center justify-center space-x-2 sm:space-x-3 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none mx-auto w-full sm:w-auto min-h-[52px]"
            >
              <ArrowRight size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
              <span>{t('startQuestion')}</span>
            </button>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full">
        {/* Spin Button */}
        {!showStartButton && (
          <button
            onClick={spinForUser}
            disabled={availableUsers.length === 0 || isSpinning || disabled || isAnimating}
            className="flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 sm:px-8 lg:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg lg:text-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none w-full sm:w-auto min-h-[56px]"
          >
            <Play size={20} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 flex-shrink-0" />
            <span>
              {isAnimating ? t('spinning') : t('spinTheWheel')}
            </span>
          </button>
        )}

        {/* Reset Spinner Position Button */}
        {(selectedUser || rotation !== 0) && !isAnimating && (
          <button
            onClick={handleResetConfirmation}
            disabled={disabled}
            className="flex items-center justify-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-40 disabled:bg-opacity-10 disabled:cursor-not-allowed text-white px-4 py-2 sm:py-3 rounded-lg backdrop-blur-sm transition-all duration-200 font-medium border border-white border-opacity-30 text-sm sm:text-base min-h-[44px] transform hover:scale-105 active:scale-95 disabled:transform-none"
          >
            <RotateCcw size={16} className="flex-shrink-0" />
            <span>{t('resetPosition')}</span>
          </button>
        )}
      </div>

      {/* Status Messages */}
      <div className="text-center space-y-2 sm:space-y-3 w-full">
        <p className="text-base sm:text-lg font-medium text-white">
          {availableUsers.length} {availableUsers.length !== 1 ? t('playersRemaining') : t('player')}
        </p>
        
        {disabled && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center shadow-lg">
            <p className="text-red-800 font-medium text-sm sm:text-base">{t('spinnerDisabled')}</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isAnimating && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center shadow-lg w-full">
          <p className="text-blue-800 font-medium text-sm sm:text-base">{t('selectingPlayer')}</p>
        </div>
      )}
    </div>
  );
};

export default Spinner;