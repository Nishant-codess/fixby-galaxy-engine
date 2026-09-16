# src/core/settings_graph.py
import json
from typing import Optional, List, Dict

try:
    import networkx as nx
    HAS_NETWORKX = True
except ImportError:
    HAS_NETWORKX = False


class SettingsHierarchyGraph:
    def __init__(self):
        self.graph = nx.DiGraph() if HAS_NETWORKX else None
        self.deeplink_nodes: Dict[str, str] = {}

    def _extract_path(self, item: Dict) -> List[str]:
        """Defensive, multi-strategy parser — Samsung's `classes` field is
        Optional[Dict[str,str]], not the delimited string the old code assumed
        (Finding #10). Tries, in order: a 'path' key, joining all dict values,
        then falls back to the description text, then gives up gracefully
        instead of crashing (per the original PRD's risk mitigation)."""
        classes = item.get("classes")
        if isinstance(classes, dict):
            if "path" in classes:
                return [p.strip() for p in classes["path"].split(">") if p.strip()]
            joined = ">".join(str(v) for v in classes.values())
            if joined:
                return [p.strip() for p in joined.split(">") if p.strip()]
        if isinstance(classes, str) and classes:
            return [p.strip() for p in classes.split(">") if p.strip()]
        description = item.get("description", "")
        if ">" in description:
            return [p.strip() for p in description.split(">") if p.strip()]
        return [description.strip()] if description.strip() else []

    def build_from_catalog(self, catalog: List[Dict]):
        if not self.graph:
            return
        for item in catalog:
            parts = self._extract_path(item)
            for i, part in enumerate(parts):
                self.graph.add_node(part, depth=i)
                if i > 0:
                    self.graph.add_edge(parts[i - 1], part)
            if parts:
                self.deeplink_nodes[item["id"]] = parts[-1]

    def resolve_deepest_screen(self, candidate_ids: List[str], category: str = "") -> Optional[str]:
        if not self.graph or not candidate_ids:
            return candidate_ids[0] if candidate_ids else None
        best_id, best_depth = candidate_ids[0], -1
        for dl_id in candidate_ids:
            node = self.deeplink_nodes.get(dl_id)
            if node and self.graph.has_node(node):
                depth = self.graph.nodes[node].get("depth", 0)
                if depth > best_depth:
                    best_depth = depth
                    best_id = dl_id
        return best_id

settings_graph = SettingsHierarchyGraph()
