/**
 * Service for interacting with the camera detection backend API
 */

interface DartboardCalibration {
    center_x: number;
    center_y: number;
    radius: number;
    auto_calibrate: boolean;
  }
  
  interface ScoringSection {
    number: number;
    multiplier: number;
    label: string;
  }
  
  interface DartThrow {
    section: ScoringSection;
    x: number;
    y: number;
    confidence: number;
  }
  
  interface ScoreResult {
    throws: DartThrow[];
    total_score: number;
    image_width: number;
    image_height: number;
  }
  
  interface ScoreResponse {
    score: ScoreResult;
    image?: string; // Base64 encoded image with visualizations
  }
  
  class CameraApiService {
    private baseUrl: string;
    private websocket: WebSocket | null = null;
    private isConnected: boolean = false;
    private onScoreUpdateCallback: ((score: ScoreResult) => void) | null = null;
    private onImageUpdateCallback: ((imageData: string) => void) | null = null;
    private onErrorCallback: ((error: string) => void) | null = null;
  
    constructor(baseUrl: string = 'http://localhost:8000') {
      this.baseUrl = baseUrl;
    }
  
    /**
     * Check if the camera service is running
     */
    async getStatus(): Promise<{ is_running: boolean; camera_source: string; model_loaded: boolean }> {
      const response = await fetch(`${this.baseUrl}/camera/status`);
      if (!response.ok) {
        throw new Error(`Failed to get camera status: ${response.statusText}`);
      }
      return await response.json();
    }
  
    /**
     * Set the dartboard calibration parameters
     */
    async setCalibration(center_x: number, center_y: number, radius: number): Promise<{ status: string }> {
      const response = await fetch(`${this.baseUrl}/camera/calibration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ center_x, center_y, radius })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set calibration: ${response.statusText}`);
      }
      
      return await response.json();
    }
  
    /**
     * Get the current dartboard calibration parameters
     */
    async getCalibration(): Promise<DartboardCalibration> {
      const response = await fetch(`${this.baseUrl}/camera/calibration`);
      
      if (!response.ok) {
        throw new Error(`Failed to get calibration: ${response.statusText}`);
      }
      
      return await response.json();
    }
  
    /**
     * Enable or disable auto-calibration
     */
    async setAutoCalibration(enable: boolean): Promise<{ status: string }> {
      const response = await fetch(`${this.baseUrl}/camera/auto_calibration?enable=${enable}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set auto-calibration: ${response.statusText}`);
      }
      
      return await response.json();
    }
  
    /**
     * Detect darts in an image and calculate the score
     * @param imageData Base64 encoded image
     */
    async detectDarts(imageData: string): Promise<ScoreResponse> {
      const response = await fetch(`${this.baseUrl}/camera/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to detect darts: ${response.statusText}`);
      }
      
      return await response.json();
    }
  
    /**
     * Connect to the WebSocket for real-time dart detection
     */
    connectWebSocket(): void {
      const wsUrl = `ws${this.baseUrl.startsWith('https') ? 's' : ''}://${this.baseUrl.replace(/^https?:\/\//, '')}/camera/ws`;
      
      if (this.websocket) {
        this.disconnectWebSocket();
      }
      
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connection established');
        this.isConnected = true;
      };
      
      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            console.error('WebSocket error:', data.error);
            if (this.onErrorCallback) {
              this.onErrorCallback(data.error);
            }
            return;
          }
          
          if (data.score && this.onScoreUpdateCallback) {
            this.onScoreUpdateCallback(data.score);
          }
          
          if (data.image && this.onImageUpdateCallback) {
            this.onImageUpdateCallback(data.image);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback('WebSocket error occurred');
        }
      };
      
      this.websocket.onclose = () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
      };
    }
  
    /**
     * Disconnect from the WebSocket
     */
    disconnectWebSocket(): void {
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
        this.isConnected = false;
      }
    }
  
    /**
     * Set callback for when a new score is received
     */
    onScoreUpdate(callback: (score: ScoreResult) => void): void {
      this.onScoreUpdateCallback = callback;
    }
  
    /**
     * Set callback for when a new image is received
     */
    onImageUpdate(callback: (imageData: string) => void): void {
      this.onImageUpdateCallback = callback;
    }
  
    /**
     * Set callback for when an error occurs
     */
    onError(callback: (error: string) => void): void {
      this.onErrorCallback = callback;
    }
  
    /**
     * Check if the WebSocket is connected
     */
    isWebSocketConnected(): boolean {
      return this.isConnected;
    }
  }
  
  export default CameraApiService;