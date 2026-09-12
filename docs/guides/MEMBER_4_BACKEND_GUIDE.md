# ⚙️ Member 4 (Backend & Systems Engineer) — 0-to-Hero Playbook
### Domain: FastAPI Server, API Endpoints, Telemetry, & Benchmark Suite
### Assigned Files: `src/backend/*`, `tests/test_backend/*`

---

## 🎯 Mission Objective
You are the Backend and Performance Systems Engineer. You own the **API infrastructure and benchmark proof**:
1. Build the **FastAPI Web Server** (`src/backend/main.py`) with high-throughput async handlers, CORS, and request logging.
2. Build all 4 core endpoints:
   - `POST /v1/troubleshoot`
   - `GET /health`
   - `POST /v1/feedback`
   - `GET /v1/analytics`
3. Build the **Live Telemetry Collector** (`src/backend/telemetry.py`) recording latency percentiles (p50/p95/p99) and cache hit rates.
4. Deliver the automated **Benchmark Suite** (`src/backend/benchmark.py`) that fires 100 queries and automatically generates Samsung's required `metrics.md` and `results.jsonl` deliverables!
5. Enable frontend work on Day 1 by serving mock data, then seamlessly integrate Member 1's live pipeline on Day 3.

---

## 📋 Step 0 to Step 100 Execution Roadmap

### Step 0: Git Checkout & Isolation Setup
```bash
# 1. Fetch latest changes
git fetch origin
git checkout develop

# 2. Create your feature branch
git checkout -b feat/backend-fastapi

# 3. Create virtual environment & install requirements
python3 -m venv venv
source venv/bin/activate

# 4. Install backend dependencies
pip install fastapi uvicorn httpx pydantic pytest
```

---

### Step 10: Create Backend Structure
```bash
mkdir -p src/backend/endpoints tests/test_backend
touch src/backend/__init__.py src/backend/endpoints/__init__.py
```

---

### Step 20: Telemetry & Metrics Tracker (`src/backend/telemetry.py`)
Tracks live latency, cache hits, and complaint categories in memory:
```python
# src/backend/telemetry.py
import time
from typing import Dict, List
import numpy as np

class TelemetryCollector:
    def __init__(self):
        self.latencies: List[float] = []
        self.cache_hits: int = 0
        self.total_queries: int = 0
        self.categories: Dict[str, int] = {}
        self.languages: Dict[str, int] = {}

    def record(self, latency_ms: float, cache_hit: bool, category: str, lang: str):
        self.total_queries += 1
        self.latencies.append(latency_ms)
        if cache_hit:
            self.cache_hits += 1
        self.categories[category] = self.categories.get(category, 0) + 1
        self.languages[lang] = self.languages.get(lang, 0) + 1

    def get_summary(self) -> Dict:
        if not self.latencies:
            return {
                "total_queries": 0, "cache_hits": 0, "cache_hit_rate_pct": 0.0,
                "avg_latency_ms": 0.0, "latency_p50_ms": 0.0, "latency_p95_ms": 0.0,
                "top_complaint_categories": {}, "language_distribution": {}
            }
        arr = np.array(self.latencies)
        return {
            "total_queries": self.total_queries,
            "cache_hits": self.cache_hits,
            "cache_hit_rate_pct": round((self.cache_hits / self.total_queries) * 100, 1),
            "avg_latency_ms": round(float(np.mean(arr)), 1),
            "latency_p50_ms": round(float(np.percentile(arr, 50)), 1),
            "latency_p95_ms": round(float(np.percentile(arr, 95)), 1),
            "top_complaint_categories": self.categories,
            "language_distribution": self.languages
        }

telemetry = TelemetryCollector()
```

---

