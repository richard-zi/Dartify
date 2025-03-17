import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { GameType } from '../../types';

interface GameControlsProps {
  onEndGame: () => void;
  isGameActive: boolean;
  gameType: GameType;
  round: number;
  currentPlayerIndex: number;
  doubleOut: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onEndGame,
  isGameActive,
  gameType,
  round,
  currentPlayerIndex,
  doubleOut
}) => {
  const [showEndGameModal, setShowEndGameModal] = useState(false);

  const handleEndGameConfirm = () => {
    onEndGame();
    setShowEndGameModal(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h3 className="text-lg font-medium mb-4 text-gray-800">Game Controls</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {isGameActive ? (
          <Button
            onClick={() => setShowEndGameModal(true)}
            variant="danger"
            fullWidth
          >
            End Game
          </Button>
        ) : (
          <div>
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
          <p className="text-sm text-gray-500 mt-1">
            Checkout: {doubleOut ? 'Double Required' : 'Any Finish'}
          </p>
        </div>
      )}
      
      {/* End Game confirmation modal */}
      <Modal
        isOpen={showEndGameModal}
        onClose={() => setShowEndGameModal(false)}
        title="End Game"
        footer={
          <>
            <Button
              onClick={() => setShowEndGameModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndGameConfirm}
              variant="danger"
            >
              End Game
            </Button>
          </>
        }
      >
        <p>Are you sure you want to end the current game?</p>
        <p className="mt-2 text-sm text-gray-600">
          The game will be ended and all progress will be lost.
        </p>
      </Modal>
    </div>
  );
};

export default GameControls;