from pydantic import BaseModel
from typing import List, Optional, Tuple

class Dart(BaseModel):
    """Model representing a dart with its position on the dartboard"""
    x: float
    y: float
    confidence: float

class DartDetection(BaseModel):
    """Model representing a dart detection result"""
    darts: List[Dart]
    frame_id: int
    timestamp: float
    image_width: int
    image_height: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "darts": [
                    {
                        "x": 320.5,
                        "y": 240.8,
                        "confidence": 0.92
                    }
                ],
                "frame_id": 42,
                "timestamp": 1648282394.567,
                "image_width": 640,
                "image_height": 480
            }
        }