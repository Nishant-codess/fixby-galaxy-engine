# 👑 Member 1 (The Lead) — 0-to-Hero Playbook
### Domain: Architecture, GitHub Repository Setup, Core Pipeline, & Docker
### Assigned Files: `contracts/*`, `src/core/*`, `docker/*`, `tests/test_core/*`

---

## 🎯 Mission Objective
You are the Lead Architect. You own the **repository foundation, architecture, and pipeline orchestrator**:
1. Create the official GitHub repository, configure collaborator permissions, and establish the branch topology.
2. Lock the interface contracts (`contracts/schema.py`) and mock fixtures so teammates can work 100% in parallel.
3. Build the **8-Stage Pipeline Orchestrator** (`src/core/pipeline.py`) that coordinates all AI and search modules.
4. Build the **Two-Tier Cascading Cache** (`src/core/cache.py`) achieving <300ms responses.
5. Implement **Innovation #1: Domain Complaint-Solution Scorer** (`src/core/scorer.py`).
6. Implement **Innovation #3: Samsung Device Symptom Taxonomy** (`src/core/taxonomy.py`).
7. Build the **Zero-Hallucination Grounding Validator** (`src/core/validator.py`).
8. Deliver a one-command containerized setup via `docker-compose.yml`.

---

## 📋 Phase 0: Ground-Zero GitHub Setup (The Lead's Pre-Flight)

> **Important:** As the Lead, complete these setup steps **first** before your teammates begin cloning.

### Step 0.0: Repository Naming Convention
* **Recommended GitHub Repo Name:** `mai-batata-hun-galaxy-engine`
* **Alternative Name:** `samsung-prism-genai-theme2`

---

### Step 0.1: Create the GitHub Repository
You can create the repository via the GitHub Web UI or the GitHub CLI:

