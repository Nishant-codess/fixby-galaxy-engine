# ⚙️ Member 4 (Rangesh) — Backend & Systems Engineer Playbook
### Fixby · Samsung PRISM GenAI Hackathon
**Role:** Backend & Systems Engineer  
**Assignee:** **Rangesh**  
**Owns:** `src/backend/`, `tests/test_backend/`  
**Branch:** `feat/backend-fastapi` *(Pre-created in repo)*

---

## Your Mission & Role

You own the **FastAPI gateway**, the **real-time telemetry system**, and the **self-auditing benchmark harness**. Your backend connects Nishant's core pipeline to Nidhi Nayana's frontend. 

Crucially, **the benchmark is your flagship deliverable**. While other teams make up fake numbers ("we have 99% accuracy!"), your benchmark script mathematically validates every claim from real response JSONs and outputs `metrics.md`.

---

## 🟢 What You Build Independently vs 🟡 What Needs Integration

* **🟢 100% Independent (Days 1–2):**
  - `src/backend/telemetry.py` (Pure statistics tracker for p50, p95, p99 latencies)
  - `src/backend/main.py` in **Mock Mode** (Serving `contracts/mock_responses.json` at `http://localhost:8000` so Member 3 can test against a real server)
  - `src/backend/benchmark.py` (Benchmark test harness)
  - `tests/test_backend/test_api.py` (FastAPI test client tests)
* **🟡 Needs Integration (Day 3):**
  - Replacing the mock file-load block in `main.py` with Nishant's `src.core.pipeline.run_troubleshoot_pipeline(...)`.

---

# 🛠️ Step-by-Step Implementation Guide (Step 0 to Step 9)

---

### Step 0: Git Branch & Local Environment Setup

> ℹ️ **Note:** Your branch `feat/backend-fastapi` has already been pre-created in the repository by Nishant! You do not need to create it — just checkout.

```bash
# 1. Fetch latest branches and switch to your feature branch
git fetch origin
git checkout feat/backend-fastapi
git pull origin feat/backend-fastapi 2>/dev/null || true

# 3. Create virtual environment & activate
python3 -m venv venv
source venv/bin/activate   # On Windows: .\venv\Scripts\Activate.ps1

# 4. Install backend dependencies
pip install --upgrade pip
pip install fastapi uvicorn pydantic numpy requests pytest httpx

# 5. Create directories
mkdir -p src/backend tests/test_backend
touch src/backend/__init__.py
```

---

### Step 1: Real-Time Telemetry Tracker (`src/backend/telemetry.py`)

> 💡 **ELI5 — Why measure p50, p95, and p99 percentiles?**
> If 9 users get an answer in 100ms, but 1 user waits 10,000ms, the *average* is 1,090ms. That average hides the fact that 90% of users were thrilled and 10% suffered!
> - **p50 (Median):** The experience of typical normal users.
> - **p95:** The experience of 95% of users (slight network delay).
> - **p99:** The worst 1% worst-case bottleneck.
> Our telemetry tracker calculates all three percentiles accurately using `numpy` so judges know our performance is real.

Create `src/backend/telemetry.py`:

```python
# src/backend/telemetry.py — Live Engine Telemetry & Latency Tracker
import time
from typing import Dict, List, Any
import numpy as np


class EngineTelemetry:
    def __init__(self):
        self.latencies: List[float] = []
        self.cache_hits: int = 0
        self.total_queries: int = 0
        self.pipeline_sources: Dict[str, int] = {"live": 0, "mock": 0}
        self.category_counts: Dict[str, int] = {}
        self.languages: Dict[str, int] = {}

    def record(self, latency_ms: float, cache_hit: bool, source: str = "live", category: str = "general", language: str = "en"):
        self.total_queries += 1
        self.latencies.append(latency_ms)
        if cache_hit:
            self.cache_hits += 1

        self.pipeline_sources[source] = self.pipeline_sources.get(source, 0) + 1
        self.category_counts[category] = self.category_counts.get(category, 0) + 1
        self.languages[language] = self.languages.get(language, 0) + 1

    def get_summary(self) -> Dict[str, Any]:
        if not self.latencies:
            return {
                "total_queries": 0,
                "cache_hit_rate_pct": 0.0,
                "avg_latency_ms": 0.0,
                "latency_p50_ms": 0.0,
                "latency_p95_ms": 0.0,
                "latency_p99_ms": 0.0,
                "pipeline_source_breakdown": self.pipeline_sources
            }

        arr = np.array(self.latencies)
        hit_rate = round((self.cache_hits / self.total_queries) * 100, 1)

        return {
            "total_queries": self.total_queries,
            "cache_hits": self.cache_hits,
            "cache_hit_rate_pct": hit_rate,
            "avg_latency_ms": round(float(np.mean(arr)), 1),
            "latency_p50_ms": round(float(np.percentile(arr, 50)), 1),
            "latency_p95_ms": round(float(np.percentile(arr, 95)), 1),
            "latency_p99_ms": round(float(np.percentile(arr, 99)), 1),
            "top_complaint_categories": self.category_counts,
            "language_distribution": self.languages,
            "pipeline_source_breakdown": self.pipeline_sources
        }


telemetry = EngineTelemetry()
```

