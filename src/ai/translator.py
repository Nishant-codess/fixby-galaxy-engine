"""
src/ai/translator.py — Multilingual & Hinglish Normalizer
Translates code-mixed Hinglish and colloquial inputs to standard English troubleshooting terms.
"""
import re
import logging
from typing import Dict

logger = logging.getLogger("fixby.ai.translator")

# Dictionary of common Hinglish phrases and their English equivalents
HINGLISH_DICTIONARY: Dict[str, str] = {
    "jaldi khatam ho raha hai": "draining fast",
    "jaldi khatam": "draining fast",
    "khatam ho raha hai": "draining",
    "bohot garam": "overheating",
    "garam ho raha hai": "overheating",
    "garam ho gaya": "overheated",
    "bohot hang": "severe lag",
    "hang ho raha hai": "lagging",
    "lag kar raha hai": "lagging",
    "charge nahi ho raha": "not charging",
    "charging nahi ho raha": "not charging",
    "smooth nahi chal raha": "stuttering",
    "screen lag": "display stutter",
    "mera phone ka": "my phone's",
    "mera phone": "my phone",
    "mobile ka": "mobile's",
    "battery life kam hai": "poor battery life",
    "net nahi chal raha": "wifi cellular internet issue",
}


class HinglishTranslator:
    """
    Normalizes Hinglish (Romanized Hindi + English) query input into standard English.
    """
    def normalize_query(self, query: str) -> str:
        if not query:
            return query

        normalized = query.lower()
        # Phrase-level replacement
        for hinglish_phrase, english_equiv in HINGLISH_DICTIONARY.items():
            if hinglish_phrase in normalized:
                normalized = normalized.replace(hinglish_phrase, english_equiv)

        # Clean multiple spaces
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized


# Singleton instance
translator = HinglishTranslator()


def normalize_hinglish_query(query: str) -> str:
    """Convenience wrapper for Hinglish query normalization."""
    return translator.normalize_query(query)
