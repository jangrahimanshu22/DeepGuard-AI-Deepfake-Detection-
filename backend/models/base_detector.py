from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple
import numpy as np

class BaseDetector(ABC):
    """Abstract interface for all deepfake detection models (Local ViT or Hugging Face)."""

    def __init__(self, model_name: str, device: str = "cpu"):
        self.model_name = model_name
        self.device = device
        self.label_mapping: Dict[str, int] = {}
        self.is_loaded: bool = False

    @abstractmethod
    def load_model(self) -> None:
        """Loads model weights, configuration, and verifies label mappings."""
        pass

    @abstractmethod
    def predict_image(self, image_input: Any) -> Tuple[str, float, Dict[str, float]]:
        """
        Runs inference on a preprocessed image or face crop.
        Returns:
            (verdict, confidence_0_to_1, { "REAL": prob, "FAKE": prob })
        """
        pass

    @abstractmethod
    def predict_batch(self, images: List[Any]) -> List[Tuple[str, float, Dict[str, float]]]:
        """Runs batched inference on multiple image frames."""
        pass

    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Returns metadata about the active model architecture, parameters, and device."""
        pass
