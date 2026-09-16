# src/core/cache.py — 3-Tier Cascading Semantic Cache
"""
Fixby 3-Tier Cascading Semantic Cache.
- Tier 1: Exact Hash (MD5 normalized query, <1ms)
- Tier 2: Semantic Slot Hash (SHA-256 domain+symptom slots, <2ms)
- Tier 3: Semantic Vector Embeddings (Dense Neural / Subword N-gram Cosine, <5ms)
Includes write-through cache warming for query variations.
"""
import hashlib
import re
import time
import zlib
from typing import Dict, Any, Tuple, Optional, List
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    _EMBEDDER = SentenceTransformer("all-MiniLM-L6-v2")
except Exception:
    _EMBEDDER = None


class CascadingSemanticCache:
    def __init__(self, similarity_threshold: float = 0.52, max_tier3_size: int = 500):
        self.tier1_exact: Dict[str, Any] = {}
        self.tier2_slots: Dict[str, Any] = {}
        # List of tuples: (vector, value, query_str, domain)
        self.tier3_vectors: List[Tuple[np.ndarray, Any, str, Optional[str]]] = []
        self.similarity_threshold = similarity_threshold
        self.max_tier3_size = max_tier3_size
        self.weights: Dict[str, float] = {}
        self.feedback_weights = self.weights

    def _hash_exact(self, query: str) -> str:
        return hashlib.md5(query.strip().lower().encode("utf-8")).hexdigest()

    def _hash_slots(self, slots: Dict[str, Any]) -> str:
        s = "|".join(f"{k}:{slots[k]}" for k in sorted(slots.keys()) if slots[k])
        return hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]

    def _vectorize(self, text: str, dim: int = 256) -> np.ndarray:
        """
        Extracts subword character n-grams and token unigrams to produce an L2-normalized vector.
        Provides robust semantic and phonetic matching across English and Hinglish without heavy model weights.
        """
        if _EMBEDDER:
            try:
                return _EMBEDDER.encode(text, normalize_embeddings=True)
            except Exception:
                pass

        vec = np.zeros(dim, dtype=np.float32)
        tokens = re.findall(r"\w+", text.lower())
        for t in tokens:
            idx = zlib.crc32(t.encode("utf-8")) % dim
            vec[idx] += 1.5
            for n in (3, 4):
                for i in range(len(t) - n + 1):
                    sub = t[i:i + n]
                    s_idx = zlib.crc32(sub.encode("utf-8")) % dim
                    vec[s_idx] += 1.0

        norm = float(np.linalg.norm(vec))
        return (vec / norm) if norm > 0.0 else vec

    def get(self, query: str, slots: Optional[Dict[str, Any]] = None) -> Tuple[Optional[Any], str]:
        # Tier 1: Exact Hash (<1ms)
        k1 = self._hash_exact(query)
        if k1 in self.tier1_exact:
            return self.tier1_exact[k1], "tier1_hash"

        # Tier 2: Semantic Slot Hash (<2ms)
        if slots:
            k2 = self._hash_slots(slots)
            if k2 in self.tier2_slots:
                return self.tier2_slots[k2], "tier2_slot_hash"

        # Tier 3: Semantic Vector Cosine Similarity (<5ms)
        if self.tier3_vectors:
            try:
                q_vec = self._vectorize(query)
                query_domain = slots.get("domain") if slots else None
                best_sim, best_val = 0.0, None

                for vec, val, _cached_q, cached_domain in self.tier3_vectors:
                    # If both queries have explicit non-matching domains, skip cross-domain collision
                    if query_domain and cached_domain and query_domain != cached_domain:
                        continue

                    sim = float(np.dot(q_vec, vec))
                    if sim > best_sim:
                        best_sim = sim
                        best_val = val

                if best_sim >= self.similarity_threshold and best_val is not None:
                    return best_val, "tier3_embedding"
            except Exception:
                pass

        return None, "cold"

    def put(self, query: str, value: Any, slots: Optional[Dict[str, Any]] = None, variations: Optional[List[str]] = None):
        k1 = self._hash_exact(query)
        self.tier1_exact[k1] = value

        domain = slots.get("domain") if slots else None
        if slots:
            k2 = self._hash_slots(slots)
            self.tier2_slots[k2] = value

        # Tier 3 Vector storage
        q_vec = self._vectorize(query)
        self._add_tier3_vector(q_vec, value, query, domain)

        # Warm cache with query variations (write-through)
        if variations:
            for v in variations[:5]:
                self.tier1_exact[self._hash_exact(v)] = value
                v_vec = self._vectorize(v)
                self._add_tier3_vector(v_vec, value, v, domain)

    def _add_tier3_vector(self, vec: np.ndarray, val: Any, query: str, domain: Optional[str]):
        if len(self.tier3_vectors) >= self.max_tier3_size:
            self.tier3_vectors.pop(0)  # LRU eviction
        self.tier3_vectors.append((vec, val, query, domain))

    def record_feedback(self, query: str, rating: int):
        k = self._hash_exact(query)
        current = self.weights.get(k, 1.0)
        self.weights[k] = min(current * 1.1, 2.0) if rating > 0 else max(current * 0.8, 0.2)

    def clear(self):
        self.tier1_exact.clear()
        self.tier2_slots.clear()
        self.tier3_vectors.clear()
        self.weights.clear()


cache = CascadingSemanticCache()
