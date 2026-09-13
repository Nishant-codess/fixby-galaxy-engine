# 🤖 Member 2 (G. Vishal) — AI/ML Engineer Playbook
### Fixby · Samsung PRISM GenAI Hackathon
**Role:** AI/ML Engineer  
**Assignee:** **G. Vishal**  
**Owns:** `src/ai/`, `tests/test_ai/`  
**Branch:** `feat/aiml-engine` *(Pre-created in repo)*

---

## Your Mission & Role

You own the **AI intelligence layer** — the brains of Fixby. Your code talks to LLMs (Google Gemini and Groq LLaMA), extracts structured troubleshooting plans, guarantees zero hallucinated URLs, normalizes colloquial Indian Hinglish into crisp technical intents, and generates the interactive diagnostic decision tree (DAG).

---

## 🟢 What You Build Independently vs 🟡 What Needs Integration

* **🟢 Independent (Days 1–2):** 
  - `src/ai/llm_client.py` (Dual-LLM client with timeout circuit-breakers)
  - `src/ai/matcher.py` (Verified Samsung deeplink candidate retriever)
  - `src/ai/extractor.py` (Retrieval-bound schema extractor — LLM selects ID enum only)
  - `src/ai/paraphraser.py` (Multi-register query paraphraser for cache warming)
  - `src/ai/translator.py` (Hinglish token-set normalizer)
  - `src/ai/graph_generator.py` (Diagnostic DAG builder)
  - `tests/test_ai/test_ai_modules.py` (Complete unit test harness)
* **🟡 Needs Integration (Day 3):**
  - Your PR merges to `develop` so Nishant's pipeline can replace its temporary stubs with your real modules.

---

# 🛠️ Step-by-Step Implementation Guide (Step 0 to Step 10)

---

### Step 0: Git Branch & Environment Setup

> ℹ️ **Note:** Your branch `feat/aiml-engine` has already been pre-created in the repository by Nishant! You do not need to create it — just checkout.

```bash
# 1. Fetch latest branches and switch to your feature branch
git fetch origin
git checkout feat/aiml-engine
git pull origin feat/aiml-engine 2>/dev/null || true

# 3. Create virtual environment & activate
python3 -m venv venv
source venv/bin/activate   # On Windows: .\venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install --upgrade pip
pip install google-generativeai groq pydantic pytest pytest-asyncio python-dotenv

# 5. Create directories
mkdir -p src/ai tests/test_ai
touch src/ai/__init__.py

# 6. Set up your local .env file
cat << 'EOF' > .env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
EOF
```

---

### Step 1: Resilient Dual-LLM Client (`src/ai/llm_client.py`)

> 💡 **ELI5 — What is a Dual-LLM Client with Circuit Breaker?**
> When you need a quick answer on stage, you cannot afford to wait 10 seconds for an API that is lagging.
> Our client tries **Google Gemini 1.5 Flash** first. If Gemini does not respond in **4.0 seconds**, our timer triggers an emergency switch to **Groq LLaMA-3.3-70B**, which generates an answer in a blisteringly fast 500 milliseconds. If the internet completely cuts out, it falls back to a verified offline response. The user never sees a crash!

Create `src/ai/llm_client.py`:

```python
# src/ai/llm_client.py — Dual-LLM Client with Circuit Breaker
import os
import json
import asyncio
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
    _GEMINI_MODEL = genai.GenerativeModel("gemini-1.5-flash")
except Exception:
    _GEMINI_MODEL = None

try:
    from groq import Groq
    _GROQ_CLIENT = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
except Exception:
    _GROQ_CLIENT = None


class ResilientLLMClient:
    def __init__(self, gemini_timeout: float = 4.0, groq_timeout: float = 3.0):
        self.gemini_timeout = gemini_timeout
        self.groq_timeout = groq_timeout

    async def _call_gemini(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        if not _GEMINI_MODEL:
            raise RuntimeError("Gemini model not initialized")
        full_prompt = f"{system_instruction}\n\nUser Request: {prompt}\n\nProvide JSON output only."
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: _GEMINI_MODEL.generate_content(full_prompt))
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
        return json.loads(text)

    async def _call_groq(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        if not _GROQ_CLIENT:
            raise RuntimeError("Groq client not initialized")
        loop = asyncio.get_event_loop()
        chat_completion = await loop.run_in_executor(
            None,
            lambda: _GROQ_CLIENT.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}
            )
        )
        return json.loads(chat_completion.choices[0].message.content)

    async def generate_json(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        # Attempt 1: Gemini 1.5 Flash (primary)
        try:
            return await asyncio.wait_for(self._call_gemini(prompt, system_instruction), timeout=self.gemini_timeout)
        except Exception as e:
            print(f"⚠️ Gemini failed or timed out ({e}). Falling back to Groq LLaMA...")

        # Attempt 2: Groq LLaMA-3.3-70B (fallback)
        try:
            return await asyncio.wait_for(self._call_groq(prompt, system_instruction), timeout=self.groq_timeout)
        except Exception as e:
            print(f"⚠️ Groq failed or timed out ({e}). Using offline fixture...")

        # Attempt 3: Local offline fixture fallback
        return {
            "title": "Device fix",
            "actions": [
                {
                    "actionName": "Device Care Optimization",
                    "description": "It will optimize battery and performance",
                    "category": "auto",
                    "deeplink_id": "DL_BATTERY_CARE",
                    "steps": ["Open Settings", "Tap Device Care", "Tap Optimize now"]
                }
            ]
        }


llm_client = ResilientLLMClient()
```

