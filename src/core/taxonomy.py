# src/core/taxonomy.py
from typing import Dict, List

SYMPTOM_TAXONOMY: Dict[str, Dict] = {
    "battery.rapid_drain": {
        "subsystem": "Battery",
        "keywords": ["battery", "drain", "dying", "battery backup", "jaldi khatam", "battery drop", "battery draining"],
        "default_deeplink_id": "DL_BATTERY_CARE",
    },
    "battery.overheating": {
        "subsystem": "Battery",
        "keywords": ["overheat", "overheating", "too hot", "garam ho raha", "taap raha", "heats up", "heating"],
        "default_deeplink_id": "DL_BATTERY_CARE",
    },
    "battery.unexpected_shutdown": {
        "subsystem": "Battery",
        "keywords": ["turns off suddenly", "shuts down", "switches off", "band ho jata", "randomly restarts"],
        "default_deeplink_id": "DL_BATTERY_CARE",
    },
    "battery.slow_charging": {
        "subsystem": "Battery",
        "keywords": ["slow charging", "charging slow", "charge nahi", "takes long to charge", "charging speed"],
        "default_deeplink_id": "DL_BATTERY_PROTECTION",
    },
    "display.gesture_navigation": {
        "subsystem": "Display",
        "keywords": ["swipe", "gesture", "navigation bar", "swipe wrong direction", "gesture galat", "swipe direction"],
        "default_deeplink_id": "DL_NAV_GESTURE",
    },
    "display.motion_stutter": {
        "subsystem": "Display",
        "keywords": ["refresh rate", "stutter", "animation lag", "120hz", "60hz", "screen lag", "flickers"],
        "default_deeplink_id": "DL_DISPLAY_MOTION",
    },
    "display.touch_unresponsive": {
        "subsystem": "Display",
        "keywords": ["touch screen unresponsive", "touch not working", "screen not responding", "touch issue"],
        "default_deeplink_id": "DL_TOUCH_SENSITIVITY",
    },
    "camera.crash_or_slow": {
        "subsystem": "Camera",
        "keywords": ["camera crash", "camera blurry", "camera slow", "camera not opening", "camera hang", "camera freeze"],
        "default_deeplink_id": "DL_CAMERA_CACHE",
    },
    "performance.general_lag": {
        "subsystem": "Performance",
        "keywords": ["lag", "slow", "hang", "freezing", "stuck", "phone slow", "hang ho raha hai", "atak raha hai"],
        "default_deeplink_id": "DL_DEVICE_OPTIMIZE",
    },
    "performance.app_crash": {
        "subsystem": "Performance",
        "keywords": ["apps crashing", "app crash", "app band ho jata", "force close", "crashing randomly"],
        "default_deeplink_id": "DL_APP_STORAGE",
    },
    "performance.storage_pressure": {
        "subsystem": "Performance",
        "keywords": ["storage full", "no space", "memory full", "storage khatam", "cannot take photos"],
        "default_deeplink_id": "DL_APP_STORAGE",
    },
    "connectivity.wifi_drop": {
        "subsystem": "Connectivity",
        "keywords": ["wifi", "disconnect", "no internet", "wifi drop", "wifi band"],
        "default_deeplink_id": "DL_WIFI_SETTINGS",
    },
}

def classify_complaint_taxonomy(text: str) -> List[str]:
    """Language-agnostic keyword-set classification — works directly on raw
    Hinglish/English text with no separate translation step required."""
    lower_text = text.lower()
    matches = [cat_id for cat_id, data in SYMPTOM_TAXONOMY.items()
               if any(kw in lower_text for kw in data["keywords"])]
    return matches or ["performance.general_lag"]

def extract_slots(text: str) -> Dict[str, str]:
    categories = classify_complaint_taxonomy(text)
    primary = categories[0]
    subsystem, symptom = primary.split(".", 1)
    return {"domain": subsystem.lower(), "symptom": symptom}
