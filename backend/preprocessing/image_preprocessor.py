import io
import mimetypes
from typing import Tuple, List, Optional, Dict, Any
from PIL import Image, UnidentifiedImageError

import torchvision.transforms as transforms
import torch

from backend.preprocessing.face_detector import FaceDetector
from backend.config.settings import settings

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp"}

class CorruptedImageError(Exception):
    pass

class UnsupportedFormatError(Exception):
    pass

class ImagePreprocessor:
    """Centralized preprocessing pipeline for image validation, face extraction, and tensor preparation."""

    def __init__(self, target_size: int = 224):
        self.target_size = target_size
        self.face_detector = FaceDetector(
            strategy=settings.face_detection.strategy,
            margin=settings.face_detection.margin_percentage,
        )
        self.tensor_transform = transforms.Compose([
            transforms.Resize((target_size, target_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def validate_file(self, filename: str, content: bytes, content_type: Optional[str] = None) -> None:
        """Validates extension, MIME type, and file size."""
        # Extension check
        ext = ("." + filename.rsplit(".", 1)[-1]).lower() if "." in filename else ""
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise UnsupportedFormatError(f"Unsupported image extension '{ext}'. Allowed: {ALLOWED_IMAGE_EXTENSIONS}")

        # Size check
        max_bytes = settings.storage.upload_max_size_mb * 1024 * 1024
        if len(content) > max_bytes:
            raise ValueError(f"File size exceeds maximum allowed of {settings.storage.upload_max_size_mb} MB")

    def load_image(self, file_bytes: bytes) -> Image.Image:
        """Loads and verifies that image bytes are not corrupt."""
        try:
            image = Image.open(io.BytesIO(file_bytes))
            image.verify()  # Verify integrity
            # Re-open for operations
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            return image
        except (UnidentifiedImageError, OSError, Exception) as e:
            raise CorruptedImageError(f"Image file is corrupted or unreadable: {str(e)}")

    def preprocess_image(self, file_bytes: bytes, filename: str) -> Tuple[Image.Image, Image.Image, bool, List[int]]:
        """
        Complete image pipeline: validation -> load -> face crop.
        Returns: (original_pil, face_crop_pil, face_detected, bounding_box)
        """
        self.validate_file(filename, file_bytes)
        original_img = self.load_image(file_bytes)
        face_crop, face_detected, bbox = self.face_detector.extract_primary_face(original_img)
        return original_img, face_crop, face_detected, bbox

    def preprocess_image_multi(self, file_bytes: bytes, filename: str) -> Tuple[Image.Image, List[Dict[str, Any]]]:
        """
        Extracts all faces for multi-face batch forensic inspection.
        Returns: (original_pil, list_of_face_dicts)
        """
        self.validate_file(filename, file_bytes)
        original_img = self.load_image(file_bytes)
        faces = self.face_detector.extract_all_faces(original_img)
        return original_img, faces

    def prepare_tensor(self, image_pil: Image.Image) -> torch.Tensor:
        """Transforms PIL image to normalized model input tensor."""
        return self.tensor_transform(image_pil).unsqueeze(0)

