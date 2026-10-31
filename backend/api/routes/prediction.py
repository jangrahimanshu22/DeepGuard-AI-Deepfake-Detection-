import os
import shutil
from typing import Dict, Any
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.services.image_service import ImageService
from backend.services.video_service import VideoService
from backend.config.settings import settings
from backend.preprocessing.image_preprocessor import CorruptedImageError, UnsupportedFormatError

router = APIRouter(prefix="/api/predict", tags=["Prediction"])
image_service = ImageService()
video_service = VideoService()

@router.post("/image", response_model=Dict[str, Any])
async def predict_image_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts an uploaded image, executes face detection, runs ViT inference,
    computes XAI explainability maps, and stores the result in SQLite.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename in upload.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = image_service.process_and_predict(
            file_bytes=content,
            filename=file.filename,
            db=db
        )
        return result
    except UnsupportedFormatError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except CorruptedImageError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=413, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.post("/video", response_model=Dict[str, Any])
async def predict_video_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts an uploaded video, decodes frames, runs ViT face inference per frame,
    aggregates temporal probabilities, and records results.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename in upload.")

    temp_path = os.path.join(settings.storage.temp_dir, file.filename)
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = video_service.process_and_predict(
            video_path=temp_path,
            filename=file.filename,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis error: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
