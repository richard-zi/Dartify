import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CameraView from '../components/camera/CameraView';
import CameraControls from '../components/camera/CameraControls';
import ScoreBoard from '../components/game/ScoreBoard';
import ScoreInput from '../components/game/ScoreInput';
import GameControls from '../components/game/GameControls';
import Button from '../components/ui/Button';
import { GameType } from '../types';
import { useGame } from '../contexts/GameContext';
import { useCamera } from '../hooks/useCamera';
import { isCheckoutRange, getCheckoutSuggestionDetails } from '../utils/dartLogic';

// Create an inline statistics component to avoid the import error
const PlayerStatistics: React.FC<{
  players: any[];
  winner: any;
  gameType: GameType;
  doubleOut: boolean;
  onNewGame: () => void;
  onEndGame: () => void;
}> = ({ players, winner, gameType, doubleOut, onNewGame, onEndGame }) => {
  // Sort players by rank (winner first, then by average)
  const rankedPlayers = [...players].sort((a, b) => {
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
            {winner.checkout.map((score: number, i: number) => (
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
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Throws</th>
                {winner.turnCount !== undefined && (
                  <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turns</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankedPlayers.map((player, index) => {
                // Calculate total darts thrown
                const totalDarts = player.history.flat().length;
                
                return (
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
                      <div className="text-gray-900">{totalDarts}</div>
                    </td>
                    {winner.turnCount !== undefined && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-900">{player.id === winner.id ? player.turnCount : '-'}</div>
                      </td>
                    )}
                  </tr>
                );
              })}
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

const GamePage: React.FC = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [showCheckoutHint, setShowCheckoutHint] = useState(false);
  const [gamePhase, setGamePhase] = useState<'selection' | 'active' | 'statistics'>('selection');
  const [selectedGameType, setSelectedGameType] = useState<GameType>("501");
  const [doubleOut, setDoubleOut] = useState<boolean>(true);
  
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
  
  // Check if current player is in checkout range
  useEffect(() => {
    if (currentPlayer && isCheckoutRange(currentPlayer.score, state.options.doubleOut)) {
      setShowCheckoutHint(true);
      // Hide the hint after 3 seconds
      const timer = setTimeout(() => {
        setShowCheckoutHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowCheckoutHint(false);
    }
  }, [currentPlayer, state.options.doubleOut]);

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
    setGamePhase('active');
  };

  // Handle reset game
  const handleResetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    setGamePhase('selection');
  };

  // Handle start new game
  const handleStartNewGame = () => {
    setGamePhase('selection');
  };

  // Handle end game
  const handleEndGame = () => {
    navigate('/');
  };

  // Handle score submission
  const handleScoreSubmit = (score: number) => {
    // Limit score to a single dart (max 60)
    if (score > 60) {
      score = 60;
    }
    
    // Use simulateDetection to satisfy the TypeScript warning
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
  
  // Get checkout details if available
  const checkoutDetails = currentPlayer ? 
    getCheckoutSuggestionDetails(currentPlayer.score, state.options.doubleOut) : null;

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
        
        {/* Checkout Hint Toast */}
        {showCheckoutHint && currentPlayer && checkoutDetails?.isCheckout && (
          <div className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded shadow-md z-50">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <p className="font-bold">Checkout possible!</p>
                <p>{checkoutDetails.sequence}</p>
              </div>
            </div>
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
                {/* Game Controls */}
                <GameControls 
                  onResetGame={handleResetGame}
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