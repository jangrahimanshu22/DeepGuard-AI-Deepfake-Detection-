import os
from pathlib import Path
from typing import List, Optional
import yaml
from pydantic import BaseModel
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = Path(__file__).resolve().parent / "config.yaml"


class AppConfig(BaseModel):
  name: str = "DeepGuard AI"
  version: str = "2.3.1"
  environment: str = "development"
  cors_origins: List[str] = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
  ]


class ModelConfig(BaseModel):
  provider: str = "huggingface"
  hf_model_id: str = "dima806/deepfake_vs_real_image_detection"
  local_checkpoint_path: str = "checkpoints/best_vit_model.pth"
  device: str = "auto"
  image_size: int = 224
  batch_size: int = 16
  confidence_threshold: float = 0.65


class VideoConfig(BaseModel):
  max_frames: int = 60
  sample_interval_sec: float = 0.25
  suspicious_threshold: float = 0.65


class FaceDetectionConfig(BaseModel):
  detector: str = "opencv_dnn"
  confidence_threshold: float = 0.60
  strategy: str = "largest_face"
  margin_percentage: float = 0.20


class DatabaseConfig(BaseModel):
  url: str = "sqlite:///./deepguard.db"


class StorageConfig(BaseModel):
  upload_max_size_mb: int = 60
  temp_dir: str = "storage/temp"
  reports_dir: str = "storage/reports"


class ExplainabilityConfig(BaseModel):
  enabled: bool = True
  generate_gradcam: bool = True
  generate_attention_rollout: bool = True


class Settings(BaseSettings):
  app: AppConfig = AppConfig()
  model: ModelConfig = ModelConfig()
  video: VideoConfig = VideoConfig()
  face_detection: FaceDetectionConfig = FaceDetectionConfig()
  database: DatabaseConfig = DatabaseConfig()
  storage: StorageConfig = StorageConfig()
  explainability: ExplainabilityConfig = ExplainabilityConfig()

  @classmethod
  def load_from_yaml(cls, path: Path = CONFIG_PATH) -> "Settings":
    if path.exists():
      with open(path, "r") as f:
        data = yaml.safe_load(f) or {}
      return cls(**data)
    return cls()


# Global settings singleton
settings = Settings.load_from_yaml()

# Ensure runtime directories exist
Path(settings.storage.temp_dir).mkdir(parents=True, exist_ok=True)
Path(settings.storage.reports_dir).mkdir(parents=True, exist_ok=True)
