import os
import secrets
import hashlib
import tempfile
import urllib.request
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.database.models import APIKey
from backend.services.image_service import ImageService
from backend.services.video_service import VideoService

router = APIRouter(prefix="/api/developer", tags=["Developer & Integrations"])

image_service = ImageService()
video_service = VideoService()

class CreateKeyRequest(BaseModel):
    name: str = "Default API Key"

class KeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    created_at: str
    last_used_at: Optional[str] = None
    is_active: bool
    raw_key: Optional[str] = None  # only present upon creation

class URLScanRequest(BaseModel):
    url: str

def hash_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

def get_current_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> Optional[APIKey]:
    """Optional validation dependency for developer API calls."""
    if not x_api_key:
        return None
    key_hash = hash_key(x_api_key.strip())
    record = db.query(APIKey).filter(APIKey.key_hash == key_hash, APIKey.is_active == 1).first()
    if not record:
        raise HTTPException(status_code=401, detail="Invalid or revoked API Key.")
    record.last_used_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    return record

@router.post("/keys", response_model=KeyResponse)
def create_api_key(req: CreateKeyRequest, db: Session = Depends(get_db)):
    """Generate a high-entropy cryptographically secure API key."""
    raw_secret = f"dg_live_{secrets.token_hex(20)}"
    key_prefix = raw_secret[:12] + "..."
    key_hash = hash_key(raw_secret)
    key_id = f"key_{secrets.token_hex(6)}"

    new_key = APIKey(
        id=key_id,
        name=req.name.strip() or "Production Key",
        key_prefix=key_prefix,
        key_hash=key_hash,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        is_active=1
    )
    db.add(new_key)
    db.commit()
    db.refresh(new_key)

    return KeyResponse(
        id=new_key.id,
        name=new_key.name,
        key_prefix=new_key.key_prefix,
        created_at=new_key.created_at.isoformat(),
        last_used_at=None,
        is_active=bool(new_key.is_active),
        raw_key=raw_secret
    )

@router.get("/keys", response_model=List[KeyResponse])
def list_api_keys(db: Session = Depends(get_db)):
    """Lists all active API keys."""
    keys = db.query(APIKey).order_by(APIKey.created_at.desc()).all()
    return [
        KeyResponse(
            id=k.id,
            name=k.name,
            key_prefix=k.key_prefix,
            created_at=k.created_at.isoformat() if k.created_at else "",
            last_used_at=k.last_used_at.isoformat() if k.last_used_at else None,
            is_active=bool(k.is_active),
            raw_key=None
        )
        for k in keys
    ]

@router.delete("/keys/{key_id}")
def revoke_api_key(key_id: str, db: Session = Depends(get_db)):
    """Revokes an API key."""
    key = db.query(APIKey).filter(APIKey.id == key_id).first()
    if not key:
        raise HTTPException(status_code=404, detail="API Key not found.")
    key.is_active = 0
    db.commit()
    return {"status": "success", "message": f"API key {key_id} has been revoked."}

@router.post("/scan-url")
def scan_media_from_url(
    req: URLScanRequest,
    db: Session = Depends(get_db)
):
    """
    Downloads media from a public URL and runs deepfake forensic analysis.
    Supports JPG, PNG, WEBP, MP4, MOV, WEBM.
    """
    url = req.url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        raise HTTPException(status_code=400, detail="Invalid URL scheme. Must be http:// or https://")

    # Safety headers to prevent scraping blocks
    headers = {
        "User-Agent": "DeepGuardAI-ForensicBot/1.0 (+https://deepguard.ai)"
    }
    req_obj = urllib.request.Request(url, headers=headers)

    try:
        with urllib.request.urlopen(req_obj, timeout=12) as response:
            content_type = response.headers.get("Content-Type", "").lower()
            file_bytes = response.read(50 * 1024 * 1024)  # 50MB max cap
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch media from URL: {str(e)}")

    raw_filename = url.split("?")[0].split("/")[-1] or "web_media_sample"
    is_video = any(ext in raw_filename.lower() or ext in content_type for ext in [".mp4", ".mov", ".webm", ".avi", "video/"])

    # Ensure valid extension
    if is_video:
        if not any(raw_filename.lower().endswith(ext) for ext in [".mp4", ".mov", ".webm", ".avi"]):
            filename = f"{raw_filename}.mp4"
        else:
            filename = raw_filename
        ext = ".mp4" if ".mp4" in filename.lower() else ".mov"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tf:
            tf.write(file_bytes)
            temp_path = tf.name
        try:
            result = video_service.process_and_predict(temp_path, filename, db=db)
            return result
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    else:
        if not any(raw_filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
            if "png" in content_type:
                filename = f"{raw_filename}.png"
            elif "webp" in content_type:
                filename = f"{raw_filename}.webp"
            else:
                filename = f"{raw_filename}.jpg"
        else:
            filename = raw_filename
        result = image_service.process_and_predict(file_bytes, filename, db=db)
        return result

