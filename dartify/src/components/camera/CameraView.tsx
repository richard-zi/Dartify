import React, { useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import Button from '../ui/Button';

interface CameraViewProps {
  onScoreDetected?: (score: number) => void;
  showControls?: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({
  onScoreDetected,
  showControls = true
}) => {
  const {
    isActive,
    isDetecting,
    lastDetectedScore,
    error,
    videoRef,
    startCamera,
    stopCamera,
    toggleDetection,
    simulateDetection
  } = useCamera({
    onDetection: onScoreDetected
  });

  // Start camera automatically when component mounts
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Simulate detection at intervals when detection is active
  useEffect(() => {
    if (!isDetecting) return;

    const intervalId = setInterval(() => {
      simulateDetection();
    }, 5000); // Simulate a detection every 5 seconds

    return () => clearInterval(intervalId);
  }, [isDetecting, simulateDetection]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        {/* Camera View */}
        <div className="bg-black aspect-video rounded-lg overflow-hidden">
          {isActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white">
                {error || "Kamera ist nicht aktiv"}
              </p>
            </div>
          )}
        </div>

        {/* Detection Overlay */}
        {isDetecting && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            Erkennung aktiv
          </div>
        )}

        {/* Last Detected Score */}
        {lastDetectedScore !== null && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-lg font-bold">
            {lastDetectedScore}
          </div>
        )}
      </div>

      {/* Camera Controls */}
      {showControls && (
        <div className="mt-4 flex flex-wrap gap-2">
          {!isActive ? (
            <Button onClick={startCamera} variant="primary">
              Kamera starten
            </Button>
          ) : (
            <>
              <Button onClick={stopCamera} variant="danger">
                Kamera stoppen
              </Button>
              <Button
                onClick={toggleDetection}
                variant={isDetecting ? "secondary" : "success"}
              >
                {isDetecting ? "Erkennung pausieren" : "Erkennung starten"}
              </Button>
              <Button onClick={simulateDetection} variant="secondary">
                Wurf simulieren
              </Button>
            </>
          )}
        </div>
      )}

      {/* Status Information */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Status: {isActive ? (isDetecting ? "Erkennung läuft" : "Kamera aktiv") : "Inaktiv"}
        </p>
        {lastDetectedScore !== null && (
          <p>Letzter erkannter Wurf: {lastDetectedScore} Punkte</p>
        )}
        {error && (
          <p className="text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};

export default CameraView;