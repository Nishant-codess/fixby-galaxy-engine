"""
src/ai package initializer.
Exposes Member 2 AI/ML engine modules:
- llm_client: Gemini/Groq LLM wrapper with circuit breaker
- matcher: Deeplink retrieval & candidate matching
- extractor: Structured goal/action schema extraction
- paraphraser: Template & dynamic query variation generation
- translator: Hinglish & multilingual token normalization
- graph_generator: Diagnostic DAG generation
"""

from src.ai.llm_client import llm_client, LLMClient
from src.ai.matcher import matcher, get_candidate_ids
from src.ai.extractor import extract_structured_plan
from src.ai.paraphraser import generate_query_variations
from src.ai.translator import normalize_hinglish_query
from src.ai.graph_generator import generate_diagnostic_graph

__all__ = [
    "llm_client",
    "LLMClient",
    "matcher",
    "get_candidate_ids",
    "extract_structured_plan",
    "generate_query_variations",
    "normalize_hinglish_query",
    "generate_diagnostic_graph",
]
