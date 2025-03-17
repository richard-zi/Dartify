from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
import cv2
import numpy as np
import base64
import json
import logging
import asyncio
from typing import Dict, List, Optional
from pydantic import BaseModel
from ..services.camera_service import CameraService
from ..services.detection_service import DetectionService
from ..services.tracking_service import TrackingService
from ..services.scoring_service import ScoringService
from ..models.dart import DartDetection
from ..models.score import Score
from ..core.exceptions import CameraError, DetectionError, TrackingError, ScoringError
from ..utils.dartboard_segmentation import DartboardSegmentation
from ..utils.image_processing import draw_detection

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/camera",
    tags=["camera"],
    responses={
        404: {"description": "Not found"},
        503: {"description": "Camera service unavailable"}
    }
)

# Services
camera_service = CameraService()
detection_service = DetectionService()
tracking_service = TrackingService()
scoring_service = ScoringService()
dartboard_segmentation = DartboardSegmentation()

# Models for API requests/responses
class CalibrationData(BaseModel):
    center_x: int
    center_y: int
    radius: int

class ScoreRequest(BaseModel):
    image: str  # Base64 encoded image

class ScoreResponse(BaseModel):
    score: Score
    image: Optional[str] = None  # Base64 encoded image with visualizations

@router.on_event("startup")
async def startup_event():
    """Start the camera service when the API starts"""
    try:
        camera_service.start()
        await detection_service.initialize()
    except Exception as e:
        logger.error(f"Failed to start camera service: {e}")

@router.on_event("shutdown")
def shutdown_event():
    """Stop the camera service when the API shuts down"""
    camera_service.stop()

@router.get("/status")
async def get_status():
    """Check if camera service is running"""
    return {
        "is_running": camera_service.is_running,
        "camera_source": camera_service.source,
        "model_loaded": detection_service.initialized
    }

@router.post("/calibration")
async def set_calibration(data: CalibrationData):
    """Set dartboard calibration parameters"""
    try:
        camera_service.set_dartboard_calibration(data.center_x, data.center_y, data.radius)
        scoring_service.update_calibration(data.center_x, data.center_y, data.radius)
        camera_service.enable_auto_calibration(False)
        return {"status": "Calibration updated successfully"}
    except Exception as e:
        logger.error(f"Calibration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update calibration: {str(e)}"
        )

@router.get("/calibration")
async def get_calibration():
    """Get current dartboard calibration parameters"""
    try:
        center, radius = camera_service.get_dartboard_calibration()
        return {
            "center_x": center[0],
            "center_y": center[1],
            "radius": radius,
            "auto_calibrate": camera_service.auto_calibrate
        }
    except Exception as e:
        logger.error(f"Calibration retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve calibration: {str(e)}"
        )

@router.post("/auto_calibration")
async def set_auto_calibration(enable: bool = True):
    """Enable or disable auto-calibration of dartboard position"""
    try:
        camera_service.enable_auto_calibration(enable)
        return {
            "status": f"Auto-calibration {'enabled' if enable else 'disabled'} successfully"
        }
    except Exception as e:
        logger.error(f"Auto-calibration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update auto-calibration: {str(e)}"
        )

