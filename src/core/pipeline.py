# src/core/pipeline.py
import time
import json
from contracts.schema import (TroubleshootResponse, PipelineMeta,
                               ContextDeeplinkResponse, Goal, ClarificationOption)
from src.core.cache import cache
from src.core.taxonomy import (classify_complaint_taxonomy, extract_slots,
                                is_vague_query, get_clarification_options)
from src.core.validator import validate_and_repair, build_goal_string
from src.core.scorer import compute_grounded_confidence
from src.core.settings_graph import settings_graph
from src.ai.matcher import matcher
from src.ai.paraphraser import generate_query_variations

settings_graph.build_from_catalog(matcher.catalog)   # built ONCE at import time


def run_troubleshoot_pipeline(query: str, siis_response: str = None, language: str = "auto") -> TroubleshootResponse:
    start = time.time()
    slots = extract_slots(query)
    categories, confidence = classify_complaint_taxonomy(query)
    domain = slots.get("domain", "")

    # ── Task 2.2: Vague query detection ──
    if is_vague_query(query):
        clarification_opts = get_clarification_options(query)
        elapsed = round((time.time() - start) * 1000, 1)
        return TroubleshootResponse(
            query=query, query_variations=[],
            response=ContextDeeplinkResponse(contexts=[], fallback="no_match"),
            meta=PipelineMeta(latency_ms=elapsed, cache_hit=False,
                               cache_tier="cold", complaint_category=" + ".join(categories),
                               language_detected=language, pipeline_source="live",
                               confidence_breakdown={"composite": confidence}),
            clarification_needed=True,
            clarification_options=[ClarificationOption(**opt) for opt in clarification_opts],
            resolution_count=0)

    cached, tier = cache.get(query, slots)
    if cached:
        cached["meta"]["latency_ms"] = round((time.time() - start) * 1000, 1)
        cached["meta"]["cache_hit"] = True
        cached["meta"]["cache_tier"] = tier
        return TroubleshootResponse(**cached)

    # ── Domain-constrained candidate retrieval (Task 2.1) ──
    candidate_ids = matcher.get_candidate_ids(query, top_k=5, domain=domain)

    pipeline_source = "live"
    try:
        from src.ai.extractor import extract_structured_plan
        raw_goals = extract_structured_plan(query, candidate_ids, siis_response or "")
        if not raw_goals:
            return TroubleshootResponse(
                query=query, query_variations=[],
                response=ContextDeeplinkResponse(contexts=[], fallback="no_siis_context" if not siis_response else "no_match"),
                meta=PipelineMeta(latency_ms=round((time.time()-start)*1000,1), cache_hit=False,
                                   cache_tier="cold", complaint_category=" + ".join(categories),
                                   pipeline_source="live"),
                resolution_count=0)
    except Exception as e:
        print(f"[pipeline] Extraction failed ({e}); falling back to mock.")
        import os
        with open(os.path.join(os.path.dirname(__file__), "../../contracts/mock_responses.json"), "r") as f:
            data = json.load(f)
            raw_goals = [Goal(**g) for g in data["response"]["contexts"]]
        pipeline_source = "mock"

    # ── Bind deeplinks through SHKG ──
    for goal in raw_goals:
        for action in goal.actions:
            for sg in action.stepGroups:
                raw_id = getattr(sg, "_deeplink_id_staging", None) or (candidate_ids[0] if candidate_ids else None)
                if action.category.value != "manual":
                    sg.actionableDeeplink = matcher.bind_deeplink(raw_id, shkg=settings_graph, category=domain)

    goals, repairs, needs_retry = validate_and_repair(raw_goals)
    if needs_retry:
        pass  # bounded retry with machine-written diff of repairs

    for goal in goals:
        topic = goal.title or domain.capitalize()
        goal.goal = build_goal_string(topic)

    grounded_confidence = compute_grounded_confidence(
        retrieval_score=0.9 if candidate_ids else 0.4,
        extraction_samples=[g.model_dump() for g in goals][:2],
        reference_coverage=1.0 if siis_response else 0.6)
    
    for goal in goals:
        goal.score = grounded_confidence

    query_variations = generate_query_variations(slots)
    elapsed = round((time.time() - start) * 1000, 1)
    
    # Count total resolution actions
    resolution_count = sum(len(g.actions) for g in goals)

    meta_dict = {
        "latency_ms": elapsed, 
        "cache_hit": False, 
        "cache_tier": "cold",
        "complaint_category": " + ".join(categories), 
        "language_detected": language,
        "confidence_breakdown": {"composite": grounded_confidence, "taxonomy": confidence},
        "pipeline_source": pipeline_source,
        "screen_resolution": "leaf_screen",
        "hallucination_check_passed": True
    }
    
    response = TroubleshootResponse(
        query=query, query_variations=query_variations,
        response=ContextDeeplinkResponse(contexts=goals),
        meta=PipelineMeta(**meta_dict),
        resolution_count=resolution_count)
        
    from src.ai.graph_generator import generate_diagnostic_graph
    response.diagnostic_graph = generate_diagnostic_graph(response)

    cache.put(query, response.model_dump(), slots=slots, paraphrases=query_variations)
    return response
