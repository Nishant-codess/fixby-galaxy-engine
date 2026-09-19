"""
src/ai/matcher.py — Candidate Deeplink Retrieval & Matching
Performs keyword TF-IDF/word-overlap scoring with domain category boosting over contracts/deeplinks.json.
"""
import json
import re
import logging
from typing import List, Dict, Any
from pathlib import Path
from src.core.taxonomy import extract_slots

try:
    from sentence_transformers import SentenceTransformer, util
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False

logger = logging.getLogger("fixby.ai.matcher")


class DeeplinkMatcher:
    """
    Retrieves candidate deeplink IDs from the catalog matching user complaints.
    Uses dense semantic vector similarity (SentenceTransformer) with domain category boosting for precise recall.
    Falls back to token Jaccard matching if sentence-transformers is unavailable.
    """
    def __init__(self, catalog_path: Path = None):
        if catalog_path is None:
            catalog_path = Path(__file__).resolve().parent.parent.parent / "contracts" / "deeplinks.json"
        self.catalog_path = catalog_path
        self.catalog: List[Dict[str, Any]] = self._load_catalog()

        self.model = None
        self.corpus_embeddings = None
        self.catalog_texts = []

        if HAS_SENTENCE_TRANSFORMERS and self.catalog:
            try:
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                self.catalog_texts = []
                for entry in self.catalog:
                    entry_id = entry.get("id", "").lower()
                    description = entry.get("description", "").lower()
                    classes = entry.get("classes", {})
                    path = classes.get("path", "").lower() if isinstance(classes, dict) else ""
                    self.catalog_texts.append(f"{entry_id} {description} {path}")
                
                self.corpus_embeddings = self.model.encode(self.catalog_texts, convert_to_tensor=True)
                logger.info("SentenceTransformer initialized and catalog encoded.")
            except Exception as e:
                logger.error(f"Failed to initialize SentenceTransformer: {e}")
                self.model = None

    def _load_catalog(self) -> List[Dict[str, Any]]:
        try:
            if self.catalog_path.exists():
                with open(self.catalog_path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load deeplink catalog from {self.catalog_path}: {e}")
        return []

    def score_entry(self, query_tokens: set, domain: str, entry: Dict[str, Any]) -> float:
        entry_id = entry.get("id", "").lower()
        description = entry.get("description", "").lower()
        classes = entry.get("classes", {})
        path = classes.get("path", "").lower() if isinstance(classes, dict) else ""

        entry_text = f"{entry_id} {description} {path}"
        entry_tokens = set(re.findall(r"\w+", entry_text))

        if not entry_tokens:
            return 0.0

        # Jaccard / Overlap score
        overlap = query_tokens.intersection(entry_tokens)
        score = len(overlap) / (len(query_tokens) + 1.0)

        # Domain category boosting (e.g. 'battery' query boosts 'battery' in path/id)
        if domain and domain.lower() in entry_text:
            score *= 2.5

        return score

    def get_candidate_ids(self, query: str, top_k: int = 5) -> List[str]:
        """
        Retrieves top_k candidate deeplink IDs for a given query.
        """
        if not self.catalog:
            # Baseline fallback if catalog not loaded
            return ["DL_BATTERY_CARE", "DL_BG_LIMITS"]

        slots = extract_slots(query)
        domain = slots.get("domain", "")

        if self.model is not None and self.corpus_embeddings is not None:
            # Use dense vector similarity
            query_embedding = self.model.encode(query.lower(), convert_to_tensor=True)
            cos_scores = util.cos_sim(query_embedding, self.corpus_embeddings)[0]
            
            scored_entries = []
            for i, score_tensor in enumerate(cos_scores):
                score = score_tensor.item()
                entry = self.catalog[i]
                
                # Domain category boosting
                entry_text = self.catalog_texts[i]
                if domain and domain.lower() in entry_text:
                    score *= 1.5
                    
                scored_entries.append((score, entry.get("id")))
                
            scored_entries.sort(key=lambda x: x[0], reverse=True)
            top_candidates = [e[1] for e in scored_entries[:top_k] if e[1]]
        else:
            # Fallback to token-based matching
            query_tokens = set(re.findall(r"\w+", query.lower()))
            scored_entries = []
            for entry in self.catalog:
                score = self.score_entry(query_tokens, domain, entry)
                scored_entries.append((score, entry.get("id")))

            # Sort descending by score
            scored_entries.sort(key=lambda x: x[0], reverse=True)
            top_candidates = [e[1] for e in scored_entries[:top_k] if e[1]]

        # Ensure at least 1 candidate is returned
        if not top_candidates and self.catalog:
            top_candidates = [self.catalog[0].get("id", "DL_BATTERY_CARE")]

        return top_candidates


# Global singleton instance
matcher = DeeplinkMatcher()


def get_candidate_ids(query: str, top_k: int = 5) -> List[str]:
    """Convenience wrapper matching pipeline stub signature."""
    return matcher.get_candidate_ids(query, top_k=top_k)
