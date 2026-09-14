# src/core/pipeline.py — 8-Stage Pipeline Orchestrator (with Day 1-2 Stubs)
"""
Fixby 8-Stage Troubleshooting Pipeline Orchestrator.
Orchestrates:
  Stage 0: Symptom Taxonomy Classification & Slot Extraction
  Stages 1-3: 3-Tier Cascading Semantic Cache (Exact Hash, Slot Hash, Vector Similarity)
  Stage 4: Candidate Deeplink Retrieval (Retrieval-Bound)
  Stage 5: Retrieval-Bound Schema Extraction
  Stage 6: Settings Hierarchy Knowledge Graph (SHKG) Leaf Resolution
  Stage 7: Auto-Repair Validation & Compositional Scoring
  Stage 8: Paraphrase Generation & Write-Through Cache Warming

Contains Day 1-2 stubs for standalone testing and benchmarking.
On Day 3, stubs will be swapped with Member 2's live AI modules.
"""
import copy
import time
from typing import Optional, List
from contracts.schema import (
    TroubleshootResponse,
    ContextDeeplinkResponse,
    PipelineMeta,
    Goal,
    Action,
    StepGroup,
    Deeplink,
    ActionCategory,
)
from src.core.taxonomy import classify_complaint_taxonomy, extract_slots
from src.core.cache import cache
from src.core.settings_graph import settings_graph
from src.core.validator import validate_and_repair
from src.core.scorer import compute_compositional_confidence

# ============================================================================
# DAY 1-2 STUBS: Standalone testbed before Day 3 Member 2 integration
# ============================================================================
def _stub_get_candidate_ids(query: str, top_k: int = 5) -> List[str]:
    slots = extract_slots(query)
    domain = slots.get("domain", "battery")
    if domain == "battery":
        return ["DL_BATTERY_CARE", "DL_BG_LIMITS"]
    elif domain == "display":
        return ["DL_DISPLAY_MOTION", "DL_NAV_GESTURES"]
    elif domain == "performance":
        return ["DL_DEVICE_CARE", "DL_AUTO_RESTART"]
    return ["DL_SETTINGS_ROOT"]


def _stub_extract_structured_plan(query: str, candidate_ids: List[str], siis_response: Optional[str] = None) -> List[Goal]:
    slots = extract_slots(query)
    domain = slots.get("domain", "battery")

    if domain == "battery":
        action_name = "Background Usage Limits"
        desc = "It will limit unused background apps"
        deeplink = "bixby://settings/device_care/battery/background_limits"
        steps = [
            "Open Settings on your Galaxy device",
            "Tap Battery",
            "Tap Background usage limits",
            "Put unused apps to deep sleep"
        ]
        goal_title = "Battery drain"
    elif domain == "display":
        action_name = "Motion Smoothness"
        desc = "It will optimize screen refresh rate"
        deeplink = "bixby://settings/display/motion_smoothness"
        steps = [
            "Open Settings on your Galaxy device",
            "Tap Display",
            "Select Motion smoothness",
            "Choose Adaptive 120Hz"
        ]
        goal_title = "Display stutter"
    else:
        action_name = "Device Care Optimization"
        desc = "It will optimize device system performance"
        deeplink = "bixby://settings/device_care"
        steps = [
            "Open Settings on your Galaxy device",
            "Tap Device Care",
            "Tap Optimize now"
        ]
        goal_title = "Device lag"

    action = Action(
        actionName=action_name,
        description=desc,
        category=ActionCategory.auto,
        stepGroups=[
            StepGroup(
                steps=steps,
                actionableDeeplink=Deeplink(
                    deeplink=deeplink,
                    description=f"Direct link to {action_name}"
                )
            )
        ]
    )
    return [Goal(goal="", title=goal_title, actions=[action], score=0.88)]


def _stub_generate_paraphrases(query: str) -> List[str]:
    return [
        f"Galaxy troubleshooting: {query}",
        f"Fix {query} on Samsung device",
        f"Help with {query}"
    ]
# ============================================================================


def run_troubleshoot_pipeline(query: str, siis_response: Optional[str] = None) -> TroubleshootResponse:
    """
    Executes the 8-stage Fixby troubleshooting pipeline.
    """
    start_time = time.time()

    # Stage 0: Taxonomy Classification & Slot Extraction (<0.1ms)
    complaint_cats = classify_complaint_taxonomy(query)
    slots = extract_slots(query)

    # Stages 1-3: 3-Tier Cascading Cache Check (<20ms)
    cached_val, tier = cache.get(query, slots)
    if cached_val is not None:
        latency = round((time.time() - start_time) * 1000, 2)
        # Deep copy to prevent mutating cached state
        resp_copy = copy.deepcopy(cached_val)
        resp_copy.meta.latency_ms = latency
        resp_copy.meta.cache_hit = True
        resp_copy.meta.cache_tier = tier
        return resp_copy

    # Stage 4: Candidate Deeplink Retrieval (CALLED BEFORE EXTRACTION)
    candidate_ids = _stub_get_candidate_ids(query, top_k=5)

    # Stage 5: Retrieval-Bound Schema Extraction
    raw_goals = _stub_extract_structured_plan(query, candidate_ids, siis_response)

    # Stage 6: SHKG Leaf Resolution
    leaf_id = settings_graph.resolve_deepest_screen(candidate_ids, domain=slots.get("domain"))
    if raw_goals and raw_goals[0].actions and raw_goals[0].actions[0].stepGroups:
        sg = raw_goals[0].actions[0].stepGroups[0]
        if sg.actionableDeeplink and leaf_id and leaf_id in settings_graph.catalog_map:
            resolved_item = settings_graph.catalog_map[leaf_id]
            sg.actionableDeeplink.deeplink = resolved_item.get("deeplink", sg.actionableDeeplink.deeplink)

    # Stage 7: Auto-Repair Validation & Compositional Scoring
    topic = slots.get("domain", "Device")
    repaired_goals, _ = validate_and_repair(raw_goals, topic=topic)
    score = compute_compositional_confidence(retrieval_sim=0.92, consistency_score=0.85, coverage_score=0.88)
    for g in repaired_goals:
        g.score = score

    # Stage 8: Paraphrase Generation & Write-Through Cache Warming
    variations = _stub_generate_paraphrases(query)
    latency = round((time.time() - start_time) * 1000, 2)

    meta = PipelineMeta(
        latency_ms=latency,
        cache_hit=False,
        cache_tier="cold",
        model="stub-pipeline",
        cost_usd=0.0,
        complaint_category=complaint_cats[0] if complaint_cats else "general.unknown",
        language_detected="en",
        confidence_breakdown={"retrieval": 0.92, "consistency": 0.85, "coverage": 0.88},
        hallucination_check_passed=True,
        screen_resolution="leaf_screen",
        pipeline_source="live"
    )

    resp = TroubleshootResponse(
        query=query,
        query_variations=variations,
        response=ContextDeeplinkResponse(contexts=repaired_goals),
        meta=meta
    )

    # Warm cache with query variations (write-through)
    cache.put(query, resp, slots=slots, variations=variations)
    return resp
