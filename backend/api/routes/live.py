import io
import time
import base64
import threading
import cv2
import numpy as np
import torch
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image

from backend.models.detector_factory import get_detector
from backend.preprocessing.face_detector import FaceDetector
from backend.utils.label_mapping import calculate_risk_level

router = APIRouter(prefix="/api/live", tags=["Real-time Live Webcam Guard"])

face_detector = FaceDetector(strategy="largest_face", margin=0.45)
mps_inference_lock = threading.Lock()

# In-memory sliding window for rPPG temporal heart rate and score smoothing per live session
session_rppg_buffers: Dict[str, List[float]] = {}
session_live_scores: Dict[str, float] = {}

class LiveFrameRequest(BaseModel):
    session_id: str = "default_session"
    frame_base64: str  # Data URI or raw base64 string

class LiveFrameResponse(BaseModel):
    session_id: str
    face_detected: bool
    bounding_box: List[int]
    prediction: str  # "REAL" or "FAKE"
    confidence: float
    fake_probability: float
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    bpm: float
    pulse_waveform: List[float]
    alert_level: str  # "SAFE", "WARNING", "CRITICAL_INTRUSION"
    latency_ms: int

@router.post("/scan-frame", response_model=LiveFrameResponse)
def scan_live_frame(req: LiveFrameRequest):
    """
    Sub-100ms ultra-low latency real-time webcam frame forensic inspection.
    Analyzes live face ROI with ViT FaceForensics specialist, applies temporal smoothing,
    and fuses rolling rPPG pulse for biological liveness confirmation.
    """
    t0 = time.time()
    raw_b64 = req.frame_base64
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]

    try:
        frame_bytes = base64.b64decode(raw_b64)
        image_pil = Image.open(io.BytesIO(frame_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image base64 data.")

    # 1. Face detection with anatomical headshot padding (margin=0.45)
    face_crop, face_detected, bbox = face_detector.extract_primary_face(image_pil)
    target_face = face_crop if face_detected else image_pil
    
    detector = get_detector()
    
    # 2. Multi-stream real-time forensic inference (FaceSwap + AI vs Human Classifier)
    fake_fs = 0.0
    fake_ai = 0.0
    with mps_inference_lock:
        with torch.inference_mode():
            if hasattr(detector, "faceswap_detector"):
                _, _, p_fs = detector.faceswap_detector.predict_image(target_face)
                fake_fs = p_fs.get("FAKE", 0.0)

            if hasattr(detector, "ai_gen_detector"):
                # Evaluate both face crop and full frame to detect synthetic AI avatars and phone screen replays
                _, _, p_ai_crop = detector.ai_gen_detector.predict_image(target_face)
                _, _, p_ai_full = detector.ai_gen_detector.predict_image(image_pil)
                fake_ai = max(p_ai_crop.get("FAKE", 0.0), p_ai_full.get("FAKE", 0.0))
            elif not hasattr(detector, "faceswap_detector"):
                _, _, p_img = detector.predict_image(target_face)
                fake_fs = p_img.get("FAKE", 0.0)

            fake_prob_raw = max(fake_fs, fake_ai)

            if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                torch.mps.synchronize()

    # 3. AI Avatar, 3D Anime Stylization & Screen Replay Spoof Inspection:
    # Stylized 3D anime/CGI avatars (Disney/Pixar/Midjourney) exhibit oversized inked eye contours
    # and porcelain quantized skin texture, whereas real humans have biological micro-pores and proportions.
    is_stylized_avatar = False
    if face_detected:
        target_np = np.array(target_face)
        th, tw = target_np.shape[:2]
        tgray = cv2.cvtColor(target_np, cv2.COLOR_RGB2GRAY)
        
        # Stylized eye-edge density
        eye_zone = tgray[int(th * 0.25):int(th * 0.52), int(tw * 0.15):int(tw * 0.85)]
        eye_edges = cv2.Canny(eye_zone, 60, 160)
        eye_edge_density_pct = (np.count_nonzero(eye_edges) / float(eye_zone.size)) * 100.0 if eye_zone.size > 0 else 0.0

        # Forehead skin color quantization / porcelain smoothness
        forehead_zone = tgray[int(th * 0.12):int(th * 0.26), int(tw * 0.30):int(tw * 0.70)]
        small_forehead = cv2.resize(forehead_zone, (32, 32)) if forehead_zone.size > 0 else tgray
        hist, _ = np.histogram(small_forehead, bins=32, range=(0, 256))
        p = hist / (hist.sum() + 1e-5)
        hist_entropy = -np.sum(p * np.log2(p + 1e-5))

        is_stylized_avatar = (eye_edge_density_pct >= 7.0) or (hist_entropy < 3.2 and eye_edge_density_pct >= 5.5) or (fake_ai >= 0.75)
        if is_stylized_avatar:
            fake_prob_raw = max(fake_prob_raw, 0.985)

    # 4. Rolling temporal exponential moving average (EMA) to eliminate single-frame webcam noise
    session_id = req.session_id
    if session_id not in session_live_scores:
        session_live_scores[session_id] = fake_prob_raw
    else:
        session_live_scores[session_id] = 0.65 * fake_prob_raw + 0.35 * session_live_scores[session_id]

    fake_prob = round(session_live_scores[session_id], 4)

    # 5. Rolling rPPG pulse calculation
    if session_id not in session_rppg_buffers:
        session_rppg_buffers[session_id] = []

    buf = session_rppg_buffers[session_id]
    if face_detected:
        face_np = np.array(face_crop)
        h, w = face_np.shape[:2]
        forehead = face_np[int(h * 0.15):int(h * 0.35), int(w * 0.3):int(w * 0.7)]
        g_val = float(np.mean(forehead[:, :, 1])) if forehead.size > 0 else 128.0
        buf.append(g_val)
        if len(buf) > 40:
            buf.pop(0)

    # Calculate BPM if buffer has enough points
    bpm = 72.0
    waveform = [round(float(np.sin(i * 0.6)), 2) for i in range(20)]
    if len(buf) >= 15:
        sig = np.array(buf)
        sig = sig - np.mean(sig)
        std_val = np.std(sig)
        if std_val > 1e-4:
            sig = sig / std_val
        fft = np.abs(np.fft.rfft(sig))
        freqs = np.fft.rfftfreq(len(sig), d=1.0/10.0)  # assume ~10 fps polling
        cardiac_mask = (freqs >= 0.8) & (freqs <= 2.5)
        if np.any(cardiac_mask) and np.max(fft[cardiac_mask]) > 0:
            peak_freq = freqs[cardiac_mask][np.argmax(fft[cardiac_mask])]
            bpm = round(float(peak_freq * 60.0), 1)
        waveform = [round(float(v), 3) for v in sig[-20:]]

    # 6. Physiological Biological Liveness Fusion:
    # ONLY apply biological liveness bonus if genuine human cardiac pulse is verified
    # AND neither FaceSwap nor Generative AI detected synthetic tampering!
    if face_detected and len(buf) >= 15 and 55.0 <= bpm <= 120.0:
        if fake_prob < 0.40 and fake_ai < 0.30 and fake_fs < 0.30 and not is_stylized_avatar:
            fake_prob = min(fake_prob, 0.05)

    verdict = "FAKE" if fake_prob >= 0.50 else "REAL"
    confidence = fake_prob if verdict == "FAKE" else (1.0 - fake_prob)
    confidence = round(confidence, 4)
    risk_level = calculate_risk_level(fake_prob)

    # 7. Alert triage
    if verdict == "FAKE" and fake_prob >= 0.75:
        alert_level = "CRITICAL_INTRUSION"
    elif verdict == "FAKE" or fake_prob >= 0.50:
        alert_level = "WARNING"
    else:
        alert_level = "SAFE"

    latency_ms = int((time.time() - t0) * 1000)

    return LiveFrameResponse(
        session_id=session_id,
        face_detected=face_detected,
        bounding_box=bbox,
        prediction=verdict,
        confidence=confidence,
        fake_probability=fake_prob,
        risk_level=risk_level,
        bpm=bpm,
        pulse_waveform=waveform,
        alert_level=alert_level,
        latency_ms=latency_ms
    )

@router.delete("/session/{session_id}")
def reset_live_session(session_id: str):
    """Cleans up sliding window buffers for a terminated webcam session."""
    if session_id in session_rppg_buffers:
        del session_rppg_buffers[session_id]
    if session_id in session_live_scores:
        del session_live_scores[session_id]
    return {"status": "cleared", "session_id": session_id}
