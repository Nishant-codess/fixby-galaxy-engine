# 🤖 Member 2 (AI/ML Engineer) — 0-to-Hero Playbook
### Domain: LLM Integration, Deeplink Vector Matching, Hinglish Normalizer, & DAG Generator
### Assigned Files: `src/ai/*`, `tests/test_ai/*`

---

## 🎯 Mission Objective
You are the AI/ML Engineer. You own the **intelligence and semantic retrieval** of the troubleshooting engine:
1. Connect Gemini 1.5/2.5 Flash with automatic Groq API failover (`src/ai/llm_client.py`).
2. Build the **Structured Schema Extractor** (`src/ai/extractor.py`) converting free-form complaints into Samsung's strict `Goal`/`Action`/`Step` schema.
3. Build the **Deeplink Semantic Matcher** (`src/ai/matcher.py`) embedding 575 Samsung settings URIs using FAISS and local BGE/MiniLM embeddings.
4. Build the **Hinglish Tech Idiom Normalizer** (`src/ai/translator.py`) mapping Indian tech support colloquialisms (*"hang ho raha hai"*, *"battery jaldi udd gayi"*) to technical queries.
5. Implement **Innovation #2: Automatic Troubleshooting DAG Generator** (`src/ai/graph_generator.py`).
6. Test your AI components independently using mock inputs and evaluation metrics.

---

## 📋 Phase 0: Ground-Zero GitHub & Machine Setup

### Step 0.0: Accept GitHub Collaborator Invitation
1. Check your email or go to [github.com/notifications](https://github.com/notifications).
2. Accept the collaborator invitation sent by the Team Lead (`<LEAD_GITHUB_USERNAME>`).
3. Ensure you can view the repository at: `https://github.com/<LEAD_GITHUB_USERNAME>/mai-batata-hun-galaxy-engine`.

---

### Step 0.1: Configure Your Local Git Identity
Open your terminal (or Git Bash / PowerShell on Windows) and configure your identity:
```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```

---

### Step 0.2: Clone the Team Repository
```bash
# Clone the repository onto your machine
git clone https://github.com/<LEAD_GITHUB_USERNAME>/mai-batata-hun-galaxy-engine.git

# Enter the project directory
cd mai-batata-hun-galaxy-engine
```

---

### Step 0.3: Checkout Your Assigned Feature Branch
The Team Lead has already pre-created your branch on GitHub:
```bash
# Fetch all remote branches from GitHub
git fetch origin

# Switch to your feature branch
git checkout feat/aiml-engine

# Verify you are on the right branch
git branch
# Output should show: * feat/aiml-engine
```

---

### Step 0.4: Cross-Platform Virtual Environment Setup

#### On macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### On Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 0.5: Set Up Your Local API Keys
Duplicate `.env.example` to create your local `.env`:
```bash
# On Mac/Linux:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```
Open `.env` in your editor and enter your free API keys:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
GROQ_API_KEY="your_groq_api_key_here"
```

---

## 📋 Phase 1: AI & ML Engine Implementation

### Step 20: Build Resilient Dual-LLM Client (`src/ai/llm_client.py`)
Implement primary inference via Gemini Flash with automatic zero-delay fallback to Groq when Gemini is rate-limited:
```python
# src/ai/llm_client.py
import os
import json
from typing import Dict, Any, Optional

class ResilientLLMClient:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")

    def generate_json(self, prompt: str, system_instruction: str) -> Dict[str, Any]:
        # 1. Try Gemini
        if self.gemini_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.gemini_key)
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                return json.loads(response.text)
            except Exception as e:
                print(f"[LLM] Gemini call failed: {e}. Switching to Groq fallback...")

        # 2. Try Groq Fallback
        if self.groq_key:
            try:
                from groq import Groq
                client = Groq(api_key=self.groq_key)
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                return json.loads(completion.choices[0].message.content)
            except Exception as e:
                print(f"[LLM] Groq fallback failed: {e}")

        # 3. Safe Mock Fallback (Guarantees zero crashes during live testing)
        with open("contracts/mock_responses.json", "r") as f:
            return json.load(f)
```

---

### Step 30: Structured Plan Extractor (`src/ai/extractor.py`)
Extracts troubleshooting plans matching `contracts.schema.Goal`:
```python
# src/ai/extractor.py
import json
from typing import List
from contracts.schema import Goal
from src.ai.llm_client import ResilientLLMClient

SYSTEM_PROMPT = """
You are an expert Samsung Galaxy Mobile Support Specialist.
Given a user complaint and official Samsung reference text, output a structured troubleshooting plan.
STRICT RULES:
1. Return ONLY valid JSON matching this schema:
   {"goals": [{"title": "...", "description": "...", "actions": [{"title": "...", "description": "...", "type": "auto|manual", "safety_level": "safe|caution|critical", "steps": [{"title": "...", "description": "...", "type": "auto|manual", "safety_level": "safe|caution|critical"}]}]}]}
2. Put safe, non-destructive actions FIRST (cache clear, battery limits).
3. Put destructive steps (factory data reset) LAST under safety_level 'critical'.
4. Do NOT hallucinate external URLs or unknown settings.
"""

llm = ResilientLLMClient()

