import React, { useState } from 'react';
import DartBoard from './DartBoard';

interface SmallDartBoardProps {
  onScoreSelected?: (score: number) => void;
  size?: number;
  className?: string;
}

const SmallDartBoard: React.FC<SmallDartBoardProps> = ({
  onScoreSelected,
  size = 180,
  className = '',
}) => {
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [showScoreInfo, setShowScoreInfo] = useState<boolean>(false);
  
  // Verarbeite die Klicks auf Dartboard-Segmente
  const handleSectionClick = (value: number, multiplier: number) => {
    const score = value * multiplier;
    setLastScore(score);
    setShowScoreInfo(true);
    
    // Blende die Score-Info nach 2 Sekunden aus
    setTimeout(() => {
      setShowScoreInfo(false);
    }, 2000);
    
    if (onScoreSelected) {
      onScoreSelected(score);
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="bg-white rounded-full shadow-lg overflow-hidden">
        <DartBoard 
          size={size}
          interactive={true}
          onSectionClick={handleSectionClick}
        />
      </div>
      
      {/* Score-Info, wenn ein Segment geklickt wurde */}
      {showScoreInfo && lastScore !== null && (
        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-1 text-lg font-bold">
          {lastScore}
        </div>
      )}
      
      {/* Hinweis unterhalb der Dartscheibe */}
      <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600 bg-white bg-opacity-70 rounded px-1">
        Klicke für Punkteingabe
      </div>
    </div>
  );
};

export default SmallDartBoard;