# src/ai/matcher.py
import json, os
from typing import List, Dict, Optional
from contracts.schema import Deeplink

REAL_CATALOG_PATH = "contracts/deeplinks.json"
DUMMY_POSITIVE = "bixby://dummy_positive"

# Offline/dev-only fixture — used ONLY if the real Samsung catalog file is absent.
# NEVER treat this as the shipped index; it will not match Samsung's masked format.
_DEV_FIXTURE_CATALOG = [
    {"id": "DL_BATTERY_CARE", "deeplink": "bixby://masked/act/0001", "description": "Battery and device care", "classes": {"path": "Settings>Battery"}},
    {"id": "DL_BG_LIMITS", "deeplink": "bixby://masked/act/0002", "description": "Background usage limits for sleeping apps", "classes": {"path": "Settings>Battery>Background usage limits"}},
    {"id": "DL_BATTERY_PROTECTION", "deeplink": "bixby://masked/act/0003", "description": "Protect battery and charging speed", "classes": {"path": "Settings>Battery>Charging"}},
    {"id": "DL_DEVICE_OPTIMIZE", "deeplink": "bixby://masked/act/0004", "description": "Optimize device now, clear ram", "classes": {"path": "Settings>Device care>Optimize now"}},
    {"id": "DL_WIFI_SETTINGS", "deeplink": "bixby://masked/act/0005", "description": "Wi-Fi connection settings", "classes": {"path": "Settings>Connections>Wi-Fi"}},
    {"id": "DL_RESET_NETWORK", "deeplink": "bixby://masked/act/0006", "description": "Reset network settings", "classes": {"path": "Settings>General management>Reset>Reset network settings"}},
    {"id": "DL_DISPLAY_MOTION", "deeplink": "bixby://masked/act/0007", "description": "Motion smoothness and refresh rate", "classes": {"path": "Settings>Display>Motion smoothness"}},
    {"id": "DL_APP_STORAGE", "deeplink": "bixby://masked/act/0008", "description": "App storage and clear cache", "classes": {"path": "Settings>Apps>Storage"}},
    {"id": "DL_NAV_GESTURE", "deeplink": "bixby://masked/act/0009", "description": "Navigation bar swipe gesture direction", "classes": {"path": "Settings>Display>Navigation bar>Swipe gestures"}},
    {"id": "DL_TOUCH_SENSITIVITY", "deeplink": "bixby://masked/act/0010", "description": "Touch sensitivity settings", "classes": {"path": "Settings>Display>Touch sensitivity"}},
    {"id": "DL_CAMERA_CACHE", "deeplink": "bixby://masked/act/0011", "description": "Camera app storage clear cache", "classes": {"path": "Settings>Apps>Camera>Storage"}},
]

class DeeplinkRetrieverAndResolver:
    def __init__(self):
        self.catalog = self._load_catalog()
        self.id_map = {item["id"]: item for item in self.catalog}

    def _load_catalog(self) -> List[Dict]:
        if os.path.exists(REAL_CATALOG_PATH):
            with open(REAL_CATALOG_PATH, "r") as f:
                return json.load(f)          # Samsung's real ~575-entry masked catalog
        print("[matcher] WARNING: real deeplinks.json not found — using dev fixture, "
              "DO NOT submit or demo against this catalog.")
        return _DEV_FIXTURE_CATALOG

    def get_candidate_ids(self, query: str, top_k: int = 5) -> List[str]:
        """First-pass keyword retrieval over description/classes metadata only —
        never over the masked deeplink string itself (Samsung pitfall #4)."""
        q_words = set(query.lower().split())
        scored = []
        for item in self.catalog:
            meta_text = (item.get("description", "") + " " + str(item.get("classes", ""))).lower()
            score = sum(1 for w in q_words if w in meta_text)
            scored.append((score, item["id"]))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [cid for score, cid in scored[:top_k] if score > 0] or [self.catalog[0]["id"]]

    def bind_deeplink(self, deeplink_id: Optional[str], shkg=None, category: str = "") -> Optional[Deeplink]:
        """Post-generation binding ONLY — the LLM never sees or writes a real
        URI (fix for Retrieval-Bound Generation actually running, Finding #2/#3)."""
        candidate_ids = [deeplink_id] if deeplink_id else []
        resolved_id = shkg.resolve_deepest_screen(candidate_ids, category) if (shkg and candidate_ids) else deeplink_id
        item = self.id_map.get(resolved_id)
        if item:
            return Deeplink(deeplink=item["deeplink"], description=item.get("description", ""), classes=item.get("classes"))
        # Finding #11: use Samsung's own designated sentinel instead of fabricating or dropping
        return Deeplink(deeplink=DUMMY_POSITIVE, description="Valid screen, not yet indexed in catalog")

matcher = DeeplinkRetrieverAndResolver()
