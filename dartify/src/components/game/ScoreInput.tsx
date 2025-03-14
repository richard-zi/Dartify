import React, { useState } from 'react';
import Button from '../ui/Button';
import { getAllDartSections } from '../../utils/dartLogic';

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
  const [showQuickScores, setShowQuickScores] = useState<boolean>(false);
  
  // Get all possible dart sections and verwende sie tatsächlich
  const dartSections = getAllDartSections();
  const commonScoreSections = dartSections.filter(section => 
    ['double', 'triple', 'bullseye'].includes(section.type)
  ).slice(0, 5); // Nur die ersten 5 zur Demonstration anzeigen
  
  // Filter popular scores for quick selection based on game type
  const getQuickScores = () => {
    // Default popular scores
    const popularScores = [
      { value: 180, label: '180' },
      { value: 140, label: 'T20 T20 20' },
      { value: 100, label: 'T20 20 20' },
      { value: 60, label: 'T20' },
      { value: 57, label: 'T19' },
      { value: 54, label: 'T18' },
      { value: 50, label: 'Bull' },
      { value: 40, label: 'D20' },
      { value: 0, label: 'Miss' },
    ];
    
    // For 01 games, add checkout scores if close to winning
    if ((gameType === '501' || gameType === '301') && currentScore <= 170) {
      const checkoutScores = [];
      
      // Add common checkout combinations
      if (currentScore === 170) checkoutScores.push({ value: 170, label: 'T20 T20 Bull' });
      if (currentScore === 160) checkoutScores.push({ value: 160, label: 'T20 T20 D20' });
      if (currentScore === 136) checkoutScores.push({ value: 136, label: 'T20 T20 D8' });
      if (currentScore === 100) checkoutScores.push({ value: 100, label: 'T20 D20' });
      if (currentScore === 50) checkoutScores.push({ value: 50, label: 'Bull' });
      
      // For direct doubles
      if (currentScore <= 40 && currentScore % 2 === 0) {
        checkoutScores.push({ value: currentScore, label: `D${currentScore / 2}` });
      }
      
      return [...checkoutScores, ...popularScores];
    }
    
    return popularScores;
  };

  const handleManualScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = parseInt(manualScore);
    if (!isNaN(score) && score >= 0 && score <= 180) {
      onScoreSubmit(score);
      setManualScore('');
    }
  };

  const handleQuickScoreClick = (score: number) => {
    onScoreSubmit(score);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-3">Punkteingabe</h3>
      
      {/* Darts thrown indicator */}
      <div className="flex justify-center mb-4">
        {[1, 2, 3].map(dart => (
          <div 
            key={dart} 
            className={`w-4 h-4 mx-1 rounded-full ${
              dart <= dartsThrown ? 'bg-blue-500' : 'bg-gray-300'
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
            max="180"
            value={manualScore}
            onChange={(e) => setManualScore(e.target.value)}
            placeholder="Punkte eingeben"
            className="border rounded px-3 py-2 w-full"
          />
          <Button type="submit" variant="primary">
            Eintragen
          </Button>
        </div>
      </form>
      
      {/* Common Dart Sections (verwendet dartSections) */}
      <div className="mb-3">
        <p className="text-sm text-gray-500 mb-1">Häufige Sektionen:</p>
        <div className="flex flex-wrap gap-1">
          {commonScoreSections.map(section => (
            <span 
              key={section.value} 
              className="text-xs bg-gray-100 px-2 py-1 rounded"
              title={`${section.value} Punkte`}
            >
              {section.label}
            </span>
          ))}
        </div>
      </div>
      
      {/* Quick score buttons toggle */}
      <div className="mb-2">
        <button 
          onClick={() => setShowQuickScores(!showQuickScores)}
          className="text-blue-600 text-sm flex items-center"
        >
          {showQuickScores ? 'Schnellwahl ausblenden' : 'Schnellwahl anzeigen'}
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
        <div className="grid grid-cols-3 gap-2 mb-4">
          {getQuickScores().map(score => (
            <button
              key={score.value}
              onClick={() => handleQuickScoreClick(score.value)}
              className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-sm"
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
          Rückgängig
        </Button>
        <Button 
          onClick={onNextPlayer} 
          variant="primary"
        >
          Nächster Spieler
        </Button>
      </div>
      
      {/* Game info */}
      {(gameType === '501' || gameType === '301') && (
        <div className="mt-4 pt-3 border-t text-sm">
          <p>
            Verbleibende Punkte: <span className="font-bold">{currentScore}</span>
          </p>
          {currentScore <= 170 && (
            <p className="text-green-600 mt-1">
              Möglicher Checkout: {getCheckoutSuggestion(currentScore)}
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
    // ... many more combinations
    40: 'D20',
    36: 'D18',
    32: 'D16',
    24: 'D12',
    20: 'D10',
    16: 'D8',
    12: 'D6',
    8: 'D4',
    4: 'D2',
    2: 'D1',
  };
  
  return checkouts[score] || 'Individuell';
}

export default ScoreInput;