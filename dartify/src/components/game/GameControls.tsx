import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { GameType } from '../../types';

interface GameControlsProps {
  onResetGame: () => void;
  onEndGame: () => void;
  isGameActive: boolean;
  gameType: GameType;
  round: number;
  currentPlayerIndex: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  onResetGame,
  onEndGame,
  isGameActive,
  gameType,
  round,
  currentPlayerIndex,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);

  const handleResetConfirm = () => {
    onResetGame();
    setShowResetModal(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h3 className="text-lg font-medium mb-4 text-gray-800">Game Controls</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {isGameActive ? (
          <>
            <Button
              onClick={() => setShowResetModal(true)}
              variant="secondary"
              fullWidth
            >
              Reset
            </Button>
            
            <Button
              onClick={onEndGame}
              variant="danger"
              fullWidth
            >
              End Game
            </Button>
          </>
        ) : (
          <div className="col-span-2">
            <p className="text-sm text-gray-500 mb-2">
              Select a game type to begin.
            </p>
          </div>
        )}
      </div>
      
      {/* Game active status */}
      {isGameActive && (
        <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">Active Game:</p>
          <p className="text-lg font-bold text-indigo-700">{gameType}</p>
          <p className="text-sm text-gray-500">
            Round: {round} | Player: {currentPlayerIndex + 1}
          </p>
        </div>
      )}
      
      {/* Reset confirmation modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Game"
        footer={
          <>
            <Button
              onClick={() => setShowResetModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetConfirm}
              variant="danger"
            >
              Reset
            </Button>
          </>
        }
      >
        <p>Are you sure you want to reset the current game?</p>
        <p className="mt-2 text-sm text-gray-600">
          The game will be restarted with the same players. All scores will be reset.
        </p>
      </Modal>
    </div>
  );
};

export default GameControls;