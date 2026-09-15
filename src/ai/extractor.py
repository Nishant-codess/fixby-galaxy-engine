"""
src/ai/extractor.py — Retrieval-Bound Schema Extractor
Constructs structured troubleshooting plans (Goal, Action, StepGroup, Deeplink) using LLM and candidate deeplinks.
"""
import logging
from typing import List, Optional, Dict, Any
from contracts.schema import Goal, Action, StepGroup, Deeplink, ActionCategory
from src.ai.llm_client import llm_client
from src.ai.matcher import matcher
from src.core.taxonomy import extract_slots

logger = logging.getLogger("fixby.ai.extractor")

SYSTEM_PROMPT = """You are Samsung Galaxy Troubleshooting Engine's AI Extractor.
Generate structured troubleshooting plans in JSON format matching the schema below.

CRITICAL RULES:
1. `goal` string MUST be EXACTLY formatted: "Follow these steps to perform this <Topic> Troubleshooting" (e.g. "Follow these steps to perform this Battery Troubleshooting").
2. `title` MUST be 2-3 words in sentence case (e.g. "Battery drain", "Display stutter").
3. Action `description` MUST be 5-7 words starting with "It will " (e.g. "It will limit unused background apps").
4. Action `category` MUST be one of: "auto" (standard config with deeplink), "manual" (physical fix), "critical" (disruptive/reset, listed last).
5. Only use deeplinks from the provided candidate list.

Return JSON in this format:
{
  "contexts": [
    {
      "goal": "Follow these steps to perform this Battery Troubleshooting",
      "title": "Battery drain",
      "score": 0.91,
      "actions": [
        {
          "actionName": "Background Usage Limits",
          "description": "It will limit unused background apps",
          "category": "auto",
          "stepGroups": [
            {
              "steps": [
                "Open Settings on your Galaxy device",
                "Tap Battery",
                "Tap Background usage limits",
                "Turn on Put unused apps to sleep"
              ],
              "actionableDeeplink": {
                "deeplink": "bixby://settings/device_care/battery/background_limits",
                "description": "Direct link to Background usage limits",
                "classes": {"path": "Settings>Battery>Background usage limits"}
              }
            }
          ]
        }
      ]
    }
  ]
}
"""


class PlanExtractor:
    """
    Extracts structured Goal objects from user queries and SIIS diagnostic responses.
    """
    def __init__(self):
        self.llm_client = llm_client

    def build_user_prompt(self, query: str, candidate_ids: List[str], siis_response: Optional[str] = None) -> str:
        candidates_info = []
        for cid in candidate_ids:
            # Look up catalog entry if available
            match_entry = next((e for e in matcher.catalog if e.get("id") == cid), None)
            if match_entry:
                candidates_info.append(f"- ID: {cid}, Deeplink: {match_entry.get('deeplink')}, Path: {match_entry.get('classes', {}).get('path')}, Description: {match_entry.get('description')}")
            else:
                candidates_info.append(f"- ID: {cid}")

        candidates_str = "\n".join(candidates_info)

        prompt = f"User Complaint: \"{query}\"\n\nCandidate Deeplinks:\n{candidates_str}"
        if siis_response:
            prompt += f"\n\nSamsung Intelligence (SIIS) Technical Data:\n{siis_response}"

        return prompt

    def parse_goals_from_json(self, data: Dict[str, Any], query: str) -> List[Goal]:
        goals = []
        contexts = data.get("contexts", [])
        if not contexts and "goal" in data:
            contexts = [data]

        slots = extract_slots(query)
        topic = slots.get("domain", "Device").capitalize()

        for ctx in contexts:
            try:
                # Ensure goal title format
                goal_str = ctx.get("goal")
                if not goal_str or not goal_str.startswith("Follow these steps to perform this"):
                    goal_str = f"Follow these steps to perform this {topic} Troubleshooting"

                title_str = ctx.get("title", f"{topic} issue")
                score_val = float(ctx.get("score", 0.88))

                actions = []
                for act_data in ctx.get("actions", []):
                    action_name = act_data.get("actionName", "System Optimization")
                    desc = act_data.get("description", "It will optimize system settings")
                    if not desc.startswith("It will"):
                        desc = f"It will {desc.lower()}"

                    cat_str = act_data.get("category", "auto")
                    try:
                        cat_enum = ActionCategory(cat_str)
                    except ValueError:
                        cat_enum = ActionCategory.auto

                    step_groups = []
                    for sg_data in act_data.get("stepGroups", []):
                        steps = sg_data.get("steps", ["Open Settings", "Apply recommendation"])
                        deeplink_obj = None

                        dl_data = sg_data.get("actionableDeeplink")
                        if dl_data and isinstance(dl_data, dict):
                            deeplink_obj = Deeplink(
                                deeplink=dl_data.get("deeplink", "bixby://settings"),
                                description=dl_data.get("description", f"Direct link to {action_name}"),
                                classes=dl_data.get("classes")
                            )

                        step_groups.append(StepGroup(steps=steps, actionableDeeplink=deeplink_obj))

                    actions.append(Action(
                        actionName=action_name,
                        description=desc,
                        category=cat_enum,
                        stepGroups=step_groups
                    ))

                goals.append(Goal(
                    goal=goal_str,
                    title=title_str,
                    actions=actions,
                    score=score_val
                ))
            except Exception as e:
                logger.warning(f"Error parsing goal from context: {e}")

        return goals

    def extract_structured_plan(self, query: str, candidate_ids: List[str], siis_response: Optional[str] = None) -> List[Goal]:
        """
        Main extraction entry point.
        Queries LLM (Groq/Gemini/Offline Fixture) and parses result into List[Goal].
        """
        user_prompt = self.build_user_prompt(query, candidate_ids, siis_response)

        try:
            raw_json = self.llm_client.generate_json_sync(user_prompt, system_prompt=SYSTEM_PROMPT)
            goals = self.parse_goals_from_json(raw_json, query)
            if goals:
                return goals
        except Exception as e:
            logger.error(f"Structured plan extraction failed: {e}")

        # Fallback baseline goal if extraction returns empty or raises
        return self._create_fallback_goal(query)

    def _create_fallback_goal(self, query: str) -> List[Goal]:
        slots = extract_slots(query)
        domain = slots.get("domain", "battery")
        topic = domain.capitalize()

        return [
            Goal(
                goal=f"Follow these steps to perform this {topic} Troubleshooting",
                title=f"{topic} drain" if domain == "battery" else f"{topic} issue",
                actions=[
                    Action(
                        actionName="Background Usage Limits" if domain == "battery" else "Device Care",
                        description="It will limit unused background apps",
                        category=ActionCategory.auto,
                        stepGroups=[
                            StepGroup(
                                steps=[
                                    "Open Settings on your Galaxy device",
                                    "Tap Battery",
                                    "Tap Background usage limits",
                                    "Turn on Put unused apps to sleep"
                                ],
                                actionableDeeplink=Deeplink(
                                    deeplink="bixby://settings/device_care/battery/background_limits",
                                    description="Direct link to Background usage limits",
                                    classes={"path": "Settings>Battery>Background usage limits"}
                                )
                            )
                        ]
                    )
                ],
                score=0.88
            )
        ]


# Singleton instance
extractor = PlanExtractor()


def extract_structured_plan(query: str, candidate_ids: List[str], siis_response: Optional[str] = None) -> List[Goal]:
    """Convenience wrapper matching pipeline stub signature."""
    return extractor.extract_structured_plan(query, candidate_ids, siis_response)
