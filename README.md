# 📱 Fixby — Smart Guided Troubleshooting Engine
### *Samsung PRISM GenAI Hackathon 3rd Edition | Theme 2*

[![CI Status](https://github.com/your-username/fixby-galaxy-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/fixby-galaxy-engine/actions)
[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688.svg)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-Samsung%20PRISM%202026-brightgreen.svg)]()

> **Fixby** (*"Your Galaxy's AI Fix Companion"*) is an ultra-fast, zero-hallucination troubleshooting engine that transforms natural conversational device complaints into structured, actionable diagnostic plans with direct one-tap Samsung One UI deeplinks.

---

## 🌟 Highlights & Merged Innovation Portfolio (20 Innovations)

### 🧠 Algorithmic & Backend Innovations (14)
1. **Three-Tier Cascading Cache:** Tier 1 Exact Hash (<5ms) + Tier 2 Semantic Slot Hash (<20ms) + Tier 3 Embedding ANN (<200ms) with feedback adaptation.
2. **Retrieval-Bound Generation:** The LLM is structurally prohibited from outputting raw URLs; selects from candidate deeplink IDs enum with zero hallucination.
3. **Settings Hierarchy Knowledge Graph (SHKG):** Directed graph (~575 nodes) resolving candidate deeplinks to the exact deepest leaf screen instead of parent menus.
4. **Generate → Verify → Auto-Repair Loop:** Code-level validator that automatically repairs mechanical schema/format violations without extra LLM retry costs.
5. **Domain Complaint-to-Solution Scorer:** Multi-factor scoring evaluating symptom overlap, hardware component matching, and safety escalation gating.
6. **Compositional Confidence Scoring:** Grounded formula combining retrieval similarity, self-consistency, and reference coverage rather than arbitrary LLM estimates.
7. **Samsung Device Symptom Taxonomy:** Domain ontology classifying conversational symptoms across Galaxy device subsystems with Hinglish aliases.
8. **Feedback-Driven Cache Evolution:** Self-optimizing index dynamically adjusting weights based on user confirmation.
9. **Hinglish Tech Idiom Normalizer:** Maps Indian colloquial tech support phrases (*"hang ho raha hai"*, *"battery jaldi udd gayi"*) to canonical technical intents.
10. **Dual-LLM Circuit Breaker:** Gemini 1.5 Flash as primary with automatic sub-second fallback to Groq LLaMA-3.3-70B on latency or quota breach.
11. **Strict Goal Template Enforcement:** Guaranteeing the mandatory prefix `"Follow these steps to perform this [Category] Troubleshooting"` per Samsung spec.
12. **Synthetic Data Augmentation Pipeline:** Generates register-diverse training & cache-warming paraphrases across 8 linguistic styles.
13. **Sub-Screen Navigation Path Synthesizer:** Reconstructs full breadcrumb trails (`Settings > Battery > Background usage limits`) for screens lacking native deep URI targets.
14. **Self-Auditing Benchmark Harness:** Dynamically validates schema compliance, URL safety, leaf resolution, and cache tier performance from live execution logs.

### 🎨 Visual & Experiential Innovations (6)
1. **Live One UI Settings Simulator:** Animated step-by-step navigation through simulated One UI settings screens inside a 3D Galaxy phone model.
2. **Interactive Diagnostic Decision Graph (DAG):** Visual pan-and-zoom node tree with glowing paths and safety level badges (🟢 Safe, 🟡 Caution, 🔴 Critical).
3. **Real-Time Engine "X-Ray / Judge HUD":** Live telemetry drawer exposing language normalization, latency gauge, pipeline source, and citation grounding confidence.
4. **Instant Real-Device QR Bridge:** Scan a dynamic QR code on screen to trigger native Samsung settings intents on a real Galaxy phone!
5. **Bilingual Voice Diagnostics:** Real-time speech recognition & text-to-speech in English and Hindi with an animated Bixby voice orb.
6. **Split-Screen Baseline Comparison:** Side-by-side live contrast during demo: Naive LLM (hallucinating links and slow latency) vs. Fixby Engine (verified leaf deeplink, fast slot-cache hit).

---

## 👥 4-Member Independent Team Guides

Each member has a dedicated, self-contained playbook with zero blocking dependencies:

