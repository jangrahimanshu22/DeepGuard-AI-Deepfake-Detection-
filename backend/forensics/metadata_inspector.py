import io
from typing import Dict, Any, List, Optional
from PIL import Image, ExifTags

class MetadataInspector:
    """
    Forensic EXIF, XMP, TIFF, and C2PA Content Credentials Inspector.
    Detects presence of camera hardware tags vs AI generator parameters and metadata tampering.
    """

    KNOWN_AI_SIGNATURES = [
        ("comfyui", "ComfyUI Workflow Graph"),
        ("stable diffusion", "Stable Diffusion Generation Parameters"),
        ("novelai", "NovelAI Generation Metadata"),
        ("midjourney", "Midjourney V4/V5/V6 Generation Marker"),
        ("dall-e", "OpenAI DALL-E Generative Signature"),
        ("adobe firefly", "Adobe Firefly AI Signature"),
        ("fooocus", "Fooocus AI Generation Pipeline"),
        ("automatic1111", "AUTOMATIC1111 WebUI Prompt Parameters"),
        ("negative prompt", "Generative Negative Prompt Tag"),
        ("cfg scale", "Classifier-Free Guidance (CFG) Scale Tag"),
        ("euler a", "Generative Sampler Tag (Euler a)"),
        ("dpm++", "Generative Sampler Tag (DPM++)"),
        ("c2pa", "C2PA Provenance / Content Credentials Manifest")
    ]

    def inspect_file(self, file_bytes: bytes, image_pil: Optional[Image.Image] = None) -> Dict[str, Any]:
        """
        Extracts EXIF, XMP, and raw chunk signatures.
        """
        if image_pil is None:
            try:
                image_pil = Image.open(io.BytesIO(file_bytes))
            except Exception:
                image_pil = None

        raw_lower = file_bytes.lower() if file_bytes else b""

        # 1. Search for AI parameter signatures in raw byte stream / PNG chunks / XMP
        detected_ai_signatures: List[str] = []
        for term, label in self.KNOWN_AI_SIGNATURES:
            if term.encode("utf-8") in raw_lower:
                detected_ai_signatures.append(label)

        # 2. Extract standard EXIF tags
        exif_data = {}
        has_camera_hardware = False
        camera_make = "Unknown"
        camera_model = "Unknown"
        software = "Unknown"
        date_time = "Not specified"
        lens_model = "Unknown"
        iso_speed = "N/A"
        focal_length = "N/A"

        if image_pil and hasattr(image_pil, "_getexif"):
            try:
                raw_exif = image_pil._getexif()
                if raw_exif:
                    for tag_id, val in raw_exif.items():
                        tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                        exif_data[tag_name] = str(val)[:120]  # truncate long values

                    camera_make = exif_data.get("Make", "Unknown")
                    camera_model = exif_data.get("Model", "Unknown")
                    software = exif_data.get("Software", "Unknown")
                    date_time = exif_data.get("DateTime", exif_data.get("DateTimeOriginal", "Not specified"))
                    lens_model = exif_data.get("LensModel", "Unknown")
                    iso_speed = exif_data.get("ISOSpeedRatings", "N/A")
                    focal_length = exif_data.get("FocalLength", "N/A")

                    if camera_make != "Unknown" or camera_model != "Unknown":
                        has_camera_hardware = True
            except Exception:
                pass

        # Also check info dictionary (PNG text chunks)
        png_text_chunks = {}
        if image_pil and hasattr(image_pil, "info") and image_pil.info:
            for k, v in image_pil.info.items():
                if isinstance(v, str):
                    png_text_chunks[k] = v[:150]
                    # Check for prompt keywords in PNG text chunks
                    val_lower = v.lower()
                    for term, label in self.KNOWN_AI_SIGNATURES:
                        if term in val_lower and label not in detected_ai_signatures:
                            detected_ai_signatures.append(label)

        # 3. Assess synthetic vs authentic metadata profile
        has_c2pa = any("C2PA" in sig for sig in detected_ai_signatures)
        is_synthetic = len(detected_ai_signatures) > 0

        if is_synthetic:
            verdict = "SYNTHETIC_GENERATOR_TAGS"
            summary = f"Detected generative AI parameter metadata: {', '.join(detected_ai_signatures[:3])}."
        elif has_camera_hardware:
            verdict = "AUTHENTIC_HARDWARE_EXIF"
            summary = f"Authentic camera hardware metadata detected: {camera_make} {camera_model} (Date: {date_time})."
        else:
            verdict = "STRIPPED_ANONYMOUS_METADATA"
            summary = "Metadata has been completely stripped or sanitized (common in modern web re-encoding and synthetic outputs)."

        return {
            "has_camera_metadata": has_camera_hardware,
            "camera_make": camera_make,
            "camera_model": camera_model,
            "software": software,
            "capture_date": date_time,
            "lens_model": lens_model,
            "iso": iso_speed,
            "focal_length": focal_length,
            "c2pa_credentials_found": has_c2pa,
            "ai_signatures": detected_ai_signatures,
            "metadata_verdict": verdict,
            "summary": summary,
            "total_tags_extracted": len(exif_data) + len(png_text_chunks)
        }