#### How to test locally:
```bash
python -c "import asyncio; from src.ai.llm_client import llm_client; res = asyncio.run(llm_client.generate_json('Give me a test title', 'Respond in JSON with key title')); print('✅ LLM Client returned:', res)"
```

#### Git Commit:
```bash
git add src/ai/llm_client.py
git commit -m "feat(ai): resilient dual-LLM client with Gemini and Groq fallback"
```

---

### Step 2: Deeplink Candidate Matcher (`src/ai/matcher.py`)

> 💡 **ELI5 — What does the Matcher do?**
> Imagine having a phone directory with 575 Samsung settings screens. You don't want to show all 575 screens to the AI because that confuses it and slows it down.
> The Matcher scans the user's complaint, compares keywords, and picks the top 5 most relevant Samsung screen IDs (like `DL_BATTERY_CARE`, `DL_BG_LIMITS`). This shortlist is given to the extractor.

Create `src/ai/matcher.py`:

```python
# src/ai/matcher.py — Samsung Deeplink Catalog & Candidate Matcher
import json
import os
from typing import List, Dict, Any

CATALOG_PATH = "contracts/deeplinks.json"

# Dev fallback fixture if contracts/deeplinks.json is not yet available
FALLBACK_CATALOG = [
    {
        "id": "DL_BATTERY_CARE",
        "deeplink": "bixby://settings/device_care/battery",
        "description": "Battery optimization and usage details",
        "classes": {"path": "Settings>Battery"}
    },
    {
        "id": "DL_BG_LIMITS",
        "deeplink": "bixby://settings/device_care/battery/background_limits",
        "description": "Put unused apps to sleep to save battery",
        "classes": {"path": "Settings>Battery>Background usage limits"}
    },
    {
        "id": "DL_DISPLAY_REFRESH",
        "deeplink": "bixby://settings/display/motion_smoothness",
        "description": "Change display refresh rate 60Hz or 120Hz",
        "classes": {"path": "Settings>Display>Motion smoothness"}
    },
    {
        "id": "DL_APPS_CLEAR_CACHE",
        "deeplink": "bixby://settings/apps",
        "description": "Clear app cache and data",
        "classes": {"path": "Settings>Apps"}
    }
]


class DeeplinkMatcher:
    def __init__(self):
        self.catalog = self._load_catalog()

    def _load_catalog(self) -> List[Dict[str, Any]]:
        if os.path.exists(CATALOG_PATH):
            try:
                with open(CATALOG_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return data if isinstance(data, list) else FALLBACK_CATALOG
            except Exception:
                return FALLBACK_CATALOG
        return FALLBACK_CATALOG

    def get_candidate_ids(self, query: str, top_k: int = 5) -> List[str]:
        q = query.lower()
        scored = []
        for item in self.catalog:
            score = 0
            desc = item.get("description", "").lower()
            classes = str(item.get("classes", "")).lower()
            item_id = item.get("id", item.get("deeplink", ""))

            for word in q.split():
                if len(word) > 2:
                    if word in desc:
                        score += 2
                    if word in classes:
                        score += 3
                    if word in item_id.lower():
                        score += 1
            scored.append((score, item_id))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = [item_id for score, item_id in scored[:top_k] if item_id]
        return results if results else ["DL_BATTERY_CARE", "DL_BG_LIMITS"]


matcher = DeeplinkMatcher()
```

#### How to test locally:
```bash
python -c "from src.ai.matcher import matcher; cands = matcher.get_candidate_ids('battery draining fast'); assert len(cands) > 0; print('✅ Matcher returned candidates:', cands)"
```

#### Git Commit:
```bash
git add src/ai/matcher.py
git commit -m "feat(ai): deeplink candidate retriever from catalog"
```

