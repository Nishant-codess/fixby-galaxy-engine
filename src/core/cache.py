# src/core/cache.py — 3-Tier Cascading Semantic Cache
"""
Fixby 3-Tier Cascading Semantic Cache.
- Tier 1: Exact Hash (MD5 normalized query, <5ms)
- Tier 2: Semantic Slot Hash (SHA-256 domain+symptom slots, <20ms)
- Tier 3: Dense Vector Embeddings (all-MiniLM-L6-v2 cosine similarity, <200ms)
Includes write-through cache warming for query variations.
"""
import hashlib
import time
from typing import Dict, Any, Tuple, Optional, List
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    _EMBEDDER = SentenceTransformer("all-MiniLM-L6-v2")
except Exception:
    _EMBEDDER = None


class CascadingSemanticCache:
    def __init__(self, similarity_threshold: float = 0.82):
        self.tier1_exact: Dict[str, Any] = {}
        self.tier2_slots: Dict[str, Any] = {}
        self.tier3_vectors: List[Tuple[np.ndarray, Any, str]] = []
        self.similarity_threshold = similarity_threshold
        self.weights: Dict[str, float] = {}

    def _hash_exact(self, query: str) -> str:
        return hashlib.md5(query.strip().lower().encode("utf-8")).hexdigest()

    def _hash_slots(self, slots: Dict[str, Any]) -> str:
        s = "|".join(f"{k}:{slots[k]}" for k in sorted(slots.keys()) if slots[k])
        return hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]

    def get(self, query: str, slots: Optional[Dict[str, Any]] = None) -> Tuple[Optional[Any], str]:
        # Tier 1: Exact Hash (<5ms)
        k1 = self._hash_exact(query)
        if k1 in self.tier1_exact:
            return self.tier1_exact[k1], "tier1_hash"

        # Tier 2: Semantic Slot Hash (<20ms)
        if slots:
            k2 = self._hash_slots(slots)
            if k2 in self.tier2_slots:
                return self.tier2_slots[k2], "tier2_slot_hash"

        # Tier 3: Embedding Cosine Similarity (<200ms)
        if _EMBEDDER and self.tier3_vectors:
            try:
                q_vec = _EMBEDDER.encode(query, normalize_embeddings=True)
                best_sim, best_val = 0.0, None
                for vec, val, _ in self.tier3_vectors:
                    sim = float(np.dot(q_vec, vec))
                    if sim > best_sim:
                        best_sim = sim
                        best_val = val
                if best_sim >= self.similarity_threshold:
                    return best_val, "tier3_embedding"
            except Exception:
                pass

        return None, "cold"

    def put(self, query: str, value: Any, slots: Optional[Dict[str, Any]] = None, variations: Optional[List[str]] = None):
        k1 = self._hash_exact(query)
        self.tier1_exact[k1] = value

        if slots:
            k2 = self._hash_slots(slots)
            self.tier2_slots[k2] = value

        if _EMBEDDER:
            try:
                q_vec = _EMBEDDER.encode(query, normalize_embeddings=True)
                self.tier3_vectors.append((q_vec, value, query))
                if variations:
                    for v in variations[:5]:
                        self.tier1_exact[self._hash_exact(v)] = value
                        v_vec = _EMBEDDER.encode(v, normalize_embeddings=True)
                        self.tier3_vectors.append((v_vec, value, v))
            except Exception:
                pass


cache = CascadingSemanticCache()
