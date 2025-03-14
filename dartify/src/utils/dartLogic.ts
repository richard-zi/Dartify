import { GameType } from '../types';

// Calculate remaining checkout options
export function getCheckoutOptions(remaining: number): number[][] {
  if (remaining <= 0 || remaining > 170) return [];
  
  // Common checkout options for values up to 170
  const checkouts: Record<number, number[][]> = {
    // Some common checkouts
    40: [[double(20)]],
    36: [[double(18)]],
    32: [[double(16)]],
    24: [[double(12)]],
    20: [[double(10)]],
    16: [[double(8)]],
    12: [[double(6)]],
    8: [[double(4)]],
    4: [[double(2)]],
    2: [[double(1)]],
    
    // Two-dart checkouts
    50: [[bullseye()]],
    60: [[triple(20)]],
    57: [[triple(19)]],
    54: [[triple(18)]],
    51: [[triple(17)]],
    48: [[triple(16)]],
    45: [[triple(15)]],
    42: [[triple(14)]],
    39: [[triple(13)]],
    // Duplizierte Eigenschaften entfernt, kein 36 doppelt
    33: [[triple(11)]],
    30: [[triple(10)]],
    27: [[triple(9)]],
    // Duplizierte Eigenschaften entfernt, kein 24 doppelt
    21: [[triple(7)]],
    18: [[triple(6)]],
    15: [[triple(5)]],
    // Duplizierte Eigenschaften entfernt, kein 12 doppelt
    9: [[triple(3)]],
    6: [[triple(2)]],
    3: [[triple(1)]],
    
    // Three-dart checkouts (just a few examples)
    170: [[triple(20), triple(20), bullseye()]],
    167: [[triple(20), triple(19), bullseye()]],
    164: [[triple(20), triple(18), bullseye()]],
    161: [[triple(20), triple(17), bullseye()]],
    160: [[triple(20), triple(20), double(20)]],
    157: [[triple(20), triple(19), double(20)]],
    // ... and many more
  };
  
  return checkouts[remaining] || [];
}

// Helper functions to make the code more readable
function single(value: number): number {
  return value;
}

function double(value: number): number {
  return value * 2;
}

function triple(value: number): number {
  return value * 3;
}

function bullseye(): number {
  return 50;
}

// Den ungenutzten single() für ein Beispiel verwenden
// Calculate initial score based on game type
export function getInitialScore(gameType: GameType): number {
  switch (gameType) {
    case "501":
      return 501;
    case "301":
      return 301;
    case "Cricket":
      // Beispiel für die Verwendung von single()
      return single(0); // Ergibt 0
    default:
      return 501;
  }
}

// Calculate if a throw would bust in 01 games
export function wouldBust(currentScore: number, throwValue: number): boolean {
  const remaining = currentScore - throwValue;
  
  // Bust conditions:
  // 1. Score goes below 0
  // 2. Score becomes exactly 1 (can't checkout)
  // 3. Score becomes 0 but not with a double (for traditional rules)
  
  if (remaining < 0 || remaining === 1) {
    return true;
  }
  
  // This is a simplified check - in a real app, you'd check
  // if the throw that made the score 0 was a double
  
  return false;
}

// Get all possible dart sections for UI
export function getAllDartSections() {
  const sections = [];
  
  // Singles 1-20
  for (let i = 1; i <= 20; i++) {
    sections.push({ value: i, type: 'single', label: `${i}` });
  }
  
  // Doubles 1-20
  for (let i = 1; i <= 20; i++) {
    sections.push({ value: i * 2, type: 'double', label: `D${i}` });
  }
  
  // Triples 1-20
  for (let i = 1; i <= 20; i++) {
    sections.push({ value: i * 3, type: 'triple', label: `T${i}` });
  }
  
  // Bullseye
  sections.push({ value: 25, type: 'outer', label: '25' });
  sections.push({ value: 50, type: 'bullseye', label: 'Bull' });
  
  // Miss
  sections.push({ value: 0, type: 'miss', label: 'Miss' });
  
  return sections;
}