from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "test_user_id"
client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_search_empty_query():
    response = client.post("/api/search", json={"query": "", "top_k": 5})
    assert response.status_code == 400


def test_search_valid_query():
    response = client.post("/api/search", json={"query": "test query", "top_k": 3})
    assert response.status_code == 200
    data = response.json()
    assert "text_results" in data
    assert "visual_results" in data
    assert "answer" in data