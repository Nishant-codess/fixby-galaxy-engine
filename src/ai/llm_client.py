# src/ai/llm_client.py
import os, json, asyncio
from typing import Dict, Any

GEMINI_TIMEOUT_S = 4.0
GROQ_TIMEOUT_S = 3.0

class ResilientLLMClient:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")

    async def generate_json(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        if self.gemini_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.gemini_key)
                response = await asyncio.wait_for(
                    asyncio.to_thread(client.models.generate_content,
                                       model="gemini-2.5-flash", contents=prompt,
                                       config={"response_mime_type": "application/json"}),
                    timeout=GEMINI_TIMEOUT_S)
                return json.loads(response.text)
            except Exception as e:
                print(f"[LLM] Gemini failed/timed out: {e}. Falling to Groq.")

        if self.groq_key:
            try:
                from groq import Groq
                client = Groq(api_key=self.groq_key)
                completion = await asyncio.wait_for(
                    asyncio.to_thread(client.chat.completions.create,
                                       model="llama-3.3-70b-versatile",
                                       messages=[{"role": "system", "content": system_instruction},
                                                 {"role": "user", "content": prompt}],
                                       response_format={"type": "json_object"}),
                    timeout=GROQ_TIMEOUT_S)
                return json.loads(completion.choices[0].message.content)
            except Exception as e:
                print(f"[LLM] Groq failed/timed out: {e}. Falling to mock.")

        with open("contracts/mock_responses.json", "r") as f:
            return json.load(f)   # last resort — pipeline must tag pipeline_source="mock" here
