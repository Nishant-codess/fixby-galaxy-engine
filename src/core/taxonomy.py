# src/core/taxonomy.py
"""
Expanded symptom taxonomy with domain isolation, fuzzy matching,
and robust input tolerance (typos, Hinglish, vague queries).
"""
from typing import Dict, List, Tuple, Optional

# ──────────────────────────────────────────────────────────────
# Typo / misspelling alias map  (Task 2.2)
# ──────────────────────────────────────────────────────────────
TYPO_ALIASES: Dict[str, str] = {
    "camra": "camera", "cmaera": "camera", "cemera": "camera",
    "camrea": "camera", "caemra": "camera",
    "baterry": "battery", "battrey": "battery", "batery": "battery",
    "bttry": "battery", "batteri": "battery",
    "blu tooth": "bluetooth", "bluethooth": "bluetooth", "blutooth": "bluetooth",
    "bluetoth": "bluetooth", "bluetooh": "bluetooth",
    "overheeting": "overheating", "overheting": "overheating",
    "overheat": "overheating",
    "chargng": "charging", "charing": "charging", "chrging": "charging",
    "disply": "display", "displya": "display", "dispaly": "display",
    "scrren": "screen", "scren": "screen", "screeen": "screen",
    "wifi": "wi-fi", "wfi": "wi-fi", "wifii": "wi-fi",
    "conection": "connection", "conexion": "connection",
    "setings": "settings", "settigns": "settings",
    "notifcation": "notification", "notificaton": "notification",
    "locaton": "location", "locaion": "location",
    "stoarge": "storage", "stroage": "storage", "sorage": "storage",
    "permision": "permission", "permisson": "permission",
    "updaet": "update", "updte": "update",
    "draning": "draining", "draing": "draining",
    "wrking": "working", "woking": "working", "workng": "working",
    "sloww": "slow", "sloow": "slow",
    "frezing": "freezing", "freeezng": "freezing",
    "crasing": "crashing", "crashng": "crashing",
    "touche": "touch", "toch": "touch",
    "darkk": "dark", "drk": "dark",
    "soud": "sound", "soound": "sound", "sond": "sound",
    "volme": "volume", "volumee": "volume", "vlume": "volume",
    "ringtone": "ringtone", "rigntone": "ringtone",
    "nfc": "nfc", "hotpsot": "hotspot", "hotspt": "hotspot",
}

# ──────────────────────────────────────────────────────────────
# Domain isolation keywords  (Task 2.1)
# If a query contains ANY of these anchors, only symptoms from
# the corresponding subsystem are eligible — hard gate.
# ──────────────────────────────────────────────────────────────
DOMAIN_ANCHORS: Dict[str, List[str]] = {
    "Battery": ["battery", "charging", "charger", "charge", "drain", "power", "dying",
                "overheating", "overheat", "hot", "garam", "jaldi khatam"],
    "Display": ["display", "screen", "refresh rate", "120hz", "60hz", "brightness",
                "dark mode", "night mode", "touch", "gesture", "swipe", "navigation bar",
                "flicker", "stutter"],
    "Camera": ["camera", "photo", "video", "lens", "blurry", "blur", "selfie", "flash",
               "zoom", "recording", "shutter", "focus"],
    "Performance": ["slow", "lag", "hang", "freeze", "stuck", "crash", "storage",
                    "memory", "ram", "space", "atak", "performance", "speed"],
    "Connectivity": ["wifi", "wi-fi", "bluetooth", "internet", "network", "mobile data",
                     "hotspot", "airplane", "signal", "nfc", "5g", "4g", "lte",
                     "disconnect", "connect"],
    "Privacy": ["location", "gps", "privacy", "permission", "tracking", "find my"],
    "Sound": ["sound", "volume", "speaker", "microphone", "ringtone", "vibration",
              "silent", "mute", "audio", "headphone", "earphone", "dolby"],
    "Notifications": ["notification", "alert", "do not disturb", "dnd", "badge",
                      "popup", "heads up", "silent notification"],
    "Software": ["update", "software", "firmware", "os", "version", "patch",
                 "upgrade", "one ui"],
    "Accounts": ["account", "samsung account", "google account", "sync", "backup",
                 "sign in", "login", "password"],
}

