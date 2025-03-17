import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ServerSettings(BaseModel):
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"

class CameraSettings(BaseModel):
    source: str = os.getenv("CAMERA_SOURCE", "0")
    width: int = int(os.getenv("CAMERA_WIDTH", "1280"))
    height: int = int(os.getenv("CAMERA_HEIGHT", "720"))
    fps: int = int(os.getenv("CAMERA_FPS", "30"))

class ModelSettings(BaseModel):
    model_path: str = os.getenv("MODEL_PATH", "yolov8n.pt")
    confidence_threshold: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))

class DartboardSettings(BaseModel):
    center_x: int = int(os.getenv("DARTBOARD_CENTER_X", "640"))
    center_y: int = int(os.getenv("DARTBOARD_CENTER_Y", "360"))
    radius: int = int(os.getenv("DARTBOARD_RADIUS", "300"))

class Settings(BaseModel):
    server: ServerSettings = ServerSettings()
    camera: CameraSettings = CameraSettings()
    model: ModelSettings = ModelSettings()
    dartboard: DartboardSettings = DartboardSettings()

settings = Settings()