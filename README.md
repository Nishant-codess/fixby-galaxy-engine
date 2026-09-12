# 📱 Mai Batata Hun — Smart Guided Troubleshooting Engine
### *Samsung PRISM GenAI Hackathon 3rd Edition | Theme 2*

[![CI Status](https://github.com/your-username/mai-batata-hun-galaxy-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/mai-batata-hun-galaxy-engine/actions)
[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688.svg)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-Samsung%20PRISM%202026-brightgreen.svg)]()

> **"Mai Batata Hun"** *(Hindi for "Let me tell you")* is an ultra-fast, zero-hallucination troubleshooting engine that transforms natural conversational device complaints into structured, actionable diagnostic plans with direct one-tap Samsung One UI deeplinks.

---

## 🌟 Highlights & Key Innovations

### 🧠 Algorithmic & Backend Innovations
1. **Two-Tier Cascading Semantic Cache:** MD5 Exact Hash (<5ms) + Semantic Embedding Retrieval (<200ms) with feedback adaptation.
2. **Domain Complaint-to-Solution Scorer:** Custom multi-factor scoring function evaluating symptom overlap, hardware component matching, and safety escalation gating.
3. **Automatic Troubleshooting DAG Generator:** Algorithms parsing unstructured Samsung guides into structured decision trees with conditional recovery paths.
4. **Samsung Device Symptom Taxonomy:** Domain ontology classifying conversational symptoms across 7 Galaxy device subsystems.
5. **Zero-Hallucination Grounding Guard:** Strict validation against official Samsung knowledge bases ensuring destructive actions (like factory reset) are safely gated.

### 🎨 Visual & Experiential Innovations (UI/UX)
1. **Live One UI Settings Simulator:** Animated step-by-step navigation through simulated One UI settings screens inside a 3D Galaxy phone model.
2. **Interactive Diagnostic Decision Graph:** Visual pan-and-zoom node tree with glowing paths and safety level badges (🟢 Safe, 🟡 Caution, 🔴 Critical).
3. **Real-Time Engine "X-Ray / Judge HUD":** Live telemetry drawer exposing language normalization, latency gauge, and citation grounding confidence.
4. **Instant Real-Device QR Bridge:** Scan a dynamic QR code on screen to trigger native Samsung settings intents on a real Galaxy phone!
5. **Bilingual Voice Diagnostics:** Real-time speech recognition & text-to-speech in English and Hindi with an animated Bixby voice orb.

---

## 👥 4-Member Independent Team Guides

Each member has a dedicated, self-contained playbook with zero blocking dependencies:

| Role | Member | Playbook | Domain & Focus |
| :--- | :--- | :--- | :--- |
| **Member 1** | **The Lead** | [👑 Member 1 Guide](docs/guides/MEMBER_1_LEAD_GUIDE.md) | Repo setup, 8-stage pipeline orchestrator, cascading cache, symptom taxonomy, Docker setup |
| **Member 2** | **AI/ML Engineer** | [🤖 Member 2 Guide](docs/guides/MEMBER_2_AIML_GUIDE.md) | Gemini + Groq fallback, schema extraction, FAISS deeplink indexing, DAG generator |
| **Member 3** | **Frontend Developer** | [🎨 Member 3 Guide](docs/guides/MEMBER_3_FRONTEND_GUIDE.md) | 3D Galaxy S24 model, One UI simulator, DAG viewer, HUD inspector, Voice orb |
| **Member 4** | **Backend Engineer** | [⚙️ Member 4 Guide](docs/guides/MEMBER_4_BACKEND_GUIDE.md) | FastAPI server, `/troubleshoot`, `/analytics`, 100-query benchmark suite |

📖 **Master Integration Plan:** [docs/MASTER_ARCHITECTURE_AND_INTEGRATION_PLAN.md](docs/MASTER_ARCHITECTURE_AND_INTEGRATION_PLAN.md)

---

## 📂 Project Structure

```
├── contracts/                     # Pydantic schemas & mock response fixtures
│   ├── schema.py                  # Strict Samsung official schema
│   └── mock_responses.json        # Test fixture for Day 1 development
├── docs/                          # Architectural documentation & member playbooks
│   ├── MASTER_ARCHITECTURE_AND_INTEGRATION_PLAN.md
│   └── guides/                    # Individual 0-to-Hero Member Guides
├── src/
│   ├── core/                      # [Member 1] Pipeline orchestrator, cache, validator, taxonomy
│   ├── ai/                        # [Member 2] LLM clients, FAISS matcher, translator, DAG builder
│   ├── frontend/                  # [Member 3] 3D Galaxy scene, One UI simulator, HUD, Voice
│   └── backend/                   # [Member 4] FastAPI app, endpoints, telemetry, benchmarks
├── tests/                         # Independent test suites per module
├── docker/                        # Containerization & deployment
├── requirements.txt               # Pinned Python dependencies
└── .env.example                   # Environment configuration template
```

---

## 🚀 Quickstart (Local Development)

### 1. Clone & Set Up Environment
```bash
# Clone the repository
git clone https://github.com/<YOUR_GITHUB_USERNAME>/mai-batata-hun-galaxy-engine.git
cd mai-batata-hun-galaxy-engine

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
# Run all tests
pytest -v

# Run the 100-query latency & cache benchmark
python -m src.backend.benchmark
```
