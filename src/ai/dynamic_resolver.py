"""
Dynamic troubleshooting resolver.

The model reads the complaint (any language) and turns it into an intent plus
English search keywords. Those keywords are scored against the live text of
contracts/deeplinks.json. A second model call may only return IDs from that
candidate list. Goals are built from the catalog entry itself, so a path can
never be invented.

If the model is unavailable or over budget, the same catalog text is ranked
from the raw query. There is no per-problem fix table.
"""
import json
import logging
import re
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from contracts.schema import Action, ActionCategory, Deeplink, Goal, StepGroup
from src.ai.llm_client import llm_client
from src.ai.matcher import matcher

logger = logging.getLogger("fixby.ai.dynamic_resolver")

# Function words only. These are not troubleshooting rules.
_STOPWORDS = {
    "a", "an", "the", "is", "are", "am", "was", "were", "be", "been",
    "my", "me", "i", "im", "i'm", "to", "of", "and", "or", "not", "no",
    "on", "in", "it", "its", "for", "with", "this", "that", "phone",
    "device", "galaxy", "samsung", "please", "help", "fix", "issue",
    "problem", "very", "too", "so", "getting", "get", "keeps", "keep",
    "wont", "won't", "cant", "can't", "does", "doesnt", "doesn't", "do",
    "did", "working", "work", "works", "hai", "ho", "raha", "rahi", "rahe",
    "mera", "meri", "mere", "bahut", "nahi", "nahin", "ka", "ki", "ke",
    "mein", "se", "ko", "par", "bhi", "kuch",
}

_INTENT_SYSTEM = """You extract troubleshooting intent from a phone complaint.
The complaint may be English, Hinglish, Korean, or mixed, and may contain typos.
Return JSON only:
{
  "language": "en|hi|ko|mixed",
  "english_query": "the complaint rewritten as a short English sentence",
  "intent_summary": "4 to 8 word canonical English problem",
  "keywords": ["english", "search", "terms"],
  "confidence": 0.0
}
Rules:
- keywords are English words that could appear in a settings-menu description.
- Translate the user's meaning. Do not copy Korean or Hindi into keywords.
- Include the thing that is broken and what is wrong with it.
- Do not name a fix, a deeplink, or a settings path.
- 4 to 8 keywords. confidence is 0 to 1.
"""

_RANK_SYSTEM = """You choose Samsung settings that fix a complaint.
You are given candidate settings from a catalog. Return JSON only:
{
  "ranked_ids": ["DL_EXAMPLE"],
  "reasons": {"DL_EXAMPLE": "one short sentence"}
}
Rules:
- ranked_ids must be copied from the candidate list. Never invent an ID.
- Order from most relevant to least. Return 1 to 3 IDs.
- Pick different settings, not duplicates of the same screen.
- Use device telemetry only when a reading is unhealthy and it changes which setting helps.
- Do not pick Safe mode, factory reset, force stop, or a restart unless the user says an app crashes or asks to reset.
- Do not add a battery or device-care setting unless the complaint or the telemetry is about battery, heat, storage, or speed.
"""


@dataclass
class DynamicResolution:
    goals: List[Goal] = field(default_factory=list)
    candidate_ids: List[str] = field(default_factory=list)
    intent_summary: str = ""
    english_query: str = ""
    source: str = "retrieval"
    cached_response: Any = None
    cache_tier: str = ""


def _stem(token: str) -> str:
    for suffix in ("ing", "ed", "es", "s"):
        if token.endswith(suffix) and len(token) - len(suffix) >= 4:
            return token[: -len(suffix)]
    return token


def _tokens(text: str) -> List[str]:
    raw = re.findall(r"[a-z0-9]+", text.lower())
    out: List[str] = []
    for token in raw:
        if token in _STOPWORDS or len(token) < 3:
            continue
        out.append(token)
        stem = _stem(token)
        if stem != token and stem not in _STOPWORDS:
            out.append(stem)
    return out


def _token_hit(query_token: str, entry_token: str) -> bool:
    if query_token == entry_token:
        return True
    if len(query_token) >= 4 and len(entry_token) >= 4:
        return entry_token.startswith(query_token) or query_token.startswith(entry_token)
    return False


def _entry_text(entry: Dict[str, Any]) -> str:
    classes = entry.get("classes") or {}
    path = classes.get("path", "") if isinstance(classes, dict) else ""
    return f"{entry.get('id', '')} {entry.get('description', '')} {path}"


