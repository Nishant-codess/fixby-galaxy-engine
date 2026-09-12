# Requirements — Mai Batata Hun

## v1 (Must Ship by Sep 25)

### Core Pipeline

- **REQ-001**: Query enrichment — normalize colloquial complaint text into canonical form, generate semantic cache key and 8-10 diverse paraphrases
- **REQ-002**: Structure extraction — parse Samsung reference text (`siis_responses.json`) into `Goal > Action > StepGroup > Step` hierarchy using Pydantic schemas
- **REQ-003**: Deeplink mapping — match each extracted action to the correct Samsung Bixby Settings deeplink from `deeplinks.json` (~575 URIs)
- **REQ-004**: Step sequencing — order steps: non-invasive first, moderate second, critical/destructive (factory reset, wipe) last
- **REQ-005**: Zero hallucination — only derive steps from reference text. Return `contexts: []` with `"no_match"` fallback if no match found
- **REQ-006**: Zero URL leaks — absolute prohibition of web URLs (samsung.com, http://) in any response field
- **REQ-007**: Strict word limits — Title (2–3 words), Description (5–7 words starting with "It will")
- **REQ-008**: Action categorization — classify actions as `auto` (has deeplink), `manual` (physical), `critical` (reboot/reset)

### Performance & Caching

- **REQ-009**: Semantic cache — two-tier cache using embedding similarity (exact hash + cosine threshold) for sub-300ms response on cache hits
- **REQ-010**: Embedding models — MiniLM-L6-v2 for cache key similarity, BGE-small for deeplink matching, both CPU-only
- **REQ-011**: LLM integration — Gemini API (free tier) for structure extraction, Groq API (free tier) for fast-path fallback
- **REQ-012**: Response time — <300ms for cached queries, <3s for uncached (full LLM pipeline)

### API

- **REQ-013**: REST endpoint `POST /v1/troubleshoot` — accepts `{ "query": "..." }`, returns structured troubleshooting plan JSON
- **REQ-014**: REST endpoint `GET /health` — returns service health status
- **REQ-015**: Docker containerization — `Dockerfile` + `docker-compose.yml` for one-command startup (`docker compose up`)

### Differentiators (v1 — ship these)

- **REQ-016**: Multi-language support — accept complaints in Hindi, Korean, and other languages, translate to English internally, process normally
- **REQ-017**: Confidence scoring — each step includes confidence score (0.0–1.0) and source reference trail
- **REQ-018**: Voice-to-troubleshoot — browser speech recognition (Web Speech API) for voice complaint input
- **REQ-019**: Galaxy device mockup frontend — interactive web UI simulating Samsung Galaxy phone screen with troubleshooting plan display
- **REQ-020**: Visual step preview — animated simulated Settings screens showing what each deeplink opens
- **REQ-021**: Proactive diagnostic chain — dependency-aware ordering with prerequisites and skip conditions
- **REQ-022**: Analytics dashboard — real-time display of complaint categories, cache hit rate, response times, deeplink coverage
- **REQ-023**: Feedback system — per-step helpful/not-helpful rating that adapts cache priorities

### Submission Deliverables

- **REQ-024**: Comprehensive `README.md` with reproducible setup instructions
- **REQ-025**: `metrics.md` benchmark report with latency percentiles, cache hit rates, accuracy scores
- **REQ-026**: `results.jsonl` — evaluation results in JSON Lines format
- **REQ-027**: 5-minute demo video uploaded to YouTube/Google Drive
- **REQ-028**: 12-slide PPT following Samsung's template (`CollegeName_TeamName_Submission.pptx`)
- **REQ-029**: AI Disclosure form (`LangAI3.0_AI_Disclosure.docx`)
- **REQ-030**: GitHub release tag `PRISM_GENAI_HACKATHON_Y2026`

## v2 (Post-hackathon / if time permits)

- **REQ-V2-001**: Fine-tuned embedding model on Samsung-specific terminology
- **REQ-V2-002**: Integration with actual Samsung Members app API
- **REQ-V2-003**: User session memory — remember past issues for returning users
- **REQ-V2-004**: A/B testing framework for different troubleshooting strategies
- **REQ-V2-005**: Multi-device support (tablets, wearables, TV)

## Out of Scope

- Actual Samsung device OS integration (this is a web prototype)
- Payment or credential handling
- Real Bixby deeplink execution on physical devices
- SMS/WhatsApp integration
- Customer identity management / authentication
- Code generation or code retrieval (Theme 1 territory)
- Modifying Samsung's reference text or deeplink database

## Traceability

| REQ | Phase |
|-----|-------|
| REQ-001 to REQ-008 | Phase 1: Core Pipeline |
| REQ-009 to REQ-012 | Phase 2: Performance & Caching |
| REQ-013 to REQ-015 | Phase 3: API & Docker |
| REQ-016 to REQ-023 | Phase 4: Differentiators & Frontend |
| REQ-024 to REQ-030 | Phase 5: Submission Package |
