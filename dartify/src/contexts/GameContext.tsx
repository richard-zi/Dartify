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
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      // Clone player data
      const updatedPlayers = [...state.players];
      const updatedPlayer = { ...currentPlayer };
      updatedPlayers[state.currentPlayerIndex] = updatedPlayer;
      
      // Update throws and score
      const newThrow = action.payload.score;
      updatedPlayer.throws = [...updatedPlayer.throws, newThrow];
      
      let newDartsThrown = state.dartsThrown + 1;
      let nextPlayerIndex = state.currentPlayerIndex;
      let nextRound = state.round;
      
      // For 01 games, subtract score; for Cricket, handle differently
      if (state.gameType === "501" || state.gameType === "301") {
        // Calculate the new score
        const newScore = updatedPlayer.score - newThrow;
        
        // Check if this would be a bust (score < 0 or score = 1 or odd number in double-out mode)
        const isBust = state.options.doubleOut 
          ? (newScore < 0 || newScore === 1 || (newScore % 2 !== 0 && newScore !== 50 && newScore !== 0)) 
          : (newScore < 0);
        
        if (isBust) {
          // Bust - this throw doesn't count, move to next player
          updatedPlayer.throws.pop(); // Remove the last throw
          
          // Add current throws to history if we have any
          if (updatedPlayer.throws.length > 0) {
            updatedPlayer.history = [...updatedPlayer.history, [...updatedPlayer.throws]];
            updatedPlayer.throws = [];
          }
          
          // Calculate average
          const totalThrows = updatedPlayer.history.flat();
          updatedPlayer.average = totalThrows.length > 0 
            ? totalThrows.reduce((sum: number, score: number) => sum + score, 0) / totalThrows.length * 3
            : 0;
          
          // Move to next player
          nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
          nextRound = nextPlayerIndex === 0 ? state.round + 1 : state.round;
          newDartsThrown = 0;
          
          return {
            ...state,
            players: updatedPlayers,
            currentPlayerIndex: nextPlayerIndex,
            round: nextRound,
            dartsThrown: newDartsThrown
          };
        }
        
        // Not a bust - update score
        updatedPlayer.score = newScore;
        
        // Check for a win
        if (newScore === 0) {
          // In doubleOut mode, last dart must be a double
          if (state.options.doubleOut && !isDouble(newThrow)) {
            // If not a double, treat as a bust
            updatedPlayer.score = updatedPlayer.score + newThrow; // Restore original score
            updatedPlayer.throws.pop(); // Remove the invalid throw
            
            // If we've thrown 3 darts, move to next player
            if (newDartsThrown >= 3) {
              updatedPlayer.history = [...updatedPlayer.history, [...updatedPlayer.throws]];
              updatedPlayer.throws = [];
              
              // Move to next player
              nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
              nextRound = nextPlayerIndex === 0 ? state.round + 1 : state.round;
              newDartsThrown = 0;
              
              return {
                ...state,
                players: updatedPlayers,
                currentPlayerIndex: nextPlayerIndex,
                round: nextRound,
                dartsThrown: newDartsThrown
              };
            }
            
            return {
              ...state,
              players: updatedPlayers,
              dartsThrown: newDartsThrown
            };
          }
          
          // Valid checkout
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
            dartsThrown: newDartsThrown
          };
        }
      } else {
        // Cricket logic would go here
      }
      
      // Handle end of player's turn (3 darts thrown)
      if (newDartsThrown >= 3) {
        updatedPlayer.history = [...updatedPlayer.history, [...updatedPlayer.throws]];
        updatedPlayer.throws = [];
        
        // Calculate average (per dart thrown)
        const totalThrows = updatedPlayer.history.flat();
        updatedPlayer.average = totalThrows.length > 0 
          ? totalThrows.reduce((sum: number, score: number) => sum + score, 0) / totalThrows.length * 3
          : 0;
        
        // Move to next player
        nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        nextRound = nextPlayerIndex === 0 ? state.round + 1 : state.round;
        newDartsThrown = 0;
        
        return {
          ...state,
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex,
          round: nextRound,
          dartsThrown: newDartsThrown,
          options: {
            ...state.options,
            turnCount: nextPlayerIndex === 0 ? state.options.turnCount + 1 : state.options.turnCount
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
        if (prevPlayerIndex === newState.players.length - 1) {
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
      // Clone state and players
      const newState = JSON.parse(JSON.stringify(state));
      const updatedPlayer = newState.players[newState.currentPlayerIndex];
      
      // Add current throws to history even if less than 3
      if (updatedPlayer.throws.length > 0) {
        // Pad with zeros if needed
        while (updatedPlayer.throws.length < 3) {
          updatedPlayer.throws.push(0);
        }
        
        updatedPlayer.history.push([...updatedPlayer.throws]);
        updatedPlayer.throws = [];
        
        // Calculate average
        const totalThrows = updatedPlayer.history.flat();
        updatedPlayer.average = totalThrows.length > 0 
          ? totalThrows.reduce((sum: number, score: number) => sum + score, 0) / totalThrows.length * 3
          : 0;
      }
      
      // Calculate next player index and update turn count if needed
      const nextPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
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