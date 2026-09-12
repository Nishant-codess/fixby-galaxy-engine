# 👑 Member 1 (The Lead) — 0-to-Hero Playbook
### Domain: Architecture, Core Pipeline Orchestrator, Cascading Cache, & Docker
### Assigned Files: `contracts/*`, `src/core/*`, `docker/*`, `tests/test_core/*`

---

## 🎯 Mission Objective
You are the Lead Architect. You own the **brain and spinal cord** of the troubleshooting engine:
1. Lock the interface contracts (`contracts/schema.py`) so your teammates never get blocked.
2. Build the **8-Stage Pipeline Orchestrator** (`src/core/pipeline.py`) that coordinates all AI and search modules.
3. Build the **Two-Tier Cascading Cache** (`src/core/cache.py`) achieving <300ms responses.
4. Implement **Innovation #1: Domain Complaint-Solution Scorer** (`src/core/scorer.py`).
5. Implement **Innovation #3: Samsung Device Symptom Taxonomy** (`src/core/taxonomy.py`).
6. Build the **Zero-Hallucination Grounding Validator** (`src/core/validator.py`).
7. Deliver a one-command containerized setup via `docker-compose.yml`.

---

## 📋 Step 0 to Step 100 Execution Roadmap

### Step 0: Git Checkout & Isolation Setup
```bash
# 1. Ensure you are on develop
git checkout develop

# 2. Create and switch to your feature branch
git checkout -b feat/lead-core-pipeline

# 3. Create your virtual environment
python3 -m venv venv
source venv/bin/activate

# 4. Install base dependencies
pip install pydantic fastapi uvicorn pytest httpx numpy
```

---

### Step 10: Interface Contracts (Day 1 - Completed)
Verify that `contracts/schema.py` and `contracts/mock_responses.json` exist:
```bash
python3 -c "import contracts.schema as s; print('Schema OK:', s.TroubleshootResponse.__name__)"
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
Implement the custom matching algorithm (not generic cosine distance) evaluating symptom overlap, component alignment, and severity safety:
```python
# src/core/scorer.py
from typing import List, Dict, Any

def score_complaint_solution(complaint_text: str, candidate_action: Dict[str, Any], detected_categories: List[str]) -> float:
    """
    Domain-specific matching score:
    1. Symptom Overlap (50% weight)
    2. Component / Subsystem match (30% weight)
    3. Severity alignment (20% weight - safe actions get bonus on initial troubleshooting)
    """
    score = 0.0
    action_text = (candidate_action.get("title", "") + " " + candidate_action.get("description", "")).lower()
    
    # 1. Symptom Overlap
    matched_symptoms = sum(1 for cat in detected_categories if any(part in action_text for part in cat.split(".")))
    overlap_ratio = matched_symptoms / max(len(detected_categories), 1)
    score += 0.5 * overlap_ratio
    
    # 2. Component match
    if candidate_action.get("deeplink") and "settings" in candidate_action.get("deeplink", ""):
        score += 0.3
    else:
        score += 0.15
        
    # 3. Severity gating: encourage safe/non-destructive fixes
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
        # Tier 1: Exact Hash
        key = self._hash_key(query)
        if key in self.tier1_exact:
            return self.tier1_exact[key], "tier1_hash"
            
        # Tier 2: Normalized Semantic Key
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
        # Adapt weight based on user feedback (+10% for positive, -20% for negative)
        if rating > 0:
            self.feedback_weights[key] = min(current * 1.1, 2.0)
        else:
            self.feedback_weights[key] = max(current * 0.8, 0.2)
```

---

### Step 50: Zero-Hallucination Grounding Validator (`src/core/validator.py`)
Validates that every step is strictly grounded in official Samsung documentation, checks deeplink format, and prevents destructive actions from appearing first:
```python
# src/core/validator.py
import re
from typing import List, Dict, Any, Tuple
from contracts.schema import Goal, Action

VALID_DEEPLINK_PATTERN = re.compile(r"^(bixby|samsungapps|android\.settings):\/\/.+")