# ──────────────────────────────────────────────────────────────
# Full symptom taxonomy  (expanded from 12 → 25 entries)
# ──────────────────────────────────────────────────────────────
SYMPTOM_TAXONOMY: Dict[str, Dict] = {
    # ── Battery ──
    "battery.rapid_drain": {
        "subsystem": "Battery",
        "keywords": ["battery drain", "drain", "dying", "battery backup",
                     "jaldi khatam", "battery drop", "battery draining",
                     "battery percentage", "battery life"],
        "default_deeplink_id": "DL_BATTERY_CARE",
    },
    "battery.overheating": {
        "subsystem": "Battery",
        "keywords": ["overheat", "overheating", "too hot", "garam ho raha",
                     "taap raha", "heats up", "heating", "phone hot",
                     "device hot", "garam", "heating up"],
        "default_deeplink_id": "DL_BATTERY_CARE",
    },
    "battery.unexpected_shutdown": {
        "subsystem": "Battery",
        "keywords": ["turns off suddenly", "shuts down", "switches off",
                     "band ho jata", "randomly restarts", "auto restart",
                     "keeps restarting"],
        "default_deeplink_id": "DL_BATTERY_CARE",
    },
    "battery.slow_charging": {
        "subsystem": "Battery",
        "keywords": ["slow charging", "charging slow", "charge nahi",
                     "takes long to charge", "charging speed",
                     "fast charging not working", "not charging"],
        "default_deeplink_id": "DL_CHARGING_SETTINGS",
    },

    # ── Display ──
    "display.gesture_navigation": {
        "subsystem": "Display",
        "keywords": ["swipe", "gesture", "navigation bar",
                     "swipe wrong direction", "gesture galat",
                     "swipe direction", "back gesture"],
        "default_deeplink_id": "DL_NAVIGATION_BAR",
    },
    "display.motion_stutter": {
        "subsystem": "Display",
        "keywords": ["refresh rate", "stutter", "animation lag", "120hz",
                     "60hz", "screen lag", "flickers", "motion smoothness",
                     "choppy", "not smooth"],
        "default_deeplink_id": "DL_DISPLAY_MOTION",
    },
    "display.touch_unresponsive": {
        "subsystem": "Display",
        "keywords": ["touch screen unresponsive", "touch not working",
                     "screen not responding", "touch issue",
                     "ghost touch", "screen protector touch"],
        "default_deeplink_id": "DL_DISPLAY_TOUCH",
    },
    "display.dark_mode": {
        "subsystem": "Display",
        "keywords": ["dark mode", "night mode", "dark theme",
                     "enable dark", "turn on dark", "light mode",
                     "theme change", "dark mode kaise"],
        "default_deeplink_id": "DL_DARK_MODE",
    },
    "display.brightness": {
        "subsystem": "Display",
        "keywords": ["brightness", "screen too dim", "screen too bright",
                     "auto brightness", "adaptive brightness",
                     "brightness not working"],
        "default_deeplink_id": "DL_DISPLAY_BRIGHTNESS",
    },

    # ── Camera ──
    "camera.crash_or_slow": {
        "subsystem": "Camera",
        "keywords": ["camera crash", "camera blurry", "camera slow",
                     "camera not opening", "camera hang", "camera freeze",
                     "blurry photos", "camera black screen",
                     "camera not working", "camera error",
                     "camera focus", "camera blur",
                     "camera nahi chal raha", "camera band"],
        "default_deeplink_id": "DL_CAMERA_SETTINGS",
    },

    # ── Performance ──
    "performance.general_lag": {
        "subsystem": "Performance",
        "keywords": ["lag", "slow", "hang", "freezing", "stuck",
                     "phone slow", "hang ho raha hai", "atak raha hai",
                     "not responding", "laggy", "sluggish"],
        "default_deeplink_id": "DL_DEVICE_CARE_MEMORY",
    },
    "performance.app_crash": {
        "subsystem": "Performance",
        "keywords": ["apps crashing", "app crash", "app band ho jata",
                     "force close", "crashing randomly",
                     "app not responding", "app stopped",
                     "unfortunately stopped"],
        "default_deeplink_id": "DL_APPS_MANAGEMENT",
    },
    "performance.storage_pressure": {
        "subsystem": "Performance",
        "keywords": ["storage full", "no space", "memory full",
                     "storage khatam", "cannot take photos",
                     "insufficient storage", "internal storage",
                     "clear storage", "free up space"],
        "default_deeplink_id": "DL_DEVICE_CARE_STORAGE",
    },

    # ── Connectivity ──
    "connectivity.wifi_drop": {
        "subsystem": "Connectivity",
        "keywords": ["wifi", "wi-fi", "disconnect", "no internet",
                     "wifi drop", "wifi band", "wifi not connecting",
                     "wifi slow", "internet not working"],
        "default_deeplink_id": "DL_WIFI_SETTINGS",
    },
    "connectivity.bluetooth": {
        "subsystem": "Connectivity",
        "keywords": ["bluetooth", "bluetooth not connecting",
                     "bluetooth won't connect", "bluetooth pairing",
                     "bluetooth device", "bt not working",
                     "bluetooth disconnect", "bluetooth audio"],
        "default_deeplink_id": "DL_BLUETOOTH_SETTINGS",
    },
    "connectivity.mobile_data": {
        "subsystem": "Connectivity",
        "keywords": ["mobile data", "data not working", "4g", "5g", "lte",
                     "no signal", "network issue", "cellular",
                     "sim card", "airplane mode"],
        "default_deeplink_id": "DL_MOBILE_DATA",
    },
    "connectivity.hotspot": {
        "subsystem": "Connectivity",
        "keywords": ["hotspot", "mobile hotspot", "tethering",
                     "hotspot not working", "share internet"],
        "default_deeplink_id": "DL_HOTSPOT",
    },

    # ── Privacy ──
    "privacy.location": {
        "subsystem": "Privacy",
        "keywords": ["location", "gps", "turn off location",
                     "location not working", "gps not accurate",
                     "find my phone", "location services",
                     "location permission", "location kaise band kare"],
        "default_deeplink_id": "DL_LOCATION",
    },
    "privacy.permissions": {
        "subsystem": "Privacy",
        "keywords": ["permission", "app permission", "allow access",
                     "deny permission", "camera permission",
                     "microphone permission", "privacy settings"],
        "default_deeplink_id": "DL_PRIVACY",
    },

    # ── Sound ──
    "sound.volume_issue": {
        "subsystem": "Sound",
        "keywords": ["volume", "sound", "no sound", "speaker",
                     "volume low", "volume not working", "ringtone",
                     "silent mode", "vibration", "mute", "audio",
                     "sound not working", "speaker problem"],
        "default_deeplink_id": "DL_SOUND",
    },

    # ── Notifications ──
    "notifications.not_showing": {
        "subsystem": "Notifications",
        "keywords": ["notification", "notifications not showing",
                     "no notifications", "notification sound",
                     "do not disturb", "dnd", "alert",
                     "notification kaam nahi kar raha"],
        "default_deeplink_id": "DL_NOTIFICATIONS",
    },

    # ── Software ──
    "software.update": {
        "subsystem": "Software",
        "keywords": ["software update", "update available", "os update",
                     "firmware update", "one ui update", "system update",
                     "update kaise kare", "latest version",
                     "update not showing"],
        "default_deeplink_id": "DL_SOFTWARE_UPDATE",
    },

    # ── Accounts ──
    "accounts.sync": {
        "subsystem": "Accounts",
        "keywords": ["samsung account", "google account", "sync",
                     "backup", "sign in", "login", "logout",
                     "account not syncing", "remove account"],
        "default_deeplink_id": "DL_ACCOUNTS",
    },
}


