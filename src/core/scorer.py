# src/core/scorer.py
from typing import List, Dict

def compute_grounded_confidence(retrieval_score: float, extraction_samples: List[Dict],
                                 reference_coverage: float,
                                 w1: float = 0.4, w2: float = 0.3, w3: float = 0.3) -> float:
    """score = w1*retrieval + w2*self_consistency + w3*coverage — computed,
    never asked of the LLM as a self-reported number (research on LLM
    verbalized confidence shows it's systematically overconfident).

    Finding #13 fix: self_consistency is now actually measured when ≥2 samples
    ran; when only 1 sample ran (the cost-saving default), it's EXPLICITLY
    discounted rather than assumed perfect — an untested assumption of full
    agreement is not the same thing as measured agreement."""
    if len(extraction_samples) >= 2:
        names_a = {a.get("actionName") for a in extraction_samples[0].get("actions", [])}
        names_b = {a.get("actionName") for a in extraction_samples[1].get("actions", [])}
        union = names_a | names_b
        self_consistency = len(names_a & names_b) / len(union) if union else 0.5
    else:
        self_consistency = 0.75   # explicit, documented discount — not silently 1.0

    return round(
        w1 * min(retrieval_score, 1.0) + w2 * self_consistency + w3 * min(reference_coverage, 1.0), 3
    )