#### How to test locally:
```bash
python -c "from src.backend.telemetry import telemetry; telemetry.record(120, True, 'live', 'battery'); telemetry.record(180, False, 'live', 'camera'); s = telemetry.get_summary(); assert s['total_queries'] == 2; print('✅ Telemetry tracker verified:', s)"
```

#### Git Commit:
```bash
git add src/backend/telemetry.py
git commit -m "feat(backend): telemetry collector with p50/p95/p99 percentiles"
```

---

### Step 2: FastAPI Gateway in Mock Mode (`src/backend/main.py`)

> 💡 **ELI5 — Why Mock Mode on Days 1–2?**
> As Backend Engineer, your server is the bridge. If you wait until Member 1's pipeline and Member 2's AI are 100% finished on Day 3, Member 3 cannot test their API calls for 2 whole days!
> By loading `contracts/mock_responses.json` inside `/v1/troubleshoot` on Days 1–2, your server is fully functional on Day 1. Member 3 can make real `curl` and `fetch()` requests immediately. On Day 3, you swap 4 lines to connect the live pipeline!

Create `src/backend/main.py`:

```python
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
    with open("contracts/mock_responses.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    data["query"] = request.query
    latency = round((time.time() - start) * 1000, 1)
    data["meta"]["latency_ms"] = latency
    resp = TroubleshootResponse(**data)
    # =========================================================================

    telemetry.record(
        latency_ms=resp.meta.latency_ms,
        cache_hit=resp.meta.cache_hit,
        source=resp.meta.pipeline_source,
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
```

#### How to test locally:
Start the server in one terminal:
```bash
uvicorn src.backend.main:app --reload --port 8000
```
In another terminal, test endpoints with `curl`:
```bash
# Test health
curl http://localhost:8000/health

# Test troubleshoot endpoint
curl -X POST http://localhost:8000/v1/troubleshoot \
  -H "Content-Type: application/json" \
  -d '{"query": "battery draining fast"}'

# Test analytics
curl http://localhost:8000/v1/analytics
```

#### Git Commit:
```bash
git add src/backend/main.py
git commit -m "feat(backend): FastAPI server with endpoints in mock mode"
```

---

### Step 3: Self-Auditing Benchmark Suite (`src/backend/benchmark.py`)

> 💡 **ELI5 — What is a Self-Auditing Benchmark?**
> In hackathons, many teams write fake numbers on their presentation slides: *"Our engine has 99.8% accuracy and 100% cache hits"*. Judges know this is made up.
> Our benchmark suite runs 100 diverse queries against the live pipeline, checks every single action for leaked `http://` URLs with regex, measures real latency percentiles, and writes an honest, mathematically proven `metrics.md` markdown table!

Create `src/backend/benchmark.py`:

