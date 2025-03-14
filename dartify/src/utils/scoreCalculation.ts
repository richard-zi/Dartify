import { Player } from '../types';

// Calculate player statistics
export function calculatePlayerStats(player: Player): {
  average: number;
  highestThrow: number;
  checkoutPercentage: number;
  dartsPerLeg: number;
} {
  // Flatten all throws
  const allThrows = player.history.flat();
  
  // Calculate average
  const average = allThrows.length > 0 
    ? allThrows.reduce((sum, score) => sum + score, 0) / allThrows.length * 3
    : 0;
  
  // Find highest throw
  const highestThrow = allThrows.length > 0 
    ? Math.max(...allThrows) 
    : 0;
  
  // Checkout percentage - assuming checkout attempts are tracked (not implemented here)
  const checkoutPercentage = 0;
  
  // Darts per leg
  const dartsPerLeg = player.history.length > 0 
    ? player.history.flat().length 
    : 0;
  
  return {
    average,
    highestThrow,
    checkoutPercentage,
    dartsPerLeg
  };
}

// Calculate points left for a checkout
export function getRequiredCheckout(score: number): string {
  // Common checkout combinations
  const checkouts: Record<number, string> = {
    170: "T20 T20 Bull",
    167: "T20 T19 Bull",
    164: "T20 T18 Bull",
    161: "T20 T17 Bull",
    160: "T20 T20 D20",
    // ... many more combinations
    40: "D20",
    36: "D18",
    32: "D16",
    // ... and so on
  };
  
  return checkouts[score] || "No standard checkout";
}

// For camera-based detection, this would analyze the dart position
// This is a placeholder that would be replaced with actual ML model integration
export function detectDartPosition(/* Parameter verwendet */ imageData: ArrayBuffer | HTMLImageElement): { 
  section: number; 
  multiplier: number;
  score: number;
  confidence: number;
} {
  // Dies ist eine Simulation - in der Realität würde dies das ML-Modell verwenden
  // um die Dart-Position auf dem Board zu erkennen
  console.log("Bild wird analysiert:", imageData instanceof ArrayBuffer ? "ArrayBuffer" : "HTMLImageElement");
  
  // Random section between 1-20
  const section = Math.floor(Math.random() * 20) + 1;
  
  // Random multiplier (1, 2, or 3)
  const multipliers = [1, 1, 1, 1, 2, 2, 3]; // More likely to hit single
  const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
  
  return {
    section,
    multiplier,
    score: section * multiplier,
    confidence: Math.random() * 0.5 + 0.5 // Random confidence between 0.5 and 1.0
  };
}

// Calculate finishing doubles for a score
export function getPossibleFinishes(score: number): string[] {
  if (score > 170) return ["No checkout possible"];
  if (score <= 1) return ["No checkout possible"];
  
  // This is a simplified version - a complete implementation would have
  // all possible checkout combinations
  
  const finishes: string[] = [];
  
  // Check if it's a direct double
  if (score <= 40 && score % 2 === 0) {
    finishes.push(`D${score / 2}`);
  }
  
  // Add some common 2-dart finishes
  if (score === 50) {
    finishes.push("Bull");
  }
  
  // Add common 3-dart finishes
  // (This would be much more comprehensive in a real app)
  
  return finishes.length > 0 ? finishes : ["Custom checkout needed"];
}