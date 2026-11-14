"""Basic health and route testing."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify that root endpoint returns HTTP 200 and basic info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "AgriShift AI" in data["project"]


def test_health_endpoint():
    """Verify health-check endpoint reports healthy status and environment details."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "target_region" in data
