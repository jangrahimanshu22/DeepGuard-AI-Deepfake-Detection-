import io
import base64
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
from typing import Dict, Any, Tuple

class ELAService:
    """
    Error Level Analysis (ELA) Forensic Engine.
    Identifies inconsistencies in JPEG compression levels across an image to detect
    digital splicing, face-swapping, diffusion seams, and localized tampering.
    """

    def __init__(self, quality: int = 90, scale: int = 15):
        self.quality = quality
        self.scale = scale

    def analyze_image(self, image_pil: Image.Image, face_box: Tuple[int, int, int, int] = None) -> Dict[str, Any]:
        """
        Executes Error Level Analysis on a PIL image.
        Returns:
            - ela_image_base64: Base64 data URI of the amplified ELA difference image.
            - uniformity_score: Float (0-100), higher means consistent compression (authentic).
            - max_difference: Maximum pixel error observed.
            - average_difference: Mean error level across all pixels.
            - tampering_detected: Boolean indicator.
            - face_bg_discrepancy: Ratio of error in face ROI vs background (high ratio = face tampering).
        """
        # Ensure RGB mode
        original_rgb = image_pil.convert("RGB")
        w, h = original_rgb.size

        # 1. Compress to in-memory JPEG
        buffer = io.BytesIO()
        original_rgb.save(buffer, format="JPEG", quality=self.quality)
        buffer.seek(0)
        recompressed = Image.open(buffer)

        # 2. Compute absolute difference
        diff_img = ImageChops.difference(original_rgb, recompressed)

        # 3. Calculate statistics from raw difference
        diff_np = np.array(diff_img, dtype=np.float32)
        mean_diff = float(np.mean(diff_np))
        max_diff = float(np.max(diff_np))
        std_diff = float(np.std(diff_np))

        # 4. Amplify difference for visual inspection
        # Dynamic scale based on extrema to prevent over/under exposure
        extrema = diff_img.getextrema()
        max_val = max([ex[1] for ex in extrema]) if extrema else 1
        scale_factor = 255.0 / max_val if max_val > 0 else 1.0
        # Use balanced scale factor
        effective_scale = min(self.scale, max(5.0, scale_factor * 0.7))
        
        enhanced_diff = ImageEnhance.Brightness(diff_img).enhance(effective_scale)

        # Encode amplified ELA image to Base64 PNG
        out_buf = io.BytesIO()
        enhanced_diff.save(out_buf, format="PNG")
        out_buf.seek(0)
        ela_base64 = f"data:image/png;base64,{base64.b64encode(out_buf.getvalue()).decode('utf-8')}"

        # 5. Face ROI vs Background Discrepancy (if bounding box provided)
        face_bg_discrepancy = 1.0
        if face_box and len(face_box) == 4:
            fx, fy, fw, fh = face_box
            fx2 = min(w, fx + fw)
            fy2 = min(h, fy + fh)
            if fw > 10 and fh > 10 and fy2 > fy and fx2 > fx:
                face_crop_diff = diff_np[fy:fy2, fx:fx2]
                face_mean = float(np.mean(face_crop_diff)) if face_crop_diff.size > 0 else mean_diff
                bg_mask = np.ones((h, w), dtype=bool)
                bg_mask[fy:fy2, fx:fx2] = False
                bg_diff = diff_np[bg_mask]
                bg_mean = float(np.mean(bg_diff)) if bg_diff.size > 0 else mean_diff
                face_bg_discrepancy = round(face_mean / (bg_mean + 1e-5), 2)

        # Uniformity calculation (Higher standard deviation in error = higher likelihood of splicing)
        # Uniform natural photos typically have standard deviation < 6.0 in raw error
        uniformity_score = max(5.0, min(100.0, 100.0 - (std_diff * 7.5)))
        tampering_detected = (uniformity_score < 50.0) or (face_bg_discrepancy > 1.85)

        return {
            "ela_image": ela_base64,
            "uniformity_score": round(uniformity_score, 1),
            "average_difference": round(mean_diff, 2),
            "max_difference": round(max_diff, 2),
            "face_bg_discrepancy": face_bg_discrepancy,
            "tampering_detected": tampering_detected,
            "quality_level": self.quality,
            "summary": (
                "Compression error levels are homogeneous across the entire matrix, indicating consistent photographic exposure."
                if not tampering_detected
                else f"High error-level variance detected (Discrepancy: {face_bg_discrepancy}x), signifying non-uniform re-compression typical of inserted deepfake facial masks."
            )
        }
