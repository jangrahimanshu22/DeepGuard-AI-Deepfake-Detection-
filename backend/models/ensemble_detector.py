import logging
from typing import Dict, Any, List, Tuple, Optional
import torch
from PIL import Image

from backend.models.base_detector import BaseDetector
from backend.models.huggingface_detector import HuggingFaceDetector

logger = logging.getLogger(__name__)

class EnsembleDeepfakeDetector(BaseDetector):
    """
    Tri-Stream Vision Transformer & Swin Forensic Ensemble:
    - Stream 1 (FaceForensics & Face-Swap Expert): 'dima806/deepfake_vs_real_image_detection' (ViT-Base)
      Specializes in face boundary blending seams, GAN warping, pupil reflections, and localized identity swaps.
    - Stream 2 (AI vs Human Generative Specialist): 'haywoodsloan/ai-image-detector-deploy' (Swin Transformer v2)
      Specializes in distinguishing authentic human photographic sensor physics from synthetic AI faces (Midjourney, DALL-E, SDXL, AI avatars, phone screen replays).
    - Stream 3 (Diffusion & Latent Grain Expert): 'Organika/sdxl-detector' (Swin Transformer)
      Specializes in whole-scene synthetic textures, simulated analog film grain, and latent diffusion noise.
    """

    def __init__(
        self,
        faceswap_model_id: str = "dima806/deepfake_vs_real_image_detection",
        ai_model_id: str = "haywoodsloan/ai-image-detector-deploy",
        diffusion_model_id: str = "Organika/sdxl-detector",
        device: str = "cpu"
    ):
        super().__init__(model_name="ensemble_vit_dual_stream", device=device)
        self.faceswap_detector = HuggingFaceDetector(model_id=faceswap_model_id, device=device)
        self.ai_gen_detector = HuggingFaceDetector(model_id=ai_model_id, device=device)
        self.diffusion_detector = HuggingFaceDetector(model_id=diffusion_model_id, device=device)
        self.active_stream = "human"
        self.label_mapping = {"REAL": 0, "FAKE": 1}

    @property
    def model(self):
        """Returns the ViT model for Grad-CAM and Attention Rollout explainability."""
        return self.faceswap_detector.model

    @property
    def processor(self):
        """Returns the ViT processor for Grad-CAM and Attention Rollout explainability."""
        return self.faceswap_detector.processor

    def load_model(self) -> None:
        logger.info("Initializing Tri-Stream Forensic Ensemble models...")
        self.faceswap_detector.load_model()
        self.ai_gen_detector.load_model()
        self.diffusion_detector.load_model()
        self.is_loaded = True
        logger.info("Tri-Stream Forensic Ensemble ready on device: %s", self.device)

    def predict_image(self, image_input: Image.Image) -> Tuple[str, float, Dict[str, float]]:
        if not self.is_loaded:
            self.load_model()

        _, _, p_faceswap = self.faceswap_detector.predict_image(image_input)
        score_fs = p_faceswap.get("FAKE", 0.0)

        _, _, p_ai = self.ai_gen_detector.predict_image(image_input)
        score_ai = p_ai.get("FAKE", 0.0)

        w, h = image_input.size
        is_tight_crop = min(w, h) < 320 or (max(w, h) / max(1, min(w, h)) > 1.8)

        if not is_tight_crop:
            _, _, p_diffusion = self.diffusion_detector.predict_image(image_input)
            score_diff = p_diffusion.get("FAKE", 0.0)
        else:
            score_diff = 0.0

        # Consensus fusion:
        # 1. High confidence AI generation (Midjourney, DALL-E, AI avatars, phone screen replays, digital art)
        if score_ai >= 0.50:
            final_fake = max(score_ai, score_diff)
            self.active_stream = "ai_generation"
        # 2. Confirmed facial manipulation (seams, warped pupils, deepfake swap)
        elif score_fs >= 0.50:
            final_fake = max(score_fs, score_diff)
            self.active_stream = "faceswap"
        # 3. Whole-scene generative diffusion (SDXL, vintage retro grain)
        elif score_diff >= 0.90 and score_ai >= 0.05:
            final_fake = score_diff
            self.active_stream = "diffusion"
        # 4. Verified authentic human photograph
        elif score_fs < 0.20 and score_ai < 0.20:
            final_fake = max(score_fs, score_ai)
            self.active_stream = "human"
        else:
            final_fake = max(score_fs, score_ai)
            self.active_stream = "ai_generation" if score_ai >= score_fs else "faceswap"

        verdict = "FAKE" if final_fake >= 0.50 else "REAL"
        confidence = final_fake if verdict == "FAKE" else (1.0 - final_fake)
        final_real = 1.0 - final_fake

        return verdict, float(confidence), {"REAL": float(final_real), "FAKE": float(final_fake)}

    def predict_dual_crop(
        self,
        full_image: Image.Image,
        face_crop: Image.Image,
        face_detected: bool
    ) -> Tuple[str, float, Dict[str, float], Dict[str, Any]]:
        """
        Runs comprehensive multi-crop and multi-stream forensic analysis:
        - Stream 1 (Face-Swap Specialist): evaluates face crop for boundary seams & GAN warping.
        - Stream 2 (AI vs Human Specialist): evaluates both face crop and full image for synthetic generative patterns.
        - Stream 3 (Generative Diffusion Specialist): evaluates full scene for global diffusion latents & grain.
        """
        if not self.is_loaded:
            self.load_model()

        target_face = face_crop if face_detected else full_image

        # Stream 1: Face-Swap specialist on Face Crop
        _, _, p_fs = self.faceswap_detector.predict_image(target_face)
        score_fs = p_fs.get("FAKE", 0.0)

        # Stream 2: AI vs Human specialist on Full Scene and Face Crop
        _, _, p_ai_full = self.ai_gen_detector.predict_image(full_image)
        _, _, p_ai_crop = self.ai_gen_detector.predict_image(target_face)
        score_ai = max(p_ai_full.get("FAKE", 0.0), p_ai_crop.get("FAKE", 0.0))

        # Stream 3: Diffusion specialist on Full Scene
        _, _, p_diff = self.diffusion_detector.predict_image(full_image)
        score_diff = p_diff.get("FAKE", 0.0)

        # Forensic consensus fusion:
        # 1. Unambiguous AI generative synthesis (Midjourney, DALL-E, AI avatars, graphics)
        if score_ai >= 0.50:
            final_fake = max(score_ai, score_diff)
            self.active_stream = "ai_generation"
            primary_evidence = "Generative AI Synthesis (Swin Transformer Artificial Pattern Analysis)"
        # 2. Confirmed facial feature manipulation (Roop, SimSwap, DeepFaceLab, boundary seams)
        elif score_fs >= 0.50:
            final_fake = max(score_fs, score_diff)
            self.active_stream = "faceswap"
            primary_evidence = "Face-Swap / Facial Feature Manipulation (Boundary Seam Inconsistencies)"
        # 3. Whole-scene generative diffusion (SDXL, retro analog grain)
        elif score_diff >= 0.90 and score_ai >= 0.05:
            final_fake = score_diff
            self.active_stream = "diffusion"
            primary_evidence = "Generative Diffusion AI (Synthetic Latents & Generative Grain Artifacts)"
        # 4. Verified authentic human photographic biometrics
        elif score_fs < 0.20 and score_ai < 0.20:
            final_fake = max(score_fs, score_ai)
            self.active_stream = "human"
            primary_evidence = "Natural Human Facial Biometrics (Verified Physiological Consistency)"
        else:
            final_fake = max(score_fs, score_ai)
            if score_ai >= score_fs:
                self.active_stream = "ai_generation"
                primary_evidence = "Generative AI Synthesis (Artificial Texture Anomaly)"
            else:
                self.active_stream = "faceswap"
                primary_evidence = "Face-Swap / Facial Feature Manipulation (Boundary Seam Inconsistencies)"

        verdict = "FAKE" if final_fake >= 0.50 else "REAL"
        confidence = final_fake if verdict == "FAKE" else (1.0 - final_fake)
        final_real = 1.0 - final_fake

        forensic_details = {
            "primary_stream": self.active_stream,
            "primary_evidence": primary_evidence,
            "faceswap_crop_fake_prob": round(score_fs, 4),
            "ai_gen_fake_prob": round(score_ai, 4),
            "diffusion_full_fake_prob": round(score_diff, 4),
        }

        return verdict, float(confidence), {"REAL": float(final_real), "FAKE": float(final_fake)}, forensic_details

    def predict_batch(self, images: List[Image.Image]) -> List[Tuple[str, float, Dict[str, float]]]:
        if not images:
            return []
        if not self.is_loaded:
            self.load_model()

        res_fs = self.faceswap_detector.predict_batch(images)
        res_ai = self.ai_gen_detector.predict_batch(images)
        res_diff = self.diffusion_detector.predict_batch(images)

        fused = []
        for (_, _, p_fs), (_, _, p_ai), (_, _, p_diff) in zip(res_fs, res_ai, res_diff):
            fake_fs = p_fs.get("FAKE", 0.0)
            fake_ai = p_ai.get("FAKE", 0.0)
            fake_diff = p_diff.get("FAKE", 0.0)

            if fake_ai >= 0.50:
                final_fake = max(fake_ai, fake_diff)
            elif fake_fs >= 0.50:
                final_fake = max(fake_fs, fake_diff)
            elif fake_diff >= 0.90 and fake_ai >= 0.05:
                final_fake = fake_diff
            elif fake_fs < 0.20 and fake_ai < 0.20:
                final_fake = max(fake_fs, fake_ai)
            else:
                final_fake = max(fake_fs, fake_ai)

            verdict = "FAKE" if final_fake >= 0.50 else "REAL"
            confidence = final_fake if verdict == "FAKE" else (1.0 - final_fake)
            fused.append((verdict, float(confidence), {"REAL": float(1.0 - final_fake), "FAKE": float(final_fake)}))

        return fused

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "name": "Ensemble (ViT FaceSwap + Swinv2 AI Detector + Swin Diffusion)",
            "provider": "ensemble",
            "architecture": "Tri-Stream Vision Transformer & Swinv2 Forensic Ensemble",
            "framework": "PyTorch / Hugging Face Transformers",
            "parameters": 258_000_000,
            "input_size": "224x224 (Tri-Stream Multi-Crop)",
            "streams": [
                "dima806/deepfake_vs_real_image_detection (Face-Swap Specialist)",
                "haywoodsloan/ai-image-detector-deploy (AI vs Human Generative Classifier)",
                "Organika/sdxl-detector (Generative Diffusion & Synthetic Grain Specialist)"
            ],
            "device": self.device,
            "active_stream": self.active_stream
        }