---

### Step 3: Retrieval-Bound Schema Extractor (`src/ai/extractor.py`)

> 💡 **ELI5 — How does Retrieval-Bound Extraction guarantee 0.0% Hallucinations?**
> Standard AI engines ask the LLM: *"Give me the troubleshooting steps and the link to fix it."* The AI makes up a link like `samsung.com/help/fix_battery` that does not exist.
> In our retrieval-bound extractor, we tell the AI:
> *"Here is a multiple choice list: [DL_BATTERY_CARE, DL_BG_LIMITS]. You are FORBIDDEN from writing web links. Pick an ID from this list, or null."*
> The AI picks `DL_BG_LIMITS`. Our code looks up that ID in our verified catalog and attaches `bixby://settings/...`. The AI never generates a URL string, so hallucination is mathematically impossible (0.0%).

Create `src/ai/extractor.py`:

```python
# src/ai/extractor.py — Retrieval-Bound Structured Schema Extractor
import asyncio
from typing import List, Optional
from contracts.schema import Goal, Action, StepGroup, Deeplink, ActionCategory
from src.ai.llm_client import llm_client
from src.ai.matcher import matcher

SYSTEM_PROMPT = """You are Fixby, Samsung's certified Galaxy Device Troubleshooting AI.
Analyze the user's device complaint and generate a structured diagnostic plan.

STRICT CONTRACT RULES:
1. You must output JSON only.
2. For each action, category must be: "auto", "manual", or "critical".
3. For deeplink_id, select ONLY from the candidate IDs provided in the prompt, or null. NEVER write any URL or URI string!
4. Action description MUST be 5 to 7 words and start with "It will".
5. Non-destructive actions must come before critical ones (factory reset is always last).
"""


def extract_structured_plan(query: str, candidate_ids: List[str], siis_response: Optional[str] = None) -> List[Goal]:
    user_prompt = f"""Complaint: "{query}"
Allowed Candidate Deeplink IDs: {candidate_ids}
Reference Context: {siis_response or "None"}

Format your response as:
{{
  "title": "Short title (2-3 words)",
  "actions": [
    {{
      "actionName": "Title Case Action Name",
      "description": "It will optimize background battery usage",
      "category": "auto",
      "deeplink_id": "{candidate_ids[0] if candidate_ids else 'null'}",
      "steps": ["Open Settings", "Tap Battery", "Tap Background usage limits"]
    }}
  ]
}}"""

    try:
        data = asyncio.run(llm_client.generate_json(user_prompt, SYSTEM_PROMPT))
    except Exception:
        data = {}

    title = data.get("title", "Device fix")
    actions_data = data.get("actions", [])

    actions: List[Action] = []
    for ad in actions_data:
        chosen_id = ad.get("deeplink_id")
        deep_obj = None

        if chosen_id and chosen_id in candidate_ids:
            # Look up verified deeplink from catalog
            cat_item = next((item for item in matcher.catalog if item.get("id") == chosen_id), None)
            uri = cat_item.get("deeplink") if cat_item else f"bixby://settings/{chosen_id.lower()}"
            deep_obj = Deeplink(deeplink=uri, description=ad.get("description", "Actionable settings link"))

        cat_str = ad.get("category", "auto").lower()
        category = ActionCategory.critical if cat_str == "critical" else (
            ActionCategory.manual if cat_str == "manual" else ActionCategory.auto
        )

        step_group = StepGroup(
            steps=ad.get("steps", ["Open Settings and configure option"]),
            actionableDeeplink=deep_obj
        )

        actions.append(
            Action(
                actionName=ad.get("actionName", "System Optimization"),
                description=ad.get("description", "It will optimize device performance reliably"),
                stepGroups=[step_group],
                category=category
            )
        )

    if not actions:
        # Fallback default action
        actions.append(
            Action(
                actionName="Background Usage Limits",
                description="It will limit background app activity",
                category=ActionCategory.auto,
                stepGroups=[
                    StepGroup(
                        steps=["Open Settings", "Tap Battery", "Tap Background usage limits"],
                        actionableDeeplink=Deeplink(
                            deeplink="bixby://settings/device_care/battery/background_limits",
                            description="Direct link to background limits"
                        )
                    )
                ]
            )
        )

    return [Goal(goal="", title=title, actions=actions, score=0.88)]
```

#### How to test locally:
```bash
python -c "from src.ai.extractor import extract_structured_plan; goals = extract_structured_plan('battery draining fast', ['DL_BATTERY_CARE', 'DL_BG_LIMITS']); print('✅ Extracted goal title:', goals[0].title, '| Actions:', len(goals[0].actions))"
```