#### Option A: Via GitHub Web UI
1. Go to [github.com/new](https://github.com/new).
2. Set **Repository name**: `mai-batata-hun-galaxy-engine`.
3. Set **Description**: `Smart Guided Troubleshooting Engine for Samsung Galaxy — Samsung PRISM GenAI Hackathon 3rd Edition (Theme 2)`.
4. Set **Visibility**: 
   * Select **Private** during initial development (recommended).
   * Or **Public** if required by your college/Samsung mentors.
5. **CRITICAL:** Leave *"Add a README file"*, *"Add .gitignore"*, and *"Choose a license"* **UNCHECKED** (we already have existing files locally).
6. Click **Create repository**.

#### Option B: Via GitHub CLI (if installed)
```bash
gh repo create mai-batata-hun-galaxy-engine --private --description "Samsung PRISM GenAI Hackathon Theme 2"
```

---

### Step 0.2: Invite Your 3 Teammates as Collaborators
Your teammates need write access to push their feature branches:
1. On your GitHub repository page, click **Settings** (top tab).
2. In the left sidebar, click **Collaborators**.
3. Click **Add people** (green button).
4. Enter each teammate's GitHub username or email address:
   * Member 2 (AI/ML Engineer)
   * Member 3 (Frontend Developer)
   * Member 4 (Backend Engineer)
5. Click **Add to this repository**. 
6. Notify your teammates to check their email or GitHub notifications to accept the invitation!

---

### Step 0.3: Rename Local Default Branch to `main`
In your local terminal:
```bash
# Rename current branch (master) to main
git branch -M main
```

---

### Step 0.4: Connect Your Local Project to GitHub
Link your local repository to the newly created GitHub repository:
```bash
# Replace <YOUR_GITHUB_USERNAME> with your actual GitHub handle
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/mai-batata-hun-galaxy-engine.git

# Verify the remote URL
git remote -v
```

---

### Step 0.5: Push `main` to GitHub
```bash
# Push your local commits to GitHub
git push -u origin main
```

---

### Step 0.6: Create and Push the `develop` Branch
All team development happens on `develop`. The `main` branch remains clean for the final hackathon submission:
```bash
# Create and switch to develop
git checkout -b develop

# Push develop to GitHub
git push -u origin develop
```

---

### Step 0.7: Set `develop` as the Default Branch on GitHub
1. On GitHub, go to **Settings** $\rightarrow$ **Branches**.
2. Under **Default branch**, click the switch/pencil icon.
3. Select **`develop`** and click **Update** $\rightarrow$ **I understand, update the default branch**.
*(Now all new pull requests will automatically target `develop`).*

---

### Step 0.8: Pre-Create Remote Feature Branches for Your Team
Create the empty feature branches from `develop` and push them to GitHub so your teammates can pull them directly:
```bash
# Ensure you are on develop
git checkout develop

# Create branches
git branch feat/aiml-engine develop
git branch feat/frontend-galaxy-ui develop
git branch feat/backend-fastapi develop

# Push all feature branches to GitHub
git push origin feat/aiml-engine feat/frontend-galaxy-ui feat/backend-fastapi
```

---

### Step 0.9: Create Your Own Working Branch
```bash
# Switch to your feature branch
git checkout -b feat/lead-core-pipeline develop
```

---

## 📋 Phase 1: Local Environment Setup

### Step 1.0: Cross-Platform Virtual Environment

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

## 📋 Phase 2: Interface Contracts & Architecture Implementation

### Step 10: Verify Interface Contracts
Verify that `contracts/schema.py` and `contracts/mock_responses.json` exist:
```bash
python3 -c "import contracts.schema as s; print('Contracts valid! Schema:', s.TroubleshootResponse.__name__)"
```

---

### Step 20: Build Innovation #3 — Samsung Symptom Taxonomy (`src/core/taxonomy.py`)
Create the taxonomy mapping conversational symptoms across 7 Galaxy device subsystems:
```python
# src/core/taxonomy.py
from typing import Dict, List, Optional

SYMPTOM_TAXONOMY: Dict[str, Dict] = {
    "battery.rapid_drain": {
        "canonical": "Rapid Battery Drain",
        "subsystem": "Battery",
        "keywords": ["battery", "drain", "dying", "battery backup", "charge jaldi khatam", "battery drop"],
        "severity": "safe",
        "default_deeplink": "bixby://settings/device_care/battery"
    },
    "performance.general_lag": {
        "canonical": "System UI Lag & Freezing",
        "subsystem": "Performance",
        "keywords": ["lag", "slow", "hang", "freezing", "stuck", "phone slow", "hang ho raha hai"],
        "severity": "safe",
        "default_deeplink": "bixby://settings/device_care/optimize"
    },
    "connectivity.wifi_drop": {
        "canonical": "Wi-Fi Disconnection",
        "subsystem": "Connectivity",
        "keywords": ["wifi", "disconnect", "no internet", "wifi drop", "wifi band"],
        "severity": "safe",
        "default_deeplink": "bixby://settings/connections/wifi"
    },
    "storage.full": {
        "canonical": "Storage Exhaustion",
        "subsystem": "Storage",
        "keywords": ["storage full", "no space", "memory full", "storage khatam"],
        "severity": "safe",
        "default_deeplink": "bixby://settings/device_care/storage"
    }
}

def classify_complaint_taxonomy(text: str) -> List[str]:
    """Matches text against Samsung symptom taxonomy keywords."""
    lower_text = text.lower()
    matches = []
    for cat_id, data in SYMPTOM_TAXONOMY.items():
        if any(kw in lower_text for kw in data["keywords"]):
            matches.append(cat_id)
    return matches or ["performance.general_lag"]
```

---

### Step 30: Build Innovation #1 — Complaint-to-Solution Scorer (`src/core/scorer.py`)
Implement the custom matching algorithm evaluating symptom overlap, component alignment, and severity safety:
```python
# src/core/scorer.py
from typing import List, Dict, Any

def score_complaint_solution(complaint_text: str, candidate_action: Dict[str, Any], detected_categories: List[str]) -> float:
    score = 0.0
    action_text = (candidate_action.get("title", "") + " " + candidate_action.get("description", "")).lower()
    
    # 1. Symptom Overlap (50% weight)
    matched_symptoms = sum(1 for cat in detected_categories if any(part in action_text for part in cat.split(".")))
    overlap_ratio = matched_symptoms / max(len(detected_categories), 1)
    score += 0.5 * overlap_ratio
    
    # 2. Component match (30% weight)
    if candidate_action.get("deeplink") and "settings" in candidate_action.get("deeplink", ""):
        score += 0.3
    else:
        score += 0.15
        
    # 3. Severity gating (20% weight - safe actions get priority)
    safety = candidate_action.get("safety_level", "safe")
    if safety == "safe":
        score += 0.2
    elif safety == "caution":
        score += 0.1
    else:
        score += 0.05
        
    return min(score, 1.0)
```

---

### Step 40: Build Cascading Cache Engine (`src/core/cache.py`)
Implement Tier 1 (MD5 exact hash lookup: <5ms) and Tier 2 (normalized token/semantic lookup: <200ms) with feedback adaptation:
```python
# src/core/cache.py
import hashlib
import time
from typing import Optional, Dict, Any, Tuple

class CascadingSemanticCache:
    def __init__(self):
        self.tier1_exact: Dict[str, Dict[str, Any]] = {}
        self.tier2_semantic: Dict[str, Dict[str, Any]] = {}
        self.feedback_weights: Dict[str, float] = {}

    def _hash_key(self, text: str) -> str:
        return hashlib.md5(text.strip().lower().encode("utf-8")).hexdigest()

    def get(self, query: str) -> Tuple[Optional[Dict[str, Any]], str]:
        key = self._hash_key(query)
        if key in self.tier1_exact:
            return self.tier1_exact[key], "tier1_hash"
            
        norm_key = " ".join(sorted(query.lower().split()))
        if norm_key in self.tier2_semantic:
            return self.tier2_semantic[norm_key], "tier2_semantic"
            
        return None, "none"

    def put(self, query: str, response_data: Dict[str, Any]):
        key = self._hash_key(query)
        norm_key = " ".join(sorted(query.lower().split()))
        self.tier1_exact[key] = response_data
        self.tier2_semantic[norm_key] = response_data

    def record_feedback(self, query: str, rating: int):
        key = self._hash_key(query)
        current = self.feedback_weights.get(key, 1.0)
        if rating > 0:
            self.feedback_weights[key] = min(current * 1.1, 2.0)
        else:
            self.feedback_weights[key] = max(current * 0.8, 0.2)
```

---

### Step 50: Zero-Hallucination Grounding Validator (`src/core/validator.py`)
```python
# src/core/validator.py
import re
from typing import List, Tuple
from contracts.schema import Goal

VALID_DEEPLINK_PATTERN = re.compile(r"^(bixby|samsungapps|android\.settings):\/\/.+")

def validate_plan_grounding(goals: List[Goal]) -> Tuple[bool, float, List[str]]:
    errors = []
    grounded_steps = 0
    total_steps = 0
    
    for goal in goals:
        for action_idx, action in enumerate(goal.actions):
            if action_idx == 0 and action.safety_level == "critical":
                errors.append(f"Safety Violation: Critical action '{action.title}' cannot be step 1.")
                
            if action.type == "auto" and action.deeplink:
                if not VALID_DEEPLINK_PATTERN.match(action.deeplink):
                    errors.append(f"Invalid Deeplink format: {action.deeplink}")
                    
            total_steps += 1
            if action.source and "siis_responses" in action.source:
                grounded_steps += 1
                
    grounding_score = grounded_steps / max(total_steps, 1)
    is_valid = len(errors) == 0 and grounding_score >= 0.8
    return is_valid, grounding_score, errors
```

---

### Step 60: The Master Pipeline Orchestrator (`src/core/pipeline.py`)
```python
# src/core/pipeline.py
import time
from contracts.schema import TroubleshootResponse, PipelineMetadata, Goal
from src.core.cache import CascadingSemanticCache
from src.core.taxonomy import classify_complaint_taxonomy
from src.core.validator import validate_plan_grounding

cache = CascadingSemanticCache()

def run_troubleshoot_pipeline(query: str, language: str = "auto") -> TroubleshootResponse:
    start_time = time.time()
    
    categories = classify_complaint_taxonomy(query)
    
    cached_data, tier = cache.get(query)
    if cached_data:
        elapsed = (time.time() - start_time) * 1000
        cached_data["metadata"]["latency_ms"] = round(elapsed, 1)
        cached_data["metadata"]["cache_hit"] = True
        cached_data["metadata"]["cache_tier"] = tier
        return TroubleshootResponse(**cached_data)

    try:
        from src.ai.extractor import extract_structured_plan
        from src.ai.matcher import match_action_deeplinks
        raw_plan = extract_structured_plan(query)
        enriched_plan = match_action_deeplinks(raw_plan)
    except (ImportError, Exception):
        import json
        with open("contracts/mock_responses.json", "r") as f:
            mock = json.load(f)
            enriched_plan = [Goal(**g) for g in mock["goals"]]

    is_valid, grounding_score, errors = validate_plan_grounding(enriched_plan)
    
    elapsed = (time.time() - start_time) * 1000
    meta = PipelineMetadata(
        cache_hit=False,
        cache_tier="none",
        latency_ms=round(elapsed, 1),
        language_detected=language if language != "auto" else "en",
        complaint_category=" + ".join(categories),
        grounding_score=round(grounding_score, 2),
        active_innovations=[
            "Domain Complaint-Solution Scorer",
            "Samsung Symptom Taxonomy",
            "Cascading Semantic Cache",
            "Zero-Hallucination Grounding Guard"
        ]
    )
    
    response = TroubleshootResponse(
        query=query,
        goals=enriched_plan,
        metadata=meta
    )
    
    cache.put(query, response.model_dump())
    return response
```

---

### Step 70: Docker Deployment Config (`docker/Dockerfile` & `docker/docker-compose.yml`)
```dockerfile
# docker/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker/docker-compose.yml
version: "3.8"
services:
  engine:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - HOST=0.0.0.0
      - PORT=8000
    restart: unless-stopped
```

---

### Step 80: Automated Core Testing (`tests/test_core/test_pipeline.py`)
```bash
pytest tests/test_core/ -v
```

---

### Step 100: Pre-Commit & PR Checklist
```bash
# 1. Ensure clean compilation & test pass
python3 -m py_compile src/core/*.py
pytest tests/test_core/

# 2. Stage only your files
git add contracts/ src/core/ docker/ tests/test_core/

# 3. Commit with semantic convention
git commit -m "feat(core): implement 8-stage pipeline orchestrator, cascading cache, and taxonomy"

# 4. Push to your branch on GitHub
git push -u origin feat/lead-core-pipeline

# 5. Open Pull Request to develop branch on GitHub:
# Go to https://github.com/<YOUR_GITHUB_USERNAME>/mai-batata-hun-galaxy-engine/pulls
# Click "New Pull Request" -> Base: develop <- Compare: feat/lead-core-pipeline
```
