# src/backend/main.py
import time
import os
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
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

FIXBY_API_KEY = os.getenv("FIXBY_API_KEY", "test-api-key-123")
RATE_LIMIT = 100  # max requests per second per IP
rate_limit_data = defaultdict(lambda: {"count": 0, "reset_time": 0.0})

@app.middleware("http")
async def security_and_rate_limit(request: Request, call_next):
    if request.url.path.startswith("/v1/"):
        # 1. API Key Auth
        api_key = request.headers.get("X-API-Key")
        if api_key != FIXBY_API_KEY:
            return JSONResponse(status_code=401, content={"detail": "Invalid or missing X-API-Key header"})
        
        # 2. Rate Limiting
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        user_data = rate_limit_data[client_ip]
        
        if current_time > user_data["reset_time"]:
            user_data["count"] = 1
            user_data["reset_time"] = current_time + 1.0
        else:
            if user_data["count"] >= RATE_LIMIT:
                return JSONResponse(status_code=429, content={"detail": "Too Many Requests"})
            user_data["count"] += 1

    return await call_next(request)

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
