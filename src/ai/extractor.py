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
1. `goal` string MUST be EXACTLY formatted: "Follow these steps to perform this <Topic> Troubleshooting".
2. `title` MUST be 2-3 words in sentence case (e.g. "Do not disturb", "Fingerprint sensor", "Edge lighting").
3. Action `description` MUST be 5-7 words starting with "It will " (e.g. "It will reset fingerprint credentials").
4. Action `category` MUST be one of: "auto" (standard config with deeplink), "manual" (physical fix), "critical" (disruptive/reset, listed last).
5. ONLY use deeplinks from the provided candidate list — do NOT invent deeplinks.
6. CAREFULLY READ THE USER COMPLAINT and DETECTED DOMAIN to select the most specific and relevant settings path.
7. NEVER pick battery or background limits unless the user explicitly says battery or charging.
8. The DETECTED DOMAIN and SYMPTOM are your PRIMARY hint — prioritize deeplinks matching that domain.

Return JSON in this format:
{
  "contexts": [
    {
      "goal": "Follow these steps to perform this <Domain> Troubleshooting",
      "title": "<2-3 word setting name>",
      "score": 0.91,
      "actions": [
        {
          "actionName": "<Setting name>",
          "description": "It will <5-7 word outcome>",
          "category": "auto",
          "stepGroups": [
            {
              "steps": ["Step 1", "Step 2", "Step 3"],
              "actionableDeeplink": {
                "deeplink": "<deeplink from candidate list>",
                "description": "Direct link to <setting name>",
                "classes": {"path": "Settings><Category>><Sub-setting>"}
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
        # Inject taxonomy domain/symptom as a strong hint to the LLM
        slots = extract_slots(query)
        domain = slots.get("domain", "general")
        symptom = slots.get("symptom", "unknown")

        candidates_info = []
        for cid in candidate_ids:
            match_entry = next((e for e in matcher.catalog if e.get("id") == cid), None)
            if match_entry:
                candidates_info.append(
                    f"- ID: {cid}, Deeplink: {match_entry.get('deeplink')}, "
                    f"Path: {match_entry.get('classes', {}).get('path')}, "
                    f"Description: {match_entry.get('description')}"
                )
            else:
                candidates_info.append(f"- ID: {cid}")

        candidates_str = "\n".join(candidates_info)

        prompt = (
            f"User Complaint: \"{query}\"\n"
            f"Detected Domain: {domain} | Detected Symptom: {symptom}\n"
            f"Instruction: Select the deeplink MOST RELEVANT to domain '{domain}' and symptom '{symptom}'.\n"
            f"Do NOT select battery/background settings unless domain is 'battery'.\n\n"
            f"Candidate Deeplinks:\n{candidates_str}"
        )
        if siis_response:
            try:
                import json
                siis_data = json.loads(siis_response)

                bat = siis_data.get("batteryLevel", 100)
                storage = siis_data.get("storageUsed", 0)
                temp = siis_data.get("temperature", 30)
                signal = siis_data.get("signalStrength", "Excellent")

                # Build an authoritative override block
                override_lines = []
                if bat <= 15:
                    override_lines.append(
                        f"⚠️ CRITICAL BATTERY ({bat}%): You MUST select Power Saving Mode deeplink. "
                        "Override the no-battery rule — the device is about to die."
                    )
                elif bat <= 30:
                    override_lines.append(
                        f"⚠️ LOW BATTERY ({bat}%): Prioritize battery power saving or background limits deeplink."
                    )

                if storage >= 95:
                    override_lines.append(
                        f"⚠️ STORAGE CRITICAL ({storage}% full): You MUST select Storage cleanup deeplink "
                        "(Device Care > Storage). Override domain rules — full storage causes ALL symptoms."
                    )
                elif storage >= 80:
                    override_lines.append(
                        f"⚠️ STORAGE HIGH ({storage}% full): Strongly prefer Storage cleanup deeplink."
                    )

                if temp >= 55:
                    override_lines.append(
                        f"⚠️ OVERHEATING ({temp}°C): You MUST recommend Device Care > Performance Profile "
                        "or App Power Management to reduce thermal load. This overrides other domain rules."
                    )
                elif temp >= 45:
                    override_lines.append(
                        f"⚠️ HIGH TEMP ({temp}°C): Prefer thermal management settings."
                    )

                if signal in ("None", "Weak"):
                    override_lines.append(
                        f"⚠️ SIGNAL {signal}: Prioritize Connections > Mobile Networks or Wi-Fi deeplinks. "
                        "The hardware signal is the root cause — override software domain rules."
                    )

                status_summary = (
                    f"Battery {bat}%, Storage {storage}%, CPU Temp {temp}°C, Signal {signal}"
                )

                if override_lines:
                    prompt += (
                        f"\n\n🚨 LIVE SAMSUNG SIIS DEVICE STATE — MANDATORY OVERRIDES:\n"
                        f"Device readings: {status_summary}\n"
                        + "\n".join(override_lines)
                        + "\nYou MUST factor these hardware readings above all other instructions."
                    )
                else:
                    prompt += (
                        f"\n\nLIVE SIIS DEVICE STATE: {status_summary} — "
                        "Device is healthy. Use domain and symptom as primary selection criteria."
                    )
            except Exception:
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
        domain = slots.get("domain", "general")
        symptom = slots.get("symptom", "unknown")
        topic = domain.replace("_", " ").capitalize()

        DOMAIN_FALLBACKS = {
            "notifications": (
                "Do Not Disturb",
                "It will silence all alerts at night",
                "bixby://settings/sound/do_not_disturb",
                "Settings>Notifications>Do not disturb",
                ["Open Settings", "Tap Notifications", "Tap Do not disturb", "Turn on Do not disturb", "Tap Add schedule > Sleep to set hours"]
            ),
            "sound": (
                "Sound Mode",
                "It will mute vibration and alerts",
                "bixby://settings/sound/sound_mode",
                "Settings>Sounds and vibration>Sound mode",
                ["Open Settings", "Tap Sounds and vibration", "Tap Sound mode", "Select Mute or Vibrate as needed"]
            ),
            "digital_wellbeing": (
                "Bedtime Mode",
                "It will silence and grey out phone at bedtime",
                "bixby://settings/digital_wellbeing/bedtime_mode",
                "Settings>Digital Wellbeing and parental controls>Bedtime mode",
                ["Open Settings", "Tap Digital Wellbeing and parental controls", "Tap Bedtime mode", "Set your bedtime schedule"]
            ),
            "display": (
                "Motion Smoothness",
                "It will fix screen stutter and refresh rate",
                "bixby://settings/display/motion_smoothness",
                "Settings>Display>Motion smoothness",
                ["Open Settings", "Tap Display", "Tap Motion smoothness", "Select Adaptive"]
            ),
            "connectivity": (
                "Intelligent Wi-Fi",
                "It will switch to mobile data when Wi-Fi drops",
                "bixby://settings/connections/wifi/intelligent",
                "Settings>Connections>Wi-Fi>Intelligent Wi-Fi",
                ["Open Settings", "Tap Connections", "Tap Wi-Fi", "Tap the three-dot menu", "Tap Intelligent Wi-Fi", "Enable Switch to mobile data"]
            ),
            "performance": (
                "Device Care Optimization",
                "It will clean RAM and optimize device speed",
                "bixby://settings/device_care/memory",
                "Settings>Device care>Memory",
                ["Open Settings", "Tap Device care", "Tap Memory", "Tap Clean now"]
            ),
            "security": (
                "Biometrics Settings",
                "It will reset biometric unlock credentials",
                "bixby://settings/security/fingerprint",
                "Settings>Security and privacy>Biometrics>Fingerprints",
                ["Open Settings", "Tap Security and privacy", "Tap Biometrics", "Tap Fingerprints", "Re-register your fingerprint"]
            ),
            "camera": (
                "Reset Camera Settings",
                "It will restore camera to default configuration",
                "bixby://settings/camera/reset",
                "Settings>Apps>Camera>Camera settings>Reset settings",
                ["Open Settings", "Tap Apps", "Tap Camera", "Tap Camera settings", "Tap Reset settings"]
            ),
            "battery": (
                "Background Usage Limits",
                "It will limit unused background apps",
                "bixby://settings/device_care/battery/background_limits",
                "Settings>Battery>Background usage limits",
                ["Open Settings on your Galaxy device", "Tap Battery", "Tap Background usage limits", "Turn on Put unused apps to sleep"]
            ),
        }

        fb = DOMAIN_FALLBACKS.get(domain, DOMAIN_FALLBACKS["battery"])
        action_name, description, deeplink_url, path, steps = fb

        if domain == "sound":
            action_name = "Dolby Atmos Audio"
            desc = "It will optimize speaker audio quality"
            deeplink = "bixby://settings/sound/dolby_atmos"
            path = "Settings>Sounds and vibration>Sound quality and effects"
            steps = ["Open Settings on your Galaxy device", "Tap Sounds and vibration", "Tap Sound quality and effects", "Turn on Dolby Atmos for rich audio"]
        elif domain == "storage":
            action_name = "Storage Space Cleanup"
            desc = "It will clean unnecessary device storage"
            deeplink = "bixby://settings/device_care/storage"
            path = "Settings>Device Care>Storage"
            steps = ["Open Settings on your Galaxy device", "Tap Device Care", "Tap Storage", "Empty Trash and delete temporary files"]
        elif domain == "security":
            action_name = "Biometric Fingerprint Calibration"
            desc = "It will calibrate your biometric fingerprint"
            deeplink = "bixby://settings/security/biometrics/fingerprints"
            path = "Settings>Security and privacy>Biometrics>Fingerprints"
            steps = ["Open Settings on your Galaxy device", "Tap Security and privacy", "Tap Biometrics", "Check registered fingerprints"]
        elif domain == "display":
            action_name = "Motion Smoothness"
            desc = "It will optimize screen refresh rate"
            deeplink = "bixby://settings/display/motion_smoothness"
            path = "Settings>Display>Motion smoothness"
            steps = ["Open Settings on your Galaxy device", "Tap Display", "Select Motion smoothness", "Choose Adaptive 120Hz"]
        elif domain == "connectivity":
            action_name = "Reset Network Settings"
            desc = "It will restore default wireless connections"
            deeplink = "bixby://settings/general/reset/network"
            path = "Settings>General management>Reset>Reset network settings"
            steps = ["Open Settings on your Galaxy device", "Tap General management", "Tap Reset", "Tap Reset network settings"]
        else:
            action_name = "Background Usage Limits" if domain == "battery" else "Device Care"
            desc = "It will limit unused background apps" if domain == "battery" else "It will optimize device system performance"
            deeplink = "bixby://settings/device_care/battery/background_limits" if domain == "battery" else "bixby://settings/device_care"
            path = "Settings>Battery>Background usage limits" if domain == "battery" else "Settings>Device Care"
            steps = ["Open Settings on your Galaxy device", "Tap Battery", "Tap Background usage limits", "Turn on Put unused apps to sleep"] if domain == "battery" else ["Open Settings on your Galaxy device", "Tap Device Care", "Tap Optimize now"]

        return [
            Goal(
                goal=f"Follow these steps to perform this {topic} Troubleshooting",
                title=action_name,
                actions=[
                    Action(
                        actionName=action_name,
                        description=description,
                        category=ActionCategory.auto,
                        stepGroups=[
                            StepGroup(
                                steps=steps,
                                actionableDeeplink=Deeplink(
                                    deeplink=deeplink_url,
                                    description=f"Direct link to {action_name}",
                                    classes={"path": path}
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