def _score_catalog(search_text: str, keywords: List[str]) -> List[tuple]:
    """Rank deeplink entries by overlap with model keywords and the complaint text."""
    query_tokens = _tokens(search_text)
    for keyword in keywords:
        query_tokens.extend(_tokens(keyword))
    # Preserve order while dropping duplicates.
    seen = set()
    unique_tokens: List[str] = []
    for token in query_tokens:
        if token not in seen:
            seen.add(token)
            unique_tokens.append(token)

    phrases = [k.strip().lower() for k in keywords if len(k.strip()) > 3]
    scored = []
    for index, entry in enumerate(matcher.catalog):
        classes = entry.get("classes") or {}
        path = classes.get("path", "") if isinstance(classes, dict) else ""
        path_tokens = _tokens(f"{entry.get('id', '')} {path}")
        desc_tokens = _tokens(entry.get("description", ""))
        text = f"{entry.get('id', '')} {entry.get('description', '')} {path}".lower()
        if not unique_tokens or not (path_tokens or desc_tokens):
            score = 0.0
        else:
            hits = 0.0
            for qtok in unique_tokens:
                if any(_token_hit(qtok, etok) for etok in path_tokens):
                    hits += 2.0
                elif any(_token_hit(qtok, etok) for etok in desc_tokens):
                    hits += 1.0
            score = hits / len(unique_tokens)
        for phrase in phrases:
            if phrase in text:
                score += 0.45
        depth = path.count(">")
        scored.append((score, depth, -index, entry))

    scored.sort(key=lambda row: (row[0], row[1], row[2]), reverse=True)
    positive = [row for row in scored if row[0] > 0]
    chosen = positive[:12] if positive else scored[:8]
    return chosen


def _goal_from_entry(entry: Dict[str, Any], rank: int) -> Goal:
    classes = entry.get("classes") or {}
    path = classes.get("path", "Settings") if isinstance(classes, dict) else "Settings"
    segments = [part.strip() for part in path.split(">") if part.strip()]
    leaf = segments[-1] if segments else "Settings"
    words = leaf.split()
    title = " ".join(words[:3]) if len(words) >= 2 else f"{leaf} settings"
    steps = ["Open Settings on your Galaxy device"]
    for segment in segments[1:]:
        steps.append(f"Tap {segment}")
    if len(steps) == 1:
        steps.append(f"Open {leaf}")

    return Goal(
        goal="Follow these steps to perform this Device Troubleshooting",
        title=title,
        score=round(max(0.55, 0.96 - rank * 0.07), 2),
        actions=[
            Action(
                actionName=leaf if len(leaf.split()) <= 4 else title,
                description="It will open this setting",
                category=ActionCategory.auto,
                stepGroups=[
                    StepGroup(
                        steps=steps,
                        actionableDeeplink=Deeplink(
                            deeplink=entry.get("deeplink", "bixby://settings"),
                            description=entry.get("description", f"Direct link to {leaf}"),
                            classes={"path": path},
                        ),
                    )
                ],
            )
        ],
    )


def _goals_for_ids(ids: List[str]) -> List[Goal]:
    by_id = {entry.get("id"): entry for entry in matcher.catalog}
    goals: List[Goal] = []
    seen_links = set()
    for cid in ids:
        entry = by_id.get(cid)
        if not entry:
            continue
        link = entry.get("deeplink")
        if link in seen_links:
            continue
        seen_links.add(link)
        goals.append(_goal_from_entry(entry, len(goals)))
        if len(goals) >= 3:
            break
    return goals


def _parse_intent(payload: Optional[Dict[str, Any]], query: str) -> Dict[str, Any]:
    if not isinstance(payload, dict):
        return {
            "english_query": query,
            "intent_summary": "",
            "keywords": [],
            "confidence": 0.0,
        }
    keywords = payload.get("keywords") or []
    if not isinstance(keywords, list):
        keywords = []
    keywords = [str(k).strip() for k in keywords if str(k).strip()][:8]
    try:
        confidence = float(payload.get("confidence", 0.5))
    except (TypeError, ValueError):
        confidence = 0.5
    return {
        "english_query": str(payload.get("english_query") or query).strip() or query,
        "intent_summary": str(payload.get("intent_summary") or "").strip(),
        "keywords": keywords,
        "confidence": max(0.0, min(confidence, 1.0)),
    }


