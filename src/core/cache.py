# src/core/cache.py
import hashlib
from typing import Optional, Dict, Any, Tuple, List

try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    _EMBEDDER = SentenceTransformer("all-MiniLM-L6-v2")   # CPU-friendly, ~80MB, no GPU needed
    HAS_EMBEDDINGS = True
except ImportError:
    HAS_EMBEDDINGS = False

TIER3_SIMILARITY_FLOOR = 0.82   # tune against a labeled paraphrase set before demo day

class CascadingSemanticCache:
    def __init__(self):
        self.tier1_exact: Dict[str, Dict[str, Any]] = {}
        self.tier2_slot_hash: Dict[str, Dict[str, Any]] = {}
        self.tier3_vectors: List[Tuple["np.ndarray", Dict[str, Any]]] = []
        self.feedback_weights: Dict[str, float] = {}

    def _hash_key(self, text: str) -> str:
        return hashlib.md5(text.strip().lower().encode("utf-8")).hexdigest()

    def _slot_hash(self, slots: Dict[str, str]) -> str:
        canonical = "|".join(f"{k}={slots[k]}" for k in sorted(slots) if slots.get(k))
        return hashlib.sha256(canonical.encode()).hexdigest()[:16]

    def get(self, query: str, slots: Optional[Dict[str, str]] = None) -> Tuple[Optional[Dict[str, Any]], str]:
        key = self._hash_key(query)
        if key in self.tier1_exact:
            return self.tier1_exact[key], "tier1_hash"

        if slots:
            slot_key = self._slot_hash(slots)
            if slot_key in self.tier2_slot_hash:
                return self.tier2_slot_hash[slot_key], "tier2_slot_hash"

        if HAS_EMBEDDINGS and self.tier3_vectors:
            q_vec = _EMBEDDER.encode(query, normalize_embeddings=True)
            best_sim, best_val = -1.0, None
            for vec, val in self.tier3_vectors:
                sim = float(np.dot(q_vec, vec))
                if sim > best_sim:
                    best_sim, best_val = sim, val
            if best_sim >= TIER3_SIMILARITY_FLOOR:
                return best_val, "tier3_embedding"

        return None, "cold"

    def put(self, query: str, response_data: Dict[str, Any],
            slots: Optional[Dict[str, str]] = None,
            paraphrases: Optional[List[str]] = None):
        """Fix #6: writes are amplified across every generated paraphrase, not
        just the literal query typed in — this is what makes unseen-paraphrase
        cache hits plausible at all."""
        for text in [query] + (paraphrases or []):
            self.tier1_exact[self._hash_key(text)] = response_data
            if HAS_EMBEDDINGS:
                vec = _EMBEDDER.encode(text, normalize_embeddings=True)
                self.tier3_vectors.append((vec, response_data))
        if slots:
            self.tier2_slot_hash[self._slot_hash(slots)] = response_data

    def record_feedback(self, query: str, rating: int):
        key = self._hash_key(query)
        current = self.feedback_weights.get(key, 1.0)
        self.feedback_weights[key] = (min(current * 1.1, 2.0) if rating > 0
                                       else max(current * 0.8, 0.2))

cache = CascadingSemanticCache()
