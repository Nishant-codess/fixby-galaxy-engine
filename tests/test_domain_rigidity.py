# tests/test_domain_rigidity.py
"""
Task 2.1 acceptance criteria: 15 benchmark queries must pass with
0% cross-domain leakage. Each query must map to the expected domain
and NEVER cross into an irrelevant domain.
"""
import pytest
from src.core.taxonomy import classify_complaint_taxonomy, extract_slots


# ──────────────────────────────────────────────────────────────
# 15 benchmark queries with expected domain + forbidden domains
# ──────────────────────────────────────────────────────────────
DOMAIN_RIGIDITY_CASES = [
    # (query, expected_domain, forbidden_domains)
    ("my phone is overheating",
     "battery", ["connectivity", "display", "camera"]),

    ("camera is not working",
     "camera", ["battery", "connectivity", "sound"]),

    ("bluetooth won't connect",
     "connectivity", ["battery", "display", "camera"]),

    ("storage is full",
     "performance", ["battery", "camera", "connectivity"]),

    ("wifi keeps disconnecting",
     "connectivity", ["battery", "camera", "display"]),

    ("how to turn on dark mode",
     "display", ["battery", "connectivity", "camera"]),

    ("my phone is very slow",
     "performance", ["camera", "connectivity", "sound"]),

    ("camera is blurry",
     "camera", ["battery", "connectivity", "display"]),

    ("how to turn off location",
     "privacy", ["battery", "camera", "display"]),

    ("battery draining fast",
     "battery", ["camera", "connectivity", "display"]),

    ("no sound from speaker",
     "sound", ["battery", "camera", "connectivity"]),

    ("notifications not showing",
     "notifications", ["battery", "camera", "connectivity"]),

    ("software update not showing",
     "software", ["battery", "camera", "connectivity"]),

    ("touch screen not responding",
     "display", ["battery", "camera", "connectivity"]),

    ("apps keep crashing randomly",
     "performance", ["camera", "connectivity", "sound"]),
]


@pytest.mark.parametrize("query,expected_domain,forbidden_domains", DOMAIN_RIGIDITY_CASES)
def test_domain_rigidity_no_cross_leakage(query, expected_domain, forbidden_domains):
    """Each query must classify into the expected domain and NEVER
    leak into any of the forbidden domains."""
    slots = extract_slots(query)
    actual_domain = slots["domain"]

    # Primary assertion: correct domain
    assert actual_domain == expected_domain, (
        f"Query: {query!r}\n"
        f"Expected domain: {expected_domain}\n"
        f"Got domain: {actual_domain}"
    )

    # Secondary assertion: no cross-domain leakage
    assert actual_domain not in forbidden_domains, (
        f"CROSS-DOMAIN LEAKAGE!\n"
        f"Query: {query!r}\n"
        f"Routed to forbidden domain: {actual_domain}\n"
        f"Forbidden: {forbidden_domains}"
    )


# ──────────────────────────────────────────────────────────────
# Confidence tests: high-confidence queries should score > 0.5
# ──────────────────────────────────────────────────────────────
HIGH_CONFIDENCE_QUERIES = [
    "battery draining fast",
    "camera is blurry",
    "bluetooth won't connect",
    "wifi keeps disconnecting",
    "how to turn on dark mode",
]

@pytest.mark.parametrize("query", HIGH_CONFIDENCE_QUERIES)
def test_high_confidence_queries(query):
    """Clear, specific queries should have confidence > 0.5."""
    _, confidence = classify_complaint_taxonomy(query)
    assert confidence > 0.5, (
        f"Query: {query!r} had low confidence: {confidence}"
    )


# ──────────────────────────────────────────────────────────────
# Typo tolerance tests (Task 2.2)
# ──────────────────────────────────────────────────────────────
TYPO_QUERIES = [
    ("camra not wrking", "camera"),
    ("blu tooth not connecting", "connectivity"),
    ("overheeting phone", "battery"),
    ("baterry draning fast", "battery"),
    ("stoarge full", "performance"),
]

@pytest.mark.parametrize("query,expected_domain", TYPO_QUERIES)
def test_typo_tolerance(query, expected_domain):
    """Queries with up to 2 character errors per word should still resolve correctly."""
    slots = extract_slots(query)
    assert slots["domain"] == expected_domain, (
        f"Typo query: {query!r}\n"
        f"Expected domain: {expected_domain}\n"
        f"Got domain: {slots['domain']}"
    )


# ──────────────────────────────────────────────────────────────
# Hinglish / mixed-language tests (Task 2.2)
# ──────────────────────────────────────────────────────────────
HINGLISH_QUERIES = [
    ("mera phone slow hai", "performance"),
    ("battery jaldi khatam ho raha hai", "battery"),
    ("camera hang ho raha hai", "camera"),
    ("wifi band ho gaya", "connectivity"),
]

@pytest.mark.parametrize("query,expected_domain", HINGLISH_QUERIES)
def test_hinglish_queries(query, expected_domain):
    """Hinglish/mixed queries should be understood and routed correctly."""
    slots = extract_slots(query)
    assert slots["domain"] == expected_domain, (
        f"Hinglish query: {query!r}\n"
        f"Expected domain: {expected_domain}\n"
        f"Got domain: {slots['domain']}"
    )
