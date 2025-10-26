import pytest
import httpx
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data

def test_rank_recommendations():
    """Test recommendation ranking endpoint"""
    response = client.post("/rank", json={})
    assert response.status_code == 200
    
    recommendations = response.json()
    assert len(recommendations) == 3
    
    # Check that recommendations are sorted by score (highest first)
    scores = [rec["score"] for rec in recommendations]
    assert scores == sorted(scores, reverse=True)
    
    # Check required fields
    for rec in recommendations:
        assert "id" in rec
        assert "title" in rec
        assert "score" in rec
        assert "rationale" in rec
        assert "actions" in rec
        assert isinstance(rec["score"], (int, float))
        assert 0 <= rec["score"] <= 1

def test_plan_jit_feasibility():
    """Test JIT planning endpoint feasibility"""
    request_data = {
        "sku_id": "SKU-004",
        "qty": 20,
        "dest_warehouse_id": "CHI"
    }
    
    response = client.post("/plan_jit", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "recommendation" in data
    assert "carriers" in data
    assert "explanation" in data
    
    # Check recommendation structure
    rec = data["recommendation"]
    assert rec["title"].startswith("JIT Transfer:")
    assert rec["score"] > 0
    assert len(rec["actions"]) >= 2
    
    # Check carriers structure
    carriers = data["carriers"]
    assert len(carriers) == 3
    for carrier in carriers:
        assert "name" in carrier
        assert "cost" in carrier
        assert "eta" in carrier
        assert "reliability" in carrier

def test_plan_jit_ranking_order():
    """Test that carriers are properly ranked by cost"""
    request_data = {
        "sku_id": "SKU-001",
        "qty": 10,
        "dest_warehouse_id": "DAL"
    }
    
    response = client.post("/plan_jit", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    carriers = data["carriers"]
    
    # Check that carriers are sorted by cost (lowest first)
    costs = [carrier["cost"] for carrier in carriers]
    assert costs == sorted(costs)
    
    # Verify cost ranges are reasonable
    for carrier in carriers:
        assert 50 <= carrier["cost"] <= 250
        assert 0.8 <= carrier["reliability"] <= 1.0

if __name__ == "__main__":
    pytest.main([__file__])
