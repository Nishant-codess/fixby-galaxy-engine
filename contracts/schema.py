"""
contracts/schema.py
Official Samsung PRISM GenAI Hackathon (Theme 2) Schema Definitions
Samsung-exact Pydantic v2 data models defining the input/output contracts across all 4 team members.
"""

from enum import Enum
from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field


class ActionCategory(str, Enum):
    auto = "auto"          # standard config screen, reachable via deeplink
    manual = "manual"       # physical intervention, no deeplink possible
    critical = "critical"   # disruptive/irreversible — must be ordered last


class BaseDeeplink(BaseModel):
    deeplink: str


class Deeplink(BaseDeeplink):
    description: str
    message: Optional[str] = ""
    classes: Optional[Dict[str, str]] = None
    originalType: Optional[str] = None


class Condition(str, Enum):
    greater = "greater"
    equal = "equal"
    less = "less"


class ResultType(str, Enum):
    boolean = "boolean"
    intNum = "integer"
    string = "str"
    floatNum = "float"


class ValidationDeeplink(BaseDeeplink):
    key: str
    resultType: Optional[ResultType] = None
    condition: Optional[Condition] = None
    value: Optional[str] = None


class StepGroup(BaseModel):
    steps: List[str]
    validationDeeplink: Optional[ValidationDeeplink] = None
    actionableDeeplink: Optional[Deeplink] = None


class Action(BaseModel):
    actionName: str
    description: str                                      # 5-7 words, starts with "It will"
    stepGroups: List[StepGroup]
    category: ActionCategory = ActionCategory.manual


class Goal(BaseModel):
    goal: str             # EXACT: "Follow these steps to perform this <Topic> Troubleshooting"
    title: str             # 2-3 words, sentence case
    actions: List[Action]  # auto before critical
    score: float = Field(..., ge=0.0, le=1.0)


class ContextDeeplinkResponse(BaseModel):
    contexts: List[Goal] = Field(default_factory=list)
    fallback: Optional[Literal["no_match", "no_siis_context"]] = None


class TroubleshootRequest(BaseModel):
    query: str = Field(..., min_length=2)
    siis_response: Optional[str] = None
    language: Optional[str] = "auto"
    device_model: Optional[str] = "Galaxy S24"


class PipelineMeta(BaseModel):
    latency_ms: float
    cache_hit: bool
    cache_tier: Literal["tier1_hash", "tier2_slot_hash", "tier3_embedding", "cold"]
    model: Optional[str] = None
    cost_usd: float = 0.0
    complaint_category: Optional[str] = None
    language_detected: Optional[str] = "en"
    confidence_breakdown: Optional[Dict[str, float]] = None
    hallucination_check_passed: bool = True
    screen_resolution: Literal["leaf_screen", "parent_menu", "manual_only"] = "leaf_screen"
    pipeline_source: Literal["live", "mock"] = "live"
    hardware_escalation: Optional[str] = None  # "WARNING", "CRITICAL", or None


class ClarificationOption(BaseModel):
    domain: str
    suggestion: str
    category: str


class TroubleshootResponse(BaseModel):
    query: str
    query_variations: List[str] = Field(default_factory=list)
    response: ContextDeeplinkResponse
    meta: PipelineMeta
    diagnostic_graph: Optional[Dict] = None
    clarification_needed: bool = False
    clarification_options: List[ClarificationOption] = Field(default_factory=list)
    resolution_count: int = 0


class FollowupRequest(BaseModel):
    query: str = Field(..., min_length=2)
    session_id: Optional[str] = None
    turn: int = Field(default=2, ge=2)
    attempted_action_ids: List[str] = Field(default_factory=list)
    device_model: Optional[str] = "Galaxy S24"


class FollowupResponse(BaseModel):
    query: str
    turn: int
    escalation_level: Literal["AUTO", "CAUTION", "CRITICAL"]
    previous_attempted_actions: List[str]
    response: ContextDeeplinkResponse
    meta: PipelineMeta
    diagnostic_graph: Optional[Dict] = None
    is_terminal: bool = False


class FeedbackRequest(BaseModel):
    query: str
    action_name: str
    rating: int = Field(..., ge=-1, le=1)


class FeedbackResponse(BaseModel):
    status: str
    message: str
    updated_cache_weight: float


class AnalyticsResponse(BaseModel):
    total_queries: int
    cache_hits: int
    cache_hit_rate_pct: float
    avg_latency_ms: float
    latency_p50_ms: float
    latency_p95_ms: float
    latency_p99_ms: float
    top_complaint_categories: Dict[str, int]
    language_distribution: Dict[str, int]
    pipeline_source_breakdown: Dict[str, int]
