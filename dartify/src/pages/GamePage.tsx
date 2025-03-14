import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CameraView from '../components/camera/CameraView';
import CameraControls from '../components/camera/CameraControls';
import ScoreBoard from '../components/game/ScoreBoard';
import ScoreInput from '../components/game/ScoreInput';
import GameControls from '../components/game/GameControls';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { GameType } from '../types';
import { useGame } from '../contexts/GameContext';
import { useCamera } from '../hooks/useCamera';

const GamePage: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  const {
    isActive: isCameraActive,
    isDetecting,
    startCamera,
    stopCamera,
    toggleDetection,
    simulateDetection
  } = useCamera({
    onDetection: (score) => handleScoreSubmit(score)
  });

  // Check if we have an active game
  const isGameActive = !state.isGameOver && state.gameType !== "" as GameType;
  
  // Get current player
  const currentPlayer = state.players[state.currentPlayerIndex] || null;

  // Handle start game
  const handleStartGame = (gameType: GameType) => {
    dispatch({ type: 'START_GAME', payload: { gameType } });
  };

  // Handle reset game
  const handleResetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    setShowWinnerModal(false);
  };

  // Handle end game
  const handleEndGame = () => {
    navigate('/');
  };

  // Handle score submission
  const handleScoreSubmit = (score: number) => {
    // Verwende simulateDetection hier, um den Warnhinweis zu beseitigen
    if (score === 0 && isDetecting) {
      score = simulateDetection();
    }
    
    dispatch({ type: 'ADD_SCORE', payload: { score } });
    
    // Check if we have a winner after adding score
    if (state.winner && !showWinnerModal) {
      setShowWinnerModal(true);
    }
  };

  // Handle undo throw
  const handleUndoThrow = () => {
    dispatch({ type: 'UNDO_THROW' });
  };

  // Handle next player
  const handleNextPlayer = () => {
    dispatch({ type: 'NEXT_PLAYER' });
  };
  
  // Handle camera toggle
  const handleCameraToggle = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Game Setup Notice */}
        {state.players.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-lg mb-6">
            <p className="font-medium">Du hast noch keine Spieler eingerichtet.</p>
            <Button
              onClick={() => navigate('/setup')}
              variant="primary"
              className="mt-2"
            >
              Zur Spielereinrichtung
            </Button>
          </div>
        ) : !isGameActive && !state.isGameOver ? (
          <div className="bg-blue-100 border border-blue-400 p-4 rounded-lg mb-6">
            <p className="font-medium">Wähle einen Spielmodus, um zu beginnen.</p>
          </div>
        ) : null}
        
        {/* Main Game Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Scoreboard */}
          <div className="lg:col-span-2">
            <ScoreBoard
              players={state.players}
              currentPlayerIndex={state.currentPlayerIndex}
              winner={state.winner}
            />
            
            {/* Camera Feed */}
            {isGameActive && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-3">Kamera</h2>
                <div className="bg-white p-4 rounded-lg shadow">
                  <CameraView 
                    onScoreDetected={handleScoreSubmit} 
                    showControls={false}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Controls */}
          <div>
            <div className="space-y-6">
              {/* Game Controls */}
              <GameControls 
                onStartGame={handleStartGame}
                onResetGame={handleResetGame}
                onEndGame={handleEndGame}
                isGameActive={isGameActive}
              />
              
              {/* Camera Controls */}
              {isGameActive && (
                <CameraControls 
                  onCameraToggle={handleCameraToggle}
                  onDetectionToggle={toggleDetection}
                  onManualScore={handleScoreSubmit}
                  isActive={isCameraActive}
                  isDetecting={isDetecting}
                />
              )}
              
              {/* Score Input */}
              {isGameActive && currentPlayer && (
                <ScoreInput 
                  onScoreSubmit={handleScoreSubmit}
                  onUndoThrow={handleUndoThrow}
                  onNextPlayer={handleNextPlayer}
                  dartsThrown={state.dartsThrown}
                  currentScore={currentPlayer.score}
                  gameType={state.gameType}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Winner Modal */}
        <Modal
          isOpen={showWinnerModal}
          onClose={() => setShowWinnerModal(false)}
          title="Spielgewinner!"
          footer={
            <>
              <Button
                onClick={handleResetGame}
                variant="secondary"
              >
                Neues Spiel
              </Button>
              <Button
                onClick={handleEndGame}
                variant="primary"
              >
                Spiel beenden
              </Button>
            </>
          }
        >
          {state.winner && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">{state.winner.name}</h3>
              <p className="text-lg">hat das Spiel gewonnen!</p>
              
              {state.winner.checkout && (
                <div className="mt-4 bg-green-50 p-3 rounded">
                  <p className="font-medium">Checkout:</p>
                  <div className="flex justify-center gap-2 mt-1">
                    {state.winner.checkout.map((score, i) => (
                      <span 
                        key={i} 
                        className="bg-green-100 px-3 py-1 rounded-full font-medium"
                      >
                        {score}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-gray-600">
                  Durchschnitt: {state.winner.average.toFixed(1)}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default GamePage;