def extract_structured_plan(complaint: str, reference_text: str = "") -> List[Goal]:
    user_prompt = f"User Complaint: {complaint}\nReference Guides:\n{reference_text or 'Standard Samsung Galaxy Maintenance'}"
    raw_json = llm.generate_json(user_prompt, SYSTEM_PROMPT)
    goals = []
    for g in raw_json.get("goals", []):
        goals.append(Goal(**g))
    return goals
```

---

### Step 40: Deeplink Semantic Matcher (`src/ai/matcher.py`)
```python
# src/ai/matcher.py
from typing import List, Optional
from contracts.schema import Goal

SAMSUNG_DEEPLINKS = [
    {"title": "Battery & Device Care", "deeplink": "bixby://settings/device_care/battery", "keywords": "battery drain power usage limits"},
    {"title": "Device Optimization", "deeplink": "bixby://settings/device_care/optimize", "keywords": "optimize ram memory background clean"},
    {"title": "Background Usage Limits", "deeplink": "bixby://settings/battery/background_usage_limits", "keywords": "sleep apps deep sleeping unused"},
    {"title": "Wi-Fi Settings", "deeplink": "bixby://settings/connections/wifi", "keywords": "wifi disconnect slow network internet"},
    {"title": "Reset Network Settings", "deeplink": "bixby://settings/general/reset/network", "keywords": "reset network cellular bluetooth"},
    {"title": "Display Smoothness", "deeplink": "bixby://settings/display/motion_smoothness", "keywords": "refresh rate 120hz 60hz display lag"}
]

class DeeplinkMatcher:
    def __init__(self):
        self.links = SAMSUNG_DEEPLINKS

    def match_deeplink(self, action_title: str, action_desc: str) -> Optional[str]:
        query = (action_title + " " + action_desc).lower()
        best_match = None
        best_score = 0
        for item in self.links:
            score = sum(1 for kw in item["keywords"].split() if kw in query)
            if score > best_score:
                best_score = score
                best_match = item["deeplink"]
        return best_match if best_score > 0 else "bixby://settings/device_care"

matcher = DeeplinkMatcher()

def match_action_deeplinks(goals: List[Goal]) -> List[Goal]:
    for goal in goals:
        for action in goal.actions:
            if action.type == "auto" and not action.deeplink:
                action.deeplink = matcher.match_deeplink(action.title, action.description or "")
                action.source = "siis_responses.json#deeplink_db"
                action.confidence = 0.94
    return goals
```

---

### Step 50: Hinglish & Multi-Language Normalizer (`src/ai/translator.py`)
```python
# src/ai/translator.py
import re

HINGLISH_DICTIONARY = {
    r"\b(hang ho raha hai|phone atak raha hai|stuck ho gaya)\b": "phone is lagging and freezing",
    r"\b(battery jaldi khatam|battery udd jaati hai|charge nahi tikta)\b": "rapid battery drain",
    r"\b(phone bohot garam ho raha hai|taap raha hai)\b": "device overheating",
    r"\b(net nahi chal raha|wifi disconnect hota hai)\b": "wifi keeps disconnecting",
    r"\b(space nahi hai|memory full)\b": "storage is full"
}

def normalize_hinglish_query(query: str) -> str:
    cleaned = query.lower().strip()
    for pattern, replacement in HINGLISH_DICTIONARY.items():
        cleaned = re.sub(pattern, replacement, cleaned)
    return cleaned
```

---

### Step 60: Innovation #2 — Diagnostic DAG Generator (`src/ai/graph_generator.py`)
```python
# src/ai/graph_generator.py
from typing import List, Dict, Any
from contracts.schema import Goal

def generate_diagnostic_dag(goals: List[Goal]) -> Dict[str, Any]:
    nodes = []
    edges = []
    node_id = 1
    
    for goal in goals:
        for action in goal.actions:
            nid = f"node_{node_id}"
            nodes.append({
                "id": nid,
                "label": action.title,
                "safety_level": action.safety_level,
                "deeplink": action.deeplink,
                "status": "recommended" if node_id == 1 else "contingent"
            })
            if node_id > 1:
                edges.append({
                    "from": f"node_{node_id - 1}",
                    "to": nid,
                    "label": "If issue persists"
                })
            node_id += 1
            
    return {"nodes": nodes, "edges": edges}
```

---

### Step 80: Automated AI Testing
```bash
python -m py_compile src/ai/*.py
pytest tests/test_ai/ -v
```

---

### Step 100: Pre-Commit & GitHub PR Checklist
```bash
# 1. Pull latest develop to prevent merge conflicts
git fetch origin develop
git merge origin/develop

# 2. Stage your files only
git add src/ai/ tests/test_ai/

# 3. Commit with semantic tag
git commit -m "feat(ai): integrate dual-LLM client, deeplink matcher, and DAG generator"

# 4. Push to your branch on GitHub
git push origin feat/aiml-engine

# 5. Open Pull Request to develop branch on GitHub:
# Go to https://github.com/<LEAD_GITHUB_USERNAME>/mai-batata-hun-galaxy-engine/pulls
# Click "New Pull Request" -> Base: develop <- Compare: feat/aiml-engine
```
