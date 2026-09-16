# src/backend/main.py
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contracts.schema import (
    TroubleshootRequest, TroubleshootResponse,
    FollowupRequest, FollowupResponse,
    FeedbackRequest, FeedbackResponse, AnalyticsResponse
)
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


USE_MOCK = os.getenv("USE_MOCK", "false").lower() in ("1", "true", "yes")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "fixby-engine",
        "version": "1.1.0",
        "mode": "mock" if USE_MOCK else "live-pipeline"
    }


@app.post("/v1/troubleshoot", response_model=TroubleshootResponse)
def troubleshoot(request: TroubleshootRequest):
    start = time.time()

    if USE_MOCK:
        with open(os.path.join(os.path.dirname(__file__), "../../contracts/mock_responses.json"), "r", encoding="utf-8") as f:
            data = json.load(f)

        data["query"] = request.query
        latency = round((time.time() - start) * 1000, 1)
        data["meta"]["latency_ms"] = latency
        resp = TroubleshootResponse(**data)
        source = "mock"
    else:
        from src.core.pipeline import run_troubleshoot_pipeline
        resp = run_troubleshoot_pipeline(request.query, siis_response=request.siis_response)
        source = resp.meta.pipeline_source or "live"

    telemetry.record(
        latency_ms=resp.meta.latency_ms,
        cache_hit=resp.meta.cache_hit,
        source=source,
        category=resp.meta.complaint_category or "general",
        language=resp.meta.language_detected or "en"
    )

    return resp


@app.post("/v1/troubleshoot/followup", response_model=FollowupResponse)
def troubleshoot_followup(request: FollowupRequest):
    from src.core.pipeline import run_followup_pipeline
    resp = run_followup_pipeline(
        query=request.query,
        attempted_action_ids=request.attempted_action_ids,
        turn=request.turn,
        session_id=request.session_id
    )

    telemetry.record(
        latency_ms=resp.meta.latency_ms,
        cache_hit=resp.meta.cache_hit,
        source="followup_escalation",
        category=resp.meta.complaint_category or "general.escalation",
        language=resp.meta.language_detected or "en"
    )

    return resp


@app.post("/v1/feedback", response_model=FeedbackResponse)
def submit_feedback(request: FeedbackRequest):
    from src.core.cache import cache
    cache.record_feedback(request.query, request.rating)
    updated_weight = cache.weights.get(cache._hash_exact(request.query), 1.1 if request.rating > 0 else 0.8)
    return FeedbackResponse(
        status="accepted",
        message=f"Recorded feedback for {request.action_name}",
        updated_cache_weight=round(updated_weight, 2)
    )


@app.get("/v1/analytics", response_model=AnalyticsResponse)
def get_analytics():
    return AnalyticsResponse(**telemetry.get_summary())
