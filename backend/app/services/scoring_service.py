import numpy as np
import logging
from typing import List, Dict, Any
from ..core.exceptions import ScoringError
from ..models.dart import Dart
from ..models.score import Score, DartThrow
from ..utils.dartboard_segmentation import DartboardSegmentation

logger = logging.getLogger(__name__)

class ScoringService:
    """Service for calculating dart scores based on their position on the dartboard"""
    
    def __init__(self):
        self.dartboard_segmentation = DartboardSegmentation()
    
    def calculate_score(self, darts: List[Dart], image_width: int, image_height: int) -> Score:
        """
        Calculate scores for darts based on their positions on the dartboard
        Returns a Score object with detailed information about each dart throw
        """
        if not darts:
            return Score(
                throws=[],
                total_score=0,
                image_width=image_width,
                image_height=image_height
            )
        
        dart_throws = []
        total_score = 0
        
        for dart in darts:
            # Get the section of the dartboard where the dart landed
            section = self.dartboard_segmentation.get_section(dart.x, dart.y)
            
            # Calculate score for this dart
            dart_score = section.number * section.multiplier
            total_score += dart_score
            
            # Create a DartThrow object
            dart_throw = DartThrow(
                section=section,
                x=dart.x,
                y=dart.y,
                confidence=dart.confidence
            )
            
            dart_throws.append(dart_throw)
        
        return Score(
            throws=dart_throws,
            total_score=total_score,
            image_width=image_width,
            image_height=image_height
        )
    
    def update_calibration(self, center_x: int, center_y: int, radius: int):
        """Update dartboard calibration parameters"""
        self.dartboard_segmentation.update_calibration(center_x, center_y, radius)
        logger.info(f"Scoring service calibration updated: center=({center_x}, {center_y}), radius={radius}")