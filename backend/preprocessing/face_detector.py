import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from PIL import Image

class FaceDetector:
    """OpenCV-based face detection module with margin padding and multi-face strategies."""

    def __init__(self, strategy: str = "largest_face", margin: float = 0.45):
        self.strategy = strategy
        self.margin = margin
        
        # Load standard OpenCV Haar Cascade
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.cascade = cv2.CascadeClassifier(cascade_path)

    def detect_faces(self, image_np: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detects faces in a BGR or RGB numpy image.
        Returns list of dicts: {"box": (x, y, w, h), "confidence": float, "crop": PIL.Image}
        """
        if len(image_np.shape) == 3 and image_np.shape[2] == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_np

        raw_faces = self.cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(60, 60),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        height, width = image_np.shape[:2]
        faces = []

        for (x, y, w, h) in raw_faces:
            # Apply proportional margin expansion for complete anatomical headshot coverage
            pad_side = int(w * self.margin)
            pad_top = int(h * (self.margin * 1.15))
            pad_bottom = int(h * self.margin)

            x1 = max(0, x - pad_side)
            y1 = max(0, y - pad_top)
            x2 = min(width, x + w + pad_side)
            y2 = min(height, y + h + pad_bottom)

            crop_np = image_np[y1:y2, x1:x2]
            crop_pil = Image.fromarray(crop_np)

            faces.append({
                "box": [int(x1), int(y1), int(x2 - x1), int(y2 - y1)],
                "area": int((x2 - x1) * (y2 - y1)),
                "confidence": 0.95,
                "crop": crop_pil,
            })

        # Sort based on strategy
        if self.strategy == "largest_face":
            faces.sort(key=lambda f: f["area"], reverse=True)

        return faces

    def extract_primary_face(self, image_pil: Image.Image) -> Tuple[Image.Image, bool, List[int]]:
        """
        Extracts the primary face for deepfake analysis.
        If no face is detected, checks if the image itself is an isolated face portrait.
        Returns: (face_crop_pil, face_detected, bounding_box)
        """
        img_np = np.array(image_pil)
        faces = self.detect_faces(img_np)

        if faces:
            primary = faces[0]
            return primary["crop"], True, primary["box"]

        # If no face detected by cascade, use full image as fallback face candidate
        w, h = image_pil.size
        return image_pil, False, [0, 0, w, h]

    def extract_all_faces(self, image_pil: Image.Image) -> List[Dict[str, Any]]:
        """
        Detects and extracts all faces from an image.
        Returns list of face dictionaries with boxes, areas, and crops.
        """
        img_np = np.array(image_pil)
        return self.detect_faces(img_np)

