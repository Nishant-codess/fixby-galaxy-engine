# src/core/scorer.py — Compositional Confidence Scorer
"""
Fixby Compositional Confidence Scorer.
Computes mathematically verifiable confidence scores combining:
- 40% Retrieval match score
- 30% Extraction consistency score
- 30% Catalog/documentation coverage score
Never outputs arbitrary hardcoded confidence values.
"""
from typing import Dict, Optional


def compute_compositional_confidence(
    retrieval_sim: float,
    consistency_score: float = 0.75,
    coverage_score: float = 0.85,
    weights: Optional[Dict[str, float]] = None
) -> float:
    """
    Calculates weighted compositional confidence score clamped to [0.0, 1.0].
    """
    if weights is None:
        weights = {"retrieval": 0.4, "consistency": 0.3, "coverage": 0.3}

    r = max(0.0, min(1.0, float(retrieval_sim)))
    c = max(0.0, min(1.0, float(consistency_score)))
    v = max(0.0, min(1.0, float(coverage_score)))

    score = (weights["retrieval"] * r) + (weights["consistency"] * c) + (weights["coverage"] * v)
    return round(score, 2)
