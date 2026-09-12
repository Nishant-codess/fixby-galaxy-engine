"""
contracts/schema.py
Official Samsung PRISM GenAI Hackathon (Theme 2) Schema Definitions
Strict Pydantic v2 data models defining the input/output contracts across all 4 team members.
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, HttpUrl


class Step(BaseModel):
    title: str = Field(..., description="Actionable, imperative step title, e.g., 'Turn off Wi-Fi'")
    description: str = Field(..., description="Clear instructions explaining how to perform this specific step.")
    type: Literal["auto", "manual"] = Field("manual", description="'auto' if can be automated via deeplink, else 'manual'")
    source: Optional[str] = Field(None, description="Grounding reference, e.g. 'siis_responses.json#47'")
    deeplink: Optional[str] = Field(None, description="Verified Samsung URI, e.g. 'bixby://settings/...'")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    safety_level: Literal["safe", "caution", "critical"] = Field("safe", description="Diagnostic risk rating")


class StepGroup(BaseModel):
    title: str = Field(..., description="Grouping header, e.g., 'Preliminary Diagnostic Steps'")
    steps: List[Step] = Field(default_factory=list, description="Ordered list of steps within this group")


class Action(BaseModel):
    title: str = Field(..., description="High-level solution action, e.g., 'Optimize Battery Settings'")
    description: Optional[str] = Field(None, description="Summary of this diagnostic solution")
    type: Literal["auto", "manual", "mixed"] = Field("manual", description="Execution type of the action")
    source: Optional[str] = Field(None, description="Grounding reference document/index")
    deeplink: Optional[str] = Field(None, description="Primary Samsung URI to launch for this action")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Overall action confidence")
    safety_level: Literal["safe", "caution", "critical"] = Field("safe")
    step_groups: Optional[List[StepGroup]] = Field(default_factory=list, description="Categorized step groups")
    steps: Optional[List[Step]] = Field(default_factory=list, description="Flat list of steps if groups not used")


class Goal(BaseModel):
    title: str = Field(..., description="User's overarching troubleshooting goal, e.g., 'Resolve Battery Drain & Overheating'")
    description: str = Field(..., description="Concise goal explanation")
    actions: List[Action] = Field(..., min_length=1, description="List of structured actions to achieve this goal")


class PipelineMetadata(BaseModel):
    cache_hit: bool = Field(False, description="True if served from semantic or hash cache")
    cache_tier: Optional[Literal["tier1_hash", "tier2_semantic", "none"]] = Field("none")
    latency_ms: float = Field(..., description="Total processing time in milliseconds")
    language_detected: str = Field("en", description="Detected language code, e.g. 'en', 'hi', 'ko'")
    normalized_query: Optional[str] = Field(None, description="Hinglish/multilingual normalized query")
    complaint_category: Optional[str] = Field(None, description="Taxonomy classification, e.g. 'battery.rapid_drain'")
    grounding_score: float = Field(1.0, ge=0.0, le=1.0, description="Verification grounding score against source data")
    active_innovations: List[str] = Field(default_factory=list, description="List of algorithms engaged in this response")


class TroubleshootRequest(BaseModel):
    query: str = Field(..., min_length=2, description="User complaint text, e.g. 'phone battery dying fast and lagging'")
    language: Optional[str] = Field("auto", description="'auto' or language code like 'en', 'hi', 'ko'")
    device_model: Optional[str] = Field("Galaxy S24", description="Samsung device model")


class TroubleshootResponse(BaseModel):
    query: str
    goals: List[Goal]
    metadata: PipelineMetadata
    diagnostic_graph: Optional[Dict[str, Any]] = Field(None, description="Dynamic DAG graph data for visual UI rendering")


class FeedbackRequest(BaseModel):
    query: str
    action_title: str
    step_title: Optional[str] = None
    rating: Literal[1, -1] = Field(..., description="1 for positive feedback, -1 for negative feedback")
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    status: str = "success"
    message: str
    updated_cache_weight: Optional[float] = None


class AnalyticsResponse(BaseModel):
    total_queries: int
    cache_hits: int
    cache_hit_rate_pct: float
    avg_latency_ms: float
    latency_p50_ms: float
    latency_p95_ms: float
    top_complaint_categories: Dict[str, int]
    language_distribution: Dict[str, int]
