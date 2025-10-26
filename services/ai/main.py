from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import random
from datetime import datetime, timedelta

app = FastAPI(title="Blue Ship Sync AI Service", version="1.0.0")

class RecommendationRequest(BaseModel):
    warehouse_id: str = None
    context: Dict[str, Any] = {}

class Recommendation(BaseModel):
    id: str
    title: str
    score: float
    rationale: str
    actions: List[Dict[str, Any]]

class PlanJITRequest(BaseModel):
    sku_id: str
    qty: int
    dest_warehouse_id: str

class PlanJITResponse(BaseModel):
    recommendation: Recommendation
    carriers: List[Dict[str, Any]]
    explanation: str

# Mock data
WAREHOUSES = ["CHI", "DAL"]
SKUS = ["SKU-001", "SKU-004", "SKU-010"]
CARRIERS = [
    {"name": "FastX EXP", "cost": 150, "eta_hours": 2, "reliability": 0.95},
    {"name": "Econo STD", "cost": 75, "eta_hours": 24, "reliability": 0.85},
    {"name": "Premium Air", "cost": 200, "eta_hours": 4, "reliability": 0.98}
]

def calculate_score(urgency: float, impact: float, effort: float, confidence: float) -> float:
    """Calculate recommendation score using the formula: urgency + impact - effort + confidence"""
    return max(0, min(1, urgency + impact - effort + confidence))

@app.post("/rank", response_model=List[Recommendation])
async def rank_recommendations(request: RecommendationRequest):
    """Rank recommendations based on urgency, impact, effort, and confidence"""
    
    recommendations = [
        {
            "id": "rec_001",
            "title": "Optimize SKU-004 Transfer",
            "urgency": 0.8,
            "impact": 0.9,
            "effort": 0.3,
            "confidence": 0.85,
            "rationale": "High demand in CHI warehouse, excess stock in DAL. Transfer will reduce stockouts and improve customer satisfaction."
        },
        {
            "id": "rec_002", 
            "title": "Reorder SKU-010",
            "urgency": 0.6,
            "impact": 0.7,
            "effort": 0.2,
            "confidence": 0.9,
            "rationale": "Low stock levels detected, high order frequency. Proactive reorder prevents future stockouts."
        },
        {
            "id": "rec_003",
            "title": "Consolidate Shipments",
            "urgency": 0.4,
            "impact": 0.6,
            "effort": 0.5,
            "confidence": 0.75,
            "rationale": "Multiple small shipments to same destination. Consolidation reduces costs and improves efficiency."
        }
    ]
    
    # Calculate scores and sort
    ranked_recs = []
    for rec in recommendations:
        score = calculate_score(
            rec["urgency"], 
            rec["impact"], 
            rec["effort"], 
            rec["confidence"]
        )
        
        ranked_recs.append(Recommendation(
            id=rec["id"],
            title=rec["title"],
            score=score,
            rationale=rec["rationale"],
            actions=[
                {"type": "CREATE_TRANSFER", "params": {"from": "DAL", "to": "CHI", "sku": "SKU-004", "qty": 20}},
                {"type": "CREATE_SHIPMENT", "params": {"carrier": "FastX EXP", "priority": "high"}}
            ] if rec["id"] == "rec_001" else [
                {"type": "CREATE_PURCHASE_ORDER", "params": {"sku": "SKU-010", "qty": 100, "supplier": "Supplier A"}}
            ] if rec["id"] == "rec_002" else [
                {"type": "CONSOLIDATE_SHIPMENTS", "params": {"shipment_ids": ["SHP-5007", "SHP-5008"]}}
            ]
        ))
    
    # Sort by score (highest first)
    ranked_recs.sort(key=lambda x: x.score, reverse=True)
    
    return ranked_recs

@app.post("/plan_jit", response_model=PlanJITResponse)
async def plan_jit(request: PlanJITRequest):
    """Plan JIT transfer with carrier options and actions"""
    
    # Mock inventory check
    available_warehouses = ["DAL"] if request.dest_warehouse_id == "CHI" else ["CHI"]
    source_warehouse = random.choice(available_warehouses)
    
    # Generate carrier options with realistic data
    carriers = []
    for carrier in CARRIERS:
        eta = datetime.now() + timedelta(hours=carrier["eta_hours"])
        carriers.append({
            "name": carrier["name"],
            "cost": carrier["cost"],
            "eta": eta.isoformat(),
            "reliability": carrier["reliability"],
            "capacity": random.randint(50, 200)
        })
    
    # Sort carriers by cost
    carriers.sort(key=lambda x: x["cost"])
    
    # Create recommendation
    recommendation = Recommendation(
        id=f"jit_{random.randint(1000, 9999)}",
        title=f"JIT Transfer: {request.sku_id}",
        score=0.9,
        rationale=f"Transfer {request.qty} units of {request.sku_id} from {source_warehouse} to {request.dest_warehouse_id}. Urgent transfer to meet demand.",
        actions=[
            {
                "type": "CREATE_TRANSFER",
                "params": {
                    "from": source_warehouse,
                    "to": request.dest_warehouse_id,
                    "sku": request.sku_id,
                    "qty": request.qty
                }
            },
            {
                "type": "CREATE_SHIPMENT", 
                "params": {
                    "carrier": carriers[0]["name"],
                    "priority": "urgent",
                    "eta": carriers[0]["eta"]
                }
            }
        ]
    )
    
    explanation = f"""
    JIT Transfer Plan for {request.sku_id}:
    
    1. Source: {source_warehouse} warehouse (sufficient stock available)
    2. Destination: {request.dest_warehouse_id} warehouse
    3. Quantity: {request.qty} units
    4. Recommended carrier: {carriers[0]['name']} (${carriers[0]['cost']}, ETA: {carriers[0]['eta']})
    5. Actions: Create transfer order and expedited shipment
    
    Alternative carriers available with different cost/speed trade-offs.
    """
    
    return PlanJITResponse(
        recommendation=recommendation,
        carriers=carriers,
        explanation=explanation
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-service", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
