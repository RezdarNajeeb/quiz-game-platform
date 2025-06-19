import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, ArrowRight, AlertTriangle } from 'lucide-react';
import { User } from '../types/game';
import { getGameSettings } from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface WheelSpinnerProps {
  availableUsers: User[];
  onUserSelected: (user: User) => void;
  onStartQuestion: () => void;
  isSpinning: boolean;
  disabled?: boolean;
}

const WheelSpinner: React.FC<WheelSpinnerProps> = ({
  availableUsers,
  onUserSelected,
  onStartQuestion,
  isSpinning,
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showStartButton, setShowStartButton] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [wheelColors, setWheelColors] = useState<string[]>([]);

  const settings = getGameSettings();
  const t = (key: string) => getTranslation(key, settings.language);

  // Generate beautiful gradient colors for wheel segments
  const generateWheelColors = useCallback((count: number): string[] => {
    const colors = [];
    const baseColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#A3E4D7', '#F9E79F', '#D5A6BD', '#AED6F1', '#A9DFBF'
    ];
    
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }, []);

  // Initialize wheel colors when users change
  useEffect(() => {
    if (availableUsers.length > 0) {
      setWheelColors(generateWheelColors(availableUsers.length));
    }
  }, [availableUsers.length, generateWheelColors]);

  // Reset states when availableUsers changes
  useEffect(() => {
    if (availableUsers.length === 0) {
      setSelectedUser(null);
      setShowStartButton(false);
    }
  }, [availableUsers]);

  // Function to determine which user the arrow is pointing to
  const getUserAtArrow = useCallback((rotation: number): User | null => {
    if (availableUsers.length === 0) return null;

    const segmentAngle = (2 * Math.PI) / availableUsers.length;
    
    // Normalize rotation to 0-2π range
    const normalizedRotation = ((rotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    
    // The arrow points to the top (12 o'clock position = -π/2 or 3π/2)
    // We need to find which segment is under the arrow
    // Since segments are drawn starting from 0 and going clockwise,
    // and the wheel rotates clockwise, we need to account for the rotation
    
    // Calculate the angle from the top of the wheel (where arrow points)
    // Add π/2 to convert from standard math coordinates to our wheel coordinates
    const arrowAngle = (normalizedRotation + Math.PI / 2) % (2 * Math.PI);
    
    // Find which segment the arrow is pointing to
    // We need to account for the fact that segments are centered on their angles
    const adjustedAngle = (arrowAngle + segmentAngle / 2) % (2 * Math.PI);
    const segmentIndex = Math.floor(adjustedAngle / segmentAngle) % availableUsers.length;
    
    return availableUsers[segmentIndex];
  }, [availableUsers]);

  // Draw the wheel
  const drawWheel = useCallback((rotation: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || availableUsers.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const segmentAngle = (2 * Math.PI) / availableUsers.length;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    // Draw segments - starting from the top and going clockwise
    availableUsers.forEach((user, index) => {
      // Start from -π/2 (top of the circle) and go clockwise
      const startAngle = -Math.PI / 2 + index * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      const color = wheelColors[index] || '#FF6B6B';

      // Create gradient for each segment
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, adjustBrightness(color, -20));

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add segment border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Add subtle shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw text
      ctx.save();
      const textAngle = startAngle + segmentAngle / 2;
      ctx.rotate(textAngle);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      const textRadius = radius * 0.7;
      const displayName = user.name.length > 12 ? `${user.name.substring(0, 10)}...` : user.name;
      ctx.fillText(displayName, textRadius, 0);
      
      ctx.restore();
    });

    // Draw center circle
    const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
    centerGradient.addColorStop(0, '#4F46E5');
    centerGradient.addColorStop(1, '#3730A3');
    
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Add center icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', 0, 0);

    ctx.restore();
  }, [availableUsers, wheelColors]);

  // Utility function to adjust color brightness
  const adjustBrightness = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Initialize canvas and draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const size = Math.min(window.innerWidth * 0.8, 400);
    canvas.width = size;
    canvas.height = size;

    drawWheel(currentRotation);
  }, [availableUsers, wheelColors, currentRotation, drawWheel]);

  // Spin animation
  const spinWheel = useCallback(async () => {
    if (availableUsers.length === 0 || isSpinning || disabled || isAnimating) return;

    setSelectedUser(null);
    setShowStartButton(false);
    setIsAnimating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate spin parameters
    const spinDuration = 4000; // 4 seconds
    const minSpins = 5;
    const maxSpins = 8;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    
    // Select random user
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    const targetUser = availableUsers[randomIndex];
    
    // Calculate target angle to land on the selected user
    const segmentAngle = (2 * Math.PI) / availableUsers.length;
    
    // We want the center of the target segment to be at the top (where arrow points)
    // The segment center is at: -π/2 + randomIndex * segmentAngle + segmentAngle/2
    // We want this to equal 0 (after normalization), so we need to rotate by the negative of this
    const targetSegmentCenter = -Math.PI / 2 + randomIndex * segmentAngle + segmentAngle / 2;
    
    // Calculate the final rotation needed to align the target segment with the arrow
    const targetAngle = -targetSegmentCenter;
    const totalRotation = spins * 2 * Math.PI + targetAngle;

    const startTime = Date.now();
    const startRotation = currentRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const rotation = startRotation + totalRotation * easeOut;
      
      setCurrentRotation(rotation);
      drawWheel(rotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - verify the selection
        const finalSelectedUser = getUserAtArrow(rotation);
        const actualSelectedUser = finalSelectedUser || targetUser;
        
        setSelectedUser(actualSelectedUser);
        setShowStartButton(true);
        setIsAnimating(false);
        onUserSelected(actualSelectedUser);
      }
    };

    requestAnimationFrame(animate);
  }, [availableUsers, isSpinning, disabled, isAnimating, currentRotation, drawWheel, onUserSelected, getUserAtArrow]);

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
    setCurrentRotation(0);
    setIsAnimating(false);
    setShowConfirmation(false);
    drawWheel(0);
  };

  const cancelReset = () => {
    setShowConfirmation(false);
  };

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

      {/* Wheel Container */}
      <div className="relative">
        {/* Wheel Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="drop-shadow-2xl rounded-full"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {/* Pointer Arrow - Fixed to point downward into the wheel */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-2 z-10">
            <div className="relative">
              {/* Arrow Shadow */}
              <div className="absolute top-1 left-1 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-gray-400 opacity-30"></div>
              {/* Main Arrow pointing DOWN into the wheel */}
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500"></div>
              {/* Arrow Base Circle */}
              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto -mt-5 shadow-lg border-2 border-white"></div>
            </div>
          </div>

          {/* Selection Highlight */}
          {selectedUser && !isAnimating && (
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse shadow-lg pointer-events-none"></div>
          )}

          {/* Spinning Overlay */}
          {isAnimating && (
            <div className="absolute inset-0 rounded-full bg-white bg-opacity-10 flex items-center justify-center pointer-events-none">
              <div className="text-white font-bold text-lg bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                {t('spinning')}
              </div>
            </div>
          )}
        </div>
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
            onClick={spinWheel}
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
        {(selectedUser || currentRotation !== 0) && !isAnimating && (
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

export default WheelSpinner;