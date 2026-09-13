# Compass — Smart Guided Troubleshooting Engine
### Product Requirements Document · Samsung PRISM Hackathon · Theme 2

*"Follow these steps" should never mean "click through five parent menus and hope."*

---

## Table of Contents

1. [Problem Recap & Why This Is Hard](#1-problem-recap--why-this-is-hard)
2. [Objectives & Success Metrics](#2-objectives--success-metrics)
3. [Architecture Selection & Rationale](#3-architecture-selection--rationale)
4. [System Architecture](#4-system-architecture)
5. [Novel Contributions — What No Other Team Will Ship](#5-novel-contributions--what-no-other-team-will-ship)
6. [Data Model & Contracts](#6-data-model--contracts)
7. [API Design](#7-api-design)
8. [Tech Stack](#8-tech-stack)
9. [Evaluation & Testing Harness](#9-evaluation--testing-harness)
10. [Known Pitfalls → Our Countermeasures](#10-known-pitfalls--our-countermeasures)
11. [Implementation Roadmap (Parallel-Agent, Hackathon-Timeboxed)](#11-implementation-roadmap-parallel-agent-hackathon-timeboxed)
12. [Team Split — Superset Worktrees](#12-team-split--superset-worktrees)
13. [Demo Script — The First 30 Seconds](#13-demo-script--the-first-30-seconds)
14. [Stretch Goal: RL-Aligned Small Model](#14-stretch-goal-rl-aligned-small-model)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [Further Reading / Prior Art We're Building On](#16-further-reading--prior-art-were-building-on)

---

## 1. Problem Recap & Why This Is Hard

Samsung's brief, distilled: turn a **vague, colloquial complaint** ("my phone's swipe gestures go the wrong way after installing an app") into a **machine-actionable, one-tap troubleshooting plan** — a strict JSON object with ordered `Action`s, each pointing at a *verified, exact* Settings screen via a masked `bixby://` deeplink — and do it in **under 300 ms** for anything resembling a previously-seen issue, with **zero hallucinated URLs**, **zero hallucinated steps**, and **byte-for-byte deterministic** output for semantically identical inputs.

The hard part isn't "call an LLM and parse JSON." It's that the brief explicitly punishes the obvious approach:

- Naive semantic caching (embed + cosine threshold) is *known* in the literature to be miscalibrated — a single fixed threshold either misses legitimate paraphrases or serves wrong answers (this is the exact failure mode Samsung's own pitfall #1, "Exact-String Cache Keying," is warning about).
- Letting the LLM write the deeplink string at all is a hallucination surface — LLMs are trained on the open web and will happily emit `samsung.com/support` from pretraining memory (pitfall #3) even when told not to (pitfall #5: "prompt-only constraints are unreliable").
- Matching on the *masked URI itself* is a dead end — the tokens are obfuscated on purpose (pitfall #4).
- "Screen resolution accuracy" (exact leaf screen vs. parent menu) and "action granularity" (One Action = One Screen) are *structural* problems, not phrasing problems — no amount of prompt engineering fixes a flat retrieval index that can't tell a parent menu from its child.

So the real product is: **a deterministic, hallucination-proof compiler from unstructured complaint text to a verified UI-action graph**, with an LLM used only where genuine language understanding is required, and everything else pushed into code, retrieval, and structure. That reframing is the seed of every novel feature below.

---

## 2. Objectives & Success Metrics

Directly lifted from Samsung's evaluation rubric — this is the scoreboard we are building against, not a vague guideline.

| Dimension | Metric | Target | Where we address it |
|---|---|---|---|
| **Robustness (automated gate)** | Schema-valid output lines | ≥ 99% | §5.2 Retrieval-Bound Generation + §5.4 Verify/Repair loop |
| | Rule compliance (Goal/Title/Description syntax) | ≥ 95% | §5.4 programmatic repair |
| | Absolute URL leaks | 0 | §5.2 (LLM never emits a URI) |
| | Deeplink catalog validity (exact URI match) | 100% | §5.2 |
| | Auto actions carrying a valid actionable deeplink | ≥ 90% | §5.3 SHKG resolution |
| **IR & Deeplink Precision** | Screen resolution accuracy (exact vs. parent) | high | §5.3 Settings Hierarchy Knowledge Graph |
| | Semantic paraphrase cache hit rate | ≥ 80% | §5.1 Semantic Slot Hashing |
| | Plan hierarchy (toggles → optimizations → reboots) | correct order | §5.5 Disruption-Weighted Ordering |
| **Latency & Cost** | Fast-path P95 | ≤ 300 ms | §5.1 tiered cache |
| | Cold-path P95 | ≤ 8 s | §5.8 model cascade |
| | Cost predictability | tracked, near-$0 | §5.8, §14 |
| **Determinism** | Identical plans for semantically identical inputs | consistent | §5.1 + §5.5 (both are pure functions of extracted structure, not LLM sampling) |

If a feature in this document doesn't trace to a row in this table, it doesn't ship before the ones that do.

---

## 3. Architecture Selection & Rationale

The "How to Win Hackathons" playbook gives three reference architectures. None of them is a drop-in fit — this problem has no camera feed and no computer to click around on — but each one contributes something real once you look past the surface framing:

| Reference architecture | Surface mismatch | What we actually borrow |
|---|---|---|
| **Arch 1 — Real-time video (watches)** | No camera/video input at all | The **cheap-tier / expensive-tier cascade**: a fast, cheap model screens *every* request; an expensive model is only woken up when the cheap tier is unsure. We reuse this exact idea for cost control (§5.8), just with text instead of frames. |
| **Arch 2 — Computer-use agent (acts)** | We don't control a device UI live | The **Observe → Ground → Act → Verify loop's discipline**: never trust an action to have worked — check. We repurpose this as **Generate → Ground → Verify → Repair** (§5.4): after the model drafts a plan, code — not another model — checks it against the schema and the catalog, and either patches it or forces a bounded retry. |
| **Arch 3 — Live digital twin (thinks)** | We don't need real-time world simulation | **This is our base architecture.** Its shape — *raw input → structured-extraction → structured state (graph + vector store) → agent layer that watches/plans over that state → recommendation with a reasoning trace* — is almost exactly the shape Samsung's own pipeline diagram (`[0]`–`[4]`) describes. We build directly on it. |

**Decision: Compass is built on Architecture 3 (structured-state + retrieval), hardened with Architecture 2's verify-loop discipline and Architecture 1's cost-tiering.** Concretely:

- Samsung's *"Normalizer → entity/relation extraction"* becomes our **Query Enrichment + Structure Extraction** phases.
- Samsung's *"Knowledge graph (relationships, causality)"* becomes our **Settings Hierarchy Knowledge Graph** — instead of modeling world events, it models the Settings app's menu tree, which is exactly the structure needed to solve "exact screen vs. parent menu."
- Samsung's *"Twin state (Postgres) + pgvector"* becomes our **tiered semantic cache**.
- Samsung's *"Watcher / Simulator / Planner"* agent layer becomes our **cache-lookup / verify-repair / action-ordering** trio — each is a deterministic function over the structured state, not a free-roaming agent, because determinism is a graded requirement here, not a nice-to-have.
- The *"recommendation + reasoning trace"* output is literally Samsung's `Goal` JSON object with its `score` and the retrieval evidence behind it.

We are explicit that this is *not* a literal digital twin (no simulation of "what if route X closes?") — we take its data-modeling philosophy, not its runtime behavior, because that's the part that transfers.

---

## 4. System Architecture

```
Raw Complaint  (+ optional siis_response text)
        │
        ▼
┌───────────────────────────── STAGE 0 · Query Enrichment ─────────────────────────────┐
│  Cheap/local model → slot extraction:                                                 │
│    {domain: Battery|Display|Camera|Performance, symptom, trigger_event, modifier}     │
│  → canonical technical query string                                                   │
│  → Semantic Slot Hash  (novel, §5.1)                                                  │
│  → 8–10 register-diverse query_variations (novel, §5.6)                               │
└───────────────────────────────────────┬───────────────────────────────────────────────┘
                                         ▼
┌───────────────────────────── STAGE 3 · Fast-Path Cache (checked FIRST) ───────────────┐
│  Tier 1: exact hash match           →  <5 ms                                          │
│  Tier 2: slot-hash match            →  <20 ms   (novel, §5.1)                         │
│  Tier 3: adaptive-threshold ANN     →  <150 ms  (novel, §5.1, VectorQ-style)           │
│  HIT  → return cached, pre-validated plan, done. (P95 ≤ 300 ms)                       │
│  MISS → fall through to cold path                                                     │
└───────────────────────────────────────┬───────────────────────────────────────────────┘
                                         ▼ (cold path)
┌───────────────────────────── STAGE 1 · Structure Extraction ──────────────────────────┐
│  If siis_response given → extract Goal/Actions/Steps from it (schema-constrained gen)  │
│  If not given → hybrid retrieval over siis_responses.json corpus first (mini-RAG),     │
│    then extract; if nothing clears the relevance floor → fallback "no_siis_context"    │
│  Output is grammar/schema-constrained — invalid JSON is structurally impossible        │
└───────────────────────────────────────┬───────────────────────────────────────────────┘
                                         ▼
┌───────────────────────────── STAGE 2 · Deeplink Mapping & Ordering ───────────────────┐
│  Hybrid retrieval (BM25 + dense) over deeplinks.json METADATA ONLY                     │
│    (description / message / qna_description — never the masked URI string itself)     │
│  → RRF fusion → cross-encoder rerank → shortlist of candidate IDs                      │
│  → Settings Hierarchy Knowledge Graph resolves exact leaf screen (novel, §5.3)         │
│  → LLM picks an ID from the shortlist ONLY — never writes a URI (novel, §5.2)          │
│  → Disruption-Weighted topological sort orders actions (novel, §5.5)                   │
└───────────────────────────────────────┬───────────────────────────────────────────────┘
                                         ▼
┌───────────────────────────── Generate → Ground → VERIFY → REPAIR loop (novel, §5.4) ──┐
│  Pydantic schema check · word-count/prefix rules · zero-URL regex scrub ·              │
│  catalog-existence check · category-ordering check                                     │
│  Fixable in code?  → auto-repair, no extra LLM call                                    │
│  Not fixable?      → ONE bounded retry with a machine-written diff of violations        │
└───────────────────────────────────────┬───────────────────────────────────────────────┘
                                         ▼
┌───────────────────────────── STAGE 4 · REST API Service ──────────────────────────────┐
│  Retrieval-Grounded Confidence Score attached (novel, §5.7)                            │
│  Write-through: canonical query + ALL 8-10 paraphrases registered into cache           │
│  Pure JSON out · latency/cache-hit/cost metadata attached                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

The critical design choice visible in this diagram: **the cache is checked before any structure extraction happens**, and **cache writes are amplified at generation time** (all 8-10 paraphrases get registered, not just the one the user typed). This is why the system can plausibly clear an 80% hit rate on *unseen* paraphrases rather than just the literal query that was asked before.

---

## 5. Novel Contributions — What No Other Team Will Ship

Being direct about honesty here: individual techniques below (constrained decoding, hybrid retrieval, semantic caching) are established research. **The novelty is in which of these we combine, and the domain-specific inventions we layer on top that are custom-built for Samsung's exact automated gates** — most teams at a hackathon will ship "prompt an LLM, parse the JSON, maybe add a basic embedding cache." That system will fail pitfalls #1, #3, #4, and #5 out of the gate. This section is the gap between that and a system that passes the automated gates *by construction*.

### 5.1 Semantic Slot Hashing (SSH) — deterministic caching that survives paraphrase

**Problem it kills:** Pitfall #1 (exact-string keys miss paraphrases) *and* the opposite failure mode that plain embedding-threshold caches have — research on this exact problem (VectorQ, MeanCache) shows a single fixed cosine threshold is never right for every embedding distribution: too loose and you serve wrong answers on a "cache hit," too strict and you miss real paraphrases and blow the ≥80% hit-rate target.

**How it works:** Stage 0 extracts a small closed set of slots — `{domain, symptom, trigger_event, modifier}` — via a cheap model (or even a fine-tuned classifier, see §14). The cache key is a hash of the *sorted slot tuple*, not of the embedding. Two wildly different-looking sentences ("swipe gestures go the wrong way after installing an app" vs. "navigation feels inverted since I downloaded that game") collapse to the same slot tuple → the same key → **byte-identical cached output**, which is exactly what "Deterministic Execution" requires and an embedding-similarity cache cannot promise.

```python
def semantic_slot_hash(slots: dict) -> str:
    canonical = "|".join(f"{k}={slots[k]}" for k in sorted(slots))
    return hashlib.sha256(canonical.encode()).hexdigest()[:16]
```

This is Tier 2 of a three-tier cache: Tier 1 exact string hash (cheapest), Tier 2 slot hash (this), Tier 3 an *adaptive*-threshold ANN lookup for genuinely ambiguous slot extractions (threshold learned per-embedding-cluster rather than fixed, the way VectorQ argues for) — only Tier 3 ever risks a false hit, and it's the tier of last resort, not the whole strategy.

### 5.2 Retrieval-Bound Generation (RBG) — deeplinks the model literally cannot hallucinate

**Problem it kills:** Pitfalls #3 and #4, and the "Zero URL Leaks" / "Catalog Integrity" gates, *by construction rather than by prompting.*

**How it works:** The LLM is never given the ability to emit a URI string. The pipeline is:

1. Hybrid retrieval (BM25 + dense embeddings, fused with Reciprocal Rank Fusion) runs over the deeplink catalog's **`description` / `message` / `qna_description` fields only** — never the masked `bixby://...` token, per pitfall #4.
2. A cross-encoder reranker (a proven second-stage precision step in modern RAG pipelines) narrows this to a shortlist of 3–5 candidate deeplink IDs.
3. Generation is schema/grammar-constrained (à la Outlines/XGrammar-style finite-state-machine decoding, or Claude's native structured tool-use) so the model's *only* legal output for the deeplink field is an **enum choice over the shortlisted IDs** (or the literal `bixby://dummy_positive` sentinel when nothing clears a relevance floor).
4. Code — not the model — substitutes the real URI string from the catalog after the fact.

There is no code path by which a hallucinated or pretraining-memorized URL can reach the response, because the model's output space for that field doesn't contain arbitrary strings in the first place. A regex URL-scrubber still runs downstream as defense-in-depth, but it should never actually catch anything — if it does, that's a bug in the shortlist enum, not a "the LLM slipped one past the prompt" event.

### 5.3 Settings Hierarchy Knowledge Graph (SHKG) — solving "exact screen" as a graph problem, not a text problem

**Problem it kills:** "Screen Resolution Accuracy" and pitfall #2 (over/under-granular actions) — Samsung's own scoring explicitly distinguishes hitting the *exact target screen* from just landing on its parent menu, which flat semantic similarity fundamentally cannot express (a parent menu's description is often *more* semantically similar to a vague query than the specific child screen is).

**How it works:** At indexing time, parse `deeplinks.json`'s `classes` metadata field and description text into a lightweight directed graph (in-process, `networkx` — ~575 nodes needs no database): `Settings → Display → Navigation bar → Swipe gesture toggle`. When retrieval returns multiple plausible candidates for one step group, resolution prefers the **deepest node whose ancestor path is consistent with the extracted goal's category**, rather than the highest raw similarity score. The same graph enforces "One Action = One Screen": step groups whose retrieved nodes collapse to the same graph node are merged under a single `Action`; step groups landing on different nodes are correctly split. This graph is also the visual centerpiece of the demo (§13) — nothing sells "we actually understand the Settings hierarchy" like watching a highlighted path animate down the tree live.

### 5.4 Generate → Ground → Verify → Repair loop — code-checked, not model-checked

**Problem it kills:** Pitfall #5 ("prompt-only constraints are unreliable" — an LLM cannot reliably count to 7 words) and most of the "Robustness & Hygiene" gate.

**How it works:** After a draft plan is generated, a **pure-code verifier** — no extra model call — checks every hard constraint: Pydantic schema conformance, the `description` field's exact 5–7-word / "It will…" prefix rule, zero URL leaks, deeplink existence in the catalog, and category ordering. Violations split into two buckets:

- **Mechanically fixable** (word count off by one, wrong case, ordering wrong) → **auto-repaired in code, zero extra tokens spent.**
- **Structurally broken** (extraction genuinely nonsensical) → exactly **one bounded retry**, with a machine-generated diff of what failed appended to the prompt — a cheaper, more reliable cousin of the critique-then-revise pattern from SELF-RAG-style research, except the critique comes from a deterministic validator instead of the model critiquing itself (which research on LLM self-confidence shows is often overconfident and poorly calibrated).

This is the single biggest lever on both the latency budget (most fixes cost 0 extra ms) and the "≥95% rule compliance" gate.

### 5.5 Disruption-Weighted Topological Sort — deterministic, LLM-free action ordering

**Problem it kills:** "Plan Hierarchy" scoring (toggles → optimizations → reboots) and the determinism requirement — ordering should never depend on model sampling.

**How it works:** A small curated *disruption index* maps action keywords/categories to an ordinal score (e.g., toggle a setting `0` < clear cache `1` < restart an app `2` < reset network settings `3` < factory reset `5`), independent of `auto/critical/manual` category which is the primary sort key. Actions are topologically sorted by `(category, disruption_index)` — pure code, zero model calls, 100% reproducible for identical inputs.

### 5.6 Register-Diverse Paraphrase Generation for `query_variations`

**Problem it kills:** Naively asking a model to "paraphrase this 10 times" produces near-duplicate phrasing that barely stress-tests the cache and often fails the schema's own diversity intent (formal / casual / keyword-only / frustrated / typo-inclusive).

**How it works:** Paraphrases are generated against an explicit register × slot matrix rather than free-form repetition — one generation per register bucket, each conditioned on the extracted slots. This produces genuinely diverse variations *and* doubles as adversarial cache-population: every one of the 8–10 variants is registered into the Tier-2 cache at write time (§5.1), so the very phrasings evaluators are most likely to probe with ("ugh my phone battery dies so fast wtf" — frustrated register) are pre-warmed rather than left to Tier-3 luck.

### 5.7 Retrieval-Grounded Confidence Scoring

**Problem it kills:** Asking a model to output a bare `0.0–1.0` confidence number is exactly the failure mode recent hallucination-calibration research (e.g. work on LLM verbalized confidence) documents as systematically overconfident and weakly correlated with actual correctness.

**How it works:** `score` is computed compositionally, not asked for:

```
score = w1 · retrieval_similarity(best_deeplink_match)
      + w2 · self_consistency_agreement(k low-temp structure-extraction samples)
      + w3 · reference_coverage(extracted steps traceable to a sentence in siis_response)
```

This is grounded, reproducible, and cheap (the `k` samples can be small since agreement, not quality, is what's being measured) — and it means a low `score` genuinely signals "the retrieved evidence is thin," which is far more useful downstream than a model's guess.

### 5.8 Cost-Aware Model Cascade

**Problem it kills:** "Cost Predictability" — tracking token/inference cost per query, and keeping the cold-path P95 under 8 s without paying for a frontier model on every request.

**How it works:** Borrowed directly from Architecture 1's cheap-tier/expensive-tier split. A small local model (CPU-only, see §8) handles Stage 0 slot extraction and the cross-encoder rerank — both are classification-shaped tasks that don't need a frontier model. A stronger hosted model (Claude, schema/tool-use constrained) is invoked *only* on a genuine cache miss, and only for the Stage 1 structure-extraction step where real language understanding is needed. Every response's `meta` block reports which tier served it and its dollar cost — which, on a cache hit, is provably `$0.00`, matching Samsung's own worked example in Appendix B of the theme doc.

---

## 6. Data Model & Contracts

We adopt Samsung's `schema.py` verbatim as the wire contract (`Goal`, `Action`, `StepGroup`, `Deeplink`, `ContextDeeplinkResponse`, etc.) — reinventing the schema would be pure risk for zero benefit. Two additions on top, both internal (never exposed in the API response):

| Addition | Purpose |
|---|---|
| `SlotSet` (domain, symptom, trigger_event, modifier) | Drives Semantic Slot Hashing (§5.1) |
| `GraphNode` edges derived from `deeplinks.json`'s `classes` field | Powers the SHKG (§5.3) |

Golden test fixtures: the five pairs in `samples/` are used two ways — as few-shot exemplars in the constrained-generation prompt, *and* as a regression suite that must keep passing as the pipeline evolves.

---

## 7. API Design

Matches Samsung's contract exactly, with our internal metadata surfaced in `meta`:

```
POST /v1/troubleshoot
{
  "query": "phone swipe gestures wrong direction after app install",
  "siis_response": "<optional raw reference text>"
}

→ 200 OK
{
  "query": "...",
  "query_variations": [ ...8-10 diverse paraphrases... ],
  "response": { "contexts": [ <Goal objects> ] },
  "meta": {
    "latency_ms": 212,
    "cache_hit": true,
    "cache_tier": "slot_hash",       // exact | slot_hash | ann | cold
    "model": "gpt-4o-mini",
    "cost_usd": 0.0,
    "confidence_breakdown": { "retrieval": 0.94, "self_consistency": 0.9, "coverage": 0.88 }
  }
}

GET /health → {"status": "ok"}   once cache, embedding index, and SHKG graph are warm
```

`siis_response` omitted → mini-RAG over the pre-indexed `siis_responses.json` corpus runs before falling back to `{"contexts": [], "fallback": "no_siis_context"}`. No viable solution in retrieved reference text at all → `{"contexts": [], "fallback": "no_match"}`, per the spec's "No Hallucinated Steps" rule. All responses are pure JSON — no markdown fences, no conversational preamble, enforced by a final serialization guard.

---

## 8. Tech Stack

Adapted from the hackathon playbook's stack, swapped for what an offline, latency-critical, hallucination-averse text pipeline actually needs (no camera/voice components — this isn't Architecture 1's problem shape):

| Layer | Choice | Why |
|---|---|---|
| Dev workflow | **Superset**, multiple isolated git worktrees | Parallelize the 4 workstreams in §12 without merge conflicts under time pressure |
| Prompting speed | **Wispr Flow** | Spec/steer agents by voice instead of typing all weekend |
| Agent brain (structure extraction) | **Claude**, schema/tool-use constrained | Best-in-class long agent loops + reliable structured tool-calling for the constrained-generation step |
| Bulk coding | **Codex** | Parallel boilerplate (FastAPI routes, Pydantic wiring, test scaffolding) while Claude handles the pipeline logic |
| Slot extraction / reranking | Small **local, CPU-only models** (e.g. a distilled classifier or a `bge-small`/MiniLM cross-encoder via `sentence-transformers`) | Given the dev machine is a CPU-only laptop (i3, 16 GB RAM, Ollama already installed), keep Stage 0 and reranking fully local — zero marginal cost, zero network dependency mid-demo, and it's the concrete mechanism behind §5.8's cost cascade |
| Sparse retrieval | `rank_bm25` | Exact-keyword recall for terms embeddings miss (device names, error codes) |
| Dense retrieval | `sentence-transformers` embeddings + RRF fusion with BM25 | Hybrid retrieval consistently outperforms either alone in recent RAG benchmarks |
| Graph | in-process `networkx` (not Neo4j) | ~575 nodes doesn't need a graph database; keeps cold-start time near zero, which matters for the 8 s cold-path budget |
| Cache | **Redis** (Tier 1 + 2), local **FAISS/HNSW** (Tier 3 ANN) | Sub-5ms exact/slot lookups; ANN only as the expensive fallback tier |
| State / persistence | **Supabase** (Postgres + pgvector + auth + realtime, one free tier) | Matches the "four services, one signup" efficiency the playbook recommends |
| Backend | **FastAPI** | Async, Pydantic-native, trivially matches Samsung's exact REST contract |
| Orchestration of the Generate→Ground→Verify→Repair loop | **LangGraph** | Explicit state machine with retries/branching beats ad-hoc prompt chaining for a loop with a hard retry bound |
| Demo dashboard | **Next.js + shadcn/ui + Tailwind + React Flow** | React Flow specifically for animating the SHKG graph traversal live (§13) |
| Containerization | Docker, single lightweight image | Matches the spec's "clean containerization, dependable cold-start" requirement |

**Engineering conventions:** hot-path code (cache lookup, hashing, ordering) should stay allocation-light and comment-free/self-documenting in the pipeline's inner loops, consistent with how this team already writes performance-critical code — the validation/repair layer is exactly the kind of place that benefits from that discipline, since it runs on every single request.

---

## 9. Evaluation & Testing Harness

Directly instantiates Samsung's `metrics.md` template — this isn't a separate test plan, it's the literal grading rubric turned into an automated suite:

1. **Schema & Rule Compliance** — run every request in `queries.json` plus all generated `query_variations`; assert ≥99% schema-valid, ≥95% rule-compliant, 0 URL leaks, 100% catalog validity.
2. **Accuracy Benchmarks** — score `samples/` and a small held-out set on Step Accuracy (0–3) and Deeplink Relevance (0–2) against hand-labeled ground truth.
3. **Latency Benchmarks** — N≥30 requests per path (cache-hit exact, cache-hit paraphrase, cold), report P50/P95, assert ≤300 ms / ≤8000 ms.
4. **Cost & Cache Efficacy** — track $/query by tier, assert ≥80% semantic hit rate on paraphrases *not* in the literal training/query set.
5. **Ablation** — three configurations run side-by-side for the writeup: (a) baseline full-LLM deeplink mapping (the naive approach every other team will likely ship), (b) hybrid BM25+dense retrieval only, (c) full Compass stack (retrieval + SHKG + verify/repair). This ablation table *is* the pitch for why the novel components matter — it should turn into the demo's most persuasive slide.

---

## 10. Known Pitfalls → Our Countermeasures

Every pitfall Samsung explicitly calls out, mapped to the section that kills it:

| Pitfall | Countermeasure |
|---|---|
| Exact-string cache keying | §5.1 Semantic Slot Hashing (semantically-grounded key, not raw string or naive embedding threshold) |
| Over/under-granular actions | §5.3 SHKG collapses/splits step groups by graph node, enforcing One Action = One Screen |
| URL injection from pretraining | §5.2 model never has a code path to emit a URI at all |
| Matching on masked URI strings | §5.2/§5.3 retrieval indexes `description`/`message`/`qna_description` only |
| Prompt-only constraints unreliable | §5.4 every hard constraint is checked and auto-repaired in code, not requested in the prompt |

---

## 11. Implementation Roadmap (Parallel-Agent, Hackathon-Timeboxed)

Scaled to a ~30–36 hour hackathon window; compress or stretch proportionally to the actual clock.

| Window | Milestone |
|---|---|
| Hour 0–3 | Schema validation harness live (`schema.py` as-is); parse `deeplinks.json`/`siis_responses.json`; baseline parsing sanity-checked against `samples/` |
| Hour 3–10 | Hybrid BM25+dense index over deeplink metadata; SHKG graph built and queryable; screen-resolution logic passing on `samples/` |
| Hour 10–18 | Semantic Slot Hashing + 3-tier cache wired; Generate→Ground→Verify→Repair loop live in LangGraph; disruption-weighted ordering |
| Hour 18–26 | REST endpoints (`/v1/troubleshoot`, `/health`) assembled; error boundaries (`no_match`, `no_siis_context`); full pipeline stress test — cold-start, cache hits, schema compliance |
| Hour 26–32 | Demo dashboard (React Flow graph viz + latency/cache-hit live readout); ablation table generated for the pitch |
| Hour 32–end | Buffer, polish, dry-run the pitch, cut anything not load-bearing for the demo |

---

## 12. Team Split — Superset Worktrees

Four isolated agent lanes, mirroring the playbook's "one frontend, one backend, one bug, one polish" split:

- **Lane A — Data & Retrieval:** index `deeplinks.json` (hybrid retrieval), build the SHKG, index `siis_responses.json` for the no-`siis_response` fallback path.
- **Lane B — Core Pipeline:** query enrichment/slot extraction, schema-constrained structure extraction, Retrieval-Bound Generation, the Verify/Repair loop.
- **Lane C — Caching & API:** Redis tiers, FastAPI service, schema validation harness, cost/latency telemetry.
- **Lane D — Demo & Eval:** React Flow dashboard, the ablation-table eval script, `metrics.md` report generation.

---

## 13. Demo Script — The First 30 Seconds

Judges decide in the first 30 seconds — so the demo opens mid-action, not with introductions:

1. Type a deliberately messy, never-before-seen complaint live on stage.
2. Split screen: **left = a naive "just prompt an LLM" baseline visibly hallucinating a `samsung.com/support` link or landing on the wrong parent menu; right = Compass** resolving the exact leaf screen with a real masked deeplink — the contrast *is* the pitch.
3. Live latency counter ticks down and turns green under 300 ms on a cache hit.
4. React Flow graph animates the SHKG traversal from `Settings` down to the exact leaf node in real time.
5. If a physical Galaxy device is available at the venue: literally tap the returned deeplink and let the phone jump straight to the real settings screen on stage. Nothing sells "one-tap" like an actual phone doing it.
6. *Then* introduce the team, in the remaining time.

---

## 14. Stretch Goal: RL-Aligned Small Model

If time and compute allow (this needs GPU access most hackathon laptops won't have — flag it as a stretch, not a dependency): the automated gates in §2 are, structurally, a **reward function** — schema conformance, zero-leak, catalog-match, and latency are all cheaply and exactly scoreable in code. That is precisely the shape of problem an RL fine-tuning loop like GRPO/DPO is built for, and it's the same shape of reward-scoring infrastructure already built for the CRAFT project's Phi-3-Mini fine-tuning. Repurposing that reward-scorer pattern here — reward = schema validity + zero-leak + catalog match + brevity — to fine-tune a small local model that *natively* emits compliant structure would let Stage 1 skip constrained-decoding infrastructure entirely on the cold path. This is exactly the kind of feature that requires already having built an RL fine-tuning pipeline to even consider attempting in a hackathon window — which is what makes it worth naming here even if it stays out of the MVP.

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `deeplinks.json`'s `classes` field doesn't cleanly encode menu hierarchy | Fall back to inferring hierarchy from shared keyword prefixes in `description`; degrade gracefully to flat retrieval + reranking, still correct, just without the graph's tie-breaking edge |
| Local CPU-only models too slow for the 300 ms fast-path budget | Fast path never touches the LLM or the cross-encoder at all — only cache lookups; keep the reranker strictly on the cold path where the 8 s budget has headroom |
| Constrained/grammar decoding infra eats setup time | Fall back to Claude's native structured tool-use (already schema-constrained) instead of standing up a separate grammar engine — same guarantee, less plumbing |
| Ablation table shows the "novel" components aren't actually beating the naive baseline | Treat this as a real finding, not a demo risk — report it honestly and pivot the pitch to whichever component *did* move the needle; a defensible ablation is more credible to judges than a suspiciously perfect one |

---

## 16. Further Reading / Prior Art We're Building On

Named for the team's own reference, not claimed as our invention — every technique below is established work we are combining and adapting, not originating:

- **Semantic caching & threshold calibration:** GPTCache, VectorQ, MeanCache, SCALM
- **Constrained/grammar-guided decoding:** Outlines, XGrammar, llguidance
- **Hybrid retrieval + reranking:** BM25 + dense fusion (RRF) followed by cross-encoder reranking, standard in current production RAG pipelines
- **Grounded generation / critique-repair loops:** SELF-RAG-style critique-then-revise, retrieval-gated generation
- **Confidence calibration:** research on LLM verbalized/self-reported confidence being poorly calibrated absent external grounding signals
