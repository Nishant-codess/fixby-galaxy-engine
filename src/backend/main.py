# src/backend/main.py — FastAPI Gateway (Mock Mode for Days 1-2)
import json
import os
import time
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from contracts.schema import (
    TroubleshootRequest, TroubleshootResponse,
    FollowupRequest, FollowupResponse,
    FeedbackRequest, FeedbackResponse, AnalyticsResponse
)
from src.backend.telemetry import telemetry

# Eagerly initialize the AI matcher so HF weights load on app startup, eliminating first-request latency
from src.ai.matcher import matcher

app = FastAPI(
    title="Fixby — Samsung Galaxy Troubleshooting API",
    description="Engine for Samsung PRISM GenAI Hackathon 3rd Edition",
    version="1.1.0"
)

def _allowed_origins() -> list[str]:
    """Explicit browser origins. Same-origin production traffic does not need CORS;
    localhost entries keep the Next.js dev server working against this API.
    """
    origins = [
        "https://fixby-galaxy-engine.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    render_url = os.getenv("RENDER_EXTERNAL_URL", "").strip().rstrip("/")
    if render_url and render_url not in origins:
        origins.append(render_url)
    for origin in os.getenv("CORS_ORIGINS", "").split(","):
        origin = origin.strip().rstrip("/")
        if origin and origin != "*" and origin not in origins:
            origins.append(origin)
    return origins


# CORS Configuration
# allow_credentials=False because this API uses no browser session cookies.
# Origins are explicit — production does not use a wildcard.
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Accept", "Content-Type", "X-API-Key"],
)

FIXBY_API_KEY = os.getenv("FIXBY_API_KEY", "test-api-key-123")
RATE_LIMIT = 100  # max requests per second per IP
rate_limit_data = defaultdict(lambda: {"count": 0, "reset_time": 0.0})

USE_MOCK = os.getenv("USE_MOCK", "false").lower() in ("1", "true", "yes")


@app.middleware("http")
async def security_and_rate_limit(request: Request, call_next):
    # Skip auth/rate-limit for CORS preflight — browser sends OPTIONS before every POST
    if request.method == "OPTIONS":
        return await call_next(request)

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
    return {
        "status": "healthy",
        "service": "fixby-engine",
        "version": "1.1.0",
        "mode": "mock" if USE_MOCK else "live-pipeline"
    }


@app.post("/v1/cache/clear")
def clear_cache():
    """Clears all in-memory cache tiers. Useful after taxonomy/deeplink updates."""
    from src.core.cache import cache
    cache.tier1_exact.clear()
    cache.tier2_slots.clear()
    cache.tier3_vectors.clear()
    return {"status": "ok", "message": "All cache tiers cleared"}


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


# Static frontend routes: Serve the real Next.js application (src/frontend-next/out)
from fastapi.staticfiles import StaticFiles

next_out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend-next/out"))
legacy_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))

frontend_dir = next_out_dir if os.path.exists(os.path.join(next_out_dir, "index.html")) else legacy_dir

if os.path.exists(frontend_dir):
    # 1. Mount Next.js _next chunks (vital for Next.js to render)
    next_chunks = os.path.join(frontend_dir, "_next")
    if os.path.exists(next_chunks):
        app.mount("/_next", StaticFiles(directory=next_chunks), name="next_static")

    # 2. Mount static assets (css, js, assets)
    css_dir = os.path.join(frontend_dir, "css")
    js_dir = os.path.join(frontend_dir, "js")
    assets_dir = os.path.join(frontend_dir, "assets")

    if os.path.exists(css_dir):
        app.mount("/css", StaticFiles(directory=css_dir), name="css")
    if os.path.exists(js_dir):
        app.mount("/js", StaticFiles(directory=js_dir), name="js")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # 3. Explicit HTML Routes
    @app.get("/", include_in_schema=False)
    async def serve_landing_page():
        return FileResponse(os.path.join(frontend_dir, "index.html"))

    @app.get("/index.html", include_in_schema=False)
    async def serve_index_html():
        return FileResponse(os.path.join(frontend_dir, "index.html"))

    @app.get("/admin", include_in_schema=False)
    @app.get("/admin.html", include_in_schema=False)
    async def serve_admin_page():
        admin_file = os.path.join(frontend_dir, "admin.html")
        if os.path.exists(admin_file):
            return FileResponse(admin_file)
        return FileResponse(os.path.join(frontend_dir, "index.html"))

    @app.get("/demo", include_in_schema=False)
    @app.get("/demo.html", include_in_schema=False)
    async def serve_demo():
        # The Next.js export is the product UI. Only the legacy frontend
        # still has a separate demo.html console.
        if os.path.exists(os.path.join(frontend_dir, "_next")):
            return FileResponse(os.path.join(frontend_dir, "index.html"))
        legacy_demo = os.path.join(legacy_dir, "demo.html")
        if os.path.exists(legacy_demo):
            return FileResponse(legacy_demo)
        return FileResponse(os.path.join(frontend_dir, "index.html"))

    # 4. Fallback mount for any remaining static files (favicon.ico, etc.)
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")



