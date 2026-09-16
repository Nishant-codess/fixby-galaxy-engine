# src/core/validator.py
import re
from typing import List, Tuple
from contracts.schema import Goal, ActionCategory

# Finding #14 in the original Compass PRD's own risk register, now actually
# broadened per Samsung's stated constraint: http(s), www., AND markdown links.
URL_LEAK_PATTERN = re.compile(r"(https?://\S+|www\.\S+|\]\(\s*\S+\s*\))", re.IGNORECASE)

def build_goal_string(topic: str, is_configuration: bool = False) -> str:
    """Code-templated, never trusted to the LLM — closes the schema gate
    Finding #1 identified (the `goal` field's exact syntax was unenforced)."""
    kind = "Configuration" if is_configuration else "Troubleshooting"
    return f"Follow these steps to perform this {topic} {kind}"

def normalize_title(raw: str) -> str:
    words = raw.strip().split()[:3] or ["Device", "settings"]
    return " ".join(words).capitalize()

def _pad_description(words: List[str], action_name: str) -> List[str]:
    """Safe padding uses only words already present in the action's own name —
    never fabricates new factual claims — until 5 words is reached, or gives up
    and flags for retry (Finding #12: old code never padded, only truncated)."""
    filler_pool = [w for w in action_name.split() if w.lower() not in {w2.lower() for w2 in words}]
    i = 0
    while len(words) < 5 and i < len(filler_pool):
        words.append(filler_pool[i]); i += 1
    return words

def validate_and_repair(goals: List[Goal]) -> Tuple[List[Goal], List[str], bool]:
    repairs, needs_retry = [], False

    for goal in goals:
        order = {ActionCategory.auto: 0, ActionCategory.manual: 1, ActionCategory.critical: 2}
        before = [a.category for a in goal.actions]
        goal.actions.sort(key=lambda a: order.get(a.category, 1))
        if before != [a.category for a in goal.actions]:
            repairs.append(f"Reordered actions in '{goal.title}': critical moved last")

        title_words = goal.title.strip().split()
        if not (2 <= len(title_words) <= 3):
            needs_retry = True   # can't safely fabricate title content — Finding #12
        goal.title = normalize_title(goal.title)

        for action in goal.actions:
            for sg in action.stepGroups:
                if sg.actionableDeeplink and URL_LEAK_PATTERN.search(sg.actionableDeeplink.deeplink):
                    needs_retry = True
                    repairs.append(f"BLOCKED leaked URL in '{action.actionName}' — forcing retry, not silently scrubbing a deeplink field")

            desc = action.description or ""
            if URL_LEAK_PATTERN.search(desc):
                desc = URL_LEAK_PATTERN.sub("[removed]", desc)
                repairs.append(f"Scrubbed leaked URL from '{action.actionName}' description")

            words = desc.split()
            if words and words[0:2] != ["It", "will"]:
                words = ["It", "will"] + [w for w in words if w.lower() not in ("it", "will")]
                repairs.append(f"Added 'It will' prefix to '{action.actionName}'")
            if len(words) > 7:
                words = words[:7]
                repairs.append(f"Truncated description of '{action.actionName}' to 7 words")
            elif len(words) < 5:
                words = _pad_description(words, action.actionName)
                if len(words) < 5:
                    needs_retry = True
                else:
                    repairs.append(f"Padded description of '{action.actionName}' to 5 words")
            action.description = " ".join(words)

    return goals, repairs, needs_retry
