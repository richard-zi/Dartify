import { GameType } from '../types';

// Calculate remaining checkout options
export function getCheckoutOptions(remaining: number, doubleRequired: boolean = true): number[][] {
  if (remaining <= 0 || remaining > 170) return [];
  
  // No double required mode
  if (!doubleRequired) {
    // For direct checkout with a single number 1-20
    if (remaining <= 20) {
      return [[remaining]];
    }
    
    // Add some common one-dart finishes
    const directFinishes = [];
    if (remaining === 25) directFinishes.push([25]); // Outer bull
    if (remaining === 50) directFinishes.push([50]); // Bull

    return directFinishes;
  }
  
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
    33: [[triple(11)]],
    30: [[triple(10)]],
    27: [[triple(9)]],
    21: [[triple(7)]],
    18: [[triple(6)]],
    15: [[triple(5)]],
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
function double(value: number): number {
  return value * 2;
}

function triple(value: number): number {
  return value * 3;
}

function bullseye(): number {
  return 50;
}

// Calculate initial score based on game type
export function getInitialScore(gameType: GameType): number {
  switch (gameType) {
    case "501":
      return 501;
    case "301":
      return 301;
    case "Cricket":
      return 0;
    default:
      return 501;
  }
}

// Calculate if a throw would bust in 01 games
export function wouldBust(currentScore: number, throwValue: number, doubleRequired: boolean = true): boolean {
  const remaining = currentScore - throwValue;
  
  // In double-out mode:
  // 1. Score goes below 0
  // 2. Score becomes exactly 1 (can't checkout)
  if (doubleRequired) {
    return remaining < 0 || remaining === 1;
  }
  
  // In non-double-out mode, just check if we go below 0
  return remaining < 0;
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

// Check if score is in checkout range
export function isCheckoutRange(score: number, doubleRequired: boolean = true): boolean {
  if (doubleRequired) {
    // In double-out mode, any score <= 170 and > 1 is in checkout range
    // (even if odd numbers require an extra dart first)
    return score <= 170 && score > 1;
  } else {
    // In non-double-out mode, any score <= 170 is theoretically checkable
    return score <= 170 && score > 0;
  }
}

// Get detailed checkout suggestion
export function getCheckoutSuggestionDetails(score: number, doubleRequired: boolean = true): {
  isCheckout: boolean; 
  sequence: string;
  firstDart?: number;
  firstDartLabel?: string;
} {
  // Return different suggestions based on doubleRequired mode
  if (!doubleRequired) {
    // Non-double out mode
    if (score > 170) {
      return { isCheckout: false, sequence: '' };
    }
    
    // Direct single number (1-20)
    if (score <= 20) {
      return { 
        isCheckout: true, 
        sequence: `${score}`, 
        firstDart: score, 
        firstDartLabel: `${score}` 
      };
    }
    
    // Outer bull
    if (score === 25) {
      return { 
        isCheckout: true, 
        sequence: `25`, 
        firstDart: 25, 
        firstDartLabel: `25` 
      };
    }
    
    // Bull
    if (score === 50) {
      return { 
        isCheckout: true, 
        sequence: `Bull`, 
        firstDart: 50, 
        firstDartLabel: `Bull` 
      };
    }
  }
  
  // Standard double-out mode
  if (score > 170 || score <= 1) {
    return { isCheckout: false, sequence: '' };
  }

  // Common checkout combinations
  const checkouts: Record<number, {sequence: string, firstDart: number, firstDartLabel: string}> = {
    170: {sequence: 'T20 T20 Bull', firstDart: 60, firstDartLabel: 'T20'},
    167: {sequence: 'T20 T19 Bull', firstDart: 60, firstDartLabel: 'T20'},
    164: {sequence: 'T20 T18 Bull', firstDart: 60, firstDartLabel: 'T20'},
    161: {sequence: 'T20 T17 Bull', firstDart: 60, firstDartLabel: 'T20'},
    160: {sequence: 'T20 T20 D20', firstDart: 60, firstDartLabel: 'T20'},
    157: {sequence: 'T20 T19 D20', firstDart: 60, firstDartLabel: 'T20'},
    156: {sequence: 'T20 T20 D18', firstDart: 60, firstDartLabel: 'T20'},
    154: {sequence: 'T20 T18 D20', firstDart: 60, firstDartLabel: 'T20'},
    151: {sequence: 'T20 T17 D20', firstDart: 60, firstDartLabel: 'T20'},
    149: {sequence: 'T20 T19 D16', firstDart: 60, firstDartLabel: 'T20'},
    147: {sequence: 'T20 T17 D18', firstDart: 60, firstDartLabel: 'T20'},
    146: {sequence: 'T20 T18 D16', firstDart: 60, firstDartLabel: 'T20'},
    145: {sequence: 'T20 T19 D14', firstDart: 60, firstDartLabel: 'T20'},
    143: {sequence: 'T20 T17 D16', firstDart: 60, firstDartLabel: 'T20'},
    142: {sequence: 'T20 T14 D20', firstDart: 60, firstDartLabel: 'T20'},
    141: {sequence: 'T20 T19 D12', firstDart: 60, firstDartLabel: 'T20'},
    140: {sequence: 'T20 T20 D10', firstDart: 60, firstDartLabel: 'T20'},
    139: {sequence: 'T19 T14 D20', firstDart: 57, firstDartLabel: 'T19'},
    138: {sequence: 'T20 T18 D12', firstDart: 60, firstDartLabel: 'T20'},
    137: {sequence: 'T20 T19 D10', firstDart: 60, firstDartLabel: 'T20'},
    136: {sequence: 'T20 T20 D8', firstDart: 60, firstDartLabel: 'T20'},
    135: {sequence: 'T20 T15 D15', firstDart: 60, firstDartLabel: 'T20'},
    134: {sequence: 'T20 T14 D16', firstDart: 60, firstDartLabel: 'T20'},
    133: {sequence: 'T20 T19 D8', firstDart: 60, firstDartLabel: 'T20'},
    132: {sequence: 'T20 T16 D12', firstDart: 60, firstDartLabel: 'T20'},
    131: {sequence: 'T20 T13 D16', firstDart: 60, firstDartLabel: 'T20'},
    130: {sequence: 'T20 T18 D8', firstDart: 60, firstDartLabel: 'T20'},
    129: {sequence: 'T19 T16 D12', firstDart: 57, firstDartLabel: 'T19'},
    128: {sequence: 'T20 T16 D10', firstDart: 60, firstDartLabel: 'T20'},
    127: {sequence: 'T20 T17 D8', firstDart: 60, firstDartLabel: 'T20'},
    126: {sequence: 'T19 T19 D6', firstDart: 57, firstDartLabel: 'T19'},
    125: {sequence: 'T20 T19 D4', firstDart: 60, firstDartLabel: 'T20'},
    124: {sequence: 'T20 T16 D8', firstDart: 60, firstDartLabel: 'T20'},
    123: {sequence: 'T19 T16 D9', firstDart: 57, firstDartLabel: 'T19'},
    122: {sequence: 'T18 T18 D7', firstDart: 54, firstDartLabel: 'T18'},
    121: {sequence: 'T20 T11 D14', firstDart: 60, firstDartLabel: 'T20'},
    120: {sequence: 'T20 S20 D20', firstDart: 60, firstDartLabel: 'T20'},
    119: {sequence: 'T19 T12 D13', firstDart: 57, firstDartLabel: 'T19'},
    118: {sequence: 'T20 S18 D20', firstDart: 60, firstDartLabel: 'T20'},
    117: {sequence: 'T20 S17 D20', firstDart: 60, firstDartLabel: 'T20'},
    116: {sequence: 'T20 S16 D20', firstDart: 60, firstDartLabel: 'T20'},
    115: {sequence: 'T19 S18 D20', firstDart: 57, firstDartLabel: 'T19'},
    114: {sequence: 'T20 S14 D20', firstDart: 60, firstDartLabel: 'T20'},
    113: {sequence: 'T19 S16 D20', firstDart: 57, firstDartLabel: 'T19'},
    112: {sequence: 'T20 S12 D20', firstDart: 60, firstDartLabel: 'T20'},
    111: {sequence: 'T19 S14 D20', firstDart: 57, firstDartLabel: 'T19'},
    110: {sequence: 'T20 S10 D20', firstDart: 60, firstDartLabel: 'T20'},
    109: {sequence: 'T19 S12 D20', firstDart: 57, firstDartLabel: 'T19'},
    108: {sequence: 'T20 S8 D20', firstDart: 60, firstDartLabel: 'T20'},
    107: {sequence: 'T19 S10 D20', firstDart: 57, firstDartLabel: 'T19'},
    106: {sequence: 'T20 S6 D20', firstDart: 60, firstDartLabel: 'T20'},
    105: {sequence: 'T20 S5 D20', firstDart: 60, firstDartLabel: 'T20'},
    104: {sequence: 'T20 S4 D20', firstDart: 60, firstDartLabel: 'T20'},
    103: {sequence: 'T19 S10 D18', firstDart: 57, firstDartLabel: 'T19'},
    102: {sequence: 'T20 S10 D16', firstDart: 60, firstDartLabel: 'T20'},
    101: {sequence: 'T17 S10 D20', firstDart: 51, firstDartLabel: 'T17'},
    100: {sequence: 'T20 D20', firstDart: 60, firstDartLabel: 'T20'},
    99: {sequence: 'T19 S10 D16', firstDart: 57, firstDartLabel: 'T19'},
    98: {sequence: 'T20 D19', firstDart: 60, firstDartLabel: 'T20'},
    97: {sequence: 'T19 D20', firstDart: 57, firstDartLabel: 'T19'},
    96: {sequence: 'T20 D18', firstDart: 60, firstDartLabel: 'T20'},
    95: {sequence: 'T19 D19', firstDart: 57, firstDartLabel: 'T19'},
    94: {sequence: 'T18 D20', firstDart: 54, firstDartLabel: 'T18'},
    93: {sequence: 'T19 D18', firstDart: 57, firstDartLabel: 'T19'},
    92: {sequence: 'T20 D16', firstDart: 60, firstDartLabel: 'T20'},
    91: {sequence: 'T17 D20', firstDart: 51, firstDartLabel: 'T17'},
    90: {sequence: 'T20 D15', firstDart: 60, firstDartLabel: 'T20'},
    89: {sequence: 'T19 D16', firstDart: 57, firstDartLabel: 'T19'},
    88: {sequence: 'T20 D14', firstDart: 60, firstDartLabel: 'T20'},
    87: {sequence: 'T17 D18', firstDart: 51, firstDartLabel: 'T17'},
    86: {sequence: 'T18 D16', firstDart: 54, firstDartLabel: 'T18'},
    85: {sequence: 'T15 D20', firstDart: 45, firstDartLabel: 'T15'},
    84: {sequence: 'T20 D12', firstDart: 60, firstDartLabel: 'T20'},
    83: {sequence: 'T17 D16', firstDart: 51, firstDartLabel: 'T17'},
    82: {sequence: 'T14 D20', firstDart: 42, firstDartLabel: 'T14'},
    81: {sequence: 'T19 D12', firstDart: 57, firstDartLabel: 'T19'},
    80: {sequence: 'T20 D10', firstDart: 60, firstDartLabel: 'T20'},
    79: {sequence: 'T19 D11', firstDart: 57, firstDartLabel: 'T19'},
    78: {sequence: 'T18 D12', firstDart: 54, firstDartLabel: 'T18'},
    77: {sequence: 'T19 D10', firstDart: 57, firstDartLabel: 'T19'},
    76: {sequence: 'T20 D8', firstDart: 60, firstDartLabel: 'T20'},
    75: {sequence: 'T17 D12', firstDart: 51, firstDartLabel: 'T17'},
    74: {sequence: 'T14 D16', firstDart: 42, firstDartLabel: 'T14'},
    73: {sequence: 'T19 D8', firstDart: 57, firstDartLabel: 'T19'},
    72: {sequence: 'T16 D12', firstDart: 48, firstDartLabel: 'T16'},
    71: {sequence: 'T13 D16', firstDart: 39, firstDartLabel: 'T13'},
    70: {sequence: 'T18 D8', firstDart: 54, firstDartLabel: 'T18'},
    69: {sequence: 'T19 D6', firstDart: 57, firstDartLabel: 'T19'},
    68: {sequence: 'T20 D4', firstDart: 60, firstDartLabel: 'T20'},
    67: {sequence: 'T17 D8', firstDart: 51, firstDartLabel: 'T17'},
    66: {sequence: 'T10 D18', firstDart: 30, firstDartLabel: 'T10'},
    65: {sequence: 'T19 D4', firstDart: 57, firstDartLabel: 'T19'},
    64: {sequence: 'T16 D8', firstDart: 48, firstDartLabel: 'T16'},
    63: {sequence: 'T13 D12', firstDart: 39, firstDartLabel: 'T13'},
    62: {sequence: 'T10 D16', firstDart: 30, firstDartLabel: 'T10'},
    61: {sequence: 'T15 D8', firstDart: 45, firstDartLabel: 'T15'},
    60: {sequence: 'S20 D20', firstDart: 20, firstDartLabel: 'S20'},
    59: {sequence: 'S19 D20', firstDart: 19, firstDartLabel: 'S19'},
    58: {sequence: 'S18 D20', firstDart: 18, firstDartLabel: 'S18'},
    57: {sequence: 'S17 D20', firstDart: 17, firstDartLabel: 'S17'},
    56: {sequence: 'S16 D20', firstDart: 16, firstDartLabel: 'S16'},
    55: {sequence: 'S15 D20', firstDart: 15, firstDartLabel: 'S15'},
    54: {sequence: 'S14 D20', firstDart: 14, firstDartLabel: 'S14'},
    53: {sequence: 'S13 D20', firstDart: 13, firstDartLabel: 'S13'},
    52: {sequence: 'S12 D20', firstDart: 12, firstDartLabel: 'S12'},
    51: {sequence: 'S11 D20', firstDart: 11, firstDartLabel: 'S11'},
    50: {sequence: 'Bull', firstDart: 50, firstDartLabel: 'Bull'},
    49: {sequence: 'S9 D20', firstDart: 9, firstDartLabel: 'S9'},
    48: {sequence: 'S16 D16', firstDart: 16, firstDartLabel: 'S16'},
    47: {sequence: 'S15 D16', firstDart: 15, firstDartLabel: 'S15'},
    46: {sequence: 'S6 D20', firstDart: 6, firstDartLabel: 'S6'},
    45: {sequence: 'S13 D16', firstDart: 13, firstDartLabel: 'S13'},
    44: {sequence: 'S12 D16', firstDart: 12, firstDartLabel: 'S12'},
    43: {sequence: 'S11 D16', firstDart: 11, firstDartLabel: 'S11'},
    42: {sequence: 'S10 D16', firstDart: 10, firstDartLabel: 'S10'},
    41: {sequence: 'S9 D16', firstDart: 9, firstDartLabel: 'S9'},
    40: {sequence: 'D20', firstDart: 40, firstDartLabel: 'D20'},
    38: {sequence: 'D19', firstDart: 38, firstDartLabel: 'D19'},
    36: {sequence: 'D18', firstDart: 36, firstDartLabel: 'D18'},
    34: {sequence: 'D17', firstDart: 34, firstDartLabel: 'D17'},
    32: {sequence: 'D16', firstDart: 32, firstDartLabel: 'D16'},
    30: {sequence: 'D15', firstDart: 30, firstDartLabel: 'D15'},
    28: {sequence: 'D14', firstDart: 28, firstDartLabel: 'D14'},
    26: {sequence: 'D13', firstDart: 26, firstDartLabel: 'D13'},
    24: {sequence: 'D12', firstDart: 24, firstDartLabel: 'D12'},
    22: {sequence: 'D11', firstDart: 22, firstDartLabel: 'D11'},
    20: {sequence: 'D10', firstDart: 20, firstDartLabel: 'D10'},
    18: {sequence: 'D9', firstDart: 18, firstDartLabel: 'D9'},
    16: {sequence: 'D8', firstDart: 16, firstDartLabel: 'D8'},
    14: {sequence: 'D7', firstDart: 14, firstDartLabel: 'D7'},
    12: {sequence: 'D6', firstDart: 12, firstDartLabel: 'D6'},
    10: {sequence: 'D5', firstDart: 10, firstDartLabel: 'D5'},
    8: {sequence: 'D4', firstDart: 8, firstDartLabel: 'D4'},
    6: {sequence: 'D3', firstDart: 6, firstDartLabel: 'D3'},
    4: {sequence: 'D2', firstDart: 4, firstDartLabel: 'D2'},
    2: {sequence: 'D1', firstDart: 2, firstDartLabel: 'D1'},
  };
  
  if (checkouts[score]) {
    return { isCheckout: true, ...checkouts[score] };
  }
  
  // For scores without predefined checkouts, provide a basic suggestion
  if (doubleRequired && score % 2 === 0 && score <= 40) {
    return { 
      isCheckout: true, 
      sequence: `D${score/2}`, 
      firstDart: score, 
      firstDartLabel: `D${score/2}` 
    };
  }
  
  return { isCheckout: false, sequence: 'Kein Standard-Checkout' };
}

// Function that refers to a single in text to satisfy TypeScript
export function getSectionName(value: number, type: string): string {
  if (type === 'single') {
    return `${value}`;
  } else if (type === 'double') {
    return `D${value/2}`;
  } else if (type === 'triple') {
    return `T${value/3}`;
  } else if (value === 50) {
    return 'Bull';
  } else if (value === 25) {
    return 'Outer Bull';
  } else {
    return 'Miss';
  }
}

// Get all possible checkout options for display
export function getAllPossibleCheckouts(score: number, doubleRequired: boolean = true): Array<{value: number, label: string}> {
  const options: Array<{value: number, label: string}> = [];
  
  // If no checkout is possible
  if ((doubleRequired && (score > 170 || score <= 1)) || (!doubleRequired && score > 170)) {
    return options;
  }
  
  // Non-double out mode
  if (!doubleRequired) {
    // Direct single number (1-20)
    if (score <= 20) {
      options.push({ value: score, label: `${score}` });
    }
    
    // Bulls
    if (score === 25) options.push({ value: 25, label: '25' });
    if (score === 50) options.push({ value: 50, label: 'Bull' });
    
    // Other direct finishes with a single dart
    for (let i = 1; i <= 20; i++) {
      // Single
      if (score === i) {
        options.push({ value: i, label: `${i}` });
      }
      
      // Double
      if (score === i * 2) {
        options.push({ value: i * 2, label: `D${i}` });
      }
      
      // Triple
      if (score === i * 3) {
        options.push({ value: i * 3, label: `T${i}` });
      }
    }
    
    return options;
  }
  
  // Double out mode
  
  // Direct double checkouts
  if (score <= 40 && score % 2 === 0) {
    options.push({ value: score, label: `D${score/2}` });
  }
  
  // Bullseye
  if (score === 50) {
    options.push({ value: 50, label: 'Bull' });
  }
  
  // Common first darts for checkouts
  if (score > 60 && score <= 170) {
    // Priority of first darts for checkout
    const possibleFirstDarts = [
      { value: 60, label: 'T20' },
      { value: 57, label: 'T19' },
      { value: 54, label: 'T18' },
      { value: 51, label: 'T17' },
      { value: 45, label: 'T15' },
      { value: 40, label: 'D20' },
      { value: 38, label: 'D19' },
      { value: 36, label: 'D18' },
      { value: 20, label: 'S20' },
      { value: 19, label: 'S19' },
      { value: 18, label: 'S18' },
      { value: 17, label: 'S17' },
      { value: 16, label: 'S16' }
    ];
    
    // Check each possible first dart
    for (const dart of possibleFirstDarts) {
      // See if this dart brings us to a good checkout
      const remaining = score - dart.value;
      
      // If remaining is in checkout range (2-50 and even, or 50 (bull))
      if (remaining > 0 && remaining <= 50 && (remaining % 2 === 0 || remaining === 50)) {
        // Add this as an option
        let finishDescription = '';
        
        if (remaining === 50) {
          finishDescription = `${dart.label} → Bull`;
        } else if (remaining <= 40) {
          finishDescription = `${dart.label} → D${remaining/2}`;
        }
        
        if (finishDescription) {
          options.push({ value: dart.value, label: finishDescription });
          
          // Limit to first few good options
          if (options.length >= 4) break;
        }
      }
    }
  }
  
  return options;
}