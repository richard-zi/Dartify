import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CameraView from '../components/camera/CameraView';
import CameraControls from '../components/camera/CameraControls';
import ScoreBoard from '../components/game/ScoreBoard';
import ScoreInput from '../components/game/ScoreInput';
import GameControls from '../components/game/GameControls';
import Button from '../components/ui/Button';
import PlayerStatistics from '../components/game/PlayerStatistics';
import { GameType } from '../types';
import { useGame } from '../contexts/GameContext';
import { useCamera } from '../hooks/useCamera';

const GamePage: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [gamePhase, setGamePhase] = useState<'selection' | 'active' | 'statistics'>('selection');
  const [selectedGameType, setSelectedGameType] = useState<GameType>("501");
  const [doubleOut, setDoubleOut] = useState<boolean>(true);
  const [effectivelyActive, setEffectivelyActive] = useState<boolean>(false);
  
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

  const isGameActive = effectivelyActive && !state.isGameOver && state.gameType !== "" as GameType;
  const currentPlayer = state.players[state.currentPlayerIndex] || null;
  
  // Update game phase based on game state
  useEffect(() => {
    if (state.isGameOver && state.winner) {
      setGamePhase('statistics');
    } else if (isGameActive) {
      setGamePhase('active');
    } else if (state.players.length > 0) {
      setGamePhase('selection');
    }
  }, [isGameActive, state.isGameOver, state.players.length, state.winner]);

  // Handle start game
  const handleStartGame = (gameType: GameType) => {
    dispatch({ 
      type: 'START_GAME', 
      payload: { 
        gameType,
        options: {
          doubleOut: doubleOut,
          turnCount: 0
        }
      } 
    });
    setEffectivelyActive(true);
    setGamePhase('active');
  };

  // Handle start new game
  const handleStartNewGame = () => {
    setEffectivelyActive(false);
    setGamePhase('selection');
  };

  // Handle end game
  const handleEndGame = () => {
    dispatch({ type: 'RESET_GAME' });
    setEffectivelyActive(false);
    setGamePhase('selection');
  };

  // Handle score submission
  const handleScoreSubmit = (score: number) => {
    if (score > 60) {
      score = 60;
    }
    
    if (score === 0 && isDetecting) {
      score = simulateDetection();
    }
    
    dispatch({ type: 'ADD_SCORE', payload: { score } });
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
        {/* Game Mode Selection Screen */}
        {gamePhase === 'selection' && state.players.length > 0 && (
          <div className="mb-8 bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Select Game Mode</h2>
            <p className="text-gray-600 mb-6">Choose a game mode to start playing with your players.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-indigo-300 ${
                  selectedGameType === "501" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                }`}
                onClick={() => setSelectedGameType("501")}
              >
                <div className="flex items-start mb-2">
                  <input
                    type="radio"
                    checked={selectedGameType === "501"}
                    onChange={() => setSelectedGameType("501")}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">501</h3>
                    <p className="text-gray-600 text-sm">
                      Standard 501 game. Start with 501 points and count down to zero.
                    </p>
                  </div>
                </div>
                <div className="pl-6 mt-2">
                  <div className="py-1 px-2 bg-indigo-100 text-indigo-800 text-xs inline-block rounded">Standard</div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>• {doubleOut ? 'Double checkout required' : 'Any checkout allowed'}</p>
                    <p>• Unlimited players</p>
                    <p>• Suitable for tournaments</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-indigo-300 ${
                  selectedGameType === "301" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                }`}
                onClick={() => setSelectedGameType("301")}
              >
                <div className="flex items-start mb-2">
                  <input
                    type="radio"
                    checked={selectedGameType === "301"}
                    onChange={() => setSelectedGameType("301")}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">301</h3>
                    <p className="text-gray-600 text-sm">
                      Shorter game. Start with 301 points and count down to zero.
                    </p>
                  </div>
                </div>
                <div className="pl-6 mt-2">
                  <div className="py-1 px-2 bg-green-100 text-green-800 text-xs inline-block rounded">Quick</div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>• {doubleOut ? 'Double checkout required' : 'Any checkout allowed'}</p>
                    <p>• Ideal for 1-2 players</p>
                    <p>• Shorter play time</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-indigo-300 ${
                  selectedGameType === "Cricket" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
                }`}
                onClick={() => setSelectedGameType("Cricket")}
              >
                <div className="flex items-start mb-2">
                  <input
                    type="radio"
                    checked={selectedGameType === "Cricket"}
                    onChange={() => setSelectedGameType("Cricket")}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">Cricket</h3>
                    <p className="text-gray-600 text-sm">
                      Hit numbers 15-20 and Bullseye three times to close them.
                    </p>
                  </div>
                </div>
                <div className="pl-6 mt-2">
                  <div className="py-1 px-2 bg-amber-100 text-amber-800 text-xs inline-block rounded">Tactical</div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>• Target specific fields</p>
                    <p>• Ideal for 2-4 players</p>
                    <p>• More tactical decisions</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Double Out Toggle Option */}
            <div className="mb-6 p-4 border rounded-lg border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 mb-2">Checkout Options</h3>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={doubleOut}
                    onChange={() => setDoubleOut(!doubleOut)}
                    className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700">Require Double Out</span>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {doubleOut 
                  ? "Traditional rules: A player must hit a double to complete the game (e.g. D20 for 40 points)." 
                  : "Any finish allowed: A player can finish with any dart (single, double, triple, or bull)."}
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => navigate('/setup')}
                variant="secondary"
              >
                Back to Player Setup
              </Button>
              <Button 
                onClick={() => handleStartGame(selectedGameType)}
                variant="primary"
                disabled={state.players.length === 0}
              >
                Start Game
              </Button>
            </div>
          </div>
        )}
      
        {/* Player Setup Notice */}
        {state.players.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
            <p className="font-medium text-amber-800">You haven't set up any players yet.</p>
            <Button
              onClick={() => navigate('/setup')}
              variant="primary"
              className="mt-2"
            >
              Go to Player Setup
            </Button>
          </div>
        ) : null}
        
        {/* Statistics Screen */}
        {gamePhase === 'statistics' && state.winner && (
          <div className="mb-8">
            <PlayerStatistics 
              players={state.players} 
              winner={state.winner} 
              gameType={state.gameType}
              doubleOut={state.options.doubleOut}
              onNewGame={handleStartNewGame}
              onEndGame={handleEndGame}
            />
          </div>
        )}
        
        {/* Main Game Interface */}
        {gamePhase === 'active' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Scoreboard */}
            <div className="lg:col-span-2">
              <ScoreBoard
                players={state.players}
                currentPlayerIndex={state.currentPlayerIndex}
                winner={state.winner}
                doubleOut={state.options.doubleOut}
              />
              
              
              {/* Camera Feed */}
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-3 text-gray-800">Camera</h2>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <CameraView 
                    onScoreDetected={handleScoreSubmit} 
                    showControls={false}
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column - Controls */}
            <div>
              <div className="space-y-6">
                {/* Game Controls - REMOVED onResetGame prop */}
                <GameControls 
                  onEndGame={handleEndGame}
                  isGameActive={isGameActive}
                  gameType={state.gameType}
                  round={state.round}
                  currentPlayerIndex={state.currentPlayerIndex}
                  doubleOut={state.options.doubleOut}
                />
                
                {/* Camera Controls */}
                <CameraControls 
                  onCameraToggle={handleCameraToggle}
                  onDetectionToggle={toggleDetection}
                  onManualScore={handleScoreSubmit}
                  isActive={isCameraActive}
                  isDetecting={isDetecting}
                />
                
                {/* Score Input */}
                {currentPlayer && (
                  <ScoreInput 
                    onScoreSubmit={handleScoreSubmit}
                    onUndoThrow={handleUndoThrow}
                    onNextPlayer={handleNextPlayer}
                    dartsThrown={state.dartsThrown}
                    currentScore={currentPlayer.score}
                    gameType={state.gameType}
                    doubleOut={state.options.doubleOut}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GamePage;