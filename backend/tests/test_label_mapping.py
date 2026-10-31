import pytest
from backend.utils.label_mapping import (
    resolve_model_label_mapping,
    normalize_probabilities,
    normalize_label,
    AmbiguousLabelMappingError,
)

def test_standard_label_mapping_resolution():
    """Test Model A: 0 -> REAL, 1 -> FAKE"""
    id2label = {"0": "REAL", "1": "FAKE"}
    resolved = resolve_model_label_mapping(id2label)
    assert resolved == {"REAL": 0, "FAKE": 1}

def test_inverted_label_mapping_resolution():
    """Test Model B: 0 -> FAKE, 1 -> REAL"""
    id2label = {"0": "FAKE", "1": "REAL"}
    resolved = resolve_model_label_mapping(id2label)
    assert resolved == {"REAL": 1, "FAKE": 0}

def test_synonym_label_mapping_resolution():
    """Test various synonyms like 'authentic', 'manipulated', 'deepfake'"""
    id2label = {0: "authentic", 1: "deepfake"}
    resolved = resolve_model_label_mapping(id2label)
    assert resolved == {"REAL": 0, "FAKE": 1}

def test_normalized_output_invariant_to_index_order():
    """
    CRITICAL REGRESSION TEST:
    Verify that Model A (0=REAL, 1=FAKE) and Model B (0=FAKE, 1=REAL)
    yield the exact same verdict and confidence for the same semantic probabilities.
    """
    # Case 1: Model A outputs 90% fake at index 1
    mapping_a = {"REAL": 0, "FAKE": 1}
    probs_a = [0.10, 0.90]
    verdict_a, conf_a, p_a = normalize_probabilities(probs_a, mapping_a)

    # Case 2: Model B outputs 90% fake at index 0
    mapping_b = {"REAL": 1, "FAKE": 0}
    probs_b = [0.90, 0.10]
    verdict_b, conf_b, p_b = normalize_probabilities(probs_b, mapping_b)

    assert verdict_a == "FAKE"
    assert verdict_b == "FAKE"
    assert pytest.approx(conf_a, 0.001) == 0.90
    assert pytest.approx(conf_b, 0.001) == 0.90
    assert pytest.approx(p_a["FAKE"], 0.001) == p_b["FAKE"]
    assert pytest.approx(p_a["REAL"], 0.001) == p_b["REAL"]

def test_ambiguous_label_fails_loudly():
    """Verify that ambiguous or unrecognizable labels raise AmbiguousLabelMappingError."""
    with pytest.raises(AmbiguousLabelMappingError):
        resolve_model_label_mapping({"0": "cat", "1": "dog"})

def test_missing_category_fails_loudly():
    """Verify that models without both REAL and FAKE categories fail loudly."""
    with pytest.raises(AmbiguousLabelMappingError):
        resolve_model_label_mapping({"0": "real", "1": "authentic"})