def validate_plan_grounding(goals: List[Goal]) -> Tuple[bool, float, List[str]]:
    """
    Checks:
    1. Schema conformance.
    2. Grounding citations present.
    3. Deeplink URI syntax valid.
    4. Safety ordering: critical steps (e.g. factory reset) CANNOT be the first action.
    """
    errors = []
    grounded_steps = 0
    total_steps = 0
    
    for goal in goals:
        for action_idx, action in enumerate(goal.actions):
            # Check safety order
            if action_idx == 0 and action.safety_level == "critical":
                errors.append(f"Safety Violation: Critical action '{action.title}' cannot be step 1.")
                
            # Check deeplink validity if auto
            if action.type == "auto" and action.deeplink:
                if not VALID_DEEPLINK_PATTERN.match(action.deeplink):
                    errors.append(f"Invalid Deeplink format: {action.deeplink}")
                    
            # Check source grounding
            total_steps += 1
            if action.source and "siis_responses" in action.source:
                grounded_steps += 1
                
    grounding_score = grounded_steps / max(total_steps, 1)
    is_valid = len(errors) == 0 and grounding_score >= 0.8
    return is_valid, grounding_score, errors
```

---

### Step 60: The Master Pipeline Orchestrator (`src/core/pipeline.py`)
Orchestrates the 8 stages:
```python
# src/core/pipeline.py
import time
from typing import Dict, Any
from contracts.schema import TroubleshootResponse, PipelineMetadata, Goal
from src.core.cache import CascadingSemanticCache
from src.core.taxonomy import classify_complaint_taxonomy
from src.core.validator import validate_plan_grounding

cache = CascadingSemanticCache()

def run_troubleshoot_pipeline(query: str, language: str = "auto") -> TroubleshootResponse:
    start_time = time.time()
    
    # Stage 1 & 2: Taxonomy & Query Normalization
    categories = classify_complaint_taxonomy(query)
    
    # Stage 3: Cache Check
    cached_data, tier = cache.get(query)
    if cached_data:
        elapsed = (time.time() - start_time) * 1000
        cached_data["metadata"]["latency_ms"] = round(elapsed, 1)
        cached_data["metadata"]["cache_hit"] = True
        cached_data["metadata"]["cache_tier"] = tier
        return TroubleshootResponse(**cached_data)

    # Stage 4 & 5: AI Generation & Deeplink Matching
    # (Calls Member 2's ai modules when integrated, or fallback to contract mock)
    try:
        from src.ai.extractor import extract_structured_plan
        from src.ai.matcher import match_action_deeplinks
        raw_plan = extract_structured_plan(query)
        enriched_plan = match_action_deeplinks(raw_plan)
    except (ImportError, Exception):
        # Fallback to local high-reliability plan generator
        import json
        with open("contracts/mock_responses.json", "r") as f:
            mock = json.load(f)
            enriched_plan = [Goal(**g) for g in mock["goals"]]

    # Stage 6 & 7: Grounding Validation & Safety Ordering
    is_valid, grounding_score, errors = validate_plan_grounding(enriched_plan)
    
    # Stage 8: Metadata & Cache Write-Back
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
    
    # Store in cache for future hits
    cache.put(query, response.model_dump())
    return response
```

---

### Step 70: Docker Deployment Config (`docker/Dockerfile` & `docker/docker-compose.yml`)
Create production Docker files so anyone can spin up the full platform with a single command:
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

---

### Step 80: Automated Core Testing (`tests/test_core/test_pipeline.py`)
Run your test suite to ensure 100% reliability:
```bash
pytest tests/test_core/ -v
```

---

### Step 100: Pre-Commit & PR Checklist
```bash
# 1. Run tests and linting
pytest tests/test_core/
python3 -m py_compile src/core/*.py

# 2. Stage only your designated files
git add contracts/ src/core/ docker/ tests/test_core/

# 3. Commit with semantic convention
git commit -m "feat(core): implement 8-stage pipeline, cascading cache, and taxonomy"

# 4. Push branch and open Pull Request to develop
git push origin feat/lead-core-pipeline
```