| Role | Member | Playbook | Domain & Focus | Independent Days |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1** | **Nishant** *(Lead)* | [👑 Member 1 Guide](docs/guides/MEMBER_1_LEAD_GUIDE.md) | Repo setup, 8-stage orchestrator, 3-tier cache, SHKG, auto-repair validator, Docker | Days 1–2: Stubs & Unit Tests |
| **Member 2** | **G. Vishal** | [🤖 Member 2 Guide](docs/guides/MEMBER_2_AIML_GUIDE.md) | Gemini + Groq fallback, retrieval-bound schema extraction, catalog matcher, Hinglish, DAG | Days 1–2: LLM & AI Testbed |
| **Member 3** | **Nidhi Nayana** | [🎨 Member 3 Guide](docs/guides/MEMBER_3_FRONTEND_GUIDE.md) | 3D Galaxy S24 model, One UI simulator, DAG viewer, HUD inspector, Voice orb, Split-Screen | Days 1–2: 100% Mock UI |
| **Member 4** | **Rangesh** | [⚙️ Member 4 Guide](docs/guides/MEMBER_4_BACKEND_GUIDE.md) | FastAPI server, `/v1/troubleshoot`, telemetry, 100-query benchmark suite | Days 1–2: Mock Mode API |

🎯 **Team Role Selection & Fit Assessment Quiz:** [docs/TEAM_ROLES_AND_FIT_ASSESSMENT.md](docs/TEAM_ROLES_AND_FIT_ASSESSMENT.md)  
🗺️ **Complete Team Flow & Master Integration Timeline:** [docs/TEAM_WALKTHROUGH.md](docs/TEAM_WALKTHROUGH.md)  
📖 **Master Architecture & Integration Plan:** [docs/MASTER_ARCHITECTURE_AND_INTEGRATION_PLAN.md](docs/MASTER_ARCHITECTURE_AND_INTEGRATION_PLAN.md)  
🎬 **Demo Presentation Script:** [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)

---

## 📂 Project Structure

```
├── contracts/                     # Pydantic schemas & mock response fixtures (Member 1)
│   ├── schema.py                  # Strict Samsung official schema
│   ├── deeplinks.json             # Verified Samsung One UI deep link catalog
│   └── mock_responses.json        # Test fixture for Day 1 development
├── docs/                          # Architectural documentation & member playbooks
│   ├── MASTER_ARCHITECTURE_AND_INTEGRATION_PLAN.md
│   ├── TEAM_ROLES_AND_FIT_ASSESSMENT.md # Team Role Selector & 5-MCQ Quiz per Role
│   ├── TEAM_WALKTHROUGH.md        # Master 5-Day Integration Flow & Schedule
│   ├── DEMO_SCRIPT.md             # 5-Minute winning pitch script
│   └── guides/                    # Individual 0-to-Hero Member Guides
│       ├── MEMBER_1_LEAD_GUIDE.md
│       ├── MEMBER_2_AIML_GUIDE.md
│       ├── MEMBER_3_FRONTEND_GUIDE.md
│       └── MEMBER_4_BACKEND_GUIDE.md
├── src/
│   ├── core/                      # [Member 1] Pipeline orchestrator, cache, validator, taxonomy, SHKG
│   ├── ai/                        # [Member 2] LLM clients, catalog matcher, translator, DAG builder
│   ├── frontend/                  # [Member 3] 3D Galaxy scene, One UI simulator, HUD, Voice
│   └── backend/                   # [Member 4] FastAPI app, endpoints, telemetry, benchmarks
├── tests/                         # Independent test suites per module
│   ├── test_core/
│   ├── test_ai/
│   ├── test_frontend/
│   └── test_backend/
├── docker/                        # Containerization & deployment
├── requirements.txt               # Pinned Python dependencies
└── .env.example                   # Environment configuration template
```

---

## 🚀 Quickstart (Local Development)

### 1. Clone & Set Up Environment
```bash
# Clone the repository
git clone https://github.com/<YOUR_GITHUB_USERNAME>/fixby-galaxy-engine.git
cd fixby-galaxy-engine

# Create virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: .\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
cp .env.example .env
```

### 2. Run API Server (Backend)
```bash
uvicorn src.backend.main:app --reload --port 8000
```

### 3. Run Web App (Frontend)
```bash
python3 -m http.server 3000 --directory src/frontend
```
Open [http://localhost:3000](http://localhost:3000) in Google Chrome.

---

## 🧪 Running Benchmarks & Tests

```bash
# Run all unit tests
pytest -v

# Run the 100-query latency & cache benchmark
python -m src.backend.benchmark
```
