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


def test_feedback_endpoint():
    res = client.post("/v1/feedback", json={
        "query": "battery draining fast",
        "action_name": "Background Usage Limits",
        "rating": 1
    })
    assert res.status_code == 200
    assert res.json()["status"] == "accepted"
    assert "Background Usage Limits" in res.json()["message"]


def test_followup_endpoint_turn2_caution():
    res = client.post("/v1/troubleshoot/followup", json={
        "query": "battery is still draining after sleep settings",
        "turn": 2,
        "attempted_action_ids": ["Background Usage Limits"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["turn"] == 2
    assert data["escalation_level"] == "CAUTION"
    assert "Background Usage Limits" in data["previous_attempted_actions"]
    assert len(data["response"]["contexts"][0]["actions"]) > 0
    # Verify Background Usage Limits is not re-suggested
    action_names = [a["actionName"] for a in data["response"]["contexts"][0]["actions"]]
    assert "Background Usage Limits" not in action_names
    assert "diagnostic_graph" in data
    assert len(data["diagnostic_graph"]["nodes"]) > 2


def test_followup_endpoint_turn3_critical():
    res = client.post("/v1/troubleshoot/followup", json={
        "query": "battery rapidly draining phone overheating",
        "turn": 3,
        "attempted_action_ids": ["Background Usage Limits", "Deep Sleeping Apps"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["turn"] == 3
    assert data["escalation_level"] == "CRITICAL"
    assert data["is_terminal"] is True
    action_names = [a["actionName"] for a in data["response"]["contexts"][0]["actions"]]
    assert any("Diagnostics" in name or "Partition" in name or "Reset" in name for name in action_names)

