import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { getAllPossibleCheckouts, isCheckoutRange, getCheckoutSuggestionDetails } from '../../utils/dartLogic';

interface ScoreInputProps {
  onScoreSubmit: (score: number) => void;
  onUndoThrow: () => void;
  onNextPlayer: () => void;
  dartsThrown: number;
  currentScore: number;
  gameType: string;
  doubleOut: boolean;
}

const ScoreInput: React.FC<ScoreInputProps> = ({
  onScoreSubmit,
  onUndoThrow,
  onNextPlayer,
  dartsThrown,
  currentScore,
  gameType,
  doubleOut
}) => {
  const [manualScore, setManualScore] = useState<string>('');
  const [showQuickScores, setShowQuickScores] = useState<boolean>(true);
  const [checkoutOptions, setCheckoutOptions] = useState<Array<{value: number, label: string}>>([]);
  const [checkoutDetails, setCheckoutDetails] = useState<{
    isCheckout: boolean; 
    sequence: string;
    firstDart?: number;
    firstDartLabel?: string;
  } | null>(null);
  
  // Update checkout options and details whenever the score changes
  useEffect(() => {
    if (isCheckoutRange(currentScore, doubleOut)) {
      const options = getAllPossibleCheckouts(currentScore, doubleOut);
      setCheckoutOptions(options);
      setCheckoutDetails(getCheckoutSuggestionDetails(currentScore, doubleOut));
    } else {
      setCheckoutOptions([]);
      setCheckoutDetails(null);
    }
  }, [currentScore, doubleOut]);

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

  // Determine if we're in checkout range and highlight it
  const isInCheckoutRange = isCheckoutRange(currentScore, doubleOut);

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
      
      {/* Checkout options if applicable */}
      {isInCheckoutRange && (
        <div className="mb-4 p-3 rounded bg-green-50 border border-green-100">
          <p className="text-sm font-medium text-green-800 mb-2">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1"></span>
            Checkout possible: {checkoutDetails?.isCheckout ? checkoutDetails.sequence : "Custom"}
          </p>
          
          {checkoutOptions.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {checkoutOptions.map((option, idx) => (
                <button
                  key={`checkout-${idx}-${option.value}`}
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
            <span className={`font-bold ${isInCheckoutRange ? 'text-green-600' : 'text-gray-800'}`}>{currentScore}</span>
          </p>
          
          {/* Display checkout mode */}
          <p className="flex justify-between mt-1">
            <span className="text-gray-600">Checkout Mode:</span>
            <span className="font-medium">{doubleOut ? 'Double Out' : 'Any Finish'}</span>
          </p>
          
          {/* Display if we're getting close to checkout but not yet there */}
          {!isInCheckoutRange && currentScore > 170 && currentScore <= 230 && (
            <p className="text-indigo-600 mt-1 text-xs">
              {currentScore - 170} points until possible checkout
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreInput;