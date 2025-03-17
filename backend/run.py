"""
Script to run the Dartify backend server
"""
import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print(f"Starting Dartify backend server on {settings.server.host}:{settings.server.port}")
    uvicorn.run(
        "app.main:app",
        host=settings.server.host,
        port=settings.server.port,
        reload=settings.server.debug
    )