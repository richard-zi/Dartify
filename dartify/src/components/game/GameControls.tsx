import React, { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { GameType } from '../../types';
import { useGame } from '../../contexts/GameContext';

interface GameControlsProps {
  onStartGame: (gameType: GameType) => void;
  onResetGame: () => void;
  onEndGame: () => void;
  isGameActive: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onStartGame,
  onResetGame,
  onEndGame,
  isGameActive,
}) => {
  const { state } = useGame();
  const [showStartModal, setShowStartModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<GameType>("501");

  const handleStartGame = () => {
    onStartGame(selectedGameType);
    setShowStartModal(false);
  };

  const handleResetConfirm = () => {
    onResetGame();
    setShowResetModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Spielsteuerung</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {!isGameActive ? (
          <Button
            onClick={() => setShowStartModal(true)}
            variant="primary"
            fullWidth
            disabled={state.players.length < 1}
          >
            Spiel starten
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setShowResetModal(true)}
              variant="secondary"
              fullWidth
            >
              Spiel zurücksetzen
            </Button>
            
            <Button
              onClick={onEndGame}
              variant="danger"
              fullWidth
            >
              Spiel beenden
            </Button>
          </>
        )}
      </div>
      
      {/* Game active status */}
      {isGameActive && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm font-medium">Aktives Spiel:</p>
          <p className="text-lg font-bold">{state.gameType}</p>
          <p className="text-sm">
            Runde: {state.round} | Spieler: {state.players.length}
          </p>
        </div>
      )}
      
      {/* Game type selection modal */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Spiel starten"
        footer={
          <>
            <Button
              onClick={() => setShowStartModal(false)}
              variant="secondary"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleStartGame}
              variant="primary"
            >
              Starten
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p>Wähle den Spieltyp:</p>
          
          <div className="grid grid-cols-1 gap-2">
            <div
              className={`border rounded p-3 cursor-pointer ${
                selectedGameType === "501" ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedGameType("501")}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={selectedGameType === "501"}
                  onChange={() => setSelectedGameType("501")}
                  className="mr-2"
                />
                <div>
                  <h4 className="font-medium">501</h4>
                  <p className="text-sm text-gray-600">
                    Standard 501 Spiel. Starte mit 501 Punkten und zähle auf 0 runter.
                  </p>
                </div>
              </div>
            </div>
            
            <div
              className={`border rounded p-3 cursor-pointer ${
                selectedGameType === "301" ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedGameType("301")}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={selectedGameType === "301"}
                  onChange={() => setSelectedGameType("301")}
                  className="mr-2"
                />
                <div>
                  <h4 className="font-medium">301</h4>
                  <p className="text-sm text-gray-600">
                    Kurzes Spiel. Starte mit 301 Punkten und zähle auf 0 runter.
                  </p>
                </div>
              </div>
            </div>
            
            <div
              className={`border rounded p-3 cursor-pointer ${
                selectedGameType === "Cricket" ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedGameType("Cricket")}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={selectedGameType === "Cricket"}
                  onChange={() => setSelectedGameType("Cricket")}
                  className="mr-2"
                />
                <div>
                  <h4 className="font-medium">Cricket</h4>
                  <p className="text-sm text-gray-600">
                    Treffe die Zahlen 15-20 und Bullseye drei Mal, um sie zu schließen.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Hinweis: Jedes Spiel beginnt mit dem ersten Spieler in der Liste.
            </p>
          </div>
        </div>
      </Modal>
      
      {/* Reset confirmation modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Spiel zurücksetzen"
        footer={
          <>
            <Button
              onClick={() => setShowResetModal(false)}
              variant="secondary"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleResetConfirm}
              variant="danger"
            >
              Zurücksetzen
            </Button>
          </>
        }
      >
        <p>Bist du sicher, dass du das aktuelle Spiel zurücksetzen möchtest?</p>
        <p className="mt-2 text-sm text-gray-600">
          Das Spiel wird mit denselben Spielern neu gestartet. Alle Punkte werden zurückgesetzt.
        </p>
      </Modal>
    </div>
  );
};

export default GameControls;