def _telemetry_context(siis_response: Optional[str]) -> str:
    if not siis_response or siis_response.strip() in ("", "{}"):
        return ""
    try:
        data = json.loads(siis_response)
    except Exception:
        return ""
    battery = data.get("batteryLevel")
    storage = data.get("storageUsed")
    temp = data.get("temperature")
    signal = data.get("signalStrength")
    if battery is None and storage is None and temp is None:
        return ""
    return (
        f"Battery {battery}%, storage used {storage}%, "
        f"temperature {temp}C, signal {signal}."
    )


def _rank_with_model(
    query: str,
    intent: Dict[str, Any],
    candidates: List[Dict[str, Any]],
    siis_response: Optional[str],
    timeout_s: float,
) -> List[str]:
    if timeout_s < 0.8 or not candidates:
        return []
    lines = []
    allowed = []
    for entry in candidates:
        cid = entry.get("id")
        if not cid:
            continue
        allowed.append(cid)
        classes = entry.get("classes") or {}
        path = classes.get("path", "") if isinstance(classes, dict) else ""
        lines.append(f"- {cid} | {path} | {entry.get('description', '')}")

    telemetry = _telemetry_context(siis_response)
    prompt = (
        f"User complaint: {query}\n"
        f"English meaning: {intent.get('english_query') or query}\n"
        f"Intent: {intent.get('intent_summary') or ''}\n"
        f"Keywords: {', '.join(intent.get('keywords') or [])}\n"
    )
    if telemetry:
        prompt += f"Device telemetry: {telemetry}\n"
    prompt += "Candidates:\n" + "\n".join(lines)

    payload = llm_client.generate_json_bounded(prompt, _RANK_SYSTEM, timeout_s=timeout_s)
    if not isinstance(payload, dict):
        return []
    ranked = payload.get("ranked_ids") or []
    if not isinstance(ranked, list):
        return []
    allowed_set = set(allowed)
    chosen = []
    for cid in ranked:
        if cid in allowed_set and cid not in chosen:
            chosen.append(cid)
    return chosen[:3]


def resolve_dynamically(
    query: str,
    siis_response: Optional[str] = None,
    budget_s: float = 8.0,
) -> DynamicResolution:
    """
    Intent extraction, catalog retrieval, ID-only ranking, catalog-backed goals.
    """
    started = time.time()
    deadline = started + budget_s
    result = DynamicResolution(english_query=query)

    intent_timeout = min(4.0, max(0.0, deadline - time.time()))
    intent_payload = None
    if intent_timeout >= 0.8:
        intent_payload = llm_client.generate_json_bounded(
            f"Complaint:\n{query}",
            _INTENT_SYSTEM,
            timeout_s=intent_timeout,
        )
    intent = _parse_intent(intent_payload, query)
    result.intent_summary = intent["intent_summary"]
    result.english_query = intent["english_query"]

    if result.intent_summary:
        from src.core.cache import cache

        cached, tier = cache.get(result.intent_summary.strip().lower(), slots=None)
        if cached is not None and tier == "tier1_hash":
            result.cached_response = cached
            result.cache_tier = tier
            result.source = "intent-cache"
            logger.info("Intent cache hit for '%s' in %.0fms", result.intent_summary, (time.time() - started) * 1000)
            return result

    search_text = " ".join(
        part for part in [result.english_query, " ".join(intent["keywords"]), query] if part
    )
    scored = _score_catalog(search_text, intent["keywords"])
    candidates = [row[3] for row in scored]
    result.candidate_ids = [entry.get("id") for entry in candidates if entry.get("id")]

    remaining = deadline - time.time()
    ranked_ids = _rank_with_model(query, intent, candidates[:10], siis_response, remaining)
    if ranked_ids:
        result.source = "llm"
    else:
        ranked_ids = result.candidate_ids[:3]
        result.source = "retrieval"

    result.goals = _goals_for_ids(ranked_ids)
    result.candidate_ids = [entry_id for entry_id in ranked_ids if entry_id]
    logger.info(
        "Dynamic resolve '%s' via %s in %.0fms -> %s",
        query[:80],
        result.source,
        (time.time() - started) * 1000,
        result.candidate_ids,
    )
    return result
