import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useGame } from '../contexts/GameContext';

const PlayerSetupPage: React.FC = () => {
  const { state, dispatch } = useGame();
  const [newPlayerName, setNewPlayerName] = useState('');
  const navigate = useNavigate();

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim whitespace and check if name is not empty
    const trimmedName = newPlayerName.trim();
    if (trimmedName === '') return;
    
    // Add player to the game
    dispatch({ type: 'ADD_PLAYER', payload: { name: trimmedName } });
    
    // Clear the input
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: { id } });
  };

  const handleStartGame = () => {
    if (state.players.length === 0) return;
    navigate('/game');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Player Setup</h1>
        
        {/* Add player form */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-medium mb-4 text-gray-800">New Player</h2>
          
          <form onSubmit={handleAddPlayer} className="flex gap-3">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter player name"
              className="border border-gray-200 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={20}
            />
            <Button type="submit" variant="primary">
              Add
            </Button>
          </form>
        </div>
        
        {/* Player list */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Player List</h2>
          
          {state.players.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No players available. Add players above.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {state.players.map((player, index) => (
                <li key={player.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-800">{player.name}</span>
                  </div>
                  <Button 
                    onClick={() => handleRemovePlayer(player.id)} 
                    variant="danger"
                    size="sm"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between">
          <Button 
            onClick={() => navigate('/')} 
            variant="secondary"
          >
            Back
          </Button>
          <Button 
            onClick={handleStartGame} 
            variant="primary"
            disabled={state.players.length === 0}
          >
            To Game
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PlayerSetupPage;