import pytest
from backend.preprocessing.image_preprocessor import (
    ImagePreprocessor,
    UnsupportedFormatError,
    CorruptedImageError
)

def test_unsupported_image_extension():
    prep = ImagePreprocessor()
    with pytest.raises(UnsupportedFormatError):
        prep.validate_file("malicious_file.exe", b"test content")

def test_corrupted_image_bytes():
    prep = ImagePreprocessor()
    with pytest.raises(CorruptedImageError):
        prep.load_image(b"this is not a valid jpeg or png binary stream")