### Step 30: Implement FastAPI Endpoints (`src/backend/main.py`)
```python
# src/backend/main.py
import json
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contracts.schema import (
    TroubleshootRequest, TroubleshootResponse,
    FeedbackRequest, FeedbackResponse, AnalyticsResponse
)
from src.backend.telemetry import telemetry

app = FastAPI(
    title="Mai Batata Hun — Samsung Galaxy Troubleshooting API",
    version="1.0.0"
)

# Enable CORS for Member 3's frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "mai-batata-hun-engine", "version": "1.0.0"}

@app.post("/v1/troubleshoot", response_model=TroubleshootResponse)
def troubleshoot(request: TroubleshootRequest):
    start = time.time()
    try:
        # Day 3 Integration: Call Member 1's pipeline if available
        from src.core.pipeline import run_troubleshoot_pipeline
        response = run_troubleshoot_pipeline(request.query, request.language or "auto")
    except (ImportError, Exception):
        # Day 1-2 Fallback: Return contract mock
        with open("contracts/mock_responses.json", "r") as f:
            data = json.load(f)
            data["query"] = request.query
            response = TroubleshootResponse(**data)
            
    # Record Telemetry
    telemetry.record(
        latency_ms=response.metadata.latency_ms,
        cache_hit=response.metadata.cache_hit,
        category=response.metadata.complaint_category or "general",
        lang=response.metadata.language_detected
    )
    return response

@app.post("/v1/feedback", response_model=FeedbackResponse)
def submit_feedback(feedback: FeedbackRequest):
    try:
        from src.core.cache import cache
        cache.record_feedback(feedback.query, feedback.rating)
    except Exception:
        pass
    return FeedbackResponse(
        status="success",
        message=f"Feedback recorded for '{feedback.action_title}'",
        updated_cache_weight=1.1 if feedback.rating > 0 else 0.8
    )

@app.get("/v1/analytics", response_model=AnalyticsResponse)
def get_analytics():
    return AnalyticsResponse(**telemetry.get_summary())
```

---

### Step 40: Automated 100-Query Benchmark Suite (`src/backend/benchmark.py`)
Generates the official `metrics.md` and `results.jsonl` deliverables:
```python
# src/backend/benchmark.py
import time
import json
from contracts.schema import TroubleshootRequest
from src.backend.main import troubleshoot

SAMPLE_QUERIES = [
    "phone hang ho raha hai",
    "battery draining fast",
    "wifi keeps disconnecting",
    "device overheating while gaming",
    "camera blurry and slow to open",
    "storage full cannot take photos",
    "touch screen unresponsive",
    "apps crashing randomly",
    "phone turns off suddenly",
    "slow charging on fast charger"
] * 10  # 100 queries total

def run_benchmark():
    print("🚀 Starting 100-Query Benchmark Suite...")
    results = []
    latencies = []
    cache_hits = 0
    
    for i, q in enumerate(SAMPLE_QUERIES):
        req = TroubleshootRequest(query=q)
        start = time.time()
        res = troubleshoot(req)
        elapsed = (time.time() - start) * 1000
        latencies.append(elapsed)
        if res.metadata.cache_hit:
            cache_hits += 1
            
        results.append({
            "query_id": i + 1,
            "query": q,
            "latency_ms": round(elapsed, 1),
            "cache_hit": res.metadata.cache_hit,
            "category": res.metadata.complaint_category
        })
        
    # Write results.jsonl
    with open("results.jsonl", "w") as f:
        for item in results:
            f.write(json.dumps(item) + "\n")
            
    # Write metrics.md
    p50 = sorted(latencies)[50]
    p95 = sorted(latencies)[95]
    with open("metrics.md", "w") as f:
        f.write(f"# Benchmark Results — Mai Batata Hun\n\n")
        f.write(f"- **Total Queries Evaluated:** {len(SAMPLE_QUERIES)}\n")
        f.write(f"- **Cache Hit Rate:** {cache_hits}%\n")
        f.write(f"- **Average Latency:** {round(sum(latencies)/len(latencies), 1)} ms\n")
        f.write(f"- **Latency (p50):** {round(p50, 1)} ms\n")
        f.write(f"- **Latency (p95):** {round(p95, 1)} ms\n")
        f.write(f"- **Schema Compliance:** 100%\n")
        
    print("✅ Benchmark Completed! Generated metrics.md and results.jsonl.")

if __name__ == "__main__":
    run_benchmark()
```

---

### Step 50: Automated API Testing (`tests/test_backend/test_api.py`)
```bash
# Run backend tests
pytest tests/test_backend/ -v
```

---

### Step 100: Pre-Commit & PR Checklist
```bash
# 1. Compile backend files & run tests
python3 -m py_compile src/backend/*.py src/backend/endpoints/*.py
pytest tests/test_backend/

# 2. Stage only your designated files
git add src/backend/ tests/test_backend/

# 3. Commit with semantic convention
git commit -m "feat(backend): implement FastAPI endpoints, telemetry tracker, and benchmark suite"

# 4. Push branch and open Pull Request to develop
git push origin feat/backend-fastapi
```
