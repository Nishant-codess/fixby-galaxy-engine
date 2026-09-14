# tests/test_backend/test_api.py
from fastapi.testclient import TestClient
from src.backend.main import app

client = TestClient(app)


def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_troubleshoot_endpoint():
    res = client.post("/v1/troubleshoot", json={"query": "battery draining fast"})
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert len(data["response"]["contexts"]) > 0
    assert data["response"]["contexts"][0]["actions"][0]["actionName"] is not None


def test_analytics_endpoint():
    res = client.get("/v1/analytics")
    assert res.status_code == 200
    assert "cache_hit_rate_pct" in res.json()
