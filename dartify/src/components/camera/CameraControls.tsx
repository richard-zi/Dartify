import React, { useState } from 'react';
import Button from '../ui/Button';

interface CameraControlsProps {
  onCameraToggle: () => void;
  onDetectionToggle: () => void;
  onManualScore: (score: number) => void;
  isActive: boolean;
  isDetecting: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  onCameraToggle,
  onDetectionToggle,
  onManualScore,
  isActive,
  isDetecting,
}) => {
  const [manualScore, setManualScore] = useState<string>('');

  const handleManualScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = parseInt(manualScore);
    if (!isNaN(score) && score >= 0 && score <= 180) {
      onManualScore(score);
      setManualScore('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h3 className="text-lg font-medium mb-4 text-gray-800">Camera</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={onCameraToggle}
          variant={isActive ? "danger" : "primary"}
        >
          {isActive ? "Stop Camera" : "Start Camera"}
        </Button>
        
        {isActive && (
          <Button
            onClick={onDetectionToggle}
            variant={isDetecting ? "secondary" : "success"}
            disabled={!isActive}
          >
            {isDetecting ? "Pause Detection" : "Start Detection"}
          </Button>
        )}
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-medium mb-2 text-gray-700">Manual Score Entry</h4>
        <form onSubmit={handleManualScoreSubmit} className="flex gap-2">
          <input
            type="number"
            min="0"
            max="180"
            value={manualScore}
            onChange={(e) => setManualScore(e.target.value)}
            placeholder="Points (0-180)"
            className="border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Button type="submit" variant="primary" size="sm">
            Enter
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-1">
          Enter a score between 0 and 180.
        </p>
      </div>
      
      <div className="mt-4 text-sm">
        <p className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-400' : 'bg-gray-300'}`}></span>
          <span className="text-gray-700">Camera: {isActive ? "Active" : "Inactive"}</span>
        </p>
        {isActive && (
          <p className="flex items-center mt-1">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isDetecting ? 'bg-red-400' : 'bg-gray-300'}`}></span>
            <span className="text-gray-700">Detection: {isDetecting ? "Active" : "Inactive"}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default CameraControls;