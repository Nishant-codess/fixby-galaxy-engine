# src/core/settings_graph.py — Settings Hierarchy Knowledge Graph (SHKG)
"""
Fixby Settings Hierarchy Knowledge Graph (SHKG).
Builds a directed graph of Samsung One UI settings navigation paths using NetworkX.
Resolves parent screens to leaf-node screens to avoid broad-menu penalties.
"""
import json
import os
from typing import Dict, List, Optional, Any, Tuple
import networkx as nx

DUMMY_POSITIVE = "bixby://dummy_positive"


DOMAIN_KEYWORDS_MAP: Dict[str, List[str]] = {
    "connectivity": ["connections", "wifi", "wi-fi", "bluetooth", "flight mode", "airplane", "network", "wireless", "mobile data"],
    "battery": ["battery", "power saving", "charging", "protect battery", "wireless power", "overheating", "thermal"],
    "display": ["display", "motion smoothness", "screen timeout", "brightness", "eye comfort", "dark mode", "navigation bar", "accidental touch", "always on display", "touch sensitivity", "font size"],
    "camera": ["camera", "photos", "scene optimizer", "apps>camera"],
    "performance": ["device care", "memory", "ram", "optimization", "auto optimization", "performance profile", "app protection"],
    "storage": ["storage", "trash", "space"],
    "sound": ["sound", "vibration", "volume", "dolby", "audio", "speaker", "sound quality", "ringtone"],
    "security": ["security", "biometrics", "fingerprint", "face recognition", "screen lock", "auto blocker", "permission", "secure folder"],
    "notifications": ["notifications", "do not disturb", "dnd", "edge lighting", "brief pop-up", "badges", "lock screen notifications"],
    "general": ["general management", "reset", "general"],
    "accessibility": ["font size", "accessibility"],
}

DOMAIN_PATH_ROOTS: Dict[str, Tuple[str, ...]] = {
    "connectivity": ("Settings>Connections",),
    "display": ("Settings>Display",),
    "camera": ("Settings>Apps>Camera",),
    "sound": ("Settings>Sounds and vibration",),
    "security": ("Settings>Security and privacy",),
    "notifications": ("Settings>Notifications",),
    "storage": ("Settings>Device care>Storage",),
    "performance": ("Settings>Device care",),
    "battery": ("Settings>Battery", "Settings>Device care"),
    "general": ("Settings>General management",),
}


class SettingsHierarchyGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.catalog_map: Dict[str, Dict[str, Any]] = {}

    def _get_item_path(self, item: Dict[str, Any]) -> str:
        classes = item.get("classes", "")
        if isinstance(classes, dict):
            return classes.get("path", "")
        elif isinstance(classes, str):
            return classes
        return ""

    def build_from_catalog(self, catalog: List[Dict[str, Any]]):
        """
        Builds the directed graph from Samsung Deeplink catalog.
        Edges represent breadcrumb hierarchy (e.g., Settings -> Battery -> Background usage limits).
        """
        self.graph.clear()
        self.catalog_map.clear()

        for item in catalog:
            node_id = item.get("id") or item.get("deeplink")
            if not node_id:
                continue
            self.catalog_map[node_id] = item
            self.graph.add_node(node_id, **item)

            path = self._get_item_path(item)
            if path:
                parts = [p.strip() for p in path.split(">") if p.strip()]
                for i in range(len(parts) - 1):
                    self.graph.add_edge(parts[i], parts[i + 1])
                if parts:
                    self.graph.add_edge(parts[-1], node_id)

    def load_catalog_file(self, filepath: str = "contracts/deeplinks.json"):
        """Loads and builds graph from a JSON catalog file if available."""
        if os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self.build_from_catalog(data)
            except Exception:
                pass

    def resolve_deepest_screen(self, candidate_ids: List[str], domain: Optional[str] = None) -> Optional[str]:
        """
        Traverses graph to select the deepest leaf node among candidate screens.
        Resolves parent menus to leaf-node screens within the same tree/branch,
        avoiding broad-menu penalties and preventing cross-domain leakage.
        """
        if not candidate_ids:
            return DUMMY_POSITIVE

        valid_nodes = [cid for cid in candidate_ids if cid in self.graph]
        if not valid_nodes:
            return candidate_ids[0]

        # 1. Filter by domain path root or keywords if domain is known
        if domain and domain.lower() != "general":
            d_lower = domain.lower()
            path_roots = DOMAIN_PATH_ROOTS.get(d_lower)
            if path_roots:
                root_nodes = [
                    cid for cid in valid_nodes
                    if self._get_item_path(self.catalog_map.get(cid, {})).startswith(path_roots)
                ]
                if root_nodes:
                    valid_nodes = root_nodes
                else:
                    keywords = DOMAIN_KEYWORDS_MAP.get(d_lower, [d_lower])
                    domain_nodes = []
                    for cid in valid_nodes:
                        item = self.catalog_map.get(cid, {})
                        desc = item.get("description", "").lower()
                        classes_str = str(item.get("classes", "")).lower()
                        deeplink = item.get("deeplink", "").lower()
                        cid_str = cid.lower()
                        blob = f"{desc} {classes_str} {deeplink} {cid_str}"
                        if any(kw in blob for kw in keywords):
                            domain_nodes.append(cid)
                    if domain_nodes:
                        valid_nodes = domain_nodes
            else:
                keywords = DOMAIN_KEYWORDS_MAP.get(d_lower, [d_lower])
                domain_nodes = []
                for cid in valid_nodes:
                    item = self.catalog_map.get(cid, {})
                    desc = item.get("description", "").lower()
                    classes_str = str(item.get("classes", "")).lower()
                    deeplink = item.get("deeplink", "").lower()
                    cid_str = cid.lower()
                    blob = f"{desc} {classes_str} {deeplink} {cid_str}"
                    if any(kw in blob for kw in keywords):
                        domain_nodes.append(cid)
                if domain_nodes:
                    valid_nodes = domain_nodes

        # 2. Start from the top-ranked candidate for this query
        top_node = valid_nodes[0]
        top_item = self.catalog_map.get(top_node, {})
        top_path = self._get_item_path(top_item)

        # 3. Check if any other candidate is a descendant / deeper child in the same path
        best_node = top_node
        best_depth = nx.shortest_path_length(self.graph, source="Settings", target=top_node) if nx.has_path(self.graph, "Settings", top_node) else 0

        for candidate in valid_nodes[1:]:
            cand_item = self.catalog_map.get(candidate, {})
            cand_path = self._get_item_path(cand_item)

            # Candidate must be in the same subtree/branch (child of top_node's path)
            is_descendant = False
            if top_path and cand_path:
                if cand_path.startswith(top_path) and cand_path != top_path:
                    is_descendant = True
                else:
                    # Also check graph reachability from top_node or common parent
                    try:
                        if nx.has_path(self.graph, top_node, candidate):
                            is_descendant = True
                    except Exception:
                        pass

            if is_descendant:
                try:
                    depth = nx.shortest_path_length(self.graph, source="Settings", target=candidate) if nx.has_path(self.graph, "Settings", candidate) else 0
                except Exception:
                    depth = 0

                if depth > best_depth:
                    best_depth = depth
                    best_node = candidate

        return best_node


settings_graph = SettingsHierarchyGraph()

# Auto-initialize with default deeplink catalog if present
_default_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "contracts", "deeplinks.json")
if os.path.exists(_default_path):
    settings_graph.load_catalog_file(_default_path)
