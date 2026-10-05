"""
src/ai/llm_client.py — Robust Dual-Provider LLM Client with Circuit Breaker
Implements resilient JSON generation using Groq and Gemini APIs with offline fixture fallback.
"""
import os
import json
import time
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout
from typing import Optional, Dict, Any, List
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("fixby.ai.llm_client")


class CircuitBreaker:
    """Simple 3-state Circuit Breaker for LLM API calls."""
    def __init__(self, failure_threshold: int = 3, recovery_timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = "CLOSED"  # CLOSED (healthy), OPEN (failing), HALF_OPEN (probing)
        self.failure_count = 0
        self.last_failure_time = 0.0

    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
                logger.info("Circuit breaker entering HALF_OPEN probe state.")
                return True
            return False
        if self.state == "HALF_OPEN":
            return True
        return False

    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.warning(f"Circuit breaker tripped to OPEN state. Cooldown: {self.recovery_timeout}s")


class LLMClient:
    """
    Unified LLM Client supporting Groq, Gemini, and offline mock fixture fallback.
    Automatically detects available API keys and manages fallback strategy.
    """
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")

        self.groq_client = None
        self.gemini_client = None

        self.circuit_breaker = CircuitBreaker()

        # Load offline fixture fallback
        self.fixture_path = Path(__file__).resolve().parent.parent.parent / "contracts" / "mock_responses.json"
        self.offline_fixture = self._load_fixture()

        # Initialize clients if keys exist
        self._init_clients()

    def _load_fixture(self) -> Dict[str, Any]:
        try:
            if self.fixture_path.exists():
                with open(self.fixture_path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load mock responses fixture: {e}")
        return {}

    def _init_clients(self):
        # Init Groq Client if key present
        if self.groq_api_key:
            try:
                from groq import Groq
                self.groq_client = Groq(api_key=self.groq_api_key, max_retries=0, timeout=5.0)
                logger.info("Groq client initialized successfully.")
            except TypeError as e:
                # Newer groq SDK removed 'proxies' — try with explicit http_client
                try:
                    import httpx
                    from groq import Groq
                    self.groq_client = Groq(
                        api_key=self.groq_api_key,
                        http_client=httpx.Client(timeout=5.0),
                        max_retries=0,
                    )
                    logger.info("Groq client initialized with explicit http_client.")
                except Exception as e2:
                    logger.warning(f"Failed to initialize Groq client (fallback): {e2}")
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")

        # Init Gemini Client if key present
        if self.gemini_api_key:
            try:
                import google.genai as genai
                self.gemini_client = genai.Client(api_key=self.gemini_api_key)
                logger.info("Google GenAI (google.genai) client initialized successfully.")
            except ImportError:
                try:
                    import warnings
                    with warnings.catch_warnings():
                        warnings.simplefilter("ignore", FutureWarning)
                        import google.generativeai as genai_legacy
                    genai_legacy.configure(api_key=self.gemini_api_key)
                    self.gemini_client = genai_legacy.GenerativeModel("gemini-1.5-flash")
                    logger.info("Gemini (legacy google.generativeai) client initialized.")
                except Exception as e:
                    logger.warning(f"Failed to initialize Gemini client: {e}")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")

    def _call_groq_model(
        self,
        model: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        timeout_s: float = 4.0,
    ) -> str:
        if not self.groq_client:
            raise RuntimeError("Groq client not available.")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        def _request() -> str:
            completion = self.groq_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.1,
                response_format={"type": "json_object"},
                timeout=timeout_s,
            )
            return completion.choices[0].message.content

        pool = ThreadPoolExecutor(max_workers=1)
        future = pool.submit(_request)
        try:
            return future.result(timeout=timeout_s + 0.4)
        except FuturesTimeout as exc:
            raise TimeoutError(f"Groq model {model} exceeded {timeout_s}s") from exc
        finally:
            pool.shutdown(wait=False, cancel_futures=True)

    def _call_groq_sync(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.groq_client:
            raise RuntimeError("Groq client not available.")

        # Fast model first, then one verified fallback. Each call is bounded.
        models_to_try = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b"]
        last_exc = None
        for model in models_to_try:
            try:
                return self._call_groq_model(model, prompt, system_prompt, timeout_s=4.0)
            except Exception as e:
                last_exc = e
                logger.warning(f"Groq model {model} failed: {e}")
                continue
        raise last_exc or RuntimeError("All Groq models failed.")

    def generate_json_bounded(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        timeout_s: float = 3.5,
        models: Optional[List[str]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        One JSON completion inside a hard timeout.
        Returns None when the circuit is open or every model fails.
        Does not substitute the offline battery fixture.
        """
        if not self.circuit_breaker.can_execute():
            logger.info("Circuit breaker open — skipping LLM call.")
            return None

        model_list = models or ["qwen/qwen3.8-27b"]
        if self.groq_client:
            per_model = max(1.2, timeout_s / max(len(model_list), 1))
            for model in model_list:
                try:
                    raw_text = self._call_groq_model(model, prompt, system_prompt, timeout_s=per_model)
                    parsed = json.loads(raw_text)
                    self.circuit_breaker.record_success()
                    return parsed
                except Exception as e:
                    logger.warning(f"Bounded Groq call failed ({model}): {e}")

        self.circuit_breaker.record_failure()
        return None

    def _call_gemini_sync(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.gemini_client:
            raise RuntimeError("Gemini client not available.")

        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        if hasattr(self.gemini_client, "generate_content"):
            response = self.gemini_client.generate_content(
                full_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return response.text
        raise RuntimeError("Gemini method not supported.")

    def generate_json_sync(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Synchronous JSON generation with fallback cascade:
        1. Groq / Gemini (if circuit breaker CLOSED/HALF_OPEN)
        2. Secondary Provider
        3. Offline mock fixture
        """
        if self.circuit_breaker.can_execute():
            # Try Groq first if available
            if self.groq_client:
                try:
                    raw_text = self._call_groq_sync(prompt, system_prompt)
                    parsed = json.loads(raw_text)
                    self.circuit_breaker.record_success()
                    return parsed
                except Exception as e:
                    logger.warning(f"Groq API call failed: {e}")
                    self.circuit_breaker.record_failure()

            # Try Gemini second if available
            if self.gemini_client:
                try:
                    raw_text = self._call_gemini_sync(prompt, system_prompt)
                    parsed = json.loads(raw_text)
                    self.circuit_breaker.record_success()
                    return parsed
                except Exception as e:
                    logger.warning(f"Gemini API call failed: {e}")
                    self.circuit_breaker.record_failure()

        # Offline fixture fallback
        logger.info("Using offline mock fixture fallback for LLM response.")
        return self._extract_fixture_response()

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Asynchronous JSON generation wrapper.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.generate_json_sync, prompt, system_prompt)

    def _extract_fixture_response(self) -> Dict[str, Any]:
        """Returns structured JSON response format extracted from mock_responses.json fixture."""
        if "response" in self.offline_fixture and "contexts" in self.offline_fixture["response"]:
            return self.offline_fixture["response"]
        
        # Default baseline structure
        return {
            "contexts": [
                {
                    "goal": "Follow these steps to perform this Battery Troubleshooting",
                    "title": "Battery drain",
                    "score": 0.88,
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


# Global singleton instance
llm_client = LLMClient()