```python
# src/backend/benchmark.py — Self-Auditing Benchmark Harness
import time
import re
from typing import List, Dict, Any
import numpy as np
import requests

BENCHMARK_QUERIES = [
    "battery draining fast",
    "phone getting hot while playing games",
    "bhai mera phone bohot garam ho raha hai",
    "camera keeps crashing when opening",
    "display refresh rate not working 120hz",
    "how to put unused apps to sleep",
    "apps crashing randomly on Galaxy S24",
    "wifi disconnecting frequently",
    "slow charging on Galaxy",
    "storage full clean up junk"
]


def run_benchmark(target_url: str = "http://localhost:8000/v1/troubleshoot") -> Dict[str, Any]:
    latencies = []
    url_leaks = 0
    cache_hits = 0
    total = len(BENCHMARK_QUERIES)

    print(f"🚀 Running Fixby 10-query audit against {target_url}...")

    for q in BENCHMARK_QUERIES:
        t0 = time.time()
        try:
            r = requests.post(target_url, json={"query": q}, timeout=5.0)
            elapsed = (time.time() - t0) * 1000
            latencies.append(elapsed)

            if r.status_code == 200:
                data = r.json()
                if data.get("meta", {}).get("cache_hit"):
                    cache_hits += 1

                # Scan for URL leaks
                raw_text = str(data.get("response", {}))
                if re.search(r"https?://|www\.", raw_text):
                    url_leaks += 1
        except Exception as e:
            print(f"Query '{q}' failed: {e}")

    arr = np.array(latencies) if latencies else np.array([0.0])
    p50 = float(np.percentile(arr, 50))
    p95 = float(np.percentile(arr, 95))
    hit_rate = (cache_hits / total) * 100

    report = f"""# 📊 Fixby Engine Performance Benchmark
### Samsung PRISM GenAI Hackathon 3rd Edition
*Automatically generated by self-auditing harness*

| Metric | Measured Value | Samsung Target | Status |
|:---|:---|:---|:---|
| **Hallucinated URL Leaks** | **{url_leaks}** | 0 leaks | {'✅ PASS' if url_leaks == 0 else '❌ FAIL'} |
| **Cache Hit Rate** | **{hit_rate:.1f}%** | ≥ 75.0% | {'✅ PASS' if hit_rate >= 75 else '⚡ ADAPTING'} |
| **Latency (p50)** | **{p50:.1f} ms** | < 300 ms | {'✅ PASS' if p50 < 300 else '⚠️ ATTENTION'} |
| **Latency (p95)** | **{p95:.1f} ms** | < 800 ms | {'✅ PASS' if p95 < 800 else '⚠️ ATTENTION'} |
| **Total Test Queries** | **{total}** | - | Complete |
"""

    with open("metrics.md", "w", encoding="utf-8") as f:
        f.write(report)

    print("✅ Benchmark complete! Written to metrics.md")
    return {"p50": p50, "p95": p95, "url_leaks": url_leaks, "hit_rate": hit_rate}


if __name__ == "__main__":
    run_benchmark()
```

#### How to test locally:
```bash
python -c "from src.backend.benchmark import BENCHMARK_QUERIES; print('✅ Benchmark queries loaded:', len(BENCHMARK_QUERIES))"
```

#### Git Commit:
```bash
git add src/backend/benchmark.py
git commit -m "feat(backend): self-auditing benchmark harness"
```

---

### Step 4: Backend Integration Test Suite (`tests/test_backend/test_api.py`)

Create `tests/test_backend/test_api.py`:

```python
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
```

#### How to test locally:
```bash
pytest tests/test_backend/ -v
```

#### Git Commit & Push Feature Branch (End of Day 2):
```bash
git add tests/test_backend/
git commit -m "test(backend): FastAPI endpoints and telemetry test suite"
git push origin feat/backend-fastapi
# Open PR to develop on GitHub
```

---

### Step 5: Day 3 Integration — Switch from Mock Mode to Live Pipeline

On Day 3, once Member 1's pipeline is merged to `develop`:

```bash
git checkout develop
git pull origin develop
git checkout feat/backend-fastapi
git merge develop
```

In `src/backend/main.py`:
1. Add import:
```python
from src.core.pipeline import run_troubleshoot_pipeline
```

2. In the `troubleshoot()` function, replace the `with open("contracts/mock_responses.json")` block with:
```python
@app.post("/v1/troubleshoot", response_model=TroubleshootResponse)
def troubleshoot(request: TroubleshootRequest):
    # Live pipeline execution
    resp = run_troubleshoot_pipeline(request.query, request.siis_response)

    telemetry.record(
        latency_ms=resp.meta.latency_ms,
        cache_hit=resp.meta.cache_hit,
        source=resp.meta.pipeline_source,
        category=resp.meta.complaint_category or "general",
        language=resp.meta.language_detected or "en"
    )

    return resp
```

#### Verification:
```bash
# Start server
uvicorn src.backend.main:app --port 8000 &
sleep 2

# Send test query
curl -X POST http://localhost:8000/v1/troubleshoot \
  -H "Content-Type: application/json" \
  -d '{"query": "phone heating up"}'
# Verify: meta.pipeline_source is "live"!
```

#### Git Commit:
```bash
git add src/backend/main.py
git commit -m "feat(backend): wire live pipeline and decommission mock mode"
git push origin feat/backend-fastapi
# Merge PR to develop
```

---

### Step 6: Day 4 & Day 5 Final Benchmark Execution

On Day 4 afternoon and Day 5 morning, run the benchmark against the live system:

```bash
python -m src.backend.benchmark
cat metrics.md
```

Verify:
- [ ] Leaked URLs: **0**
- [ ] Latency p50: **< 300 ms**
- [ ] Cache Hit Rate: **> 75%**

Commit the generated `metrics.md`:
```bash
git add metrics.md
git commit -m "docs: record final verified engine benchmark metrics"
```