# ──────────────────────────────────────────────────────────────
# Fuzzy matching helpers  (Task 2.2)
# ──────────────────────────────────────────────────────────────

def _edit_distance(s1: str, s2: str) -> int:
    """Levenshtein distance — O(m*n) but inputs are short keywords."""
    if len(s1) < len(s2):
        return _edit_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    prev_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row
    return prev_row[-1]


def _normalize_typos(text: str) -> str:
    """Replace known misspellings with correct forms."""
    result = text.lower()
    # Multi-word aliases first (longer match priority)
    for typo, correct in sorted(TYPO_ALIASES.items(), key=lambda x: -len(x[0])):
        if typo in result:
            result = result.replace(typo, correct)
    return result


def _fuzzy_keyword_match(text: str, keyword: str, max_dist: int = 2) -> bool:
    """Check if any word in text is within edit distance of keyword words."""
    text_words = text.split()
    kw_words = keyword.split()

    if len(kw_words) == 1:
        # Single-word keyword: check each word in text
        for tw in text_words:
            if _edit_distance(tw, kw_words[0]) <= max_dist:
                return True
        return False
    else:
        # Multi-word keyword: check if all words appear (with fuzzy) or exact substring
        if keyword in text:
            return True
        matched = 0
        for kw in kw_words:
            for tw in text_words:
                if _edit_distance(tw, kw) <= max_dist:
                    matched += 1
                    break
        return matched >= len(kw_words)


# ──────────────────────────────────────────────────────────────
# Domain-constrained classification  (Tasks 2.1 + 2.2)
# ──────────────────────────────────────────────────────────────

def _detect_domain_anchors(text: str) -> List[str]:
    """Return list of subsystem names strongly anchored by the text."""
    lower = text.lower()
    anchored = []
    for domain, anchors in DOMAIN_ANCHORS.items():
        if any(a in lower for a in anchors):
            anchored.append(domain)
    return anchored


