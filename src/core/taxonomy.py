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
            "배터리", "방전", "빨리 닳", "배터리 부족", "battery life", "battery percentage",
            "charge keeps dropping", "losing charge", "power draining",
        },
        "overheating": {
            "hot", "garam", "heat", "overheat", "overheating", "warm",
            "bohot garam", "garam ho raha", "phone heat", "heating up",
            "발열", "뜨거워", "과열", "온도", "temperature", "burns", "burning",
            "too hot", "getting hot", "warm to touch",
        },
        "slow_charging": {
            "slow charge", "charging slow", "not charging", "slow charging",
            "der se charge", "charge nahi ho raha",
            "충전 느림", "충전 안됨", "고속충전 안됨", "충전 불가", "won't charge",
            "not fast charging", "charging stopped",
        },
        "unexpected_shutdown": {
            "turns off", "shut down", "band ho gaya", "restarts randomly",
            "switch off", "sudden restart", "keeps restarting",
            "꺼짐", "갑자기 꺼져", "재부팅", "random reboot", "boots itself",
        },
        "battery_protect": {
            "protect battery", "limit charge", "maximum charge", "battery health",
            "stop charging", "85%", "plugged in all night", "overcharge",
            "배터리 보호", "충전 제한",
        },
        "wireless_power_sharing": {
            "wireless power", "power share", "charge watch", "charge another phone",
            "reverse charging", "charge buds",
            "무선 배터리 공유",
        }
    },
    "display": {
        "touch_unresponsive": {
            "touch", "screen unresponsive", "touch not working", "kaam nahi kar raha",
            "touch freeze", "screen not responding", "touch kaam nahi",
            "터치 안됨", "터치 먹통", "화면 터치", "터치 반응 없음",
            "screen frozen", "touch doesn't work", "tapping not working",
        },
        "motion_stutter": {
            "stutter", "lag screen", "refresh rate", "jitter", "120hz",
            "screen flicker", "adaptive smoothness", "flickering",
            "화면 버벅", "주사율", "화면 깜빡임", "부드러운 모션",
            "choppy", "not smooth", "display lag", "screen stutter",
        },
        "gesture_navigation": {
            "gesture", "swipe navigation", "back button", "navigation bar",
            "제스처", "뒤로가기", "내비게이션 바", "swipe back", "bottom bar",
            "navigation gesture", "three button navigation",
        },
        "screen_timeout": {
            "screen timeout", "keep screen on", "screen stays on", "screen off too fast",
            "timeout", "screen turn off", "reading timeout", "screen on while reading",
            "화면 꺼짐", "화면 유지", "자동 꺼짐",
            "screen goes off", "dim screen", "always awake",
        },
        "accidental_touch": {
            "pocket", "dialing itself", "dialing numbers", "accidental", "in my pocket",
            "phone calling by itself", "screen touches itself", "pocket dial",
            "random touches", "calling by itself", "types by itself",
            "주머니", "실수 터치", "주머니 터치", "잠금 해제 안됨",
            "touches when in bag", "accidental screen touch", "butt dial",
        },
        "brightness": {
            "brightness", "too dim", "too bright", "screen dark", "auto brightness",
            "밝기", "어두워", "화면 밝기", "adaptive brightness",
            "screen is dark", "can't see screen", "sunlight readability",
        },
        "always_on": {
            "always on display", "aod", "clock on screen", "always on",
            "상시 화면", "잠금화면", "always on clock", "lock screen clock",
        },
    },
    "notifications": {
        "do_not_disturb": {
            "sleep", "3 am", "night", "vibrating at night", "interrupting sleep",
            "waking me up", "notifications at night", "bedtime", "disturbing",
            "알림 방해", "방해 금지", "수면", "do not disturb", "dnd",
            "random vibration", "alert during sleep", "stop buzzing at night",
            "phone buzzing", "interrupting", "random app vibrations",
            "waking up", "notifications while sleeping", "silent at night",
            "late night notifications", "keep getting notified",
        },
        "notification_settings": {
            "notification", "alert", "badge", "pop up", "banner",
            "알림", "뱃지", "팝업", "notify me", "notification sound",
            "turn off notifications", "app notifications", "silent notifications",
            "hide notifications", "notification style",
        },
        "edge_lighting": {
            "edge light", "edge lighting", "screen edge", "light up edge",
            "edge glows", "side lights up", "edge screen light",
            "엣지 라이팅", "엣지 조명", "edge notification",
            "stop lighting up", "edge of my screen", "rim lights",
            "edge of screen lights", "screen edge lights",
        },
    },
    "camera": {
        "crash_or_slow": {
            "camera", "cam", "camera crash", "camera crashing", "camera crashes", "camera lag", "camera slow", "camera band", "photos blurry",
            "camera freeze", "camera open nahi", "camera error", "camera not working",
            "카메라 튕김", "카메라 멈춤", "사진 흐림", "카메라 오류",
            "camera app crashed", "can't open camera", "camera stopped working",
        },
        "photo_quality": {
            "blurry", "blur", "grainy", "dark photos", "washed out",
            "흐린 사진", "사진 품질", "야간 사진",
            "photos look bad", "picture quality", "night mode", "pro mode",
        },
    },
    "performance": {
        "general_lag": {
            "hang", "lag", "phone slow", "slow response", "ruk ruk ke",
            "phone atak raha", "hang kar raha", "response slow",
            "폰 느려", "버벅임", "렉", "반응 느림", "시스템 지연",
            "sluggish", "freezing", "not responding",
        },
        "app_crash": {
            "app crash", "crashing", "apps closing", "force close",
            "app band ho jata", "apps restart",
            "앱 튕김", "강제종료", "앱 오류", "앱 꺼짐",
            "app keeps crashing", "app closes itself", "keeps force closing",
        },
        "ram": {
            "ram", "memory", "multitasking", "apps close in background",
            "apps keep closing", "background apps", "switching apps slow",
            "clean ram", "free up ram", "memory clean",
            "램", "메모리", "멀티태스킹",
        },
    },
    "connectivity": {
        "quick_share": {
            "send file", "large file", "video file", "quick share", "nearby share",
            "send to friend", "share to galaxy", "massive video", "send to phone",
            "퀵쉐어", "파일 전송", "대용량 파일",
        },
        "wifi_drop": {
            "wifi", "disconnect", "no internet", "wifi drop", "network issue",
            "wifi band", "network nahi aa raha", "wifi reconnect",
            "와이파이 끊김", "와이파이", "인터넷 끊김", "네트워크 오류",
            "keeps disconnecting from wifi", "wifi not stable", "internet drops",
        },
        "mobile_data": {
            "mobile data", "data not working", "4g", "5g", "lte",
            "internet on data", "data slow", "no signal",
            "모바일 데이터", "LTE", "5G", "데이터 안됨",
            "switch to mobile data", "use mobile data when wifi weak",
            "auto switch", "wifi to data",
        },
        "bluetooth": {
            "bluetooth", "bt", "buds", "earphone not connecting", "pairing",
            "블루투스", "연결 안됨", "이어폰",
            "headphones not connecting", "bluetooth keeps disconnecting",
            "galaxy buds", "watch not connecting",
        },
    },
    "sound": {
        "volume_vibration": {
            "volume", "sound", "vibrate", "vibration", "ringtone",
            "소리", "진동", "볼륨", "벨소리",
            "phone vibrating", "silent mode", "mute", "no sound",
            "sound not working", "speaker not working",
        },
        "speaker_distortion": {
            "speaker", "sound crackling", "distorted audio", "sound muffled",
            "awaz nahi aa rahi", "speaker kharab", "speaker buzzing",
            "스피커", "소리 안들림", "소리 찢어짐", "음질 이상"
        },
        "low_volume": {
            "volume low", "call volume", "sound low", "earpiece", "kam awaz",
            "awaz bohot kam", "volume badhana",
            "볼륨 작음", "통화 볼륨", "소리 작음", "음량"
        },
        "spatial_effects": {
            "dolby", "dolby atmos", "sound quality", "adapt sound", "equalizer",
            "atmos", "surround sound",
            "돌비", "돌비 애트모스", "음질 최적화", "사운드"
        },
    },
    "storage": {
        "cleanup_trash": {
            "storage full", "space low", "storage cleanup", "clean storage",
            "trash empty", "delete other files", "storage saaf", "memory space",
            "storage khatam", "clear cache",
            "저장공간", "용량 부족", "메모리 부족", "용량 정리", "휴지통 비우기"
        },
    },
    "security": {
        "biometrics": {
            "fingerprint", "face unlock", "face recognition", "biometric",
            "지문", "얼굴 인식", "생체 인식",
            "fingerprint not working", "face id not working", "can't unlock",
        },
        "biometrics_fingerprint": {
            "fingerprint", "fingerprint not working", "biometrics", "finger print fail",
            "fingerprint reader", "ungli ka nishan", "finger sensor",
            "지문", "지문인식 안됨", "생체인식", "지문 센서"
        },
        "screen_lock": {
            "screen lock", "pin", "password", "pattern", "lock screen",
            "화면 잠금", "잠금 해제", "패턴", "핀 번호",
            "forgot pin", "locked out", "can't unlock phone",
        },
    },
    "accessibility": {
        "text_display": {
            "font size", "text size", "zoom", "large text", "display size",
            "글자 크기", "화면 크기", "확대",
            "text too small", "can't read", "make text bigger",
        },
    },
    "digital_wellbeing": {
        "screen_time": {
            "screen time", "app limit", "usage limit", "digital wellbeing",
            "phone addiction", "app timer", "focus mode",
            "디지털 웰빙", "사용 시간", "앱 제한",
            "too much screen time", "limit app usage", "bedtime mode",
            "wind down", "grey scale at bedtime",
        },
    },
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
    Prioritizes longer, more specific multi-word matches over short generic phrases.
    """
    q = query.lower()
    q = re.sub(r"\bnotworking\b", "not working", q)
    q = re.sub(r"\bnotcharging\b", "not charging", q)
    q = re.sub(r"\boverheating\b", "over heating", q)
    scored_matches = []
    seen_cats = set()

    for domain, symptoms in SYMPTOM_TAXONOMY.items():
        for symptom, keywords in symptoms.items():
            best_kw_len = 0
            for kw in keywords:
                # Use word boundaries for English alphanumeric words to prevent 'hot' matching 'photos'
                if re.match(r"^[a-z0-9\s]+$", kw):
                    if re.search(rf"\b{re.escape(kw)}\b", q):
                        if len(kw) > best_kw_len:
                            best_kw_len = len(kw)
                else:
                    if kw in q:
                        if len(kw) > best_kw_len:
                            best_kw_len = len(kw)
            if best_kw_len > 0:
                cat = f"{domain}.{symptom}"
                scored_matches.append((best_kw_len, cat))

    if not scored_matches:
        return ["general.unknown"]

    # Sort descending by keyword length so more specific matches win (e.g. 'screen timeout' > 'turns off')
    scored_matches.sort(key=lambda x: x[0], reverse=True)
    return [m[1] for m in scored_matches]


def extract_slots(query: str) -> Dict[str, Optional[str]]:
    """
    Extracts high-level domain and symptom slots from user query.
    Used for Tier 2 semantic slot hashing in the cascading cache.
    """
    cats = classify_complaint_taxonomy(query)
    if cats and cats[0] != "general.unknown":
        domain, symptom = cats[0].split(".", 1)
        return {"domain": domain, "symptom": symptom}
    return {"domain": "general", "symptom": "unknown"}
