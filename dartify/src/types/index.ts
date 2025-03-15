export type Player = {
  id: string;
  name: string;
  score: number;
  initialScore: number;
  throws: number[];
  history: number[][];
  average: number;
  checkout?: number[];
  turnCount: number; // Add turnCount to track how many turns were taken for checkout
};

export type GameType = "501" | "301" | "Cricket";

export type GameOptions = {
  doubleOut: boolean; // Whether double checkout is required
  turnCount: number; // Global turn counter
};

export type GameState = {
  players: Player[];
  currentPlayerIndex: number;
  gameType: GameType;
  isGameOver: boolean;
  winner: Player | null;
  round: number;
  dartsThrown: number;
  options: GameOptions;
};

export type CameraState = {
  isActive: boolean;
  isDetecting: boolean;
  lastDetectedScore: number | null;
};