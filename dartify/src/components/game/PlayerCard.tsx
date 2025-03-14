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
          <div className="text-3xl font-bold">{player.score}</div>
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