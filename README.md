# Fixby — Smart Guided Troubleshooting Engine
### *Next-Generation Zero-Hallucination Diagnostic Engine for Samsung Galaxy (One UI 6+)*
**Samsung PRISM GenAI Hackathon 3rd Edition | Theme 2**  
**Team: The Cyclops | SRM Institute of Science and Technology**

<div align="center">

![Fixby Architecture Whiteboard Diagram](docs/assets/fixby_architecture_whiteboard.jpg)

[![CI Status](https://github.com/Nishant-codess/fixby-galaxy-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/Nishant-codess/fixby-galaxy-engine/actions)
[![Python Version](https://img.shields.io/badge/Python-3.11%2B-blue.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063.svg?logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![Latency p50](https://img.shields.io/badge/Latency%20(p50)-0.86ms-brightgreen.svg?logo=speedtest&logoColor=white)]()
[![URL Leaks](https://img.shields.io/badge/Hallucinated%20URLs-0%20(Zero)-brightgreen.svg)]()
[![Schema Compliance](https://img.shields.io/badge/Samsung%20Schema-100%25%20Exact-blueviolet.svg)]()
[![License](https://img.shields.io/badge/Samsung%20PRISM-2026%20Edition-black.svg)]()

**Fixby** (*"Your Galaxy's AI Diagnostic Companion"*) is a deterministic, sub-millisecond troubleshooting engine that transforms natural conversational complaints (in English, Hinglish, or native Korean) into structured, actionable diagnostic plans with direct one-tap Samsung One UI deeplinks.

[Submission Artifacts](#-official-submission-deliverables) • [Why Fixby?](#the-problem-why-naive-llms-fail-at-device-support) • [Architecture](#system-architecture-the-8-stage-pipeline) • [Innovations](#novel-engineering-innovations) • [Benchmarks](#empirical-performance-benchmarks) • [Quickstart](#quickstart-guide) • [Team](#team-and-ownership)

</div>

---

## 📋 Official Submission Deliverables

| Deliverable | Format / Link | Description |
|:---|:---|:---|
| 📺 **Demo Video (YouTube)** | [**Watch on YouTube (5 min)**](https://youtu.be/CweVKNfK24I?si=kOnye3QL2gz9HHFk) | Full walkthrough: cold query, sub-ms cache hits, Hinglish parsing, 3D Galaxy simulator, and One UI deeplinks. |
| 📊 **Presentation Deck** | [**`SRM_TheCyclops_PPT.pptx.pdf`**](./SRM_TheCyclops_PPT.pptx.pdf) | Official 12-slide presentation detailing architecture, benchmarks, innovations, and Samsung ecosystem fit. |
| 📝 **AI Disclosure Form** | [**`AI_Disclosure.pdf`**](./AI_Disclosure.pdf) | Complete, signed declaration of AI tools, platforms, system prompts, and human code contributions. |
| 🌐 **Live Web Console** | [**Launch Interactive Console**](https://fixby-galaxy-engine.onrender.com/) | Live interactive deployment featuring 3D Galaxy phone model, One UI simulator, and real-time DAG visualizer. |
| 📖 **Interactive API Docs** | [**Open Swagger / OpenAPI**](https://fixby-galaxy-engine.onrender.com/docs) | Live FastAPI documentation with Swagger UI for `/v1/troubleshoot`, `/v1/analytics`, and health checks. |

<div align="center">

### 📺 Watch the 5-Minute Submission Pitch & Walkthrough
[![Fixby Video Pitch Walkthrough](https://img.youtube.com/vi/CweVKNfK24I/maxresdefault.jpg)](https://youtu.be/CweVKNfK24I?si=kOnye3QL2gz9HHFk)  
*(Click above or visit: https://youtu.be/CweVKNfK24I?si=kOnye3QL2gz9HHFk)*

</div>

---

## The Problem: Why Naive LLMs Fail at Device Support

Modern Samsung Galaxy devices running **One UI 6+** have over **575+ nested settings menus and diagnostic toggles**. When a frustrated user asks a generic LLM (*"bhai mera phone bohot garam ho raha hai aur battery jaldi khatam ho rahi hai"*), traditional AI chatbots fail in four critical areas:

```
+-------------------------------+--------------------------------------------------------+
| Failure Category              | Real-World Consequence for Galaxy Users                |
+-------------------------------+--------------------------------------------------------+
| Hallucinated Web URLs         | Generates dead links like 'samsung.com/support/battery'|
|                               | instead of native OS-level deep links.                 |
+-------------------------------+--------------------------------------------------------+
| Broad-Menu Penalties          | Tells the user: "Go to Settings > Battery". The user   |
|                               | is still stranded across dozens of nested sub-menus.   |
+-------------------------------+--------------------------------------------------------+
| Dangerous Step Ordering       | Suggests destructive actions ("Factory Data Reset") as |
|                               | Step 1 or 2 instead of non-invasive optimizations.     |
+-------------------------------+--------------------------------------------------------+
| High Latency and Token Waste  | 2.5s to 4.0s round-trip latency and costly API calls   |
|                               | even for common questions asked millions of times.     |
+-------------------------------+--------------------------------------------------------+
```

---

## The Solution: How Fixby Works

Fixby replaces unconstrained generative hallucinations with a **deterministic, retrieval-bound, 8-stage pipeline**:
1. **Zero Hallucinated URLs:** The LLM is structurally prohibited from outputting web links. All links are bound to verified Samsung One UI URI intents (`bixby://settings/...`).
2. **Deepest Leaf Screen Resolution:** A dedicated graph algorithm navigates breadcrumb trails to deliver the user to the exact toggle (`Settings > Battery > Background usage limits`), not a vague parent screen.
3. **Sub-Millisecond Median Latency:** A 3-Tier Cascading Cache serves recurring queries in **under 1ms**, saving 95%+ in AI operational costs.
4. **Deterministic Auto-Repair:** Code-level schema enforcers normalize phrasing, enforce Samsung word limits, and order actions (non-invasive first, critical last) in **0.01ms** without re-prompting the LLM.

---

## Head-to-Head: Naive Chatbot vs. Fixby Diagnostic Engine

| Dimension | Standard GenAI / RAG Chatbot | Fixby Diagnostic Engine |
|:---|:---|:---|
| **Deeplink Target** | Hallucinates HTTP links or dead URLs | **Authenticated `bixby://settings/...` One UI URIs** |
| **Screen Depth** | Dumps user on root Settings menu | **Resolves exact leaf screen via SHKG tree (112 nodes)** |
| **Step Safety Ordering** | May suggest Factory Reset prematurely | **Safe/auto steps first; critical steps strictly gated last** |
| **Cache Latency** | 2,000ms to 4,000ms (LLM call every time) | **0.86ms median (p50) via 3-Tier Semantic Cache** |
| **Schema Strictness** | Drifted field names, unstructured output | **100% Samsung-Exact Pydantic v2 Contract** |
| **Multilingual Handling** | Rigid English prompts; fails on slang | **Native Korean (`ko`), Hinglish (`hi-Latn`), and Hindi (`hi`)** |
| **API Failure Resilience**| Fails on quota or rate limits | **Dual-LLM Circuit Breaker (Groq Qwen + Gemini Fallback)** |

---

## System Architecture: The 8-Stage Pipeline

The engine executes in **8 distinct stages**, orchestrated by [`src/core/pipeline.py`](src/core/pipeline.py):

```mermaid
flowchart TD
    A["User Complaint: English, Hinglish, Korean"] --> S0["Stage 0: Symptom Taxonomy and Slot Extractor<br/>5 Domains: Hinglish and Korean Native (<0.1ms)"]
    S0 --> S1{"Stages 1-3: 3-Tier Cascading Cache"}
    S1 -->|"Tier 1: Exact Hash (<1ms)"| HIT["Instant Return: Sub-millisecond"]
    S1 -->|"Tier 2: Slot Hash (<5ms)"| HIT
    S1 -->|"Tier 3: MiniLM Cosine (<50ms)"| HIT
    S1 -->|"Cache Miss: Cold Path"| S4["Stage 4: Candidate Deeplink Retrieval<br/>Retrieval-Bound Catalog Filter"]
    S4 --> S5["Stage 5: Retrieval-Bound Schema Extraction<br/>Contained Dual-LLM (Groq / Gemini)"]
    S5 --> S6["Stage 6: Settings Hierarchy Knowledge Graph - SHKG<br/>NetworkX Traversal to Leaf Screen"]
    S6 --> S7["Stage 7: Auto-Repair Validator and Scorer<br/>Template Enforcement and URL Scrubbing (0.01ms)"]
    S7 --> S8["Stage 8: Paraphrase Warming and Write-Through<br/>Populates Cache Tiers 1-3"]
    S8 --> OUT["Compliant TroubleshootResponse and Telemetry"]
```

---

## Novel Engineering Innovations

### 1. Settings Hierarchy Knowledge Graph (SHKG)
- **Problem:** Samsung evaluates whether solutions target the deepest possible screen. Targeting `Settings > Battery` receives a deduction if `Settings > Battery > Background usage limits` exists.
- **Innovation:** Implemented with `networkx.DiGraph` in [`src/core/settings_graph.py`](src/core/settings_graph.py), parsing breadcrumb paths across **22 authentic One UI screens** into **112 nodes**. The engine calculates shortest-path depth from root `Settings` and resolves the deepest leaf screen automatically.

### 2. Three-Tier Cascading Semantic Cache
- **Tier 1 (Exact Hash, <1ms):** MD5 hash on normalized query string.
- **Tier 2 (Semantic Slot Hash, <5ms):** Domain and symptom slot extraction hashed via SHA-256. If a user asks *"mera phone bohot garam ho raha hai"* and another asks *"phone is overheating"*, both map to `[battery:overheating]` and hit Tier 2 instantly.
- **Tier 3 (Sentence Vector Embedding, <50ms):** Cosine similarity using `all-MiniLM-L6-v2` embeddings with similarity threshold >= 0.82.
- **Write-Through Warming:** Every cold response automatically generates 5 diverse paraphrases and warms all 3 tiers.

### 3. Deterministic Auto-Repair Validator
- Located in [`src/core/validator.py`](src/core/validator.py), this code-level guardrail executes in **0.01ms**:
  - Enforces mandatory Samsung template: `"Follow these steps to perform this <Topic> Troubleshooting"`.
  - Normalizes goal titles to 2 to 3 words.
  - Formats action descriptions to 5 to 7 words, strictly beginning with `"It will"`.
  - Partitions actions: safe/auto steps first, critical/irreversible steps (e.g. Factory Reset) strictly last.
  - Scrubs any leaked HTTP/HTTPS links and substitutes verified `bixby://settings/...` fallbacks.

### 4. Multi-Lingual Hinglish and Korean Support
- Fast Tier-0 taxonomy in [`src/core/taxonomy.py`](src/core/taxonomy.py) recognizes native Korean Hangul (배터리, 방전, 발열, 터치, 충전) and colloquial Hinglish idioms (*"garam ho raha"*, *"jaldi khatam"*, *"ruk ruk ke"*, *"chal nahi raha"*), detecting language without invoking an LLM.

### 5. Multi-Turn Diagnostic Escalation
- [`src/core/session.py`](src/core/session.py) tracks conversation state across turns:
  - If Step 1 ("Clear Cache") fails, Turn 2 escalates to `CAUTION` ("Reset App Preferences") and eventually `CRITICAL` ("Factory Reset").
  - Dynamically filters out previously attempted action IDs to prevent repetitive loops.

---

## Empirical Performance Benchmarks

Measured using the self-auditing benchmark harness ([`src/backend/benchmark.py`](src/backend/benchmark.py)) across **41 diverse queries** in English, Hinglish, and Korean:

| Metric | Measured Value | Samsung PRISM Target | Hackathon Verdict |
|:---|:---|:---|:---|
| **Hallucinated URL Leaks** | **0 leaks** | 0 leaks strictly | **PASS (Zero Leaks)** |
| **Schema Compliance Rate** | **100.0%** | 100.0% | **100% Samsung-Exact** |
| **Cache Hit Rate** | **73.2%** | >= 60.0% | **TARGET SURPASSED** |
| **Median Latency (p50)** | **0.86 ms** | < 300 ms | **SUB-MILLISECOND (<1ms)** |
| **95th Percentile (p95)** | **1.05 ms** | < 800 ms | **REAL-TIME READY** |
| **99th Percentile (p99)** | **23.82 ms** | < 1,500 ms | **NO COLD-START SPIKES** |
| **Average Query Latency** | **1.80 ms** | < 500 ms | **INSTANTANEOUS** |

*Detailed benchmark breakdown and language distribution recorded in [`metrics.md`](metrics.md) and [`results.jsonl`](results.jsonl).*

---

## Repository Structure

```
fixby-galaxy-engine/
├── SRM_TheCyclops_PPT.pptx.pdf    # Official Presentation Deck (12 Slides)
├── AI_Disclosure.pdf              # Signed Official AI Usage Disclosure Form
├── DEPLOYMENT.md                  # Comprehensive Free Cloud Deployment Guide
├── Dockerfile                     # Root multi-cloud container definition
├── render.yaml                    # 1-Click Render.com Blueprint configuration
├── contracts/                     # Official Data Contracts
│   ├── schema.py                  # Samsung-exact Pydantic v2 data models
│   ├── deeplinks.json             # 112 authentic One UI settings (NetworkX graph nodes)
│   └── mock_responses.json        # Contract fixture for frontend/backend testing
├── docs/                          # Architecture, Guides & Presentation Deck
│   ├── assets/                    # Whiteboard architecture and presentation graphics
│   ├── MASTER_ARCHITECTURE_AND_INTEGRATION_PLAN.md
│   ├── TEAM_WALKTHROUGH.md        # 5-Day engineering flow & milestones
│   └── guides/                    # Detailed individual member manuals
├── src/
│   ├── core/                      # Pipeline, Cache, SHKG, Validator, Taxonomy, Session
│   │   ├── pipeline.py            # 8-stage pipeline orchestrator
│   │   ├── cache.py               # 3-tier cascading semantic cache
│   │   ├── settings_graph.py      # NetworkX Settings Hierarchy Knowledge Graph
│   │   ├── validator.py           # Auto-repair validator & templater
│   │   ├── scorer.py              # Compositional confidence scorer
│   │   ├── session.py             # Multi-turn conversational session manager
│   │   └── taxonomy.py            # Multilingual symptom taxonomy & slot extractor
│   ├── ai/                        # LLM circuit breaker, matcher, paraphraser, extractor
│   │   ├── llm_client.py          # Groq + Gemini dual-provider circuit breaker
│   │   ├── matcher.py             # Candidate deeplink retrieval (SentenceTransformer)
│   │   ├── extractor.py           # Retrieval-bound schema extractor
│   │   └── paraphraser.py         # Write-through query variation generator
│   ├── frontend/                  # Interactive 3D Web Console & Landing Page
│   │   ├── index.html             # Ambient Three.js 3D landing page
│   │   ├── demo.html              # Live diagnostic console with One UI simulator
│   │   └── js/app.js              # Console master controller with dynamic cloud routing
│   └── backend/                   # FastAPI application & Telemetry
│       ├── main.py                # Dual-mode FastAPI gateway (/v1/troubleshoot)
│       ├── telemetry.py           # Live latency percentiles & query analytics
│       └── benchmark.py           # Self-auditing 41-query benchmark harness
├── tests/                         # Automated Unit & Integration Test Suites
│   ├── test_core/                 # Core engine unit tests
│   ├── test_ai/                   # AI/ML engine unit tests
│   └── test_backend/              # API endpoint & telemetry tests
├── requirements.txt               # Pinned Python dependencies
├── metrics.md                     # Empirical benchmark markdown scorecard
└── results.jsonl                  # Per-query Theme 2 JSON Lines evaluation dataset
```

---

## Team and Ownership

**Team Name:** The Cyclops  
**Institution:** SRM Institute of Science and Technology (SRMIST-KTR)  
**Track:** Samsung PRISM GenAI Hackathon 3rd Edition (Theme 2: Smart Guided Troubleshooting Engine)

| Member | Role | Email | Primary Ownership & Deliverables |
|:---|:---|:---|:---|
| **Nishant Ranjan** *(Lead)* | **Team Lead & Core Engine Architect** | `nishant.ranjan.air1@gmail.com` | Contracts freeze, 8-stage pipeline orchestrator, 3-tier cache, SHKG graph, auto-repair validator, Docker & cloud deployment. |
| **G. Vishal** | **AI/ML Engineer** | `valiantvishal30@gmail.com` | Dual-LLM circuit breaker (Groq + Gemini), retrieval-bound extraction, catalog matcher, Hinglish/Korean translator. |
| **Nidhi Nayana** | **Frontend Developer** | `nidhinayana0412@gmail.com` | 3D Galaxy phone mockup, One UI settings simulator, diagnostic decision tree (DAG), telemetry HUD drawer, voice orb. |
| **Rangesh Pandian** | **Backend & Telemetry Engineer** | `rangeshpandian@gmail.com` | FastAPI service, `/v1/troubleshoot`, `/v1/analytics`, self-auditing benchmark harness, metrics generation. |

---

## Quickstart Guide

### 1. Prerequisites and Installation
```bash
# Clone the repository
git clone https://github.com/Nishant-codess/fixby-galaxy-engine.git
cd fixby-galaxy-engine

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate    # On Windows: .\venv\Scripts\Activate.ps1

# Install pinned dependencies
pip install -r requirements.txt
```

### 2. Run Automated Test Suite (27/27 Tests)
```bash
pytest tests/ -v
```

### 3. Run the Self-Auditing Benchmark
```bash
python -m src.backend.benchmark
```
*Outputs real-time statistics to `metrics.md` and generates `results.jsonl`.*

### 4. Start the FastAPI Live Server Locally
```bash
uvicorn src.backend.main:app --reload --port 8000
```
- Interactive Web Console: [http://localhost:8000/demo.html](http://localhost:8000/demo.html)
- 3D Landing Page: [http://localhost:8000/](http://localhost:8000/)
- Interactive Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: `curl http://localhost:8000/health`

### 5. Run Full Stack with Docker
```bash
docker build -t fixby-engine .
docker run -p 8000:8000 fixby-engine
```

---

<div align="center">
  <sub>Built with ❤️ by <b>The Cyclops</b> for the <b>Samsung PRISM GenAI Hackathon 3rd Edition</b></sub>
</div>
