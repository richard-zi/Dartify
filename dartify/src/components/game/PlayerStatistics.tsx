import React, { useMemo } from 'react';
import { Player, GameType } from '../../types';
import Button from '../ui/Button';

interface PlayerStatisticsProps {
  players: Player[];
  winner: Player;
  gameType: GameType;
  doubleOut: boolean;
  onNewGame: () => void;
  onEndGame: () => void;
}

const PlayerStatistics: React.FC<PlayerStatisticsProps> = ({
  players,
  winner,
  gameType,
  doubleOut,
  onNewGame,
  onEndGame
}) => {
  // Calculate detailed statistics for each player
  const playerStats = useMemo(() => players.map(player => {
    // All throws flattened
    const allThrows = player.history.flat();
    
    // Dart statistics
    const totalDarts = allThrows.length;
    const highestThrow = allThrows.length > 0 ? Math.max(...allThrows) : 0;
    const lowestThrow = allThrows.length > 0 ? Math.min(...allThrows) : 0;
    
    // Score statistics
    const totalScore = allThrows.reduce((sum, score) => sum + score, 0);
    const average = totalDarts > 0 ? (totalScore / totalDarts) * 3 : 0;
    
    // Calculate 60+ throws
    const sixtyPlusThrows = allThrows.filter(score => score >= 60).length;
    const hundredPlusThrows = allThrows.filter(score => score >= 100).length;
    
    // Calculate zeros
    const zeroThrows = allThrows.filter(score => score === 0).length;
    
    return {
      ...player,
      totalDarts,
      highestThrow,
      lowestThrow,
      totalScore,
      average,
      sixtyPlusThrows,
      hundredPlusThrows,
      zeroThrows,
      missPercentage: totalDarts > 0 ? (zeroThrows / totalDarts) * 100 : 0,
      checkoutPercentage: player.checkout ? 100 : 0 // Simplified for demo
    };
  }), [players]);
  
  // Sort players by rank (winner first, then by average)
  const rankedPlayers = [...playerStats].sort((a, b) => {
    if (a.id === winner.id) return -1;
    if (b.id === winner.id) return 1;
    return b.average - a.average;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Over</h2>
        <p className="text-lg text-gray-600">{gameType} game completed</p>
        
        <div className="mt-6 flex justify-center">
          <div className="bg-green-50 rounded-full w-24 h-24 flex items-center justify-center border-4 border-green-100">
            <div className="text-center">
              <div className="text-green-600">
                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="font-bold text-green-800 text-sm mt-1">WINNER</div>
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-indigo-700 mt-3">{winner.name}</h3>
        
        {winner.checkout && (
          <div className="mt-3 inline-block bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <span className="text-green-800 font-medium">Checkout: </span>
            {winner.checkout.map((score, i) => (
              <span key={i} className="inline-block bg-green-100 px-2 py-1 rounded-full text-sm font-medium mx-1">
                {score}
              </span>
            ))}
          </div>
        )}

        {/* Show turns needed for checkout */}
        {winner.turnCount !== undefined && (
          <div className="mt-2">
            <span className="text-gray-700">Turns to checkout: </span>
            <span className="font-medium text-indigo-700">{winner.turnCount}</span>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Player Statistics</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High Throw</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">60+</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">100+</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miss %</th>
                {winner.turnCount !== undefined && (
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turns</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankedPlayers.map((player, index) => (
                <tr key={player.id} className={player.id === winner.id ? "bg-green-50" : ""}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="font-medium text-gray-900">
                        {player.name}
                        {player.id === winner.id && (
                          <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            Winner
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-gray-900 font-medium">{player.average.toFixed(1)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-gray-900">{player.highestThrow}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-gray-900">{player.sixtyPlusThrows}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-gray-900">{player.hundredPlusThrows}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-gray-900">{player.missPercentage.toFixed(1)}%</div>
                  </td>
                  {winner.turnCount !== undefined && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-gray-900">{player.id === winner.id ? player.turnCount : '-'}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Game Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Total Rounds</div>
            <div className="text-2xl font-bold text-gray-800">{players[0]?.history.length || 0}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Game Type</div>
            <div className="text-2xl font-bold text-gray-800">{gameType}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Checkout Mode</div>
            <div className="text-2xl font-bold text-gray-800">{doubleOut ? 'Double Out' : 'Any Finish'}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Players</div>
            <div className="text-2xl font-bold text-gray-800">{players.length}</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8 pt-4 border-t">
        <Button onClick={onEndGame} variant="secondary">
          Exit to Menu
        </Button>
        <Button onClick={onNewGame} variant="primary">
          Play New Game
        </Button>
      </div>
    </div>
  );
};

export default PlayerStatistics;