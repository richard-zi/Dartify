import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Player, GameType, GameState } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Define action types
type GameAction =
  | { type: 'ADD_PLAYER'; payload: { name: string } }
  | { type: 'REMOVE_PLAYER'; payload: { id: string } }
  | { type: 'START_GAME'; payload: { gameType: GameType } }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_SCORE'; payload: { score: number } }
  | { type: 'UNDO_THROW' }
  | { type: 'NEXT_PLAYER' };

// Initial game state
const initialGameState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  gameType: "501",
  isGameOver: false,
  winner: null,
  round: 1,
  dartsThrown: 0
};

// Create the context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | undefined>(undefined);

// Game reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const initialScore = state.gameType === "501" ? 501 : state.gameType === "301" ? 301 : 0;
      const newPlayer: Player = {
        id: uuidv4(),
        name: action.payload.name,
        score: initialScore,
        initialScore,
        throws: [],
        history: [],
        average: 0
      };
      return {
        ...state,
        players: [...state.players, newPlayer]
      };
    }

    case 'REMOVE_PLAYER': {
      return {
        ...state,
        players: state.players.filter(player => player.id !== action.payload.id)
      };
    }

    case 'START_GAME': {
      // Initialize player scores based on game type
      const initialScore = action.payload.gameType === "501" ? 501 : action.payload.gameType === "301" ? 301 : 0;
      const updatedPlayers = state.players.map(player => ({
        ...player,
        score: initialScore,
        initialScore,
        throws: [],
        history: [],
        average: 0
      }));
      
      return {
        ...state,
        gameType: action.payload.gameType,
        players: updatedPlayers,
        currentPlayerIndex: 0,
        isGameOver: false,
        winner: null,
        round: 1,
        dartsThrown: 0
      };
    }

    case 'RESET_GAME': {
      return {
        ...initialGameState,
        players: state.players.map(player => ({
          ...player,
          score: player.initialScore,
          throws: [],
          history: [],
          average: 0
        })),
        gameType: state.gameType
      };
    }

    case 'ADD_SCORE': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      // Clone player data
      const updatedPlayers = [...state.players];
      const updatedPlayer = { ...currentPlayer };
      updatedPlayers[state.currentPlayerIndex] = updatedPlayer;
      
      // Update throws and score
      const newThrow = action.payload.score;
      updatedPlayer.throws = [...updatedPlayer.throws, newThrow];
      
      // For 01 games, subtract score; for Cricket, handle differently
      if (state.gameType === "501" || state.gameType === "301") {
        // Check if this would be a bust (score < 0 or score = 1)
        const newScore = updatedPlayer.score - newThrow;
        
        if (newScore < 0 || newScore === 1) {
          // Bust - this throw doesn't count, move to next player
          updatedPlayer.throws.pop(); // Remove the last throw
          
          // Add empty throw to history
          if (updatedPlayer.throws.length === 3) {
            updatedPlayer.history = [...updatedPlayer.history, [...updatedPlayer.throws]];
            updatedPlayer.throws = [];
          }
          
          // Calculate average
          const totalThrows = updatedPlayer.history.flat();
          updatedPlayer.average = totalThrows.length > 0 
            ? totalThrows.reduce((sum, score) => sum + score, 0) / totalThrows.length 
            : 0;
          
          return {
            ...state,
            players: updatedPlayers,
            currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
            round: state.currentPlayerIndex === state.players.length - 1 ? state.round + 1 : state.round,
            dartsThrown: 0
          };
        }
        
        // Not a bust - update score
        updatedPlayer.score = newScore;
        
        // Check for a win
        if (newScore === 0) {
          // Record checkout
          updatedPlayer.checkout = [...updatedPlayer.throws];
          
          // Add to history
          updatedPlayer.history = [...updatedPlayer.history, [...updatedPlayer.throws]];
          
          // Calculate average
          const totalThrows = [...updatedPlayer.history.flat()];
          updatedPlayer.average = totalThrows.length > 0 
            ? totalThrows.reduce((sum, score) => sum + score, 0) / totalThrows.length 
            : 0;
          
          return {
            ...state,
            players: updatedPlayers,
            isGameOver: true,
            winner: updatedPlayer,
            dartsThrown: state.dartsThrown + 1
          };
        }
      } else {
        // Cricket logic would go here
      }
      
      // Handle end of player's turn (3 darts thrown)
      if (updatedPlayer.throws.length === 3) {
        updatedPlayer.history = [...updatedPlayer.history, [...updatedPlayer.throws]];
        updatedPlayer.throws = [];
        
        // Calculate average
        const totalThrows = updatedPlayer.history.flat();
        updatedPlayer.average = totalThrows.length > 0 
          ? totalThrows.reduce((sum, score) => sum + score, 0) / totalThrows.length 
          : 0;
        
        return {
          ...state,
          players: updatedPlayers,
          currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
          round: state.currentPlayerIndex === state.players.length - 1 ? state.round + 1 : state.round,
          dartsThrown: 0
        };
      }
      
      // Continue same player's turn
      return {
        ...state,
        players: updatedPlayers,
        dartsThrown: state.dartsThrown + 1
      };
    }

    case 'UNDO_THROW': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      // Nothing to undo if no throws yet
      if (currentPlayer.throws.length === 0) {
        // If at the start of a new round, go back to the previous player's last throw
        if (state.dartsThrown === 0 && (state.currentPlayerIndex > 0 || state.round > 1)) {
          const prevPlayerIndex = state.currentPlayerIndex === 0 
            ? state.players.length - 1 
            : state.currentPlayerIndex - 1;
          const prevPlayer = { ...state.players[prevPlayerIndex] };
          
          // If the previous player has no history, can't undo
          if (prevPlayer.history.length === 0) return state;
          
          // Get the last round of throws from history
          const lastRound = prevPlayer.history[prevPlayer.history.length - 1];
          prevPlayer.throws = [...lastRound];
          prevPlayer.history = prevPlayer.history.slice(0, -1);
          
          // Recalculate score
          if (state.gameType === "501" || state.gameType === "301") {
            prevPlayer.score = prevPlayer.initialScore - prevPlayer.history.flat().reduce((sum, score) => sum + score, 0);
          }
          
          // Update players array
          const updatedPlayers = [...state.players];
          updatedPlayers[prevPlayerIndex] = prevPlayer;
          
          return {
            ...state,
            players: updatedPlayers,
            currentPlayerIndex: prevPlayerIndex,
            round: prevPlayerIndex === state.players.length - 1 ? state.round - 1 : state.round,
            dartsThrown: 3
          };
        }
        
        return state;
      }
      
      // Clone player data
      const updatedPlayers = [...state.players];
      const updatedPlayer = { ...currentPlayer };
      updatedPlayers[state.currentPlayerIndex] = updatedPlayer;
      
      // Remove the last throw
      const removedScore = updatedPlayer.throws.pop();
      
      // Recalculate score for 01 games
      if (state.gameType === "501" || state.gameType === "301") {
        updatedPlayer.score = updatedPlayer.score + (removedScore || 0);
      }
      
      return {
        ...state,
        players: updatedPlayers,
        dartsThrown: state.dartsThrown - 1
      };
    }

    case 'NEXT_PLAYER': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      // Clone player data
      const updatedPlayers = [...state.players];
      const updatedPlayer = { ...currentPlayer };
      updatedPlayers[state.currentPlayerIndex] = updatedPlayer;
      
      // Add current throws to history even if less than 3
      if (updatedPlayer.throws.length > 0) {
        // Pad with zeros if needed
        while (updatedPlayer.throws.length < 3) {
          updatedPlayer.throws.push(0);
        }
        
        updatedPlayer.history = [...updatedPlayer.history, [...updatedPlayer.throws]];
        updatedPlayer.throws = [];
        
        // Calculate average
        const totalThrows = updatedPlayer.history.flat();
        updatedPlayer.average = totalThrows.length > 0 
          ? totalThrows.reduce((sum, score) => sum + score, 0) / totalThrows.length 
          : 0;
      }
      
      return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
        round: state.currentPlayerIndex === state.players.length - 1 ? state.round + 1 : state.round,
        dartsThrown: 0
      };
    }

    default:
      return state;
  }
}

// Context provider
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
};