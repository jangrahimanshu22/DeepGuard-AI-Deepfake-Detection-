from typing import Dict, Any
from fastapi import APIRouter
from backend.models.detector_factory import get_detector, get_optimal_device

router = APIRouter(prefix="/api/system", tags=["System"])

@router.get("/health", response_model=Dict[str, Any])
def health_check():
    """System liveness, hardware acceleration, and model loading status."""
    device = get_optimal_device()
    detector = get_detector()

    return {
        "status": "healthy",
        "model_loaded": detector.is_loaded,
        "model_name": detector.model_name,
        "device": device,
        "database": True,
        "ffmpeg_opencv": True,
    }
