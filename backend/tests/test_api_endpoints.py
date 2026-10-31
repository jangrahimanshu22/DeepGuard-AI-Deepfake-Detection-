import io
from fastapi.testclient import TestClient
from PIL import Image
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["app"] == "DeepGuard AI"

def test_health_endpoint():
    response = client.get("/api/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "device" in data

def test_model_endpoint():
    response = client.get("/api/model")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "provider" in data
    assert "label_mapping" in data

def test_metrics_endpoint():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "benchmarks" in data

def test_predict_image_api():
    # Create a synthetic 100x100 RGB image
    img = Image.new("RGB", (100, 100), color=(180, 140, 120))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    buffer.seek(0)

    response = client.post(
        "/api/predict/image",
        files={"file": ("test_sample.jpg", buffer, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ["REAL", "FAKE"]
    assert 0.0 <= data["confidence"] <= 1.0
    assert "probabilities" in data
    assert "REAL" in data["probabilities"]
    assert "FAKE" in data["probabilities"]
    assert "explainability" in data
    assert "id" in data

def test_history_endpoint():
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert "records" in data
    assert "total" in data
    assert "stats" in data
