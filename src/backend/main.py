# src/backend/main.py
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contracts.schema import TroubleshootRequest, TroubleshootResponse, FeedbackRequest, FeedbackResponse, AnalyticsResponse
from src.backend.telemetry import telemetry
from src.core.pipeline import run_troubleshoot_pipeline
from src.core.cache import cache

app = FastAPI(title="Mai Batata Hun — Samsung Galaxy Troubleshooting API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # fix #14
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "mai-batata-hun-engine", "version": "1.1.0"}

@app.post("/v1/troubleshoot", response_model=TroubleshootResponse)
def troubleshoot(request: TroubleshootRequest):
    response = run_troubleshoot_pipeline(request.query, request.siis_response, request.language or "auto")
    telemetry.record(latency_ms=response.meta.latency_ms, cache_hit=response.meta.cache_hit,
                      category=response.meta.complaint_category or "general",
                      lang=response.meta.language_detected, pipeline_source=response.meta.pipeline_source)
    return response

@app.post("/v1/feedback", response_model=FeedbackResponse)
def submit_feedback(feedback: FeedbackRequest):
    cache.record_feedback(feedback.query, feedback.rating)
    return FeedbackResponse(status="success", message=f"Feedback recorded for '{feedback.action_name}'",
                             updated_cache_weight=1.1 if feedback.rating > 0 else 0.8)

@app.get("/v1/analytics", response_model=AnalyticsResponse)
def get_analytics():
    return AnalyticsResponse(**telemetry.get_summary())
