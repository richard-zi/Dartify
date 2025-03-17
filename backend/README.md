# Dartify Backend

This is the backend for the Dartify application, which provides camera-based dart detection and scoring using computer vision.

## Features

- FastAPI-based web server for dart detection
- Integration with YOLOv8 for object detection
- Real-time dart tracking with Supervision
- Dartboard section recognition and scoring
- WebSocket support for real-time updates
- REST API for configuration and manual detection

## Requirements

- Python 3.8+
- Camera (webcam, IP camera, or video file)
- CUDA-capable GPU recommended (but not required)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dartify.git
   cd dartify/backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Download the YOLOv8 model:
   ```
   # For a lightweight model
   wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
   
   # Or for better accuracy (but slower)
   # wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8m.pt
   ```

4. Configure the application by editing the `.env` file:
   ```
   # Server settings
   HOST=0.0.0.0
   PORT=8000
   DEBUG=True

   # Camera settings
   CAMERA_SOURCE=0  # 0 for webcam, or path to video file or IP camera URL
   CAMERA_WIDTH=1280
   CAMERA_HEIGHT=720
   CAMERA_FPS=30

   # YOLO model settings
   MODEL_PATH=yolov8n.pt
   CONFIDENCE_THRESHOLD=0.25

   # Dartboard settings
   DARTBOARD_CENTER_X=640  # x-coordinate of dartboard center in pixels
   DARTBOARD_CENTER_Y=360  # y-coordinate of dartboard center in pixels
   DARTBOARD_RADIUS=300    # radius of dartboard in pixels
   ```

## Running the Server

Start the server with:

```
python run.py
```

Or using uvicorn directly:

```
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /camera/status` - Camera service status
- `GET /camera/calibration` - Get dartboard calibration
- `POST /camera/calibration` - Set dartboard calibration
- `POST /camera/auto_calibration` - Enable/disable auto-calibration
- `POST /camera/detect` - Detect darts in an uploaded image
- `WebSocket /camera/ws` - Real-time dart detection

## Model Training

For optimal dart detection, you might want to train your own YOLO model on dart images. First, collect and label images of darts on a dartboard, then use YOLOv8's training capabilities:

```
yolo task=detect mode=train data=/path/to/dataset.yaml model=yolov8n.pt epochs=100 imgsz=640
```

## Docker Support

Build and run the Docker container:

```
docker build -t dartify-backend .
docker run -p 8000:8000 --device=/dev/video0:/dev/video0 dartify-backend
```

## Frontend Integration

The Dartify frontend connects to this backend API. Make sure the frontend is configured with the correct backend URL:

```typescript
// In the frontend code
const cameraApi = new CameraApiService('http://localhost:8000');
```