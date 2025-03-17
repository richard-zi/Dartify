import cv2
import numpy as np
import os
import time
from typing import List, Tuple, Dict, Any
import logging
from ultralytics import YOLO
from ..core.config import settings
from ..core.exceptions import DetectionError
from ..models.dart import Dart, DartDetection

logger = logging.getLogger(__name__)

class DetectionService:
    """Service for detecting darts using YOLOv8"""
    
    def __init__(self):
        self.model = None
        self.model_path = settings.model.model_path
        self.confidence_threshold = settings.model.confidence_threshold
        self.initialized = False
        self.last_detections = []
        self.class_mapping = {
            0: "dart"  # Map class index to class name
        }
    
    async def initialize(self):
        """Initialize the YOLO model"""
        if self.initialized:
            return
        
        try:
            # Load the YOLO model
            self.model = YOLO(self.model_path)
            self.initialized = True
            logger.info(f"YOLO model loaded from {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise DetectionError(f"Failed to load YOLO model: {e}")
    
    async def detect_darts(self, frame: np.ndarray) -> DartDetection:
        """
        Detect darts in a frame using YOLOv8
        Returns a DartDetection object with the positions of detected darts
        """
        if not self.initialized:
            await self.initialize()
        
        try:
            # Run YOLO detection
            results = self.model(frame, conf=self.confidence_threshold)
            
            # Extract dart detections
            darts = []
            for detection in results[0].boxes.data:
                if len(detection) >= 6:  # x1, y1, x2, y2, confidence, class
                    x1, y1, x2, y2, confidence, class_id = detection[:6]
                    
                    # Only process if the class is a dart (class_id 0)
                    if int(class_id) == 0:
                        # Calculate center point of the bounding box
                        x_center = (x1 + x2) / 2
                        y_center = (y1 + y2) / 2
                        
                        darts.append(Dart(
                            x=float(x_center),
                            y=float(y_center),
                            confidence=float(confidence)
                        ))
            
            # Create a DartDetection object
            detection_result = DartDetection(
                darts=darts,
                frame_id=0,  # This will be filled by the caller
                timestamp=time.time(),
                image_width=frame.shape[1],
                image_height=frame.shape[0]
            )
            
            # Store the last detections for tracking
            self.last_detections = darts
            
            return detection_result
        
        except Exception as e:
            logger.error(f"Detection error: {e}")
            raise DetectionError(f"Detection error: {e}")
    
    def draw_detections(self, frame: np.ndarray, detections: DartDetection) -> np.ndarray:
        """Draw bounding boxes and labels for detected darts"""
        result_frame = frame.copy()
        
        for dart in detections.darts:
            # Draw a circle at the center point
            cv2.circle(
                result_frame,
                (int(dart.x), int(dart.y)),
                5,  # radius
                (0, 255, 0),  # color (green)
                -1  # filled
            )
            
            # Draw confidence label
            label = f"Dart: {dart.confidence:.2f}"
            cv2.putText(
                result_frame,
                label,
                (int(dart.x) + 10, int(dart.y) - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                1,
                cv2.LINE_AA
            )
        
        return result_frame