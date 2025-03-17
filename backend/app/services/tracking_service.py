import cv2
import numpy as np
import supervision as sv
import logging
import time
from typing import List, Dict, Set, Tuple
from ..core.exceptions import TrackingError
from ..models.dart import Dart, DartDetection

logger = logging.getLogger(__name__)

class TrackingService:
    """Service for tracking darts using Supervision"""
    
    def __init__(self):
        # Initialize ByteTrack tracker from Supervision
        self.tracker = sv.ByteTrack()
        
        # Store tracking history
        self.tracked_darts = {}  # Map of tracker_id -> dart positions
        self.stable_darts = []   # List of darts that are stable (not moving)
        self.last_update_time = time.time()
        
        # Tracking parameters
        self.stability_threshold = 10  # Number of frames to consider a dart stable
        self.movement_threshold = 5    # Maximum movement (pixels) to consider a dart static
        self.reset_interval = 5.0      # Seconds between tracking resets
    
    def update(self, detections: DartDetection) -> List[Dart]:
        """
        Update the tracker with new detections
        Returns a list of stable dart positions
        """
        current_time = time.time()
        
        # Convert dart detections to format expected by ByteTrack
        # ByteTrack expects detections in format [x1, y1, x2, y2, confidence, class_id]
        detection_data = []
        for dart in detections.darts:
            # Create a small bounding box around the dart point
            box_size = 10
            x1 = dart.x - box_size
            y1 = dart.y - box_size
            x2 = dart.x + box_size
            y2 = dart.y + box_size
            detection_data.append([x1, y1, x2, y2, dart.confidence, 0])  # Class 0 = dart
        
        # Skip update if no detections
        if not detection_data:
            return self.stable_darts
            
        detections_array = np.array(detection_data)
        
        # Create Supervision Detections object
        sv_detections = sv.Detections(
            xyxy=detections_array[:, :4],
            confidence=detections_array[:, 4],
            class_id=detections_array[:, 5].astype(int),
        )
        
        # Update tracker
        tracked_detections = self.tracker.update(
            detections=sv_detections,
            # No need for frame here as we're using processed bounding boxes
        )
        
        # Process tracked detections
        active_trackers = set()
        for i, tracker_id in enumerate(tracked_detections.tracker_id):
            active_trackers.add(tracker_id)
            
            # Calculate center of bounding box
            xyxy = tracked_detections.xyxy[i]
            x_center = (xyxy[0] + xyxy[2]) / 2
            y_center = (xyxy[1] + xyxy[3]) / 2
            
            # Get confidence
            confidence = tracked_detections.confidence[i]
            
            # Create a dart object
            dart = Dart(
                x=float(x_center),
                y=float(y_center),
                confidence=float(confidence)
            )
            
            # Update tracking history
            if tracker_id not in self.tracked_darts:
                self.tracked_darts[tracker_id] = {
                    'positions': [dart],
                    'stable_count': 0,
                    'last_position': dart
                }
            else:
                # Check if the dart has moved significantly
                last_pos = self.tracked_darts[tracker_id]['last_position']
                distance = np.sqrt((dart.x - last_pos.x)**2 + (dart.y - last_pos.y)**2)
                
                if distance < self.movement_threshold:
                    # Dart is relatively stationary
                    self.tracked_darts[tracker_id]['stable_count'] += 1
                else:
                    # Dart has moved, reset stability counter
                    self.tracked_darts[tracker_id]['stable_count'] = 0
                
                # Update position history
                self.tracked_darts[tracker_id]['positions'].append(dart)
                self.tracked_darts[tracker_id]['last_position'] = dart
        
        # Remove trackers that are no longer active
        to_remove = []
        for tracker_id in self.tracked_darts:
            if tracker_id not in active_trackers:
                to_remove.append(tracker_id)
        
        for tracker_id in to_remove:
            del self.tracked_darts[tracker_id]
        
        # Update stable darts
        self.stable_darts = []
        for tracker_id, data in self.tracked_darts.items():
            if data['stable_count'] >= self.stability_threshold:
                # This dart is considered stable
                self.stable_darts.append(data['last_position'])
        
        # Periodically reset the tracker to avoid memory issues
        if current_time - self.last_update_time > self.reset_interval:
            # We'll keep the stable darts but reset the tracker
            stable_positions = [(d.x, d.y, d.confidence) for d in self.stable_darts]
            self.reset()
            
            # Re-add the stable darts
            for i, (x, y, conf) in enumerate(stable_positions):
                self.stable_darts.append(Dart(x=x, y=y, confidence=conf))
            
            self.last_update_time = current_time
        
        return self.stable_darts
    
    def reset(self):
        """Reset the tracker"""
        self.tracker = sv.ByteTrack()
        self.tracked_darts = {}
        self.last_update_time = time.time()
        # Note: we don't reset stable_darts here to maintain the dart positions
        
        logger.info("Tracker reset")
    
    def draw_tracking(self, frame: np.ndarray) -> np.ndarray:
        """Draw tracking information on the frame"""
        result_frame = frame.copy()
        
        # Box annotator for tracked objects
        box_annotator = sv.BoxAnnotator(
            thickness=2,
            text_thickness=1,
            text_scale=0.5
        )
        
        # Draw active trackers
        for tracker_id, data in self.tracked_darts.items():
            dart = data['last_position']
            
            # Draw a circle for the dart
            color = (0, 165, 255)  # Orange for tracked darts
            if data['stable_count'] >= self.stability_threshold:
                color = (0, 255, 0)  # Green for stable darts
            
            cv2.circle(
                result_frame,
                (int(dart.x), int(dart.y)),
                5,
                color,
                -1
            )
            
            # Label with tracker ID and stability count
            label = f"ID:{tracker_id} Stab:{data['stable_count']}"
            cv2.putText(
                result_frame,
                label,
                (int(dart.x) + 10, int(dart.y) - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                1,
                cv2.LINE_AA
            )
        
        return result_frame