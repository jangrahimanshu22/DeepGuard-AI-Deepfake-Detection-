import json
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.database.repository import list_records, get_record, delete_record, get_database_stats

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("", response_model=Dict[str, Any])
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    type: Optional[str] = Query(None),
    verdict: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Lists past media analyses with pagination, filtering, and search."""
    records, total = list_records(
        db,
        skip=skip,
        limit=limit,
        media_type=type,
        verdict=verdict,
        search=search,
    )

    items = []
    for r in records:
        explain_data = {}
        if r.explainability_json:
            try:
                explain_data = json.loads(r.explainability_json)
            except Exception:
                pass

        vid_data = None
        if r.video_timeline_json:
            try:
                vid_data = json.loads(r.video_timeline_json)
            except Exception:
                pass

        items.append({
            "id": r.id,
            "filename": r.filename,
            "media_type": r.media_type,
            "prediction": r.prediction,
            "confidence": round(r.confidence * 100, 1),
            "risk_level": r.risk_level,
            "probabilities": {
                "REAL": round(r.real_probability, 4),
                "FAKE": round(r.fake_probability, 4),
            },
            "model_name": r.model_name,
            "model_provider": r.model_provider,
            "processing_time_ms": r.processing_time_ms,
            "frames_analyzed": r.frames_analyzed,
            "suspicious_frames": r.suspicious_frames,
            "created_at": r.created_at.isoformat(),
            "file_size_bytes": r.file_size_bytes,
            "explainability": explain_data,
            "video_analysis": vid_data,
        })

    stats = get_database_stats(db)

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "records": items,
        "stats": stats,
    }

@router.get("/{record_id}", response_model=Dict[str, Any])
def get_single_record(record_id: str, db: Session = Depends(get_db)):
    """Retrieves full details for a single archived forensic analysis."""
    r = get_record(db, record_id)
    if not r:
        raise HTTPException(status_code=404, detail=f"Analysis with ID '{record_id}' not found.")

    explain_data = json.loads(r.explainability_json) if r.explainability_json else {}
    vid_data = json.loads(r.video_timeline_json) if r.video_timeline_json else None

    return {
        "id": r.id,
        "filename": r.filename,
        "media_type": r.media_type,
        "prediction": r.prediction,
        "confidence": round(r.confidence * 100, 1),
        "risk_level": r.risk_level,
        "probabilities": {
            "REAL": round(r.real_probability, 4),
            "FAKE": round(r.fake_probability, 4),
        },
        "model_name": r.model_name,
        "model_provider": r.model_provider,
        "processing_time_ms": r.processing_time_ms,
        "frames_analyzed": r.frames_analyzed,
        "suspicious_frames": r.suspicious_frames,
        "created_at": r.created_at.isoformat(),
        "file_size_bytes": r.file_size_bytes,
        "explainability": explain_data,
        "video_analysis": vid_data,
    }

@router.delete("/{record_id}")
def delete_single_record(record_id: str, db: Session = Depends(get_db)):
    """Deletes an archived record from the database."""
    success = delete_record(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Record '{record_id}' not found.")
    return {"message": f"Record '{record_id}' deleted successfully.", "id": record_id}
