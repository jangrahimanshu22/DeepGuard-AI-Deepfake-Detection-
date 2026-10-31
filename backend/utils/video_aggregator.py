"""Video frame probability aggregation module.

Performs robust temporal aggregation over frame-level predictions.
"""

from typing import Any, Dict, List
import numpy as np


def aggregate_video_predictions(
    frame_results: List[Dict[str, Any]],
    suspicious_threshold: float = 0.65,
) -> Dict[str, Any]:
  """Aggregates frame-by-frame deepfake probabilities into a final forensic

  verdict.

  Args:
      frame_results: List of dicts with keys {"frame_index", "timestamp_sec",
        "probabilities": {"REAL": float, "FAKE": float}, "face_detected": bool}
      suspicious_threshold: Probability threshold above which a frame is flagged
        as suspicious.

  Returns:
      Dict with aggregated metrics and final prediction.
  """
  if not frame_results:
    return {
        "prediction": "WARNING",
        "confidence": 0.5,
        "probabilities": {"REAL": 0.5, "FAKE": 0.5},
        "frames_analyzed": 0,
        "suspicious_frames": 0,
        "suspicious_ratio": 0.0,
        "real_probability_mean": 0.5,
        "fake_probability_mean": 0.5,
        "median_fake_probability": 0.5,
        "max_fake_probability": 0.5,
        "consistency_score": 0.0,
        "risk_level": "MEDIUM",
        "frame_results": [],
    }

  fake_probs = [
      f["probabilities"]["FAKE"] for f in frame_results if "probabilities" in f
  ]
  real_probs = [
      f["probabilities"]["REAL"] for f in frame_results if "probabilities" in f
  ]

  if not fake_probs:
    fake_probs = [0.5]
    real_probs = [0.5]

  fake_mean = float(np.mean(fake_probs))
  real_mean = float(np.mean(real_probs))
  fake_median = float(np.median(fake_probs))
  fake_max = float(np.max(fake_probs))
  fake_std = float(np.std(fake_probs))

  # Count frames exceeding the suspicious threshold
  suspicious_count = sum(1 for p in fake_probs if p >= suspicious_threshold)
  total_analyzed = len(fake_probs)
  suspicious_ratio = suspicious_count / total_analyzed if total_analyzed > 0 else 0.0

  # Temporal consistency (lower standard deviation = higher consistency)
  consistency_score = max(0.0, min(1.0, 1.0 - (fake_std * 2)))

  # Weighted final score considering mean, median, peak burst, and suspicious ratio
  # If a video has a sustained burst of fake frames (e.g. face swap on 30% of frames),
  # it should be flagged as FAKE even if the other 70% was real background/transition!
  if suspicious_ratio >= 0.20 or (fake_max > 0.85 and suspicious_count >= 3):
    final_prediction = "FAKE"
    # Blend the suspicious frame confidence with average
    final_confidence = max(fake_mean, (fake_median + fake_max) / 2)
  elif fake_mean > 0.50:
    final_prediction = "FAKE"
    final_confidence = fake_mean
  else:
    final_prediction = "REAL"
    final_confidence = real_mean

  # Calculate risk level
  if final_prediction == "FAKE":
    risk_level = "HIGH" if final_confidence >= 0.80 or suspicious_ratio >= 0.30 else "MEDIUM"
  else:
    risk_level = "LOW" if final_confidence >= 0.80 and suspicious_ratio < 0.05 else "MEDIUM"

  return {
      "prediction": final_prediction,
      "confidence": round(final_confidence, 4),
      "probabilities": {
          "REAL": round(1.0 - final_confidence if final_prediction == "FAKE" else final_confidence, 4),
          "FAKE": round(final_confidence if final_prediction == "FAKE" else 1.0 - final_confidence, 4),
      },
      "frames_analyzed": total_analyzed,
      "suspicious_frames": suspicious_count,
      "suspicious_ratio": round(suspicious_ratio * 100, 1),
      "real_probability_mean": round(real_mean, 4),
      "fake_probability_mean": round(fake_mean, 4),
      "median_fake_probability": round(fake_median, 4),
      "max_fake_probability": round(fake_max, 4),
      "consistency_score": round(consistency_score, 2),
      "risk_level": risk_level,
      "frame_results": frame_results,
  }
