# Roadmap — Mai Batata Hun

## Overview

**5 phases** | **30 v1 requirements** | Deadline: Sep 25, 2026

---

### Phase 1: Core Troubleshooting Pipeline
**Goal:** Build the end-to-end pipeline from complaint text → structured troubleshooting plan with Samsung schema compliance
**Requirements:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-007, REQ-008
**Success Criteria:**
1. Given a plain-text complaint, the pipeline outputs a valid `Goal > Action > StepGroup > Step` JSON matching Samsung's Pydantic schemas
2. Deeplinks from `deeplinks.json` are correctly mapped to actions
3. Steps are ordered: non-invasive → moderate → critical
4. No web URLs appear anywhere in the output
5. Title and description word limits are enforced

---

### Phase 2: Semantic Cache & Performance
**Goal:** Implement two-tier semantic caching and LLM integration for sub-300ms cached responses
**Requirements:** REQ-009, REQ-010, REQ-011, REQ-012
**Success Criteria:**
1. Cached queries return in <300ms (measured end-to-end)
2. Embedding models (MiniLM + BGE) load and run on CPU without GPU
3. Gemini API integration works with free tier key
4. Groq API fallback triggers when cache miss + low latency needed
5. Cache hit rate >60% on Samsung's sample `queries.json` paraphrases

---

### Phase 3: REST API & Docker
**Goal:** Wrap the pipeline in a production-ready FastAPI service, containerized with Docker
**Requirements:** REQ-013, REQ-014, REQ-015
**Success Criteria:**
1. `POST /v1/troubleshoot` returns valid JSON responses
2. `GET /health` returns 200 with service status
3. `docker compose up` starts the entire service in <30 seconds
4. Fresh `git clone` + `docker compose up` works with zero manual setup
5. API handles concurrent requests without crashing

---

### Phase 4: Differentiators & Frontend
**Goal:** Build the Galaxy device mockup UI, voice input, multi-language support, analytics, and all standout features
**Requirements:** REQ-016, REQ-017, REQ-018, REQ-019, REQ-020, REQ-021, REQ-022, REQ-023
**UI hint**: yes
**Success Criteria:**
1. Hindi and Korean complaint text produces valid English troubleshooting plans
2. Confidence scores appear on every step in the UI
3. Voice input captures speech and triggers troubleshooting lookup
4. Galaxy device mockup looks like an actual Samsung phone with animated transitions
5. Analytics dashboard shows live cache hit rate and complaint statistics
6. Feedback buttons (helpful/not helpful) work and influence cache behavior

---

### Phase 5: Submission Package
**Goal:** Prepare and polish all hackathon deliverables — video, deck, disclosure, benchmarks, and tagged release
**Requirements:** REQ-024, REQ-025, REQ-026, REQ-027, REQ-028, REQ-029, REQ-030
**Success Criteria:**
1. `README.md` has clear reproducible setup instructions
2. `metrics.md` includes latency percentiles (p50, p95, p99), cache hit rates, accuracy scores
3. `results.jsonl` contains evaluation results
4. 5-minute video demonstrates the working prototype end-to-end
5. 12-slide PPT follows Samsung's exact template
6. AI Disclosure form is completed
7. Git release tag `PRISM_GENAI_HACKATHON_Y2026` is created
