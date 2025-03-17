import cv2
import numpy as np
from typing import Tuple, Optional

def preprocess_frame(frame: np.ndarray) -> np.ndarray:
    """
    Preprocess a frame for better dart detection
    """
    # Resize if needed
    # frame = cv2.resize(frame, (width, height))
    
    # Apply some basic preprocessing
    # Convert to grayscale if needed
    # gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    # blurred = cv2.GaussianBlur(frame, (5, 5), 0)
    
    # Enhance contrast if needed
    # enhanced = cv2.convertScaleAbs(frame, alpha=1.2, beta=10)
    
    # For now, we'll just return the original frame
    # This can be expanded with more sophisticated preprocessing as needed
    return frame

def detect_dartboard(frame: np.ndarray) -> Tuple[Optional[Tuple[int, int]], Optional[int]]:
    """
    Detect the dartboard in the frame.
    Returns the center (x, y) and radius of the dartboard if found, otherwise (None, None)
    This is a simplistic implementation and would need to be replaced with a more robust method
    using Hough Circle Transform or other techniques.
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 2)
    
    # Try to detect circles using the Hough Circle Transform
    circles = cv2.HoughCircles(
        blurred,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=100,
        param1=50,
        param2=30,
        minRadius=50,
        maxRadius=300
    )
    
    if circles is not None:
        # Convert to uint16 to prevent rounding errors
        circles = np.uint16(np.around(circles))
        
        # Just take the first circle detected (assuming it's the dartboard)
        x, y, r = circles[0][0]
        return (int(x), int(y)), int(r)
    
    return None, None

def draw_detection(frame: np.ndarray, x: int, y: int, label: str) -> np.ndarray:
    """
    Draw a detection on the frame
    """
    # Draw a small circle at the dart position
    cv2.circle(frame, (int(x), int(y)), 5, (0, 255, 0), -1)
    
    # Draw the label (e.g., T20, D16) above the circle
    cv2.putText(
        frame,
        label,
        (int(x - 20), int(y - 10)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2,
        cv2.LINE_AA
    )
    
    return frame