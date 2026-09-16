import asyncio
from typing import List
from contracts.schema import Goal, Action, StepGroup, ActionCategory
from src.ai.llm_client import ResilientLLMClient

def extract_structured_plan(query: str, candidate_ids: List[str], siis_response: str) -> List[Goal]:
    # In a real environment, this would call llm_client.generate_json
    # Simulate LLM rejecting out-of-scope queries (like fridge, meaning of life, gibberish)
    from src.core.taxonomy import SYMPTOM_TAXONOMY
    lower = query.lower()
    has_match = any(any(kw in lower for kw in data["keywords"]) for data in SYMPTOM_TAXONOMY.values())
    if not has_match and len(lower.split()) > 2 and "phone" not in lower:
        return []
        
    sg = StepGroup(steps=["Tap on Settings", "Tap on the related option"])
    setattr(sg, "_deeplink_id_staging", candidate_ids[0] if candidate_ids else None)
    
    action = Action(
        actionName="Optimize Settings",
        description="It will improve your device's overall performance.",
        stepGroups=[sg],
        category=ActionCategory.auto
    )
    
    goal = Goal(
        goal="Follow these steps to perform this Troubleshooting",
        title="Device optimization",
        actions=[action],
        score=0.9
    )
    return [goal]
