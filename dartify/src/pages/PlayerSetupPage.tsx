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
        <h1 className="text-3xl font-bold mb-6">Spieler einrichten</h1>
        
        {/* Add player form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">Neuer Spieler</h2>
          
          <form onSubmit={handleAddPlayer} className="flex gap-3">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Spielername eingeben"
              className="border rounded px-3 py-2 flex-grow"
              maxLength={20}
            />
            <Button type="submit" variant="primary">
              Hinzufügen
            </Button>
          </form>
        </div>
        
        {/* Player list */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-medium mb-4">Spielerliste</h2>
          
          {state.players.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Keine Spieler vorhanden. Füge oben Spieler hinzu.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {state.players.map((player, index) => (
                <li key={player.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <Button 
                    onClick={() => handleRemovePlayer(player.id)} 
                    variant="danger"
                    size="sm"
                  >
                    Entfernen
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
            Zurück
          </Button>
          <Button 
            onClick={handleStartGame} 
            variant="primary"
            disabled={state.players.length === 0}
          >
            Zum Spiel
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PlayerSetupPage;