import numpy as np
import cv2
import math
from typing import Tuple, Dict, List
from ..models.score import ScoringSection
from ..core.config import settings

# Define the dartboard numbers in clockwise order
DARTBOARD_NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]

# Radius ranges for different segments (normalized to total radius = 1.0)
# These values may need to be calibrated for the specific dartboard
RADIUS_RANGES = {
    "double": (0.94, 1.0),    # Double ring (outer)
    "outer_single": (0.63, 0.94),  # Outer single
    "triple": (0.54, 0.63),   # Triple ring
    "inner_single": (0.10, 0.54),  # Inner single
    "bullseye": (0.0, 0.03),      # Bullseye (inner bull)
    "outer_bull": (0.03, 0.10)     # Outer bull
}

class DartboardSegmentation:
    def __init__(self):
        self.center_x = settings.dartboard.center_x
        self.center_y = settings.dartboard.center_y
        self.radius = settings.dartboard.radius
        
    def update_calibration(self, center_x: int, center_y: int, radius: int):
        """Update dartboard calibration parameters"""
        self.center_x = center_x
        self.center_y = center_y
        self.radius = radius
    
    def get_section(self, x: float, y: float) -> ScoringSection:
        """
        Determine which section of the dartboard a dart is in, given its x,y coordinates
        Returns a ScoringSection with the number, multiplier, and label
        """
        # Calculate polar coordinates (distance from center and angle)
        dx = x - self.center_x
        dy = y - self.center_y
        
        # Calculate distance from center (normalized to radius = 1.0)
        distance = math.sqrt(dx**2 + dy**2) / self.radius
        
        # Calculate angle (in degrees, 0 = top of dartboard, increases clockwise)
        angle = math.degrees(math.atan2(dx, -dy)) % 360
        
        # Determine which section based on angle
        section_index = int((angle + 9) % 360 / 18)  # +9 to align with dartboard orientation
        section_number = DARTBOARD_NUMBERS[section_index % 20]
        
        # Determine multiplier based on distance from center
        if distance <= RADIUS_RANGES["bullseye"][1]:
            # Bullseye (inner bull)
            return ScoringSection(number=50, multiplier=1, label="Bull")
        elif distance <= RADIUS_RANGES["outer_bull"][1]:
            # Outer bull
            return ScoringSection(number=25, multiplier=1, label="25")
        elif distance <= RADIUS_RANGES["inner_single"][1]:
            # Inner single
            return ScoringSection(number=section_number, multiplier=1, label=f"{section_number}")
        elif distance <= RADIUS_RANGES["triple"][1]:
            # Triple
            return ScoringSection(number=section_number, multiplier=3, label=f"T{section_number}")
        elif distance <= RADIUS_RANGES["outer_single"][1]:
            # Outer single
            return ScoringSection(number=section_number, multiplier=1, label=f"{section_number}")
        elif distance <= RADIUS_RANGES["double"][1]:
            # Double
            return ScoringSection(number=section_number, multiplier=2, label=f"D{section_number}")
        else:
            # Outside the dartboard
            return ScoringSection(number=0, multiplier=0, label="Miss")
    
    def draw_dartboard_overlay(self, image: np.ndarray) -> np.ndarray:
        """Draw dartboard segmentation overlay on an image for visualization"""
        overlay = image.copy()
        
        # Draw outer circle (double ring)
        cv2.circle(overlay, (self.center_x, self.center_y), self.radius, (0, 255, 0), 2)
        
        # Draw triple ring
        triple_radius = int(self.radius * RADIUS_RANGES["triple"][1])
        cv2.circle(overlay, (self.center_x, self.center_y), triple_radius, (0, 0, 255), 2)
        
        # Draw outer bull
        outer_bull_radius = int(self.radius * RADIUS_RANGES["outer_bull"][1])
        cv2.circle(overlay, (self.center_x, self.center_y), outer_bull_radius, (255, 0, 0), 2)
        
        # Draw bullseye
        bullseye_radius = int(self.radius * RADIUS_RANGES["bullseye"][1])
        cv2.circle(overlay, (self.center_x, self.center_y), bullseye_radius, (0, 255, 255), 2)
        
        # Draw segment lines
        for i in range(20):
            angle = i * 18
            radian = math.radians(angle)
            x = int(self.center_x + self.radius * math.sin(radian))
            y = int(self.center_y - self.radius * math.cos(radian))
            cv2.line(overlay, (self.center_x, self.center_y), (x, y), (255, 255, 255), 1)
            
            # Add number labels at appropriate positions
            label_distance = 1.05
            label_x = int(self.center_x + self.radius * label_distance * math.sin(radian))
            label_y = int(self.center_y - self.radius * label_distance * math.cos(radian))
            cv2.putText(
                overlay, 
                str(DARTBOARD_NUMBERS[i]), 
                (label_x, label_y), 
                cv2.FONT_HERSHEY_SIMPLEX, 
                0.5, 
                (255, 255, 255), 
                1, 
                cv2.LINE_AA
            )
        
        # Blend the overlay with the original image
        alpha = 0.4
        cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0, image)
        
        return image