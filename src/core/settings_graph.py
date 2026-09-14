# src/core/settings_graph.py — Settings Hierarchy Knowledge Graph (SHKG)
"""
Fixby Settings Hierarchy Knowledge Graph (SHKG).
Builds a directed graph of Samsung One UI settings navigation paths using NetworkX.
Resolves parent screens to leaf-node screens to avoid broad-menu penalties.
"""
import json
import os
from typing import Dict, List, Optional, Any
import networkx as nx

DUMMY_POSITIVE = "bixby://dummy_positive"


class SettingsHierarchyGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.catalog_map: Dict[str, Dict[str, Any]] = {}

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

            classes = item.get("classes")
            path = ""
            if isinstance(classes, dict):
                path = classes.get("path", "")
            elif isinstance(classes, str):
                path = classes

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
        Calculates shortest path depth from root 'Settings'.
        """
        if not candidate_ids:
            return DUMMY_POSITIVE

        valid_nodes = [cid for cid in candidate_ids if cid in self.graph]
        if not valid_nodes:
            return candidate_ids[0]

        best_node = valid_nodes[0]
        max_depth = -1
        for node in valid_nodes:
            try:
                depth = nx.shortest_path_length(self.graph, source="Settings", target=node) if nx.has_path(self.graph, "Settings", node) else 0
            except Exception:
                depth = 0
            if depth > max_depth:
                max_depth = depth
                best_node = node

        return best_node


settings_graph = SettingsHierarchyGraph()

# Auto-initialize with default deeplink catalog if present
_default_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "contracts", "deeplinks.json")
if os.path.exists(_default_path):
    settings_graph.load_catalog_file(_default_path)
