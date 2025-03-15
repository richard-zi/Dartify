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
    if (isWinner) return 'bg-green-100 border-green-500';
    if (isActive) return 'bg-blue-100 border-blue-500';
    return 'bg-white';
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
    
    return checkouts[score] || 'Möglich';
  };

  return (
    <div 
      className={`rounded-lg border shadow p-4 transition-all ${getBgColor()}`}
    >
      {/* Status indicators */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{player.name}</h3>
        <div className="flex items-center">
          {isActive && (
            <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mr-1">
              Am Zug
            </span>
          )}
          {isWinner && (
            <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded">
              Gewinner
            </span>
          )}
        </div>
      </div>

      {/* Score display */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-gray-500 text-sm">Punkte</span>
          <div className={`text-3xl font-bold ${isCheckoutRange ? 'text-green-600' : ''}`}>
            {player.score}
            {isCheckoutRange && (
              <span className="ml-2 text-xs inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Checkout
              </span>
            )}
          </div>
        </div>
        <div>
          <span className="text-gray-500 text-sm">Durchschnitt</span>
          <div className="text-xl font-medium">{player.average.toFixed(1)}</div>
        </div>
      </div>

      {/* Current throw display */}
      {isActive && player.throws.length > 0 && (
        <div className="mt-3 p-2 bg-gray-100 rounded">
          <span className="text-sm font-medium">Aktuelle Würfe:</span>
          <div className="flex justify-between mt-1">
            {[0, 1, 2].map(index => (
              <div 
                key={index} 
                className={`w-12 h-12 flex items-center justify-center rounded font-bold
                  ${index < player.throws.length 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-400'}`
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
          <span className="text-sm text-gray-500">Letzte Runde:</span>
          <div className="flex space-x-2 mt-1">
            {player.history[player.history.length - 1].map((score, i) => (
              <span 
                key={i} 
                className="inline-block bg-gray-200 px-2 py-1 rounded text-sm"
              >
                {score}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Checkout suggestion if applicable */}
      {isCheckoutRange && !isWinner && (
        <div className="mt-3 p-2 bg-green-100 rounded">
          <span className="text-sm font-medium text-green-800">Empfohlener Checkout:</span>
          <div className="font-medium text-green-800 mt-1">
            {getCheckoutSuggestion(player.score)}
          </div>
        </div>
      )}

      {/* Checkout if applicable */}
      {player.checkout && (
        <div className="mt-3 p-2 bg-green-100 rounded">
          <span className="text-sm font-medium text-green-800">Checkout:</span>
          <div className="flex space-x-2 mt-1">
            {player.checkout.map((score, i) => (
              <span 
                key={i} 
                className="inline-block bg-green-200 px-2 py-1 rounded text-sm font-medium"
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