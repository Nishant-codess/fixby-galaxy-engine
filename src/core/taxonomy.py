# src/core/taxonomy.py — Samsung Galaxy Symptom Taxonomy & Slot Extractor
"""
Galaxy Symptom Taxonomy and Semantic Slot Extractor for Fixby.
Maps colloquial user complaints (English, Hindi/Hinglish, and Korean) to device domains and technical symptoms.
Includes multi-lingual language detection (en, hi, hi-Latn, ko).
"""
import re
from typing import Dict, List, Optional, Set

SYMPTOM_TAXONOMY: Dict[str, Dict[str, Set[str]]] = {
    "battery": {
        "rapid_drain": {
            "drain", "battery fast", "jaldi khatam", "draining", "dying fast",
            "battery low", "battery backup", "battery drop", "battery utar",
            "배터리", "방전", "빨리 닳", "배터리 부족"
        },
        "overheating": {
            "hot", "garam", "heat", "overheat", "overheating", "warm",
            "bohot garam", "garam ho raha", "phone heat", "heating up",
            "발열", "뜨거워", "과열", "온도"
        },
        "slow_charging": {
            "slow charge", "charging slow", "not charging", "slow charging",
            "der se charge", "charge nahi ho raha", "slow charging",
            "충전 느림", "충전 안됨", "고속충전 안됨", "충전 불가"
        },
        "unexpected_shutdown": {
            "turns off", "shut down", "band ho gaya", "restarts randomly",
            "switch off", "sudden restart",
            "꺼짐", "갑자기 꺼져", "재부팅"
        }
    },
    "display": {
        "touch_unresponsive": {
            "touch", "screen unresponsive", "touch not working", "kaam nahi kar raha",
            "touch freeze", "screen not responding", "touch kaam nahi",
            "터치 안됨", "터치 먹통", "화면 터치", "터치 반응 없음"
        },
        "motion_stutter": {
            "stutter", "lag screen", "refresh rate", "jitter", "120hz",
            "screen flicker", "adaptive smoothness",
            "화면 버벅", "주사율", "화면 깜빡임", "부드러운 모션"
        },
        "gesture_navigation": {
            "gesture", "swipe navigation", "back button", "navigation bar",
            "제스처", "뒤로가기", "내비게이션 바"
        }
    },
    "camera": {
        "crash_or_slow": {
            "camera crash", "camera lag", "camera slow", "camera band", "photos blurry",
            "camera freeze", "camera open nahi", "camera error",
            "카메라 튕김", "카메라 멈춤", "사진 흐림", "카메라 오류"
        }
    },
    "performance": {
        "general_lag": {
            "hang", "lag", "phone slow", "slow response", "ruk ruk ke",
            "phone atak raha", "hang kar raha", "response slow",
            "폰 느려", "버벅임", "렉", "반응 느림", "시스템 지연"
        },
        "app_crash": {
            "app crash", "crashing", "apps closing", "force close",
            "app band ho jata", "apps restart",
            "앱 튕김", "강제종료", "앱 오류", "앱 꺼짐"
        },
        "storage_pressure": {
            "storage full", "memory full", "space low", "storage",
            "storage saaf", "memory space",
            "저장공간", "용량 부족", "메모리 부족", "용량 정리"
        }
    },
    "connectivity": {
        "wifi_drop": {
            "wifi", "disconnect", "no internet", "wifi drop", "network issue",
            "wifi band", "network nahi aa raha", "wifi reconnect",
            "와이파이 끊김", "와이파이", "인터넷 끊김", "네트워크 오류"
        }
    }
}

_HINGLISH_WORDS = {
    "mera", "meri", "bohot", "garam", "jaldi", "khatam", "nahi", "ho", "raha",
    "rahi", "hai", "band", "gaya", "chal", "kaam", "ruk", "ke", "phone", "bhai"
}


def detect_query_language(query: str) -> str:
    """
    Detects language of user complaint.
    Returns 'ko' for Korean, 'hi' for Devanagari Hindi, 'hi-Latn' for Hinglish, and 'en' for English.
    """
    if re.search(r"[\uac00-\ud7a3]", query):
        return "ko"
    if re.search(r"[\u0900-\u097f]", query):
        return "hi"
    words = set(re.findall(r"\b\w+\b", query.lower()))
    if len(words.intersection(_HINGLISH_WORDS)) >= 2:
        return "hi-Latn"
    return "en"


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
