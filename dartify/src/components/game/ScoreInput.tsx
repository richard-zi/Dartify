import React, { useState } from 'react';
import Button from '../ui/Button';

interface ScoreInputProps {
  onScoreSubmit: (score: number) => void;
  onUndoThrow: () => void;
  onNextPlayer: () => void;
  dartsThrown: number;
  currentScore: number;
  gameType: string;
}

const ScoreInput: React.FC<ScoreInputProps> = ({
  onScoreSubmit,
  onUndoThrow,
  onNextPlayer,
  dartsThrown,
  currentScore,
  gameType,
}) => {
  const [manualScore, setManualScore] = useState<string>('');
  const [showQuickScores, setShowQuickScores] = useState<boolean>(true);
  
  // Single dart score options for quick input
  const quickScores = [
    { value: 60, label: 'T20' },
    { value: 57, label: 'T19' },
    { value: 54, label: 'T18' },
    { value: 51, label: 'T17' },
    { value: 50, label: 'Bull' },
    { value: 40, label: 'D20' },
    { value: 38, label: 'D19' },
    { value: 36, label: 'D18' },
    { value: 25, label: '25' },
    { value: 20, label: '20' },
    { value: 19, label: '19' },
    { value: 18, label: '18' },
    { value: 17, label: '17' },
    { value: 16, label: '16' },
    { value: 0, label: 'Miss' },
  ];
  
  // Possible checkout options based on current score
  const getCheckoutOptions = () => {
    if ((gameType === '501' || gameType === '301') && currentScore <= 170) {
      const checkoutScores = [];
      
      // Direct doubles for checkouts
      if (currentScore <= 40 && currentScore % 2 === 0) {
        checkoutScores.push({ value: currentScore, label: `D${currentScore / 2}` });
      }
      
      // Special checkout combinations
      if (currentScore === 170) checkoutScores.push({ value: 60, label: 'T20 → T20 → Bull' });
      if (currentScore === 167) checkoutScores.push({ value: 57, label: 'T19 → T20 → Bull' });
      if (currentScore === 164) checkoutScores.push({ value: 54, label: 'T18 → T20 → Bull' });
      if (currentScore === 160) checkoutScores.push({ value: 60, label: 'T20 → T20 → D20' });
      if (currentScore === 161) checkoutScores.push({ value: 60, label: 'T20 → T17 → Bull' });
      if (currentScore === 130) checkoutScores.push({ value: 60, label: 'T20 → T18 → D8' });
      if (currentScore === 136) checkoutScores.push({ value: 60, label: 'T20 → T20 → D8' });
      if (currentScore === 100) checkoutScores.push({ value: 60, label: 'T20 → D20' });
      
      return checkoutScores.length > 0 ? checkoutScores : null;
    }
    
    return null;
  };

  const handleManualScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = parseInt(manualScore);
    if (!isNaN(score) && score >= 0 && score <= 60) {
      onScoreSubmit(score);
      setManualScore('');
    }
  };

  const handleQuickScoreClick = (score: number) => {
    onScoreSubmit(score);
  };

  const checkoutOptions = getCheckoutOptions();
  
  // Determine if we're in checkout range and highlight it
  const isCheckoutRange = (gameType === '501' || gameType === '301') && currentScore <= 170 && currentScore > 1;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h3 className="text-lg font-medium mb-3 text-gray-800">Score Input</h3>
      
      {/* Darts thrown indicator */}
      <div className="flex justify-center mb-4">
        {[1, 2, 3].map(dart => (
          <div 
            key={dart} 
            className={`w-4 h-4 mx-1 rounded-full ${
              dart <= dartsThrown ? 'bg-indigo-500' : 'bg-gray-200'
            }`}
          >
          </div>
        ))}
      </div>
      
      {/* Manual score input */}
      <form onSubmit={handleManualScoreSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="60"
            value={manualScore}
            onChange={(e) => setManualScore(e.target.value)}
            placeholder="Enter points (0-60)"
            className="border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
          />
          <Button type="submit" variant="primary">
            Enter
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter points for a single throw (0-60).
        </p>
      </form>
      
      {/* Checkout options if available */}
      {isCheckoutRange && (
        <div className={`mb-4 p-3 rounded ${checkoutOptions ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
          <p className="text-sm font-medium text-green-800 mb-2">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1"></span>
            Checkout possible: {getCheckoutSuggestion(currentScore)}
          </p>
          
          {checkoutOptions && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {checkoutOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleQuickScoreClick(option.value)}
                  className="bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-sm text-green-800 border border-green-200 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Quick score buttons toggle */}
      <div className="mb-2">
        <button 
          onClick={() => setShowQuickScores(!showQuickScores)}
          className="text-indigo-600 text-sm flex items-center"
        >
          {showQuickScores ? 'Hide Quick Select' : 'Show Quick Select'}
          <svg 
            className={`ml-1 w-4 h-4 transform ${showQuickScores ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Quick score buttons */}
      {showQuickScores && (
        <div className="grid grid-cols-5 gap-2 mb-4">
          {quickScores.map(score => (
            <button
              key={score.value}
              onClick={() => handleQuickScoreClick(score.value)}
              className="bg-gray-50 hover:bg-gray-100 px-2 py-2 rounded text-sm font-medium border border-gray-100 transition-colors"
            >
              {score.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Control buttons */}
      <div className="flex space-x-2">
        <Button 
          onClick={onUndoThrow} 
          variant="secondary"
          disabled={dartsThrown === 0}
        >
          Undo
        </Button>
        <Button 
          onClick={onNextPlayer} 
          variant="primary"
        >
          Next Player
        </Button>
      </div>
      
      {/* Game info */}
      {(gameType === '501' || gameType === '301') && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-sm">
          <p className="flex justify-between">
            <span className="text-gray-600">Remaining Points:</span> 
            <span className={`font-bold ${isCheckoutRange ? 'text-green-600' : 'text-gray-800'}`}>{currentScore}</span>
          </p>
          
          {/* Display if we're getting close to checkout but not yet there */}
          {!isCheckoutRange && currentScore > 170 && currentScore <= 230 && (
            <p className="text-indigo-600 mt-1 text-xs">
              {currentScore - 170} points until possible checkout
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to suggest checkout combinations
function getCheckoutSuggestion(score: number): string {
  const checkouts: Record<number, string> = {
    170: 'T20 T20 Bull',
    167: 'T20 T19 Bull',
    164: 'T20 T18 Bull',
    161: 'T20 T17 Bull',
    160: 'T20 T20 D20',
    157: 'T20 T19 D20',
    156: 'T20 T20 D18',
    155: 'T20 T19 D19',
    154: 'T20 T18 D20',
    153: 'T20 T19 D18',
    152: 'T20 T20 D16',
    151: 'T20 T17 D20',
    150: 'T20 T18 D18',
    149: 'T20 T19 D16',
    148: 'T20 T20 D14',
    147: 'T20 T17 D18',
    146: 'T20 T18 D16',
    145: 'T20 T19 D14',
    144: 'T20 T20 D12',
    143: 'T20 T17 D16',
    142: 'T20 T14 D20',
    141: 'T20 T19 D12',
    140: 'T20 T20 D10',
    139: 'T20 T13 D20',
    138: 'T20 T18 D12',
    137: 'T20 T19 D10',
    136: 'T20 T20 D8',
    135: 'T20 T15 D15',
    134: 'T20 T14 D16',
    133: 'T20 T19 D8',
    132: 'T20 T16 D12',
    131: 'T20 T13 D16',
    130: 'T20 T18 D8',
    129: 'T19 T16 D12',
    128: 'T18 T18 D10',
    127: 'T20 T17 D8',
    126: 'T19 T19 D6',
    125: 'T20 T19 D4',
    124: 'T20 T16 D8',
    123: 'T19 T18 D6',
    122: 'T18 T18 D7',
    121: 'T20 T11 D14',
    120: 'T20 S20 D20',
    119: 'T19 T12 D13',
    118: 'T20 S18 D20',
    117: 'T20 S17 D20',
    116: 'T20 S16 D20',
    115: 'T19 S18 D20',
    114: 'T20 S14 D20',
    113: 'T19 S16 D20',
    112: 'T20 S12 D20',
    111: 'T19 S14 D20',
    110: 'T20 S10 D20',
    109: 'T19 S12 D20',
    108: 'T20 S8 D20',
    107: 'T19 S10 D20',
    106: 'T20 S6 D20',
    105: 'T19 S8 D20',
    104: 'T19 S16 D16',
    103: 'T19 S10 D18',
    102: 'T20 S10 D16',
    101: 'T17 S10 D20',
    100: 'T20 D20',
    99: 'T19 S10 D16',
    98: 'T20 D19',
    97: 'T19 D20',
    96: 'T20 D18',
    95: 'T19 D19',
    94: 'T18 D20',
    93: 'T19 D18',
    92: 'T20 D16',
    91: 'T17 D20',
    90: 'T20 D15',
    89: 'T19 D16',
    88: 'T20 D14',
    87: 'T17 D18',
    86: 'T18 D16',
    85: 'T15 D20',
    84: 'T20 D12',
    83: 'T17 D16',
    82: 'T14 D20',
    81: 'T19 D12',
    80: 'T20 D10',
    79: 'T19 D11',
    78: 'T18 D12',
    77: 'T19 D10',
    76: 'T20 D8',
    75: 'T17 D12',
    74: 'T14 D16',
    73: 'T19 D8',
    72: 'T16 D12',
    71: 'T13 D16',
    70: 'T18 D8',
    69: 'T19 D6',
    68: 'T20 D4',
    67: 'T17 D8',
    66: 'T10 D18',
    65: 'T19 D4',
    64: 'T16 D8',
    63: 'T13 D12',
    62: 'T10 D16',
    61: 'T15 D8',
    60: 'S20 D20',
    59: 'S19 D20',
    58: 'S18 D20',
    57: 'S17 D20',
    56: 'S16 D20',
    55: 'S15 D20',
    54: 'S14 D20',
    53: 'S13 D20',
    52: 'S12 D20',
    51: 'S11 D20',
    50: 'Bull',
    49: 'S9 D20',
    48: 'S16 D16',
    47: 'S15 D16',
    46: 'S6 D20',
    45: 'S13 D16',
    44: 'S12 D16',
    43: 'S11 D16',
    42: 'S10 D16',
    41: 'S9 D16',
    40: 'D20',
    38: 'D19',
    36: 'D18',
    34: 'D17',
    32: 'D16',
    30: 'D15',
    28: 'D14',
    26: 'D13',
    24: 'D12',
    22: 'D11',
    20: 'D10',
    18: 'D9',
    16: 'D8',
    14: 'D7',
    12: 'D6',
    10: 'D5',
    8: 'D4',
    6: 'D3',
    4: 'D2',
    2: 'D1',
  };
  
  return checkouts[score] || 'Custom';
}

export default ScoreInput;