"""
tests/test_ai/test_ai_modules.py — Comprehensive Unit & Integration Test Suite
Tests for Member 2 (AI/ML Engineer) modules:
- LLMClient (Groq primary, Gemini fallback, circuit breaker, offline fixture)
- DeeplinkMatcher (keyword search, category boosting)
- PlanExtractor (Goal/Action/StepGroup schema extraction & validation)
- QueryParaphraser (8 semantic registers for cache warming)
- HinglishTranslator (token & phrase normalization)
- DiagnosticGraphGenerator (DAG decision tree generation)
- Full Pipeline Integration
"""

import pytest
from contracts.schema import Goal, Action, StepGroup, Deeplink, ActionCategory
from src.ai.llm_client import llm_client, CircuitBreaker
from src.ai.matcher import matcher, get_candidate_ids
from src.ai.extractor import extractor, extract_structured_plan
from src.ai.paraphraser import paraphraser, generate_query_variations
from src.ai.translator import translator, normalize_hinglish_query
from src.ai.graph_generator import graph_generator, generate_diagnostic_graph
from src.core.pipeline import run_troubleshoot_pipeline


class TestLLMClient:
    def test_llm_client_initialization(self):
        assert llm_client is not None
        assert llm_client.circuit_breaker is not None
        assert llm_client.circuit_breaker.state == "CLOSED"

    def test_circuit_breaker_flow(self):
        cb = CircuitBreaker(failure_threshold=2, recovery_timeout=1.0)
        assert cb.can_execute() is True
        cb.record_failure()
        assert cb.can_execute() is True
        cb.record_failure()
        assert cb.state == "OPEN"
        assert cb.can_execute() is False

    def test_offline_fixture_fallback(self):
        fixture_res = llm_client._extract_fixture_response()
        assert isinstance(fixture_res, dict)
        assert "contexts" in fixture_res or "goal" in fixture_res


class TestMatcher:
    def test_get_candidate_ids_battery(self):
        candidates = get_candidate_ids("my battery is draining fast", top_k=3)
        assert isinstance(candidates, list)
        assert len(candidates) > 0
        assert any("BATTERY" in c or "BG" in c for c in candidates)

    def test_get_candidate_ids_display(self):
        candidates = get_candidate_ids("screen stutter lag refresh rate", top_k=3)
        assert isinstance(candidates, list)
        assert len(candidates) > 0


class TestParaphraser:
    def test_generate_query_variations(self):
        variations = generate_query_variations("battery draining fast")
        assert isinstance(variations, list)
        assert len(variations) >= 5
        # Check that variations include different phrasing styles
        var_text = " ".join(variations).lower()
        assert "samsung" in var_text or "battery" in var_text


class TestTranslator:
    def test_normalize_hinglish_query(self):
        hinglish = "mera phone ka battery jaldi khatam ho raha hai"
        normalized = normalize_hinglish_query(hinglish)
        assert "draining fast" in normalized or "battery" in normalized
        assert "jaldi khatam ho raha hai" not in normalized


class TestGraphGenerator:
    def test_generate_diagnostic_graph(self):
        goal = Goal(
            goal="Follow these steps to perform this Battery Troubleshooting",
            title="Battery drain",
            score=0.91,
            actions=[
                Action(
                    actionName="Background Usage Limits",
                    description="It will limit unused background apps",
                    category=ActionCategory.auto,
                    stepGroups=[]
                ),
                Action(
                    actionName="Factory Data Reset",
                    description="It will reset device to defaults",
                    category=ActionCategory.critical,
                    stepGroups=[]
                )
            ]
        )
        graph = generate_diagnostic_graph([goal])
        assert "nodes" in graph
        assert "edges" in graph
        assert len(graph["nodes"]) == 2
        assert len(graph["edges"]) == 1
        assert graph["nodes"][0]["color"] == "#10b981"  # emerald green for auto
        assert graph["nodes"][1]["color"] == "#ef4444"  # rose/red for critical
        assert graph["edges"][0]["label"] == "Last resort"


class TestExtractor:
    def test_extract_structured_plan(self):
        candidate_ids = ["DL_BATTERY_CARE", "DL_BG_LIMITS"]
        goals = extract_structured_plan("battery draining fast", candidate_ids)
        assert isinstance(goals, list)
        assert len(goals) > 0
        g = goals[0]
        assert g.goal.startswith("Follow these steps to perform this")
        assert g.title != ""
        assert len(g.actions) > 0
        assert g.actions[0].description.startswith("It will")


class TestPipelineIntegration:
    def test_full_pipeline_run(self):
        from src.core.cache import cache
        cache.clear()
        response = run_troubleshoot_pipeline("phone battery drains too fast")
        assert response.query == "phone battery drains too fast"
        assert response.meta is not None
        assert response.meta.cache_hit is False
        assert response.response.contexts is not None
        assert len(response.response.contexts) > 0
        assert len(response.query_variations) >= 5
