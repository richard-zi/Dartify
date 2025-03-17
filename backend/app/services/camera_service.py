import cv2
import numpy as np
import threading
import time
from typing import Optional, Tuple, List
import logging
from ..core.config import settings
from ..core.exceptions import CameraError
from ..utils.image_processing import preprocess_frame, detect_dartboard

logger = logging.getLogger(__name__)

class CameraService:
    """Service for handling camera input"""
    
    def __init__(self):
        self.camera = None
        self.is_running = False
        self.frame_buffer = None
        self.lock = threading.Lock()
        self.thread = None
        self.frame_count = 0
        self.last_frame_time = 0
        self.auto_calibrate = True
        
        # Camera settings
        self.source = settings.camera.source
        self.width = settings.camera.width
        self.height = settings.camera.height
        self.fps = settings.camera.fps
        
        # Dartboard calibration
        self.dartboard_center = (settings.dartboard.center_x, settings.dartboard.center_y)
        self.dartboard_radius = settings.dartboard.radius
    
    def start(self):
        """Start the camera service"""
        if self.is_running:
            return
            
        try:
            # Try to convert source to integer for webcam
            self.camera = cv2.VideoCapture(int(self.source))
        except ValueError:
            # If not an integer, treat as a file path or URL
            self.camera = cv2.VideoCapture(self.source)
        
        if not self.camera.isOpened():
            raise CameraError(f"Failed to open camera source: {self.source}")
        
        # Set camera properties
        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
        self.camera.set(cv2.CAP_PROP_FPS, self.fps)
        
        self.is_running = True
        self.thread = threading.Thread(target=self._update, daemon=True)
        self.thread.start()
        
        logger.info(f"Camera service started with source: {self.source}")
    
    def stop(self):
        """Stop the camera service"""
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=1.0)
        if self.camera:
            self.camera.release()
        self.camera = None
        logger.info("Camera service stopped")
    
    def _update(self):
        """Thread function that continuously reads frames from the camera"""
        while self.is_running:
            ret, frame = self.camera.read()
            
            if not ret:
                logger.warning("Failed to read frame from camera")
                time.sleep(0.1)
                continue
            
            # Preprocess the frame
            processed_frame = preprocess_frame(frame)
            
            # Auto-calibrate dartboard position if enabled
            if self.auto_calibrate:
                center, radius = detect_dartboard(processed_frame)
                if center and radius:
                    self.dartboard_center = center
                    self.dartboard_radius = radius
            
            timestamp = time.time()
            with self.lock:
                self.frame_buffer = processed_frame
                self.frame_count += 1
                self.last_frame_time = timestamp
    
    def get_frame(self) -> Tuple[Optional[np.ndarray], int, float]:
        """Get the latest frame from the camera"""
        if not self.is_running:
            raise CameraError("Camera service is not running")
        
        with self.lock:
            if self.frame_buffer is None:
                raise CameraError("No frame available")
            frame = self.frame_buffer.copy()
            frame_count = self.frame_count
            timestamp = self.last_frame_time
        
        return frame, frame_count, timestamp
    
    def set_dartboard_calibration(self, center_x: int, center_y: int, radius: int):
        """Set dartboard calibration parameters"""
        with self.lock:
            self.dartboard_center = (center_x, center_y)
            self.dartboard_radius = radius
            self.auto_calibrate = False
        
        logger.info(f"Dartboard calibration updated: center=({center_x}, {center_y}), radius={radius}")
    
    def get_dartboard_calibration(self) -> Tuple[Tuple[int, int], int]:
        """Get current dartboard calibration parameters"""
        with self.lock:
            return self.dartboard_center, self.dartboard_radius
    
    def enable_auto_calibration(self, enable: bool = True):
        """Enable or disable auto-calibration of dartboard position"""
        with self.lock:
            self.auto_calibrate = enable
        
        logger.info(f"Auto-calibration {'enabled' if enable else 'disabled'}")