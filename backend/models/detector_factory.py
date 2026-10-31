import logging
import torch
from typing import Optional
from backend.config.settings import settings
from backend.models.base_detector import BaseDetector
from backend.models.local_vit_detector import LocalViTDetector
from backend.models.huggingface_detector import HuggingFaceDetector

from backend.models.ensemble_detector import EnsembleDeepfakeDetector

logger = logging.getLogger(__name__)

_active_detector: Optional[BaseDetector] = None

def get_optimal_device() -> str:
    """Detects available hardware acceleration (MPS, CUDA, or CPU fallback)."""
    cfg_device = settings.model.device.lower()
    if cfg_device in ["cuda", "mps", "cpu"]:
        return cfg_device

    if torch.cuda.is_available():
        return "cuda"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"

def get_detector(force_reload: bool = False) -> BaseDetector:
    """Singleton factory returning the configured deepfake detector."""
    global _active_detector

    if _active_detector is not None and not force_reload:
        return _active_detector

    device = get_optimal_device()
    logger.info(f"Selected computation device: {device.upper()}")

    provider = settings.model.provider.lower()
    detector = None

    if provider == "ensemble":
        try:
            logger.info("Initializing EnsembleDeepfakeDetector (Tri-Stream Forensic Ensemble)...")
            detector = EnsembleDeepfakeDetector(
                faceswap_model_id="dima806/deepfake_vs_real_image_detection",
                ai_model_id="haywoodsloan/ai-image-detector-deploy",
                diffusion_model_id="Organika/sdxl-detector",
                device=device
            )
            detector.load_model()
        except Exception as e:
            logger.warning(f"Failed to load Ensemble detector ({e}). Falling back to HuggingFace single stream.")
            try:
                detector = HuggingFaceDetector(model_id=settings.model.hf_model_id, device=device)
                detector.load_model()
            except Exception as e2:
                logger.warning(f"Failed HuggingFace fallback ({e2}). Falling back to LocalViTDetector.")
                detector = LocalViTDetector(checkpoint_path=settings.model.local_checkpoint_path, device=device)
                detector.load_model()
    elif provider in ["huggingface", "hf"]:
        try:
            logger.info(f"Initializing HuggingFaceDetector ({settings.model.hf_model_id})...")
            detector = HuggingFaceDetector(model_id=settings.model.hf_model_id, device=device)
            detector.load_model()
        except Exception as e:
            logger.warning(f"Failed HuggingFace model load ({e}). Falling back to LocalViTDetector.")
            detector = LocalViTDetector(checkpoint_path=settings.model.local_checkpoint_path, device=device)
            detector.load_model()
    else:
        detector = LocalViTDetector(checkpoint_path=settings.model.local_checkpoint_path, device=device)
        detector.load_model()

    _active_detector = detector
    return _active_detector