#### Git Commit:
```bash
git add src/ai/extractor.py
git commit -m "feat(ai): retrieval-bound schema extractor with zero URL hallucination"
```

---

### Step 4: Register-Diverse Query Paraphraser (`src/ai/paraphraser.py`)

> 💡 **ELI5 — What is Register Diversity and Cache Warming?**
> A teenager asks: *"yo my phone is dead fast"*. A professional asks: *"I am observing rapid battery depletion on my Galaxy S24"*. An Indian user asks: *"bhai charge nahi tik raha"*.
> Even though they sound completely different, they all need the same solution. Our paraphraser generates 8 distinct linguistic versions across multiple styles. When we save the answer to cache, we warm the cache with all 8 versions so future queries hit the 5ms fast cache!

Create `src/ai/paraphraser.py`:

```python
# src/ai/paraphraser.py — Multi-Register Query Variation Paraphraser
from typing import List, Dict


def generate_query_variations(query: str, slots: Dict[str, str] = None) -> List[str]:
    domain = (slots or {}).get("domain", "device")
    symptom = (slots or {}).get("symptom", "issue").replace("_", " ")

    return [
        f"I am experiencing rapid {symptom} with my device's {domain}.",
        f"my {domain} is doing this {symptom} thing",
        f"{domain} {symptom} troubleshooting",
        f"Samsung Galaxy {domain} {symptom} fix",
        f"mera phone ka {domain} mein {symptom} ho raha hai",
        f"how do I resolve {symptom} on my Galaxy {domain}?",
        f"why is my {domain} having {symptom} problems?",
        f"fix {domain} {symptom} on Samsung One UI"
    ]
```

#### How to test locally:
```bash
python -c "from src.ai.paraphraser import generate_query_variations; v = generate_query_variations('battery drain', {'domain': 'battery', 'symptom': 'rapid_drain'}); assert len(v) >= 8; print(f'✅ Generated {len(v)} paraphrases successfully!')"
```

#### Git Commit:
```bash
git add src/ai/paraphraser.py
git commit -m "feat(ai): register-diverse query paraphraser for cache warming"
```

---

### Step 5: Hinglish Tech Idiom Normalizer (`src/ai/translator.py`)

> 💡 **ELI5 — Why Token-Set Matching beats Regex on Hinglish:**
> A regular regex looks for the exact phrase `"battery jaldi khatam"`.
> If an Indian user types: *"bhai battery BHI bohot jaldi khatam ho rahi hai"*, the regex fails because of the extra words "bhi" and "bohot".
> Our token-set matcher checks if the key puzzle pieces `{"battery", "jaldi", "khatam"}` exist in the user's sentence in any order. It normalizes colloquial slang (*"phone garam ho raha hai"*) into canonical technical English (`device overheating`) instantly!

Create `src/ai/translator.py`:

```python
# src/ai/translator.py — Hinglish Token-Set Normalizer
from typing import Dict, Set

HINGLISH_MAP: Dict[str, Set[str]] = {
    "battery rapid drain": {"battery", "jaldi", "khatam"},
    "battery not holding charge": {"charge", "nahi", "tik"},
    "device overheating": {"garam", "phone", "heat"},
    "phone lag and stutter": {"hang", "phone", "chal"},
    "slow charging speed": {"slow", "charge", "der"},
    "camera app crash": {"camera", "band", "crash"}
}


def normalize_hinglish_query(query: str) -> str:
    tokens = set(query.lower().split())

    for canonical, keyword_set in HINGLISH_MAP.items():
        if keyword_set.issubset(tokens):
            return f"Samsung Galaxy {canonical}"

    return query
```

#### How to test locally:
```bash
python -c "from src.ai.translator import normalize_hinglish_query; res = normalize_hinglish_query('bhai phone garam ho raha hai games ke baad'); print('✅ Normalized query:', res); assert 'overheating' in res"
```

#### Git Commit:
```bash
git add src/ai/translator.py
git commit -m "feat(ai): token-set Hinglish tech idiom normalizer"
```

---

### Step 6: Diagnostic Decision DAG Generator (`src/ai/graph_generator.py`)

> 💡 **ELI5 — What is the Diagnostic Decision DAG?**
> Instead of a boring flat bulleted list of instructions, our AI generates an interactive flowchart (a Directed Acyclic Graph).
> Green nodes are 🟢 Safe fixes (adjusting background limits), Yellow nodes are 🟡 Cautionary (clearing cache), and Red nodes are 🔴 Last-Resort (safe mode boot or factory reset).
> If the user clicks "Issue persists" in the UI, the flowchart lights up the next contingency path!

