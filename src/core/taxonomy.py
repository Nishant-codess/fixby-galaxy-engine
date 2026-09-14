# src/core/taxonomy.py — Samsung Galaxy Symptom Taxonomy & Slot Extractor
"""
Galaxy Symptom Taxonomy and Semantic Slot Extractor for Fixby.
Maps colloquial user complaints (English & Hinglish) to device domains and technical symptoms.
"""
import re
from typing import Dict, List, Optional, Set

SYMPTOM_TAXONOMY: Dict[str, Dict[str, Set[str]]] = {
    "battery": {
        "rapid_drain": {"drain", "battery fast", "jaldi khatam", "draining", "dying fast", "battery low", "battery backup"},
        "overheating": {"hot", "garam", "heat", "overheat", "overheating", "warm"},
        "slow_charging": {"slow charge", "charging slow", "not charging", "slow charging", "der se charge"},
        "unexpected_shutdown": {"turns off", "shut down", "band ho gaya", "restarts randomly"}
    },
    "display": {
        "touch_unresponsive": {"touch", "screen unresponsive", "touch not working", "kaam nahi kar raha"},
        "motion_stutter": {"stutter", "lag screen", "refresh rate", "jitter", "120hz"},
        "gesture_navigation": {"gesture", "swipe navigation", "back button", "navigation bar"}
    },
    "camera": {
        "crash_or_slow": {"camera crash", "camera lag", "camera slow", "camera band", "photos blurry"}
    },
    "performance": {
        "general_lag": {"hang", "lag", "phone slow", "slow response", "ruk ruk ke"},
        "app_crash": {"app crash", "crashing", "apps closing", "force close"},
        "storage_pressure": {"storage full", "memory full", "space low", "storage"}
    },
    "connectivity": {
        "wifi_drop": {"wifi", "disconnect", "no internet", "wifi drop", "network issue"}
    }
}


def classify_complaint_taxonomy(query: str) -> List[str]:
    """
    Classifies a query against the symptom taxonomy.
    Returns list of matched strings in format 'domain.symptom', or ['general.unknown'].
    """
    q = query.lower()
    matches = []
    for domain, symptoms in SYMPTOM_TAXONOMY.items():
        for symptom, keywords in symptoms.items():
            if any(kw in q for kw in keywords):
                matches.append(f"{domain}.{symptom}")
    return matches if matches else ["general.unknown"]


def extract_slots(query: str) -> Dict[str, Optional[str]]:
    """
    Extracts high-level domain and symptom slots from user query.
    Used for Tier 2 semantic slot hashing in the cascading cache.
    """
    q = query.lower()
    for domain, symptoms in SYMPTOM_TAXONOMY.items():
        for symptom, keywords in symptoms.items():
            if any(kw in q for kw in keywords):
                return {"domain": domain, "symptom": symptom}
    return {"domain": "general", "symptom": "unknown"}
