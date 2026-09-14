import os
# src/backend/main.py — FastAPI Gateway (Mock Mode for Days 1-2)
import json
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contracts.schema import (
    TroubleshootRequest, TroubleshootResponse,
    FeedbackRequest, FeedbackResponse, AnalyticsResponse
)
from src.backend.telemetry import telemetry

app = FastAPI(
    title="Fixby — Samsung Galaxy Troubleshooting API",
    description="Engine for Samsung PRISM GenAI Hackathon 3rd Edition",
    version="1.1.0"
)

# CORS Configuration
# Note: allow_credentials=False because this API uses no browser session cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "fixby-engine",
        "version": "1.1.0"
    }


@app.post("/v1/troubleshoot", response_model=TroubleshootResponse)
def troubleshoot(request: TroubleshootRequest):
    start = time.time()

    # =========================================================================
    # DAYS 1-2 MOCK BLOCK: (Swapped on Day 3 for live pipeline call)
    # =========================================================================
    with open(os.path.join(os.path.dirname(__file__), "../../contracts/mock_responses.json"), "r", encoding="utf-8") as f:
        data = json.load(f)

    data["query"] = request.query
    latency = round((time.time() - start) * 1000, 1)
    data["meta"]["latency_ms"] = latency
    resp = TroubleshootResponse(**data)
    # =========================================================================

    telemetry.record(
        latency_ms=resp.meta.latency_ms,
        cache_hit=resp.meta.cache_hit,
        source="mock",
        category=resp.meta.complaint_category or "general",
        language=resp.meta.language_detected or "en"
    )

    return resp


@app.post("/v1/feedback", response_model=FeedbackResponse)
def submit_feedback(request: FeedbackRequest):
    return FeedbackResponse(
        status="accepted",
        message=f"Recorded feedback for {request.action_name}",
        updated_cache_weight=1.1 if request.rating > 0 else 0.8
    )


@app.get("/v1/analytics", response_model=AnalyticsResponse)
def get_analytics():
    summary = telemetry.get_summary()
    return AnalyticsResponse(
        total_queries=summary["total_queries"],
        cache_hits=summary.get("cache_hits", 0),
        cache_hit_rate_pct=summary["cache_hit_rate_pct"],
        avg_latency_ms=summary["avg_latency_ms"],
        latency_p50_ms=summary["latency_p50_ms"],
        latency_p95_ms=summary["latency_p95_ms"],
        latency_p99_ms=summary["latency_p99_ms"],
        top_complaint_categories=summary.get("top_complaint_categories", {}),
        language_distribution=summary.get("language_distribution", {}),
        pipeline_source_breakdown=summary.get("pipeline_source_breakdown", {})
    )
