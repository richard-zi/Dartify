import React from 'react';
import { Player } from '../../types';
import PlayerCard from './PlayerCard';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  winner: Player | null;
  doubleOut: boolean;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentPlayerIndex,
  winner,
  doubleOut
}) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Score Board</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {players.map((player, index) => (
          <PlayerCard 
            key={player.id}
            player={player}
            isActive={index === currentPlayerIndex && !winner}
            isWinner={winner ? player.id === winner.id : false}
            doubleOut={doubleOut}
          />
        ))}
      </div>
      
      {players.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No players available. Add players to begin.</p>
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;