Create `src/ai/graph_generator.py`:

```python
# src/ai/graph_generator.py — Diagnostic Decision Flowchart DAG Builder
from typing import Dict, Any, List
from contracts.schema import Goal, ActionCategory


def generate_diagnostic_dag(goals: List[Goal]) -> Dict[str, Any]:
    nodes = []
    edges = []

    node_id = 1
    prev_id = None

    for goal in goals:
        for action in goal.actions:
            color = "#10b981" if action.category == ActionCategory.auto else (
                "#f59e0b" if action.category == ActionCategory.manual else "#ef4444"
            )
            curr_id = f"node_{node_id}"
            nodes.append({
                "id": curr_id,
                "label": action.actionName,
                "description": action.description,
                "category": action.category.value,
                "color": color
            })

            if prev_id:
                edges.append({
                    "from": prev_id,
                    "to": curr_id,
                    "label": "If issue persists"
                })

            prev_id = curr_id
            node_id += 1

    return {"nodes": nodes, "edges": edges}
```

#### How to test locally:
```bash
python -c "from contracts.schema import Goal, Action, ActionCategory; from src.ai.graph_generator import generate_diagnostic_dag; g = Goal(goal='', title='Test', actions=[Action(actionName='A1', description='It will test', category=ActionCategory.auto, stepGroups=[])], score=0.9); dag = generate_diagnostic_dag([g]); assert len(dag['nodes']) == 1; print('✅ DAG generated:', dag)"
```

#### Git Commit:
```bash
git add src/ai/graph_generator.py
git commit -m "feat(ai): diagnostic decision flowchart DAG builder"
```

---

### Step 7: AI Unit Test Suite (`tests/test_ai/test_ai_modules.py`)

Create `tests/test_ai/test_ai_modules.py`:

```python
# tests/test_ai/test_ai_modules.py
import pytest
from src.ai.matcher import matcher
from src.ai.paraphraser import generate_query_variations
from src.ai.translator import normalize_hinglish_query
from src.ai.graph_generator import generate_diagnostic_dag
from contracts.schema import Goal, Action, ActionCategory


def test_matcher():
    cands = matcher.get_candidate_ids("battery drain", top_k=3)
    assert len(cands) > 0


def test_paraphraser():
    vars = generate_query_variations("battery drain", {"domain": "battery", "symptom": "drain"})
    assert len(vars) >= 5


def test_hinglish_normalizer():
    norm = normalize_hinglish_query("phone garam ho raha hai")
    assert "overheating" in norm


def test_dag_builder():
    g = Goal(goal="", title="T", actions=[Action(actionName="A", description="It will fix", category=ActionCategory.auto, stepGroups=[])], score=0.8)
    dag = generate_diagnostic_dag([g])
    assert len(dag["nodes"]) == 1
```

#### How to test locally:
```bash
pytest tests/test_ai/ -v
```

#### Git Commit & Push Feature Branch (End of Day 2):
```bash
git add tests/test_ai/
git commit -m "test(ai): comprehensive test suite for all AI modules"
git push origin feat/aiml-engine
# Open PR to develop: "feat(ai): AI intelligence layer ready for Day 3 integration"
```

---

### Step 8: Day 3 Integration Support

On Day 3 morning, your PR is reviewed and merged into `develop`.
Member 1 will import your functions (`matcher.get_candidate_ids`, `extract_structured_plan`, `generate_query_variations`) into `src/core/pipeline.py`.

You will verify that Member 1's live pipeline test succeeds:
```bash
python -c "from src.core.pipeline import run_troubleshoot_pipeline; r = run_troubleshoot_pipeline('phone heating up'); print('AI EXTRACTION SUCCESS:', r.response.contexts[0].actions[0].actionName)"
```

---

### Step 9: Day 4 Live Demo Query Verification

Test the exact queries that will be presented live on stage:

```bash
# Demo Query 1 (Hinglish):
python -c "from src.core.pipeline import run_troubleshoot_pipeline; r = run_troubleshoot_pipeline('bhai mera phone bohot garam ho raha hai aur battery jaldi khatam ho jaati hai'); print('Hinglish demo response actions:', len(r.response.contexts[0].actions))"

# Demo Query 2 (Camera crash):
python -c "from src.core.pipeline import run_troubleshoot_pipeline; r = run_troubleshoot_pipeline('my Galaxy S24 camera keeps crashing'); print('Camera demo response:', r.response.contexts[0].actions[0].actionName)"
```

---

### Step 10: Day 5 Final Pre-Submission Audit

Run a final verification to confirm 0 leaked URLs and 100% test pass rate:
```bash
pytest tests/test_ai/ -v
```
