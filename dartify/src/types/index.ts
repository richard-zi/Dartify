export type Player = {
    id: string;
    name: string;
    score: number;
    initialScore: number;
    throws: number[];
    history: number[][];
    average: number;
    checkout?: number[];
  };
  
  export type GameType = "501" | "301" | "Cricket";
  
  export type GameState = {
    players: Player[];
    currentPlayerIndex: number;
    gameType: GameType;
    isGameOver: boolean;
    winner: Player | null;
    round: number;
    dartsThrown: number;
  };
  
  export type CameraState = {
    isActive: boolean;
    isDetecting: boolean;
    lastDetectedScore: number | null;
  };