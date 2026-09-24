"""
src/ai/graph_generator.py — Diagnostic DAG & Decision Tree Generator
Converts extracted Goals/Actions into visual graph nodes and edges for frontend UI rendering.
"""
import logging
from typing import List, Dict, Any, Optional
from contracts.schema import Goal, ActionCategory

logger = logging.getLogger("fixby.ai.graph_generator")

CATEGORY_COLORS = {
    ActionCategory.auto: "#10b981",       # emerald green
    ActionCategory.manual: "#f59e0b",     # amber/orange
    ActionCategory.critical: "#ef4444",   # rose/red
    "auto": "#10b981",
    "manual": "#f59e0b",
    "critical": "#ef4444"
}


class DiagnosticGraphGenerator:
    """
    Builds visual diagnostic decision graphs from structured Goal objects.
    """
    def generate_graph(self, goals: List[Goal]) -> Dict[str, Any]:
        nodes = []
        edges = []

        if not goals:
            return {"nodes": [], "edges": []}

        # Collect all actions across goals
        all_actions = []
        for g in goals:
            for act in g.actions:
                all_actions.append(act)

        if not all_actions:
            return {"nodes": [], "edges": []}

        # Build nodes
        for idx, act in enumerate(all_actions):
            node_id = f"n{idx + 1}"
            cat_val = act.category.value if hasattr(act.category, "value") else str(act.category)
            color = CATEGORY_COLORS.get(cat_val, "#3b82f6")

            nodes.append({
                "id": node_id,
                "label": act.actionName,
                "category": cat_val,
                "color": color
            })

        # Build edges sequentially linking steps
        for i in range(len(nodes) - 1):
            curr_node = nodes[i]
            next_node = nodes[i + 1]

            if next_node["category"] == "critical":
                edge_label = "Last resort"
            else:
                edge_label = "If issue persists"

            edges.append({
                "from": curr_node["id"],
                "to": next_node["id"],
                "label": edge_label
            })

        return {
            "nodes": nodes,
            "edges": edges
        }


# Singleton instance
graph_generator = DiagnosticGraphGenerator()


def generate_diagnostic_graph(goals: List[Goal]) -> Dict[str, Any]:
    """Convenience wrapper for diagnostic graph generation."""
    return graph_generator.generate_graph(goals)
