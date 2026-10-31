"""Label mapping resolution and orientation safety utilities.

Guarantees that model raw outputs are never inverted by class index
assumptions.
"""

from typing import Any, Dict, List, Tuple


class AmbiguousLabelMappingError(Exception):
  """Raised when a model's label configuration cannot be interpreted safely."""

  pass


REAL_SYNONYMS = {"REAL", "AUTHENTIC", "ORIGINAL", "BONAFIDE", "PRISTINE", "HUMAN", "HUM", "REALISM"}
FAKE_SYNONYMS = {
    "FAKE",
    "MANIPULATED",
    "SYNTHETIC",
    "DEEPFAKE",
    "GENERATED",
    "ALTERED",
    "DF",
    "ARTIFICIAL",
    "AI",
    "DIFFUSION",
}


def normalize_label(raw_label: Any) -> str:
  """Normalizes raw label string into uppercase authoritative 'REAL' or 'FAKE'.

  Fails loudly if the label cannot be categorized.
  """
  clean = str(raw_label).strip().upper()

  # Exact match first
  if clean in REAL_SYNONYMS:
    return "REAL"
  if clean in FAKE_SYNONYMS:
    return "FAKE"

  # Check substring or split matches
  for synonym in REAL_SYNONYMS:
    if synonym == clean or synonym in clean.split("_") or synonym in clean:
      return "REAL"

  for synonym in FAKE_SYNONYMS:
    if synonym in clean.split("_") or synonym in clean:
      return "FAKE"

  raise AmbiguousLabelMappingError(
      f"Cannot determine REAL/FAKE semantics for raw label: '{raw_label}'. "
      f"Supported real synonyms: {REAL_SYNONYMS}, fake synonyms:"
      f" {FAKE_SYNONYMS}"
  )


def resolve_model_label_mapping(
    id2label: Dict[Any, Any],
) -> Dict[str, int]:
  """Resolves an arbitrary id2label dictionary into explicit index mappings for

  REAL and FAKE.

  Returns:
      Dict with keys {"REAL": int_idx, "FAKE": int_idx}

  Raises:
      AmbiguousLabelMappingError: If mapping does not contain both REAL and FAKE
      or is ambiguous.
  """
  if not id2label or not isinstance(id2label, dict):
    raise AmbiguousLabelMappingError(
        f"Invalid or missing id2label dictionary: {id2label}"
    )

  resolved: Dict[str, int] = {}

  for raw_idx, raw_name in id2label.items():
    try:
      idx = int(raw_idx)
    except (ValueError, TypeError):
      raise AmbiguousLabelMappingError(
          f"Non-integer class index encountered: {raw_idx}"
      )

    normalized = normalize_label(raw_name)

    if normalized in resolved:
      raise AmbiguousLabelMappingError(
          f"Duplicate mapping for label category '{normalized}'. "
          f"Both index {resolved[normalized]} and {idx} mapped to"
          f" {normalized}."
      )

    resolved[normalized] = idx

  if "REAL" not in resolved or "FAKE" not in resolved:
    raise AmbiguousLabelMappingError(
        f"Incomplete classification mapping. Extracted labels: {list(resolved.keys())}. "
        f"Both 'REAL' and 'FAKE' categories are required."
    )

  return resolved


def normalize_probabilities(
    probs: List[float], resolved_mapping: Dict[str, int]
) -> Tuple[str, float, Dict[str, float]]:
  """Converts a list or tensor of class probabilities into normalized REAL/FAKE

  metrics.

  Returns:
      (predicted_verdict, confidence_0_to_1, { "REAL": prob, "FAKE": prob })
  """
  real_idx = resolved_mapping["REAL"]
  fake_idx = resolved_mapping["FAKE"]

  real_prob = float(probs[real_idx])
  fake_prob = float(probs[fake_idx])

  # Normalize sum to 1.0 in case of rounding
  total = real_prob + fake_prob
  if total > 0:
    real_prob = real_prob / total
    fake_prob = fake_prob / total

  if fake_prob >= 0.5:
    verdict = "FAKE"
    confidence = fake_prob
  else:
    verdict = "REAL"
    confidence = real_prob

  return verdict, confidence, {"REAL": real_prob, "FAKE": fake_prob}


def calculate_risk_level(fake_prob: float) -> str:
  """Calculates forensic risk level based on fake probability thresholds."""
  if fake_prob > 0.70:
    return "HIGH"
  elif fake_prob >= 0.30:
    return "MEDIUM"
  else:
    return "LOW"
