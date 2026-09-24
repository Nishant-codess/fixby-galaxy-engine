"""
src/ai/paraphraser.py — Query Paraphrase & Variation Generator
Generates 8 semantic registers for Tier-2 cache warming and semantic indexing.
"""
import logging
from typing import List, Optional, Dict
from src.core.taxonomy import extract_slots

logger = logging.getLogger("fixby.ai.paraphraser")




class QueryParaphraser:
    """
    Generates multi-register variations of a complaint query.
    Used for Stage 8 Write-Through Cache Warming.
    """
    def generate_query_variations(self, query: str, slots: Optional[Dict] = None) -> List[str]:
        if slots is None:
            slots = extract_slots(query)

        domain = slots.get("domain", "device").lower()
        symptom = slots.get("symptom", "issue").lower().replace("_", " ")

        variations = [
            f"I am experiencing {symptom} with my {domain}.",
            f"my {domain} is doing this {symptom} thing",
            f"{domain} {symptom}",
            f"mera {domain} ka {symptom} ho raha hai",
            f"Samsung Galaxy {domain} {symptom} troubleshooting",
            f"why is my {domain} having {symptom}?",
            f"{domain} {symptom} issue",
            f"fix galaxy {domain} {symptom} now",
            f"Galaxy troubleshooting: {query}",
            f"Fix {query} on Samsung device"
        ]

        # Deduplicate while preserving order
        seen = set()
        unique_variations = []
        for v in variations:
            if v and v.lower() not in seen:
                seen.add(v.lower())
                unique_variations.append(v)

        return unique_variations


# Singleton instance
paraphraser = QueryParaphraser()


def generate_query_variations(query: str, slots: Optional[Dict] = None) -> List[str]:
    """Convenience wrapper matching pipeline stub signature."""
    return paraphraser.generate_query_variations(query, slots=slots)
