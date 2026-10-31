import logging
from typing import Dict, Any, List, Tuple, Optional
import torch
from PIL import Image
from transformers import AutoModelForImageClassification, AutoImageProcessor, AutoConfig

from backend.models.base_detector import BaseDetector
from backend.utils.label_mapping import resolve_model_label_mapping, normalize_probabilities

import threading

_mps_inference_lock = threading.Lock()

logger = logging.getLogger(__name__)

class HuggingFaceDetector(BaseDetector):
    """Hugging Face Vision Transformer / Deepfake Detection provider."""

    def __init__(self, model_id: str = "dima806/deepfake_vs_real_image_detection", device: str = "cpu"):
        super().__init__(model_name=model_id, device=device)
        self.model_id = model_id
        self.model = None
        self.processor = None
        self.id2label: Dict[Any, Any] = {}

    def load_model(self) -> None:
        logger.info(f"Loading Hugging Face model '{self.model_id}' on device: {self.device}")
        try:
            config = AutoConfig.from_pretrained(self.model_id)
            self.id2label = config.id2label or {}
            
            # Resolve label mapping dynamically from config.id2label
            self.label_mapping = resolve_model_label_mapping(self.id2label)
            logger.info(f"Resolved label mapping for '{self.model_id}': {self.label_mapping}")

            self.processor = AutoImageProcessor.from_pretrained(self.model_id)
            self.model = AutoModelForImageClassification.from_pretrained(
                self.model_id,
                attn_implementation="eager"
            )
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            logger.info(f"Hugging Face model '{self.model_id}' loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Hugging Face model '{self.model_id}': {e}")
            raise e

    def predict_image(self, image_input: Image.Image) -> Tuple[str, float, Dict[str, float]]:
        if not self.is_loaded or self.model is None or self.processor is None:
            self.load_model()

        inputs = self.processor(images=image_input, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with _mps_inference_lock:
            with torch.inference_mode():
                outputs = self.model(**inputs)
                logits = outputs.logits[0]
                probs = torch.softmax(logits, dim=-1).cpu().tolist()
                if self.device == "mps" and hasattr(torch, "mps"):
                    torch.mps.synchronize()

        return normalize_probabilities(probs, self.label_mapping)

    def predict_batch(self, images: List[Image.Image]) -> List[Tuple[str, float, Dict[str, float]]]:
        if not images:
            return []
        if not self.is_loaded or self.model is None or self.processor is None:
            self.load_model()

        inputs = self.processor(images=images, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with _mps_inference_lock:
            with torch.inference_mode():
                outputs = self.model(**inputs)
                probs = torch.softmax(outputs.logits, dim=-1).cpu().tolist()
                if self.device == "mps" and hasattr(torch, "mps"):
                    torch.mps.synchronize()

        return [normalize_probabilities(p, self.label_mapping) for p in probs]

    def get_model_info(self) -> Dict[str, Any]:
        param_count = sum(p.numel() for p in self.model.parameters()) if self.model else 86_000_000
        return {
            "name": self.model_id,
            "provider": "huggingface",
            "architecture": self.model.__class__.__name__ if self.model else "AutoModelForImageClassification",
            "framework": "PyTorch / Hugging Face Transformers",
            "parameters": param_count,
            "input_size": "224x224",
            "label_mapping": self.label_mapping,
            "raw_id2label": self.id2label,
            "device": self.device,
        }
