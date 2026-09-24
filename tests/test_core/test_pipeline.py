# tests/test_core/test_pipeline.py
"""
Fixby Core Engine Unit Test Suite.
Tests taxonomy, 3-tier cache, SHKG graph, auto-repair validator, scorer, and 8-stage pipeline.
"""
import pytest
from contracts.schema import (
    Goal,
    Action,
    StepGroup,
    Deeplink,
    ActionCategory,
    TroubleshootResponse,
)
from src.core.taxonomy import classify_complaint_taxonomy, extract_slots
from src.core.cache import CascadingSemanticCache
from src.core.settings_graph import SettingsHierarchyGraph
from src.core.validator import build_goal_string, validate_and_repair
from src.core.scorer import compute_compositional_confidence
from src.core.pipeline import run_troubleshoot_pipeline, run_followup_pipeline


# ============================================================================
# 1. Symptom Taxonomy Tests
# ============================================================================
def test_taxonomy_battery_english():
    cats = classify_complaint_taxonomy("battery draining fast")
    assert "battery.rapid_drain" in cats
    slots = extract_slots("battery draining fast")
    assert slots["domain"] == "battery"
    assert slots["symptom"] == "rapid_drain"


def test_taxonomy_hinglish():
    cats = classify_complaint_taxonomy("mera phone bohot garam ho raha hai")
    assert "battery.overheating" in cats
    slots = extract_slots("mera phone bohot garam ho raha hai")
    assert slots["domain"] == "battery"
    assert slots["symptom"] == "overheating"


def test_taxonomy_display_and_performance():
    display_cats = classify_complaint_taxonomy("screen touch not working")
    assert "display.touch_unresponsive" in display_cats

    perf_cats = classify_complaint_taxonomy("phone lag and hang problem")
    assert "performance.general_lag" in perf_cats


def test_taxonomy_unknown():
    cats = classify_complaint_taxonomy("something unrelated entirely")
    assert cats == ["general.unknown"]
    slots = extract_slots("something unrelated entirely")
    assert slots["domain"] == "general"


# ============================================================================
# 2. Settings Hierarchy Knowledge Graph (SHKG) Tests
# ============================================================================
def test_shkg_leaf_resolution():
    shkg = SettingsHierarchyGraph()
    catalog = [
        {"id": "DL_ROOT", "deeplink": "bixby://settings", "classes": {"path": "Settings"}},
        {"id": "DL_BATTERY", "deeplink": "bixby://settings/battery", "classes": {"path": "Settings>Battery"}},
        {"id": "DL_BG_LIMITS", "deeplink": "bixby://settings/battery/bg_limits", "classes": {"path": "Settings>Battery>Background usage limits"}},
    ]
    shkg.build_from_catalog(catalog)

    leaf = shkg.resolve_deepest_screen(["DL_BATTERY", "DL_BG_LIMITS"])
    assert leaf == "DL_BG_LIMITS"


def test_shkg_fallback_dummy():
    shkg = SettingsHierarchyGraph()
    res = shkg.resolve_deepest_screen([])
    assert res == "bixby://dummy_positive"


# ============================================================================
# 3. Auto-Repair Validator Tests
# ============================================================================
def test_goal_template_exact():
    assert build_goal_string("Battery") == "Follow these steps to perform this Battery Troubleshooting"
    assert build_goal_string("display") == "Follow these steps to perform this Display Troubleshooting"


def test_validator_action_ordering_and_description():
    crit_action = Action(
        actionName="Factory Reset",
        description="Reset phone",  # Too short, doesn't start with "It will"
        category=ActionCategory.critical,
        stepGroups=[
            StepGroup(
                steps=["Open Settings", "Visit https://samsung.com for support"],  # URL leak
                actionableDeeplink=Deeplink(
                    deeplink="https://malicious-url.com",  # URL leak in deeplink
                    description="Support link"
                )
            )
        ]
    )
    safe_action = Action(
        actionName="Optimize Battery",
        description="limits unused background applications to save maximum power",  # >7 words
        category=ActionCategory.auto,
        stepGroups=[
            StepGroup(
                steps=["Open Settings", "Tap Battery"]
            )
        ]
    )

    test_goal = Goal(
        goal="Wrong Goal String",
        title="Excessively Long Goal Title That Violates Word Count",
        actions=[crit_action, safe_action],  # Critical is wrongly first
        score=0.5
    )

    repaired, logs = validate_and_repair([test_goal], topic="Battery")
    r_goal = repaired[0]

    # Check goal string enforcement
    assert r_goal.goal == "Follow these steps to perform this Battery Troubleshooting"

    # Check title normalization (2-3 words)
    assert len(r_goal.title.split()) in (2, 3)

    # Check action sorting (safe action auto first, critical action last)
    assert r_goal.actions[0].actionName == "Optimize Battery"
    assert r_goal.actions[1].actionName == "Factory Reset"

    # Check description rules (5-7 words, starts with "It will")
    for act in r_goal.actions:
        words = act.description.split()
        assert act.description.startswith("It will")
        assert 5 <= len(words) <= 7

    # Check URL scrubbing
    repaired_crit = r_goal.actions[1]
    sg = repaired_crit.stepGroups[0]
    for step in sg.steps:
        assert "http://" not in step and "https://" not in step
    assert sg.actionableDeeplink.deeplink == "bixby://dummy_positive"


# ============================================================================
# 4. Compositional Confidence Scorer Tests
# ============================================================================
def test_confidence_scorer():
    score = compute_compositional_confidence(retrieval_sim=0.9, consistency_score=0.8, coverage_score=0.85)
    # (0.4 * 0.9) + (0.3 * 0.8) + (0.3 * 0.85) = 0.36 + 0.24 + 0.255 = 0.855 -> 0.86
    assert score == 0.86
    assert 0.0 <= score <= 1.0


