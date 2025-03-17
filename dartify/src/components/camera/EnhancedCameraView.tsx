import React, { useEffect, useState, useRef } from 'react';
import Button from '../ui/Button';
import CameraApiService from '../../services/cameraApiService';

interface EnhancedCameraViewProps {
  onScoreDetected?: (score: number) => void;
  showControls?: boolean;
}

const EnhancedCameraView: React.FC<EnhancedCameraViewProps> = ({
  onScoreDetected,
  showControls = true
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetectedScore, setLastDetectedScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibration, setCalibration] = useState({
    center_x: 640,
    center_y: 360,
    radius: 300,
    auto_calibrate: true
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraApiRef = useRef<CameraApiService>(
    new CameraApiService(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')
  );

  // Start camera and connect to backend
  const startCamera = async () => {
    try {
      // Check if backend is available
      const status = await cameraApiRef.current.getStatus();
      
      if (!status.is_running) {
        setError('Backend camera service is not running');
        return;
      }
      
      // Start WebSocket connection
      cameraApiRef.current.connectWebSocket();
      setIsActive(true);
      setError(null);
      
      // Get current calibration
      try {
        const calibrationData = await cameraApiRef.current.getCalibration();
        setCalibration(calibrationData);
      } catch (err) {
        console.error('Error getting calibration:', err);
      }
      
    } catch (err) {
      setError('Failed to connect to backend service');
      console.error('Error connecting to backend:', err);
    }
  };

  // Stop camera and disconnect from backend
  const stopCamera = () => {
    cameraApiRef.current.disconnectWebSocket();
    setIsActive(false);
    setIsDetecting(false);
    setCameraImage(null);
  };

  // Toggle detection mode
  const toggleDetection = () => {
    setIsDetecting(prev => !prev);
  };

  // Take a photo and send to backend for dart detection
  const takePhoto = async () => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data as base64
      const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
      
      // Send to backend for detection
      const result = await cameraApiRef.current.detectDarts(imageData);
      
      // Update state with results
      if (result.score && result.score.total_score > 0) {
        setLastDetectedScore(result.score.total_score);
        
        // Call the callback if provided
        if (onScoreDetected) {
          onScoreDetected(result.score.total_score);
        }
      }
      
      // Display the annotated image if available
      if (result.image) {
        setCameraImage(`data:image/jpeg;base64,${result.image}`);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Failed to analyze dart position');
    }
  };

  // Simulate a detection for demo/testing purposes
  const simulateDetection = () => {
    const sections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const multipliers = [1, 1, 1, 1, 1, 1, 1, 2, 2, 3]; // More likely to be single
    
    const section = sections[Math.floor(Math.random() * sections.length)];
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const score = section * multiplier;
    
    setLastDetectedScore(score);
    
    if (onScoreDetected) {
      onScoreDetected(score);
    }
    
    return score;
  };

  // Update calibration settings
  const updateCalibration = async () => {
    try {
      await cameraApiRef.current.setCalibration(
        calibration.center_x,
        calibration.center_y,
        calibration.radius
      );
      setIsCalibrating(false);
    } catch (err) {
      console.error('Error updating calibration:', err);
      setError('Failed to update calibration');
    }
  };

  // Toggle auto-calibration
  const toggleAutoCalibration = async () => {
    try {
      await cameraApiRef.current.setAutoCalibration(!calibration.auto_calibrate);
      setCalibration(prev => ({
        ...prev,
        auto_calibrate: !prev.auto_calibrate
      }));
    } catch (err) {
      console.error('Error toggling auto-calibration:', err);
      setError('Failed to update auto-calibration setting');
    }
  };

  // Setup WebSocket callbacks
  useEffect(() => {
    const cameraApi = cameraApiRef.current;
    
    cameraApi.onScoreUpdate((score) => {
      if (score.total_score > 0) {
        setLastDetectedScore(score.total_score);
        
        // Call the callback if provided
        if (onScoreDetected && isDetecting) {
          onScoreDetected(score.total_score);
        }
      }
    });
    
    cameraApi.onImageUpdate((imageData) => {
      setCameraImage(`data:image/jpeg;base64,${imageData}`);
    });
    
    cameraApi.onError((errorMsg) => {
      setError(errorMsg);
    });
    
    return () => {
      // Disconnect WebSocket when component unmounts
      cameraApi.disconnectWebSocket();
    };
  }, [onScoreDetected, isDetecting]);

  // Start camera automatically when component mounts
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Setup local camera feed
  useEffect(() => {
    const setupLocalCamera = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing local camera:', err);
      }
    };
    
    setupLocalCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Periodically take photos when detection is active
  useEffect(() => {
    if (!isActive || !isDetecting) return;
    
    const intervalId = setInterval(() => {
      takePhoto();
    }, 2000); // Take a photo every 2 seconds
    
    return () => clearInterval(intervalId);
  }, [isActive, isDetecting]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        {/* Camera View */}
        <div className="bg-black aspect-video rounded-lg overflow-hidden">
          {isActive ? (
            cameraImage ? (
              <img 
                src={cameraImage} 
                alt="Camera feed with dart detection" 
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white">
                {error || "Camera not active"}
              </p>
            </div>
          )}
          
          {/* Hidden canvas for image capture */}
          <canvas 
            ref={canvasRef} 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Detection Overlay */}
        {isDetecting && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            Detection active
          </div>
        )}

        {/* Last Detected Score */}
        {lastDetectedScore !== null && (
          <div className="absolute top-2 left-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-lg font-bold">
            {lastDetectedScore}
          </div>
        )}
      </div>

      {/* Camera Controls */}
      {showControls && (
        <div className="mt-4 flex flex-wrap gap-2">
          {!isActive ? (
            <Button onClick={startCamera} variant="primary">
              Connect to Camera
            </Button>
          ) : (
            <>
              <Button onClick={stopCamera} variant="danger">
                Disconnect
              </Button>
              <Button
                onClick={toggleDetection}
                variant={isDetecting ? "secondary" : "success"}
              >
                {isDetecting ? "Pause Detection" : "Start Detection"}
              </Button>
              <Button onClick={takePhoto} variant="secondary">
                Capture Frame
              </Button>
              <Button onClick={simulateDetection} variant="secondary">
                Simulate Throw
              </Button>
              <Button 
                onClick={() => setIsCalibrating(!isCalibrating)} 
                variant="secondary"
              >
                Calibration
              </Button>
            </>
          )}
        </div>
      )}

      {/* Calibration Controls */}
      {isCalibrating && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-medium mb-3">Dartboard Calibration</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Center X
              </label>
              <input
                type="number"
                value={calibration.center_x}
                onChange={(e) => setCalibration(prev => ({
                  ...prev,
                  center_x: parseInt(e.target.value)
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Center Y
              </label>
              <input
                type="number"
                value={calibration.center_y}
                onChange={(e) => setCalibration(prev => ({
                  ...prev,
                  center_y: parseInt(e.target.value)
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius
            </label>
            <input
              type="number"
              value={calibration.radius}
              onChange={(e) => setCalibration(prev => ({
                ...prev,
                radius: parseInt(e.target.value)
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="auto-calibrate"
              checked={calibration.auto_calibrate}
              onChange={toggleAutoCalibration}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="auto-calibrate" className="ml-2 block text-sm text-gray-700">
              Auto-calibrate
            </label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setIsCalibrating(false)} 
              variant="secondary"
            >
              Cancel
            </Button>
            <Button 
              onClick={updateCalibration} 
              variant="primary"
            >
              Save Calibration
            </Button>
          </div>
        </div>
      )}

      {/* Status Information */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Status: {isActive ? (isDetecting ? "Detection Running" : "Camera Active") : "Inactive"}
        </p>
        {lastDetectedScore !== null && (
          <p>Last detected throw: {lastDetectedScore} points</p>
        )}
        {error && (
          <p className="text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};

export default EnhancedCameraView;