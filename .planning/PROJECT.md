# Mai Batata Hun — Smart Guided Troubleshooting Engine

## Project Overview

**Mai Batata Hun** ("Let me tell you" in Hindi) is a smart guided troubleshooting engine for Samsung Galaxy devices. It transforms vague, colloquial customer complaints into structured, ordered, machine-actionable troubleshooting plans with one-tap deeplinked Samsung Settings actions — all in under 300ms for cached queries.

Built for **Samsung PRISM GenAI Hackathon 3rd Edition (2026–27), Theme 2**.

## Problem Statement

Samsung Galaxy customers describe device issues colloquially ("my phone is slow and battery drains fast"). Customer support agents spend 15+ minutes manually mapping these vague descriptions to specific Settings navigation paths. This engine automates that entire process:

1. **Understands** vague complaints in any language (Hindi, Korean, English)
2. **Extracts** structured troubleshooting goals, actions, and steps
3. **Maps** each action to the correct Samsung Bixby Settings deeplink
4. **Orders** steps safely (non-invasive first, destructive/critical last)
5. **Returns** a machine-actionable JSON plan in <300ms (cached) / <3s (uncached)

## Team

- **Team Size**: 4 members
- **Experience Level**: Moderate — comfortable with Python/APIs, newer to embeddings and Docker
- **Naming Convention**: `CollegeName_TeamName` (as per hackathon rules)

## Tech Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI (async, high-performance)
- **Containerization**: Docker + docker-compose (one-command startup)
- **Schema Validation**: Pydantic v2 (strict mode)

### AI/ML Layer
- **LLM (Structure Extraction)**: Google Gemini API (free tier via Google AI Studio)
  - Model: gemini-2.0-flash or gemini-1.5-flash (free, fast, generous limits)
  - Used for: Query enrichment, structure extraction from reference text, multi-language translation
- **LLM (Fast Path)**: Groq API (free tier)
  - Model: llama-3.1-70b-versatile or mixtral-8x7b-32768
  - Used for: Fast fallback on cache misses where Gemini latency is too high
- **Embeddings (Semantic Cache)**: sentence-transformers/all-MiniLM-L6-v2 (local, CPU)
  - Lightweight, fast inference for cache key generation and similarity lookup
- **Embeddings (Deeplink Matching)**: BAAI/bge-small-en-v1.5 (local, CPU)
  - Higher quality for precise deeplink URI matching

### Frontend (Demo)
- **Samsung Galaxy Device Mockup**: Interactive web UI simulating a Galaxy phone screen
- **Tech**: HTML/CSS/JS (vanilla) with premium glassmorphism design
- **Features**: Voice input (Web Speech API), animated step transitions, analytics dashboard

### Data Storage
- **Semantic Cache**: In-memory vector store (FAISS or numpy-based)
- **Session State**: Redis or in-memory dict (for feedback/analytics)

## Key Differentiators (Standout Features)

### 1. Multi-Language Complaint Support 🌍
Accept complaints in Hindi, Korean, Spanish, or any language. Automatically translate to English, process through the pipeline, and return the structured plan. Samsung is a Korean company judging in India — this resonates deeply.

### 2. Confidence Scoring & Explainability 🔍
Every troubleshooting step includes:
- Confidence score (0.0–1.0) showing match certainty
- Source reference trail linking each step back to Samsung's reference text
- Deeplink match confidence showing why that specific URI was chosen

### 3. Visual Step-by-Step Galaxy UI Preview 📱
The demo frontend doesn't just list steps — it simulates the actual Samsung Settings screens that would appear when each deeplink is tapped. Animated transitions between screens.

### 4. Voice-to-Troubleshoot 🎤
Browser-based speech recognition allows users to speak their complaint. Live demo of "my phone battery drains fast" → instant troubleshooting plan appearing on the Galaxy mockup.

### 5. Proactive Diagnostic Chain 🔗
Instead of a flat list, build a dependency-aware diagnostic tree:
- Non-invasive checks first (check battery stats, close background apps)
- Moderate actions next (clear cache, disable battery-heavy apps)
- Critical/destructive actions last (factory reset)
- Each step group has prerequisites and skip conditions

### 6. Feedback Loop with Adaptive Caching 📊
Users can rate each step as helpful/not helpful. The semantic cache adapts:
- Highly-rated plans get boosted similarity thresholds
- Poorly-rated plans trigger re-generation on next similar query
- Shows Samsung this system improves over time

### 7. Real-Time Analytics Dashboard 📈
Live dashboard showing:
- Most common complaint categories
- Average resolution time per complaint type
- Cache hit rate percentage
- Deeplink coverage analysis
- Query volume over time

## Samsung's Strict Constraints (MUST comply)

1. **Zero URL leaks**: Absolute prohibition of web URLs (samsung.com, http://) in responses
2. **Strict word limits**: Title (2–3 words), Description (5–7 words starting with "It will")
3. **Zero hallucinated steps**: Only derive steps from reference text; return `contexts: []` with fallback `"no_match"` if unresolvable
4. **Action categories**: `auto` (has deeplink), `manual` (physical clean/repair), `critical` (reboot/reset, ordered last)
5. **Schema compliance**: Output must match Samsung's Pydantic schemas exactly (`Goal`, `Action`, `StepGroup`, `Step`)
6. **Deeplink format**: Use masked Bixby Settings deeplinks from `deeplinks.json` (~575 URIs)

## API Contract

### Endpoints
- `POST /v1/troubleshoot` — Primary endpoint, accepts complaint text, returns structured plan
- `GET /health` — Health check endpoint
- `GET /v1/analytics` — Real-time analytics data
- `POST /v1/feedback` — Submit step-level feedback

### Performance Targets
- **Cached queries**: <300ms response time (semantic cache hit)
- **Uncached queries**: <3s response time (full LLM pipeline)
- **Startup**: Docker one-command, <30s to ready

## Evaluation Criteria (Samsung Scoring)

```
Working Prototype & Core Functionality  : 30%
Technical Depth & Feasibility           : 25%
Innovation & Originality                : 20%
Relevance to Theme                      : 15%
Presentation, Documentation & Repro     : 10%
```

## Deliverables (Due Sep 25, 11:59 PM)

1. **GitHub repo** with release tag `PRISM_GENAI_HACKATHON_Y2026`
2. **Docker setup** for one-command execution
3. **5-minute demo video** on YouTube/Google Drive
4. **12-slide PPT** (`CollegeName_TeamName_Submission.pptx`)
5. **AI Disclosure** (`LangAI3.0_AI_Disclosure.docx`)
6. **Evaluation artifacts**: `metrics.md` and `results.jsonl`

## Timeline

- **Sep 12–14**: Project setup, register team, lock theme
- **Sep 15–18**: Core pipeline (extraction, caching, deeplink matching, API)
- **Sep 19–21**: Frontend, Docker, benchmarking
- **Sep 22–23**: Polish, analytics dashboard, demo video prep
- **Sep 24–25**: Final video, deck, disclosure, tag & submit

## Success Criteria

- [ ] All Samsung Pydantic schemas pass validation (0% schema errors)
- [ ] Zero URL leaks in any response
- [ ] Sub-300ms cached response time
- [ ] Multi-language support working (at least Hindi + English + Korean)
- [ ] Voice input functional in demo
- [ ] Galaxy device mockup looks production-quality
- [ ] Docker one-command startup works
- [ ] `metrics.md` and `results.jsonl` generated
- [ ] 5-minute video recorded and uploaded
- [ ] Git release tagged `PRISM_GENAI_HACKATHON_Y2026`
