"""
src/ai/translator.py — Multilingual & Hinglish Normalizer
Translates code-mixed Hinglish and colloquial inputs to standard English troubleshooting terms.
"""
import re
import logging
from typing import Dict
from src.core.taxonomy import SYMPTOM_TAXONOMY

logger = logging.getLogger("fixby.ai.translator")

def _build_translation_dict() -> Dict[str, str]:
    # Base dictionary for specific phrases not easily mapped to a single symptom
    trans_dict = {
        "mera phone ka": "my phone's",
        "mera phone": "my phone",
        "mobile ka": "mobile's",
        "net nahi chal raha": "wifi cellular internet issue",
    }
    
    # Dynamically populate from taxonomy
    for domain, symptoms in SYMPTOM_TAXONOMY.items():
        for symptom, keywords in symptoms.items():
            standard_term = symptom.replace("_", " ")
            for kw in keywords:
                # Map all keywords to the standard symptom term
                trans_dict[kw.lower()] = standard_term
                
    return trans_dict

TRANSLATION_DICT = _build_translation_dict()


class MultilingualTranslator:
    """
    Normalizes Hinglish (Romanized Hindi + English) and Korean query input into standard English.
    """
    def __init__(self):
        # Sort keys by length descending to match longest phrases first
        self.sorted_keys = sorted(TRANSLATION_DICT.keys(), key=len, reverse=True)

    def normalize_query(self, query: str) -> str:
        if not query:
            return query

        normalized = query.lower()
        # Phrase-level replacement
        for phrase in self.sorted_keys:
            # Add word boundary to avoid partial matches on small English words,
            # but for Korean and Hinglish, direct substring match works if sorted by length.
            # To be safe and simple, we'll use substring replacement as originally done.
            if phrase in normalized:
                english_equiv = TRANSLATION_DICT[phrase]
                normalized = normalized.replace(phrase, english_equiv)

        # Clean multiple spaces
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized


# Singleton instance
translator = MultilingualTranslator()


def normalize_hinglish_query(query: str) -> str:
    """Convenience wrapper for Hinglish/Multilingual query normalization."""
    return translator.normalize_query(query)
