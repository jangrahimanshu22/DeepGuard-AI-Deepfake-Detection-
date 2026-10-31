import pytest
import numpy as np
from PIL import Image
from backend.forensics.biological_detector import BiologicalForensicsDetector
from backend.forensics.ela_service import ELAService
from backend.forensics.metadata_inspector import MetadataInspector
from backend.audio.audio_detector import AudioDeepfakeDetector

def test_biological_rppg_analysis():
    detector = BiologicalForensicsDetector(fps=30.0)
    # Generate 10 test frames
    frames = [np.random.randint(120, 180, (100, 100, 3), dtype=np.uint8) for _ in range(10)]
    res = detector.analyze_video_rppg(frames)
    assert "bpm" in res
    assert "cardiac_coherence_score" in res
    assert "pulse_waveform" in res
    assert isinstance(res["pulse_waveform"], list)
    assert len(res["pulse_waveform"]) >= 20

def test_ela_service():
    ela = ELAService(quality=90, scale=15)
    img = Image.new("RGB", (120, 120), color=(100, 150, 200))
    res = ela.analyze_image(img, face_box=(20, 20, 60, 60))
    assert "ela_image" in res
    assert res["ela_image"].startswith("data:image/png;base64,")
    assert "uniformity_score" in res
    assert 0 <= res["uniformity_score"] <= 100

def test_metadata_inspector_ai_signatures():
    inspector = MetadataInspector()
    # Mock byte payload with ComfyUI and prompt signatures
    mock_payload = b"test header... comfyui workflow graph ... prompt: high quality portrait"
    res = inspector.inspect_file(mock_payload)
    assert len(res["ai_signatures"]) > 0
    assert "ComfyUI Workflow Graph" in res["ai_signatures"]
    assert res["metadata_verdict"] == "SYNTHETIC_GENERATOR_TAGS"

def test_audio_detector_fallback():
    detector = AudioDeepfakeDetector()
    res = detector.analyze_video_audio("non_existent_file.mp4")
    assert res["has_audio"] is False
    assert res["verdict"] == "NO_AUDIO_TRACK"
