import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Player, GameType, GameState, GameOptions } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Define action types
type GameAction =
  | { type: 'ADD_PLAYER'; payload: { name: string } }
  | { type: 'REMOVE_PLAYER'; payload: { id: string } }
  | { type: 'START_GAME'; payload: { gameType: GameType; options?: GameOptions } }
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
  dartsThrown: 0,
  options: {
    doubleOut: true, // Default to traditional rules with double out required
    turnCount: 0
  }
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
        average: 0,
        turnCount: 0,
        checkout: undefined // Explicitly initialize to undefined
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
        average: 0,
        turnCount: 0,
        checkout: undefined // Explicitly reset checkout
      }));
      
      return {
        ...state,
        gameType: action.payload.gameType,
        players: updatedPlayers,
        currentPlayerIndex: 0,
        isGameOver: false,
        winner: null,
        round: 1,
        dartsThrown: 0,
        options: {
          ...state.options,
          ...(action.payload.options || {}),
          turnCount: 0
        }
      };
    }

    case 'RESET_GAME': {
      // Reset all players to initial state
      const updatedPlayers = state.players.map(player => ({
        ...player,
        score: player.initialScore,
        throws: [],
        history: [],
        average: 0,
        turnCount: 0,
        checkout: undefined // Explicitly reset checkout
      }));
      
      return {
        ...initialGameState,
        players: updatedPlayers,
        gameType: state.gameType,
        options: state.options
      };
    }

    case 'ADD_SCORE': {
      // If no players or game over, don't process score
      if (state.players.length === 0 || state.isGameOver) {
        return state;
      }

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
        // Calculate the new score
        const newScore = updatedPlayer.score - newThrow;
        
        // Check if this would be a bust (score < 0 or score = 1)
        // In non-double-out mode, we only check if the score goes below 0
        const isBust = state.options.doubleOut 
          ? (newScore < 0 || newScore === 1) 
          : (newScore < 0);
        
        // Check for invalid finish (if doubleOut is required but last dart is not a double)
        const isInvalidFinish = state.options.doubleOut && 
          newScore === 0 && 
          !isDouble(newThrow);
        
        if (isBust || isInvalidFinish) {
          // Bust - this throw doesn't count, move to next player
          updatedPlayer.throws = []; // Clear all throws (bust discards the entire turn)
          
          // Add to history as a busted turn
          updatedPlayer.history = [...updatedPlayer.history, [0, 0, 0]]; // Record as zeroes
          
          // Calculate average
          const totalThrows = updatedPlayer.history.flat();
          updatedPlayer.average = totalThrows.length > 0 
            ? totalThrows.reduce((sum: number, score: number) => sum + score, 0) / totalThrows.length * 3
            : 0;
          
          // Move to next player
          const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
          
          // Only increment round if we're moving from the last player to the first player
          const newRound = nextPlayerIndex === 0 ? state.round + 1 : state.round;
          
          return {
            ...state,
            players: updatedPlayers,
            currentPlayerIndex: nextPlayerIndex,
            round: newRound,
            dartsThrown: 0
          };
        }
        
        // Not a bust - update score
        updatedPlayer.score = newScore;
        
        // Check for a win
        if (newScore === 0) {
          // Record checkout
          updatedPlayer.checkout = [...updatedPlayer.throws];
          updatedPlayer.turnCount = state.options.turnCount + 1; // Include current turn
          
          // Add to history
          updatedPlayer.history = [...updatedPlayer.history, [...updatedPlayer.throws]];
          
          // Calculate average
          const totalThrows = [...updatedPlayer.history.flat()];
          updatedPlayer.average = totalThrows.length > 0 
            ? totalThrows.reduce((sum: number, score: number) => sum + score, 0) / totalThrows.length * 3
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
      
      // Update darts thrown
      const newDartsThrown = state.dartsThrown + 1;
      
      // Handle end of player's turn (3 darts thrown)
      if (newDartsThrown === 3) {
        // Save current throws to history and clear throws
        updatedPlayer.history = [...updatedPlayer.history, [...updatedPlayer.throws]];
        updatedPlayer.throws = [];
        
        // Calculate average (per dart thrown)
        const totalThrows = updatedPlayer.history.flat();
        updatedPlayer.average = totalThrows.length > 0 
          ? totalThrows.reduce((sum: number, score: number) => sum + score, 0) / totalThrows.length * 3
          : 0;
        
        // Move to next player
        const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        
        // Only increment round if we're moving from the last player to the first player
        const newRound = nextPlayerIndex === 0 ? state.round + 1 : state.round;
        const newTurnCount = nextPlayerIndex === 0 ? state.options.turnCount + 1 : state.options.turnCount;
        
        return {
          ...state,
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex,
          round: newRound,
          dartsThrown: 0,
          options: {
            ...state.options,
            turnCount: newTurnCount
          }
        };
      }
      
      // Continue same player's turn
      return {
        ...state,
        players: updatedPlayers,
        dartsThrown: newDartsThrown
      };
    }

    case 'UNDO_THROW': {
      // If no players or game over, don't process undo
      if (state.players.length === 0 || state.isGameOver) {
        return state;
      }

      // Deep copy of the state to ensure all changes are tracked
      const newState = JSON.parse(JSON.stringify(state));
      const currentPlayer = newState.players[newState.currentPlayerIndex];
      
      // If current player has throws, undo the last one
      if (currentPlayer.throws.length > 0) {
        const lastThrow = currentPlayer.throws.pop();
        
        // Update score (add back the points for 01 games)
        if (state.gameType === "501" || state.gameType === "301") {
          currentPlayer.score += lastThrow;
        }
        
        newState.dartsThrown = Math.max(0, newState.dartsThrown - 1);
        return newState;
      }
      
      // If no throws but we're at the start of a player's turn
      // Go back to the previous player's turn
      if (currentPlayer.throws.length === 0 && newState.dartsThrown === 0) {
        // Calculate previous player index
        const prevPlayerIndex = (newState.currentPlayerIndex + newState.players.length - 1) % newState.players.length;
        const prevPlayer = newState.players[prevPlayerIndex];
        
        // Check if previous player has history
        if (prevPlayer.history.length === 0) {
          return newState; // Can't go back further
        }
        
        // Get last round of throws from history
        const lastRound = prevPlayer.history.pop();
        prevPlayer.throws = lastRound;
        
        // Recalculate score for 01 games
        if (state.gameType === "501" || state.gameType === "301") {
          // Reset to initial score and subtract all throws except last round
          prevPlayer.score = prevPlayer.initialScore;
          for (const round of prevPlayer.history) {
            for (const score of round) {
              prevPlayer.score -= score;
            }
          }
        }
        
        // Update turn count if we're going back to the last player
        if (prevPlayerIndex === newState.players.length - 1 && newState.currentPlayerIndex === 0) {
          newState.options.turnCount = Math.max(0, newState.options.turnCount - 1);
          newState.round = Math.max(1, newState.round - 1);
        }
        
        newState.currentPlayerIndex = prevPlayerIndex;
        newState.dartsThrown = lastRound.length;
        return newState;
      }
      
      return newState;
    }

    case 'NEXT_PLAYER': {
      // If no players or game over, don't process next player
      if (state.players.length === 0 || state.isGameOver) {
        return state;
      }

      // Clone state and players
      const newState = JSON.parse(JSON.stringify(state));
      const updatedPlayer = newState.players[newState.currentPlayerIndex];
      
      // Add current throws to history even if less than 3
      if (updatedPlayer.throws.length > 0) {
        // Pad with zeros if needed
        const currentThrows = [...updatedPlayer.throws];
        while (currentThrows.length < 3) {
          currentThrows.push(0);
        }
        
        updatedPlayer.history.push(currentThrows);
        updatedPlayer.throws = [];
        
        // Calculate average
        const totalThrows = updatedPlayer.history.flat();
        updatedPlayer.average = totalThrows.length > 0 
          ? totalThrows.reduce((sum: number, score: number) => sum + score, 0) / totalThrows.length * 3
          : 0;
      }
      
      // Calculate next player index
      const nextPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
      
      // Only increment round and turn count if we're moving from the last player to the first player
      if (nextPlayerIndex === 0) {
        newState.options.turnCount += 1;
        newState.round += 1;
      }
      
      newState.currentPlayerIndex = nextPlayerIndex;
      newState.dartsThrown = 0;
      
      return newState;
    }

    default:
      return state;
  }
}

// Helper function to check if a score is a double
function isDouble(score: number): boolean {
  // Handle bullseye (50) as a double
  if (score === 50) return true;
  
  // Check even numbers from 2 to 40 (all possible doubles)
  return score % 2 === 0 && score >= 2 && score <= 40 && (score / 2) <= 20;
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