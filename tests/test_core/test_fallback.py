# tests/test_core/test_fallback.py
import pytest
from src.core.pipeline import run_troubleshoot_pipeline

ADVERSARIAL_QUERIES = [
    "my smart fridge is making a weird noise",   # not a Galaxy phone issue at all
    "asdkjaslkdj qqqq zzzz",                       # gibberish
    "what is the meaning of life",                 # off-topic
]

@pytest.mark.parametrize("query", ADVERSARIAL_QUERIES)
def test_no_forced_hallucinated_answer(query):
    response = run_troubleshoot_pipeline(query, siis_response=None)
    assert response.response.fallback in ("no_match", "no_siis_context") or len(response.response.contexts) == 0, (
        f"Pipeline forced an answer for an out-of-scope query: {query!r}"
    )