def classify_complaint_taxonomy(text: str) -> Tuple[List[str], float]:
    """Language-agnostic keyword-set classification with fuzzy matching,
    domain isolation, and confidence scoring.

    Returns (matched_category_ids, confidence_score).
    """
    # Step 1: Normalize typos
    normalized = _normalize_typos(text)
    lower_text = normalized

    # Step 2: Detect domain anchors for isolation
    anchored_domains = _detect_domain_anchors(lower_text)

    # Step 3: Score each category
    scored: List[Tuple[str, float]] = []

    # Detect explicit component nouns for specificity bonus
    COMPONENT_NOUNS = {
        "camera": "Camera", "bluetooth": "Connectivity", "wifi": "Connectivity",
        "wi-fi": "Connectivity", "battery": "Battery", "display": "Display",
        "screen": "Display", "speaker": "Sound", "volume": "Sound",
        "location": "Privacy", "gps": "Privacy", "notification": "Notifications",
    }
    explicit_subsystem = None
    first_words = lower_text.split()
    for word in first_words:
        if word in COMPONENT_NOUNS:
            explicit_subsystem = COMPONENT_NOUNS[word]
            break

    for cat_id, data in SYMPTOM_TAXONOMY.items():
        # Domain isolation: skip categories outside anchored domains
        if anchored_domains and data["subsystem"] not in anchored_domains:
            continue

        score = 0.0
        for kw in data["keywords"]:
            # Exact substring match
            if kw in lower_text:
                # Multi-word keywords are more specific → higher weight
                kw_word_count = len(kw.split())
                score += 1.0 + (0.5 * (kw_word_count - 1))
            # Fuzzy match (lower confidence)
            elif _fuzzy_keyword_match(lower_text, kw, max_dist=2):
                score += 0.6

        # Component-specificity bonus: if the query explicitly names a
        # component (e.g. "camera"), boost categories from that subsystem
        if score > 0 and explicit_subsystem and data["subsystem"] == explicit_subsystem:
            score += 3.0

        if score > 0:
            scored.append((cat_id, score))

    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)

    if scored:
        max_score = scored[0][1]
        # Confidence: high if clear winner, low if close scores
        if len(scored) == 1:
            confidence = min(max_score / 2.0, 1.0)
        else:
            gap = max_score - scored[1][1]
            confidence = min((max_score / 2.0) * (1 + gap / max(max_score, 1)), 1.0)

        return [s[0] for s in scored], round(confidence, 3)

    # No match at all — try without domain isolation as fallback
    if anchored_domains:
        fallback_scored = []
        for cat_id, data in SYMPTOM_TAXONOMY.items():
            score = 0.0
            for kw in data["keywords"]:
                if kw in lower_text:
                    score += 1.0
                elif _fuzzy_keyword_match(lower_text, kw, max_dist=2):
                    score += 0.6
            if score > 0:
                fallback_scored.append((cat_id, score))
        fallback_scored.sort(key=lambda x: x[1], reverse=True)
        if fallback_scored:
            return [s[0] for s in fallback_scored], round(fallback_scored[0][1] / 3.0, 3)

    # Truly nothing matched
    return ["performance.general_lag"], 0.15


def extract_slots(text: str) -> Dict[str, str]:
    categories, confidence = classify_complaint_taxonomy(text)
    primary = categories[0]
    subsystem, symptom = primary.split(".", 1)
    return {"domain": subsystem.lower(), "symptom": symptom, "confidence": str(confidence)}


# ──────────────────────────────────────────────────────────────
# Vague query detection  (Task 2.2)
# ──────────────────────────────────────────────────────────────
VAGUE_QUERIES = {"help", "not working", "problem", "issue", "fix", "error",
                 "broken", "wrong", "bad", "kaam nahi", "kharab"}


def is_vague_query(text: str) -> bool:
    """Detect queries too vague to classify with confidence."""
    words = set(text.lower().strip().split())
    # Single word or all words are vague terms
    if len(words) <= 2 and words.issubset(VAGUE_QUERIES | {"my", "phone", "device", "samsung", "galaxy"}):
        return True
    return False


def get_clarification_options(text: str) -> List[Dict[str, str]]:
    """For vague queries, return top-3 possible interpretations."""
    categories, _ = classify_complaint_taxonomy(text)
    options = []
    seen_subsystems = set()
    for cat_id in categories[:5]:
        data = SYMPTOM_TAXONOMY.get(cat_id)
        if data and data["subsystem"] not in seen_subsystems:
            seen_subsystems.add(data["subsystem"])
            options.append({
                "domain": data["subsystem"],
                "suggestion": f"Are you having issues with {data['subsystem'].lower()}?",
                "category": cat_id,
            })
        if len(options) >= 3:
            break

    # If still less than 3, add common domains
    for domain in ["Battery", "Display", "Connectivity"]:
        if domain not in seen_subsystems and len(options) < 3:
            options.append({
                "domain": domain,
                "suggestion": f"Are you having issues with {domain.lower()}?",
                "category": f"{domain.lower()}.general",
            })
    return options[:3]
