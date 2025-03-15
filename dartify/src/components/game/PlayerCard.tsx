import React from 'react';
import { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  isWinner: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isActive, isWinner }) => {
  // Generate background based on status
  const getBgColor = () => {
    if (isWinner) return 'bg-green-50 border-green-400';
    if (isActive) return 'bg-indigo-50 border-indigo-400';
    return 'bg-white border-gray-100';
  };

  // Determine if player is in checkout range
  const isCheckoutRange = (player.score <= 170 && player.score > 1);
  
  // Get checkout suggestion if in range
  const getCheckoutSuggestion = (score: number): string | null => {
    if (score > 170 || score <= 1) return null;
    
    // Just provide a few common checkouts for demonstration
    const checkouts: Record<number, string> = {
      170: 'T20 T20 Bull',
      167: 'T20 T19 Bull',
      160: 'T20 T20 D20',
      136: 'T20 T20 D8',
      100: 'T20 D20',
      50: 'Bull',
      40: 'D20',
      36: 'D18',
      32: 'D16',
    };
    
    return checkouts[score] || 'Possible';
  };

  return (
    <div 
      className={`rounded-lg border shadow-sm p-4 transition-all ${getBgColor()}`}
    >
      {/* Status indicators */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-800">{player.name}</h3>
        <div className="flex items-center">
          {isActive && (
            <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
              Current Turn
            </span>
          )}
          {isWinner && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              Winner
            </span>
          )}
        </div>
      </div>

      {/* Score display */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-gray-500 text-sm">Points</span>
          <div className={`text-3xl font-bold ${isCheckoutRange ? 'text-green-600' : 'text-gray-800'}`}>
            {player.score}
            {isCheckoutRange && (
              <span className="ml-2 text-xs inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Checkout
              </span>
            )}
          </div>
        </div>
        <div>
          <span className="text-gray-500 text-sm">Average</span>
          <div className="text-xl font-medium text-gray-800">{player.average.toFixed(1)}</div>
        </div>
      </div>

      {/* Current throw display */}
      {isActive && player.throws.length > 0 && (
        <div className="mt-3 p-2 bg-gray-50 rounded-md border border-gray-100">
          <span className="text-sm font-medium text-gray-700">Current Throws:</span>
          <div className="flex justify-between mt-1">
            {[0, 1, 2].map(index => (
              <div 
                key={index} 
                className={`w-12 h-12 flex items-center justify-center rounded-md font-bold
                  ${index < player.throws.length 
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                    : 'bg-gray-100 text-gray-400 border border-gray-200'}`
                }
              >
                {index < player.throws.length ? player.throws[index] : '-'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {player.history.length > 0 && (
        <div className="mt-3">
          <span className="text-sm text-gray-500">Last Round:</span>
          <div className="flex space-x-2 mt-1">
            {player.history[player.history.length - 1].map((score, i) => (
              <span 
                key={i} 
                className="inline-block bg-gray-100 px-2 py-1 rounded text-sm"
              >
                {score}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Checkout suggestion if applicable */}
      {isCheckoutRange && !isWinner && (
        <div className="mt-3 p-2 bg-green-50 rounded-md border border-green-100">
          <span className="text-sm font-medium text-green-800">Recommended Checkout:</span>
          <div className="font-medium text-green-800 mt-1">
            {getCheckoutSuggestion(player.score)}
          </div>
        </div>
      )}

      {/* Checkout if applicable */}
      {player.checkout && (
        <div className="mt-3 p-2 bg-green-50 rounded-md border border-green-100">
          <span className="text-sm font-medium text-green-800">Checkout:</span>
          <div className="flex space-x-2 mt-1">
            {player.checkout.map((score, i) => (
              <span 
                key={i} 
                className="inline-block bg-green-100 px-2 py-1 rounded-full text-sm font-medium text-green-800"
              >
                {score}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;