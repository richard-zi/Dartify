import { useState, useEffect, useRef } from 'react';

interface UseCameraOptions {
  onDetection?: (score: number) => void;
}

export function useCamera({ onDetection }: UseCameraOptions = {}) {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetectedScore, setLastDetectedScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Error accessing camera:', err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
    setIsDetecting(false);
  };

  // Toggle detection mode
  const toggleDetection = () => {
    setIsDetecting(prev => !prev);
  };

  // Simulate a detection (in a real app, this would use ML models)
  const simulateDetection = () => {
    // This is just a placeholder - in reality, this would process camera frames
    // and use ML to detect dart positions and scores
    
    // Generate a random dart score for demo purposes
    const sections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const multipliers = [1, 1, 1, 1, 1, 1, 1, 2, 2, 3]; // More likely to be single
    
    const section = sections[Math.floor(Math.random() * sections.length)];
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const score = section * multiplier;
    
    setLastDetectedScore(score);
    
    if (onDetection) {
      onDetection(score);
    }
    
    return score;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    isActive,
    isDetecting,
    lastDetectedScore,
    error,
    videoRef,
    startCamera,
    stopCamera,
    toggleDetection,
    simulateDetection
  };
}