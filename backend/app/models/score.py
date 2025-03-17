from pydantic import BaseModel
from typing import List, Optional

class ScoringSection(BaseModel):
    """Model representing a section of the dartboard"""
    number: int
    multiplier: int  # 1 for single, 2 for double, 3 for triple
    label: str

class DartThrow(BaseModel):
    """Model representing a single dart throw with its score"""
    section: ScoringSection
    x: float
    y: float
    confidence: float

class Score(BaseModel):
    """Model representing the score of multiple darts"""
    throws: List[DartThrow]
    total_score: int
    image_width: int
    image_height: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "throws": [
                    {
                        "section": {
                            "number": 20,
                            "multiplier": 3,
                            "label": "T20"
                        },
                        "x": 320.5,
                        "y": 240.8,
                        "confidence": 0.92
                    }
                ],
                "total_score": 60,
                "image_width": 640,
                "image_height": 480
            }
        }