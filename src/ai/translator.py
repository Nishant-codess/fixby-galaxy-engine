# src/ai/translator.py
# Rebuilt on top of taxonomy.py's own keyword sets instead of a second,
# brittle, contiguous-phrase regex table. This is what actually fixes the
# demo-breaking bug: "battery bhi jaldi khatam" now matches because token
# presence is checked individually, order- and insertion-tolerant, instead of
# requiring an exact multi-word substring.
from src.core.taxonomy import SYMPTOM_TAXONOMY

CANONICAL_LABEL = {cat_id: cat_id.split(".", 1)[1].replace("_", " ") for cat_id in SYMPTOM_TAXONOMY}

def normalize_hinglish_query(query: str) -> str:
    """Produces a clean canonical English string for the LLM prompt and for
    display in the Judge HUD. Classification itself (taxonomy.py) never
    depends on this function succeeding — it works directly on raw text."""
    lower = query.lower()
    words = set(lower.split())
    for cat_id, data in SYMPTOM_TAXONOMY.items():
        for kw in data["keywords"]:
            kw_words = set(kw.split())
            if kw_words.issubset(words) or kw in lower:
                return f"{data['subsystem'].lower()} {CANONICAL_LABEL[cat_id]}"
    return query
