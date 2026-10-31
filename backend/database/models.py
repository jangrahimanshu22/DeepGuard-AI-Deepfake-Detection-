import datetime
from sqlalchemy import Column, String, Float, Integer, Text, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class DetectionRecord(Base):
    __tablename__ = "detection_records"

    id = Column(String(64), primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    media_type = Column(String(32), nullable=False)  # "image" or "video"
    prediction = Column(String(16), nullable=False)  # "REAL" or "FAKE"
    confidence = Column(Float, nullable=False)
    risk_level = Column(String(16), nullable=False)  # "LOW", "MEDIUM", "HIGH"
    real_probability = Column(Float, nullable=False)
    fake_probability = Column(Float, nullable=False)
    model_name = Column(String(128), nullable=False)
    model_provider = Column(String(64), nullable=False)  # "huggingface" or "local"
    processing_time_ms = Column(Integer, nullable=False)
    frames_analyzed = Column(Integer, default=1)
    suspicious_frames = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    
    # JSON-encoded details
    explainability_json = Column(Text, nullable=True)
    video_timeline_json = Column(Text, nullable=True)
    file_size_bytes = Column(Integer, default=0)

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    key_prefix = Column(String(16), nullable=False)
    key_hash = Column(String(64), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_used_at = Column(DateTime, nullable=True)
    is_active = Column(Integer, default=1)

