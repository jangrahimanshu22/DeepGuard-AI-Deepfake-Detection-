import json
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database.models import DetectionRecord

def create_record(db: Session, record_data: Dict[str, Any]) -> DetectionRecord:
    record = DetectionRecord(
        id=record_data["id"],
        filename=record_data["filename"],
        media_type=record_data["media_type"],
        prediction=record_data["prediction"],
        confidence=record_data["confidence"],
        risk_level=record_data["risk_level"],
        real_probability=record_data["real_probability"],
        fake_probability=record_data["fake_probability"],
        model_name=record_data["model_name"],
        model_provider=record_data["model_provider"],
        processing_time_ms=record_data["processing_time_ms"],
        frames_analyzed=record_data.get("frames_analyzed", 1),
        suspicious_frames=record_data.get("suspicious_frames", 0),
        explainability_json=json.dumps(record_data.get("explainability", {})),
        video_timeline_json=json.dumps(record_data.get("video_analysis", {})),
        file_size_bytes=record_data.get("file_size_bytes", 0),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_record(db: Session, record_id: str) -> Optional[DetectionRecord]:
    return db.query(DetectionRecord).filter(DetectionRecord.id == record_id).first()

def delete_record(db: Session, record_id: str) -> bool:
    record = db.query(DetectionRecord).filter(DetectionRecord.id == record_id).first()
    if record:
        db.delete(record)
        db.commit()
        return True
    return False

def list_records(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    media_type: Optional[str] = None,
    verdict: Optional[str] = None,
    search: Optional[str] = None,
) -> Tuple[List[DetectionRecord], int]:
    query = db.query(DetectionRecord)
    
    if media_type and media_type.lower() != "all":
        query = query.filter(DetectionRecord.media_type == media_type.lower())
    
    if verdict and verdict.upper() != "ALL":
        query = query.filter(DetectionRecord.prediction == verdict.upper())
        
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (DetectionRecord.filename.ilike(search_pattern)) | 
            (DetectionRecord.id.ilike(search_pattern))
        )
        
    total = query.count()
    records = query.order_by(desc(DetectionRecord.created_at)).offset(skip).limit(limit).all()
    return records, total

def get_database_stats(db: Session) -> Dict[str, Any]:
    records = db.query(DetectionRecord).all()
    total = len(records)
    if total == 0:
        return {
            "total_analyses": 0,
            "real_count": 0,
            "fake_count": 0,
            "avg_confidence": 0.0,
            "avg_latency_ms": 0,
        }
        
    real_count = sum(1 for r in records if r.prediction == "REAL")
    fake_count = sum(1 for r in records if r.prediction == "FAKE")
    avg_conf = sum(r.confidence for r in records) / total
    avg_latency = sum(r.processing_time_ms for r in records) / total
    
    return {
        "total_analyses": total,
        "real_count": real_count,
        "fake_count": fake_count,
        "avg_confidence": round(avg_conf * 100, 1),
        "avg_latency_ms": int(avg_latency),
    }