# ============================================================================
# 5. Cascading Cache Tests
# ============================================================================
def test_cache_tier1_exact_and_tier2_slot():
    test_cache = CascadingSemanticCache(similarity_threshold=0.52)
    sample_data = {"test": "data"}

    test_cache.put("battery drain", sample_data, slots={"domain": "battery", "symptom": "drain"})

    # Tier 1 Exact Hit
    val1, tier1 = test_cache.get("battery drain")
    assert tier1 == "tier1_hash"
    assert val1 == sample_data

    # Tier 2 Slot Hit (different phrasing, same slots)
    val2, tier2 = test_cache.get("completely different text", slots={"domain": "battery", "symptom": "drain"})
    assert tier2 == "tier2_slot_hash"
    assert val2 == sample_data

    # Tier 3 Semantic Vector Hit (similar subword phrasing when slots are empty/missing)
    val_vec, tier_vec = test_cache.get("battery draining quickly on galaxy", slots=None)
    assert tier_vec == "tier3_embedding"
    assert val_vec == sample_data

    # Cold Miss
    val3, tier3 = test_cache.get("unseen query about camera lens error", slots={"domain": "camera", "symptom": "none"})
    assert tier3 == "cold"
    assert val3 is None


# ============================================================================
# 6. Pipeline End-to-End Execution & Schema Validation
# ============================================================================
def test_pipeline_execution_cold_and_cache_hit():
    from src.core.cache import cache
    cache.tier1_exact.clear()
    cache.tier2_slots.clear()
    cache.tier3_vectors.clear()

    query = "my galaxy battery is draining so fast"

    # Cold run
    resp_cold = run_troubleshoot_pipeline(query)
    assert isinstance(resp_cold, TroubleshootResponse)
    assert resp_cold.meta.cache_hit is False
    assert resp_cold.meta.cache_tier == "cold"
    assert len(resp_cold.response.contexts) > 0

    first_goal = resp_cold.response.contexts[0]
    assert first_goal.goal.startswith("Follow these steps to perform this")
    assert len(first_goal.actions) > 0
    assert any(x in first_goal.actions[0].actionName for x in ["Background Usage", "Battery usage"])
    assert first_goal.actions[0].description.startswith("It will")

    # Warm run (Cache Hit)
    resp_warm = run_troubleshoot_pipeline(query)
    assert resp_warm.meta.cache_hit is True
    assert resp_warm.meta.cache_tier == "tier1_hash"
    assert resp_warm.meta.latency_ms >= 0


def test_taxonomy_sound_storage_security():
    # Sound domain
    sound_cats = classify_complaint_taxonomy("phone speaker crackling and sound distorted")
    assert "sound.speaker_distortion" in sound_cats
    sound_slots = extract_slots("phone speaker crackling and sound distorted")
    assert sound_slots["domain"] == "sound"

    # Storage domain
    storage_cats = classify_complaint_taxonomy("phone storage full clean storage and trash")
    assert any("storage" in c for c in storage_cats)
    storage_slots = extract_slots("storage cleanup and empty trash")
    assert storage_slots["domain"] == "storage"

    # Security domain
    sec_cats = classify_complaint_taxonomy("biometric fingerprint sensor not working")
    assert "security.biometrics_fingerprint" in sec_cats
    sec_slots = extract_slots("biometric fingerprint sensor not working")
    assert sec_slots["domain"] == "security"


def test_dynamic_confidence_scoring():
    from src.core.scorer import (
        calculate_retrieval_similarity,
        calculate_consistency_score,
        calculate_coverage_score,
    )

    # Retrieval similarity varies with token overlap
    item = {
        "id": "DL_BATTERY_CARE",
        "description": "Battery usage details and battery optimization",
        "classes": {"path": "Settings>Battery"}
    }
    high_sim = calculate_retrieval_similarity("battery usage optimization", item)
    low_sim = calculate_retrieval_similarity("screen brightness touch", item)
    assert high_sim > low_sim

    # Consistency score decreases with repairs
    clean_score = calculate_consistency_score(0)
    repaired_score = calculate_consistency_score(2)
    assert clean_score == 1.0
    assert repaired_score < clean_score

    # Coverage score responds to SIIS context
    cov_high = calculate_coverage_score(
        "battery overheating",
        leaf_screen_id="DL_BATTERY_CARE",
        siis_response="Battery overheating diagnostic report"
    )
    cov_no_siis = calculate_coverage_score(
        "battery overheating",
        leaf_screen_id="DL_BATTERY_CARE",
        siis_response=None
    )
    assert cov_high >= 0.88
    assert cov_no_siis == 0.90


def test_session_state_persistence_across_turns():
    from src.core.session import session_manager
    session_id = "test-session-persist-123"
    session_manager.clear(session_id)

    # Turn 2 followup with explicit attempted action
    res_turn2 = run_followup_pipeline(
        query="battery still draining fast",
        attempted_action_ids=["Background Usage Limits"],
        turn=2,
        session_id=session_id
    )
    assert res_turn2.turn == 2
    assert "Background Usage Limits" in res_turn2.previous_attempted_actions

    # Turn 3 followup: pass None for attempted_action_ids to verify it retrieves from session
    res_turn3 = run_followup_pipeline(
        query="phone still hot battery draining",
        attempted_action_ids=None,
        turn=3,
        session_id=session_id
    )
    assert res_turn3.turn == 3
    assert "Background Usage Limits" in res_turn3.previous_attempted_actions
    assert res_turn3.escalation_level == "CRITICAL"
    assert res_turn3.is_terminal is True

