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
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Kamera Steuerung</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={onCameraToggle}
          variant={isActive ? "danger" : "primary"}
        >
          {isActive ? "Kamera stoppen" : "Kamera starten"}
        </Button>
        
        {isActive && (
          <Button
            onClick={onDetectionToggle}
            variant={isDetecting ? "secondary" : "success"}
            disabled={!isActive}
          >
            {isDetecting ? "Erkennung pausieren" : "Erkennung starten"}
          </Button>
        )}
      </div>
      
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Manuelle Punkteingabe</h4>
        <form onSubmit={handleManualScoreSubmit} className="flex gap-2">
          <input
            type="number"
            min="0"
            max="180"
            value={manualScore}
            onChange={(e) => setManualScore(e.target.value)}
            placeholder="Punkte (0-180)"
            className="border rounded px-3 py-2 w-full"
          />
          <Button type="submit" variant="primary" size="sm">
            Eintragen
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-1">
          Gib eine Punktzahl zwischen 0 und 180 ein.
        </p>
      </div>
      
      <div className="mt-4 text-sm">
        <p className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          Kamera: {isActive ? "Aktiv" : "Inaktiv"}
        </p>
        {isActive && (
          <p className="flex items-center mt-1">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isDetecting ? 'bg-red-500' : 'bg-gray-400'}`}></span>
            Erkennung: {isDetecting ? "Aktiv" : "Inaktiv"}
          </p>
        )}
      </div>
    </div>
  );
};

export default CameraControls;