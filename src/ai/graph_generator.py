# src/ai/graph_generator.py
from typing import Dict, Any
from contracts.schema import TroubleshootResponse

def generate_diagnostic_graph(response: TroubleshootResponse) -> Dict[str, Any]:
    nodes = []
    edges = []
    
    nodes.append({"id": "start", "label": "Start Troubleshooting", "type": "start"})
    
    if not response.response.contexts:
        nodes.append({"id": "no_match", "label": "No Solution Found", "type": "error"})
        edges.append({"source": "start", "target": "no_match"})
        return {"nodes": nodes, "edges": edges}
        
    prev_id = "start"
    for g_idx, goal in enumerate(response.response.contexts):
        goal_id = f"goal_{g_idx}"
        nodes.append({"id": goal_id, "label": goal.title, "type": "goal"})
        edges.append({"source": prev_id, "target": goal_id})
        prev_id = goal_id
        
        for a_idx, action in enumerate(goal.actions):
            action_id = f"action_{g_idx}_{a_idx}"
            nodes.append({"id": action_id, "label": action.actionName, "type": action.category.value})
            edges.append({"source": prev_id, "target": action_id})
            prev_id = action_id
            
    nodes.append({"id": "end", "label": "Issue Resolved", "type": "end"})
    edges.append({"source": prev_id, "target": "end"})
            
    return {"nodes": nodes, "edges": edges}
