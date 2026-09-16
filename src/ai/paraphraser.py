"""
src/ai/paraphraser.py — Query Paraphrase & Variation Generator
Generates 8 semantic registers for Tier-2 cache warming and semantic indexing.
"""
import logging
from typing import List, Optional, Dict
from src.core.taxonomy import extract_slots

logger = logging.getLogger("fixby.ai.paraphraser")

# Register templates mapping slot domains/complaints to 8 distinct phrasing styles
REGISTER_TEMPLATES = {
    "battery": {
        "formal": "I am experiencing rapid drain with my device's battery.",
        "casual": "my battery is doing this rapid drain thing",
        "telegraphic": "battery rapid drain",
        "hinglish": "mera phone ka battery jaldi khatam ho raha hai",
        "technical": "Samsung Galaxy battery rapid drain troubleshooting",
        "interrogative": "why is my battery draining so fast?",
        "minimalist": "battery drain fast",
        "imperative": "fix galaxy battery drain now"
    },
    "display": {
        "formal": "The display stuttering and screen lag is noticeable.",
        "casual": "my screen keeps stuttering and lagging",
        "telegraphic": "display stutter lag",
        "hinglish": "screen lag kar raha hai smooth nahi chal raha",
        "technical": "Samsung Galaxy Motion Smoothness refresh rate stutter fix",
        "interrogative": "why is my screen refresh rate lagging?",
        "minimalist": "screen stutter lag",
        "imperative": "fix screen stutter refresh rate"
    },
    "performance": {
        "formal": "Device performance is sluggish and experiencing slowdowns.",
        "casual": "my phone is lagging and running super slow",
        "telegraphic": "device lag performance slow",
        "hinglish": "phone bohot hang ho raha hai lag kar raha hai",
        "technical": "Samsung Galaxy RAM memory optimization background usage",
        "interrogative": "how to fix phone lag and slow speed?",
        "minimalist": "phone slow lag",
        "imperative": "speed up galaxy device now"
    }
}


class QueryParaphraser:
    """
    Generates multi-register variations of a complaint query.
    Used for Stage 8 Write-Through Cache Warming.
    """
    def generate_query_variations(self, query: str, slots: Optional[Dict] = None) -> List[str]:
        if slots is None:
            slots = extract_slots(query)

        domain = slots.get("domain", "battery").lower()
        if domain not in REGISTER_TEMPLATES:
            domain = "battery"

        templates = REGISTER_TEMPLATES[domain]

        variations = [
            templates["formal"],
            templates["casual"],
            templates["telegraphic"],
            templates["hinglish"],
            templates["technical"],
            templates["interrogative"],
            templates["minimalist"],
            templates["imperative"],
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
