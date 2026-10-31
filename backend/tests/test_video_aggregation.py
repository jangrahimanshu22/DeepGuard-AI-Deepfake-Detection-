import pytest
from backend.utils.video_aggregator import aggregate_video_predictions

def test_video_aggregation_mostly_real():
    frame_results = [
        {"frame_index": i, "probabilities": {"REAL": 0.95, "FAKE": 0.05}}
        for i in range(30)
    ]
    res = aggregate_video_predictions(frame_results, suspicious_threshold=0.65)
    assert res["prediction"] == "REAL"
    assert res["confidence"] >= 0.90
    assert res["suspicious_frames"] == 0
    assert res["risk_level"] == "LOW"

def test_video_aggregation_burst_face_swap():
    """Verify that a video with a burst of manipulated frames (e.g. 10 of 30) is flagged as FAKE."""
    frame_results = []
    for i in range(30):
        if 10 <= i < 20:
            frame_results.append({"frame_index": i, "probabilities": {"REAL": 0.10, "FAKE": 0.90}})
        else:
            frame_results.append({"frame_index": i, "probabilities": {"REAL": 0.85, "FAKE": 0.15}})

    res = aggregate_video_predictions(frame_results, suspicious_threshold=0.65)
    assert res["prediction"] == "FAKE"
    assert res["suspicious_frames"] == 10
    assert res["suspicious_ratio"] == 33.3
    assert res["risk_level"] == "HIGH"