@router.post("/detect")
async def detect_darts_in_image(request: ScoreRequest):
    """
    Detect darts in an uploaded image and calculate the score
    Returns the score and a visualization image
    """
    try:
        # Decode the base64 image
        image_data = base64.b64decode(request.image)
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image data"
            )
        
        # Detect darts
        detection_result = await detection_service.detect_darts(frame)
        
        # Update tracker
        stable_darts = tracking_service.update(detection_result)
        
        # Calculate score
        score = scoring_service.calculate_score(
            stable_darts,
            frame.shape[1],
            frame.shape[0]
        )
        
        # Create visualization image
        visualization = frame.copy()
        
        # Draw dartboard segmentation
        visualization = dartboard_segmentation.draw_dartboard_overlay(visualization)
        
        # Draw detections
        visualization = detection_service.draw_detections(visualization, detection_result)
        
        # Draw tracking
        visualization = tracking_service.draw_tracking(visualization)
        
        # Draw the score results
        for dart_throw in score.throws:
            cv2.putText(
                visualization,
                f"{dart_throw.section.label} ({dart_throw.section.number * dart_throw.section.multiplier})",
                (int(dart_throw.x) + 15, int(dart_throw.y) + 15),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 255),
                2,
                cv2.LINE_AA
            )
        
        # Add total score text
        cv2.putText(
            visualization,
            f"Total Score: {score.total_score}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (0, 0, 255),
            2,
            cv2.LINE_AA
        )
        
        # Encode visualization image to base64
        _, buffer = cv2.imencode('.jpg', visualization)
        visualization_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return ScoreResponse(
            score=score,
            image=visualization_base64
        )
    
    except CameraError as e:
        logger.error(f"Camera error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except DetectionError as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except TrackingError as e:
        logger.error(f"Tracking error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except ScoringError as e:
        logger.error(f"Scoring error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time dart detection and scoring
    """
    await websocket.accept()
    
    try:
        # Start camera if not already running
        if not camera_service.is_running:
            camera_service.start()
        
        # Initialize detection service if not already initialized
        if not detection_service.initialized:
            await detection_service.initialize()
        
        # Reset tracker
        tracking_service.reset()
        
        # Heartbeat counter
        heartbeat_counter = 0
        
        while True:
            # Get the latest frame
            frame, frame_id, timestamp = camera_service.get_frame()
            
            # Detect darts
            detection_result = await detection_service.detect_darts(frame)
            detection_result.frame_id = frame_id
            detection_result.timestamp = timestamp
            
            # Update tracker
            stable_darts = tracking_service.update(detection_result)
            
            # Calculate score
            score = scoring_service.calculate_score(
                stable_darts,
                frame.shape[1],
                frame.shape[0]
            )
            
            # Create visualization image
            visualization = frame.copy()
            
            # Draw dartboard segmentation
            visualization = dartboard_segmentation.draw_dartboard_overlay(visualization)
            
            # Draw detections
            visualization = detection_service.draw_detections(visualization, detection_result)
            
            # Draw tracking
            visualization = tracking_service.draw_tracking(visualization)
            
            # Draw score results
            for dart_throw in score.throws:
                draw_detection(
                    visualization,
                    dart_throw.x,
                    dart_throw.y,
                    f"{dart_throw.section.label} ({dart_throw.section.number * dart_throw.section.multiplier})"
                )
            
            # Add total score text
            cv2.putText(
                visualization,
                f"Total Score: {score.total_score}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.0,
                (0, 0, 255),
                2,
                cv2.LINE_AA
            )
            
            # Compress and encode the image for web transmission (lower quality for websocket)
            _, buffer = cv2.imencode('.jpg', visualization, [cv2.IMWRITE_JPEG_QUALITY, 70])
            visualization_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Prepare WebSocket message
            message = {
                "score": score.dict(),
                "frame_id": frame_id,
                "timestamp": timestamp,
                "image": visualization_base64,
                "heartbeat": heartbeat_counter
            }
            
            # Send the message
            await websocket.send_text(json.dumps(message))
            
            # Increment heartbeat counter
            heartbeat_counter += 1
            
            # Wait a short time to avoid overwhelming the WebSocket
            await asyncio.sleep(0.1)
    
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except CameraError as e:
        logger.error(f"Camera error in WebSocket: {e}")
        await websocket.send_text(json.dumps({"error": str(e)}))
    except Exception as e:
        logger.error(f"Error in WebSocket: {e}")
        try:
            await websocket.send_text(json.dumps({"error": str(e)}))
        except:
            pass
    finally:
        # No need to stop the camera service here, as it might be used by other clients
        pass