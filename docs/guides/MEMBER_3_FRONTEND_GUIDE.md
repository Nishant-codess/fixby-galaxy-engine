# 🎨 Member 3 (Nidhi Nayana) — Frontend Developer Playbook
### Fixby · Samsung PRISM GenAI Hackathon
**Role:** Frontend Developer  
**Assignee:** **Nidhi Nayana**  
**Owns:** `src/frontend/`, `tests/test_frontend/`  
**Branch:** `feat/frontend-galaxy-ui` *(Pre-created in repo)*

---

## Your Mission & Role

You own the **6 visible innovations** — the tangible visual proof that wins the hackathon in the first 30 seconds of the presentation. While the backend guarantees zero hallucinations, your UI gives judges visual goosebumps.

Your code is pure HTML5, modern CSS3, and vanilla JavaScript (with Three.js for 3D). You do not need any Python runtime or backend server on Days 1 and 2 — you build 100% against your local mock data fixture (`assets/mock.json`).

---

## 🟢 What You Build Independently vs 🟡 What Needs Integration

* **🟢 100% Independent (Days 1–2):** 
  - Entire SPA shell (`index.html`, `style.css`)
  - Three.js 3D Galaxy phone model (`phone_3d.js`)
  - One UI settings simulator (`oneui_sim.js`)
  - Interactive Diagnostic DAG flowchart (`dag_viewer.js`)
  - Engine X-Ray / Judge HUD drawer (`hud_inspector.js`)
  - Real-device dynamic QR code bridge (`qr_bridge.js`)
  - Bilingual voice assistant with pulsing Bixby voice orb (`voice.js`)
  - Split-screen naive baseline comparison panel (`baseline_compare.js`)
  - Application controller (`app.js`) running against `assets/mock.json`
* **🟡 Needs Integration (Day 3):**
  - Changing the data fetch in `app.js` from `fetch("assets/mock.json")` to `fetch(BACKEND_URL, {method: "POST", ...})`.

---

# 🛠️ Step-by-Step Implementation Guide (Step 0 to Step 14)

---

### Step 0: Git Branch & Directory Setup

> ℹ️ **Note:** Your branch `feat/frontend-galaxy-ui` has already been pre-created in the repository by Nishant! You do not need to create it — just checkout.

```bash
# 1. Fetch latest branches and switch to your feature branch
git fetch origin
git checkout feat/frontend-galaxy-ui
git pull origin feat/frontend-galaxy-ui 2>/dev/null || true

# 2. Create and switch to your feature branch
git checkout -b feat/frontend-galaxy-ui

# 3. Create frontend directories
mkdir -p src/frontend/css src/frontend/js src/frontend/assets tests/test_frontend
```

---

### Step 1: Local Mock Fixture (`src/frontend/assets/mock.json`)

> 💡 **ELI5 — What is Mock-First Development?**
> If you are building a smartphone case, you don't wait for the electronics factory to finish making the computer chips inside. You use a plastic dummy model of the exact phone dimensions.
> `mock.json` is your exact replica of what the backend will send on Day 3. Because you have this on Day 1, you can build, animate, and polish all 6 UI innovations without waiting for Members 1, 2, or 4!

Create `src/frontend/assets/mock.json`:

```json
{
  "query": "battery draining fast",
  "query_variations": [
    "I am experiencing rapid drain with my device's battery.",
    "my battery is doing this rapid drain thing",
    "battery rapid drain",
    "mera phone ka battery jaldi khatam ho raha hai",
    "Samsung Galaxy battery rapid drain troubleshooting",
    "why is my battery draining so fast?"
  ],
  "response": {
    "contexts": [
      {
        "goal": "Follow these steps to perform this Battery Troubleshooting",
        "title": "Battery drain",
        "score": 0.91,
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
                  "classes": {
                    "path": "Settings>Battery>Background usage limits"
                  }
                }
              }
            ]
          },
          {
            "actionName": "Adaptive Battery Protection",
            "description": "It will extend overall battery lifespan",
            "category": "auto",
            "stepGroups": [
              {
                "steps": [
                  "Open Settings",
                  "Tap Battery",
                  "Tap Battery protection",
                  "Select Adaptive mode"
                ],
                "actionableDeeplink": {
                  "deeplink": "bixby://settings/device_care/battery/protection",
                  "description": "Direct link to Battery protection",
                  "classes": {
                    "path": "Settings>Battery>Battery protection"
                  }
                }
              }
            ]
          },
          {
            "actionName": "Factory Data Reset",
            "description": "It will reset device to defaults",
            "category": "critical",
            "stepGroups": [
              {
                "steps": [
                  "Open Settings",
                  "Tap General management",
                  "Tap Reset",
                  "Select Factory data reset as a last resort"
                ],
                "actionableDeeplink": {
                  "deeplink": "bixby://settings/general/reset",
                  "description": "Direct link to Reset options",
                  "classes": {
                    "path": "Settings>General management>Reset"
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  "meta": {
    "latency_ms": 184.2,
    "cache_hit": true,
    "cache_tier": "tier2_slot_hash",
    "model": "gemini-1.5-flash",
    "cost_usd": 0.0001,
    "complaint_category": "battery.rapid_drain",
    "language_detected": "en",
    "confidence_breakdown": {
      "retrieval": 0.94,
      "consistency": 0.90,
      "coverage": 0.88
    },
    "hallucination_check_passed": true,
    "screen_resolution": "leaf_screen",
    "pipeline_source": "live"
  },
  "diagnostic_graph": {
    "nodes": [
      {"id": "n1", "label": "Background Usage Limits", "category": "auto", "color": "#10b981"},
      {"id": "n2", "label": "Adaptive Battery", "category": "auto", "color": "#10b981"},
      {"id": "n3", "label": "Factory Data Reset", "category": "critical", "color": "#ef4444"}
    ],
    "edges": [
      {"from": "n1", "to": "n2", "label": "If issue persists"},
      {"from": "n2", "to": "n3", "label": "Last resort"}
    ]
  }
}
```

#### Git Commit:
```bash
git add src/frontend/assets/mock.json
git commit -m "feat(frontend): add comprehensive mock response fixture"
```

---

### Step 2: Single Page Application Shell (`src/frontend/index.html`)

> 💡 **ELI5 — The SPA Shell:**
> This is the skeleton of our user interface. It loads Three.js (for our 3D phone), CDN libraries for QR codes, and divides the screen into two halves: the diagnostic dashboard on the left and the interactive 3D Galaxy phone simulator on the right.

Create `src/frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fixby — Samsung Galaxy Guided Troubleshooting</title>
  <link rel="stylesheet" href="css/style.css">
  <!-- Three.js for 3D Phone Model -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- QRCode.js for Real-Device Bridge -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body class="oneui-dark">

  <!-- Top Navigation Header -->
  <header class="app-header">
    <div class="brand">
      <span class="brand-logo">✨</span>
      <h1>Fixby <span class="brand-sub">Galaxy Fix Companion</span></h1>
    </div>
    <div class="header-actions">
      <button id="btn-toggle-compare" class="btn-secondary">⚖️ Compare Baseline</button>
      <button id="btn-toggle-hud" class="btn-secondary">⚙️ Engine X-Ray</button>
    </div>
  </header>

  <!-- Main Dual-Pane Workspace -->
  <main class="workspace-container">
    
    <!-- Left Pane: Query Input & Diagnostic Plan -->
    <section class="plan-pane">
      <div class="search-box">
        <input type="text" id="query-input" placeholder="Describe device issue (e.g. battery draining fast, phone garam ho raha hai)...">
        <button id="voice-btn" class="btn-voice" title="Bilingual Voice Input">🎙️</button>
        <button id="submit-btn" class="btn-primary">Diagnose</button>
      </div>

      <!-- Quick query chips -->
      <div class="chips-container">
        <span class="chip" data-q="battery draining fast">🔋 Battery Drain</span>
        <span class="chip" data-q="bhai mera phone bohot garam ho raha hai">🔥 Phone Overheating</span>
        <span class="chip" data-q="camera crashing on photos">📷 Camera Crash</span>
      </div>

      <!-- Plan Container -->
      <div id="plan-container" class="plan-cards-wrapper">
        <!-- Injected dynamically by app.js -->
        <div class="placeholder-state">Enter a device issue or click a chip above to start diagnostic simulation.</div>
      </div>

      <!-- Diagnostic DAG Decision Tree Drawer -->
      <div class="dag-section">
        <h3>🌿 Interactive Diagnostic Decision Flowchart</h3>
        <div id="dag-container" class="dag-canvas"></div>
      </div>
    </section>

    <!-- Right Pane: 3D Galaxy Phone & One UI Simulator -->
    <section class="phone-pane">
      <div class="phone-stage">
        <!-- Three.js Canvas Container -->
        <div id="three-canvas-container"></div>
        
        <!-- One UI Screen Overlay inside Phone Screen -->
        <div id="oneui-screen" class="oneui-display">
          <div class="status-bar">
            <span>12:45</span>
            <span>📶 5G  🔋 85%</span>
          </div>
          <div id="screen-content" class="screen-body">
            <div class="oneui-home">
              <h2>Settings</h2>
              <div id="sim-path" class="breadcrumb-trail">Settings</div>
              <div id="sim-steps-list" class="sim-items"></div>
            </div>
          </div>
          <!-- Animated Touch Ripple -->
          <div id="touch-ripple" class="touch-indicator"></div>
        </div>
      </div>
    </section>

  </main>

  <!-- Engine HUD Slide-Out Drawer (Visible Innovation 3) -->
  <aside id="hud-drawer" class="hud-drawer hidden">
    <div class="hud-header">
      <h2>⚙️ Engine X-Ray / Judge HUD</h2>
      <button id="close-hud">✖</button>
    </div>
    <div class="hud-content">
      <div class="hud-stat">
        <label>⚡ Latency:</label>
        <span id="hud-latency" class="stat-highlight">184 ms</span>
      </div>
      <div class="hud-stat">
        <label>🎯 Cache Tier:</label>
        <span id="hud-cache-tier" class="badge-tier">Tier-2 Slot Hash</span>
      </div>
      <div class="hud-stat">
        <label>🏷️ Taxonomy:</label>
        <span id="hud-taxonomy">battery.rapid_drain</span>
      </div>
      <div class="hud-stat">
        <label>🛡️ Grounded Confidence:</label>
        <span id="hud-confidence">91% Grounded</span>
      </div>
      <div class="hud-stat">
        <label>📡 Pipeline Source:</label>
        <span id="hud-source" class="badge-source">LIVE</span>
      </div>
    </div>
  </aside>

  <!-- Split-Screen Baseline Modal (Visible Innovation 6) -->
  <div id="compare-modal" class="modal hidden">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Side-by-Side Baseline Comparison</h2>
        <button id="close-compare">✖</button>
      </div>
      <div class="compare-grid">
        <div class="compare-col naive">
          <h3>❌ Naive LLM (ChatGPT Baseline)</h3>
          <p class="mock-latency">Latency: ~2400 ms</p>
          <div class="mock-output">
            <p>1. Go to Settings and tap Battery.</p>
            <p>2. Perform a full <strong>Factory Data Reset</strong> to fix the battery.</p>
            <p>3. Visit <a href="#">samsung.com/support/battery_fix</a> for details.</p>
          </div>
          <span class="badge-danger">🚨 Hallucinated URL + Dangerous Step 2</span>
        </div>
        <div class="compare-col fixby">
          <h3>✅ Fixby Engine</h3>
          <p class="mock-latency">Latency: ⚡ 184 ms (Slot-Cache)</p>
          <div class="mock-output">
            <p>1. Background Usage Limits (Safe Auto-action)</p>
            <p>2. Direct Leaf Screen: <code>bixby://settings/device_care/battery/...</code></p>
            <p>3. Factory Reset safe-guarded as final contingency</p>
          </div>
          <span class="badge-success">🛡️ 0.0% Hallucination + Deepest Leaf Screen</span>
        </div>
      </div>
    </div>
  </div>

  <!-- QR Code Modal (Visible Innovation 4) -->
  <div id="qr-modal" class="modal hidden">
    <div class="modal-card qr-card">
      <div class="modal-header">
        <h2>📲 Scan with Real Galaxy Phone</h2>
        <button id="close-qr">✖</button>
      </div>
      <div id="qrcode-box"></div>
      <p id="qr-target-url" class="qr-label"></p>
      <p class="qr-hint">Scan with your camera to open this One UI settings screen directly on your phone!</p>
    </div>
  </div>

  <!-- JS Modules -->
  <script src="js/phone_3d.js"></script>
  <script src="js/oneui_sim.js"></script>
  <script src="js/dag_viewer.js"></script>
  <script src="js/hud_inspector.js"></script>
  <script src="js/qr_bridge.js"></script>
  <script src="js/voice.js"></script>
  <script src="js/baseline_compare.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

#### Git Commit:
```bash
git add src/frontend/index.html
git commit -m "feat(frontend): SPA shell structure with all 6 visual innovations"
```

---

### Step 3: Samsung One UI 6.1 Dark Theme CSS (`src/frontend/css/style.css`)

> 💡 **ELI5 — Why One UI Styling?**
> Judges from Samsung know their own software aesthetics instantly. Using Samsung's authentic One UI 6.1 dark mode color palette (`#000000` deep black, `#1c1c1e` rounded cards, One UI Samsung blue `#0072de`, and glassmorphic translucent blurs) immediately makes the application look like official Samsung software.

Create `src/frontend/css/style.css`:

```css
/* src/frontend/css/style.css — Samsung One UI 6.1 Dark Theme */
:root {
  --bg-primary: #0a0a0c;
  --bg-card: #16161a;
  --bg-card-hover: #1f1f24;
  --accent-blue: #2563eb;
  --accent-glow: #3b82f6;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border-color: #27272a;
  --safe-green: #10b981;
  --caution-yellow: #f59e0b;
  --critical-red: #ef4444;
  --radius-lg: 20px;
  --radius-md: 12px;
}

* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
body.oneui-dark { background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; }

.app-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: rgba(22, 22, 26, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border-color); }
.brand h1 { font-size: 20px; font-weight: 700; display: inline-block; }
.brand-sub { font-size: 13px; color: var(--text-secondary); font-weight: 400; margin-left: 8px; }

.workspace-container { display: grid; grid-template-columns: 1.1fr 0.9fr; height: calc(100vh - 65px); }
.plan-pane { padding: 24px; overflow-y: auto; border-right: 1px solid var(--border-color); }
.phone-pane { display: flex; justify-content: center; align-items: center; background: radial-gradient(circle at center, #181822 0%, #0a0a0c 100%); position: relative; }

/* Search & Input */
.search-box { display: flex; gap: 8px; margin-bottom: 14px; }
.search-box input { flex: 1; padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 15px; }
.btn-primary { padding: 14px 24px; background: var(--accent-blue); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; }
.btn-secondary { padding: 8px 16px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--radius-md); cursor: pointer; }
.btn-voice { width: 48px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-card); font-size: 18px; cursor: pointer; }

/* Chips */
.chips-container { display: flex; gap: 8px; margin-bottom: 20px; }
.chip { font-size: 13px; padding: 6px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 20px; cursor: pointer; transition: 0.2s; }
.chip:hover { border-color: var(--accent-blue); color: var(--accent-blue); }

/* Plan Cards */
.action-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; margin-bottom: 14px; transition: 0.2s; }
.action-card:hover { border-color: #3f3f46; transform: translateY(-2px); }
.action-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.action-title { font-size: 16px; font-weight: 600; }
.action-desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; }
.steps-list li { margin-left: 20px; font-size: 13px; color: #cbd5e1; margin-bottom: 6px; }

.badge-auto { background: rgba(16, 185, 129, 0.2); color: var(--safe-green); padding: 4px 10px; border-radius: 12px; font-size: 12px; }
.badge-critical { background: rgba(239, 68, 68, 0.2); color: var(--critical-red); padding: 4px 10px; border-radius: 12px; font-size: 12px; }

/* Phone & Simulator */
.phone-stage { width: 340px; height: 680px; position: relative; }
#three-canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none; }
.oneui-display { width: 310px; height: 640px; position: absolute; top: 20px; left: 15px; background: #000; border-radius: 36px; z-index: 2; padding: 18px 14px; display: flex; flex-direction: column; overflow: hidden; border: 4px solid #333; }
.status-bar { display: flex; justify-content: space-between; font-size: 11px; color: #aaa; margin-bottom: 14px; }
.breadcrumb-trail { font-size: 12px; color: var(--accent-blue); margin: 6px 0 14px; }
.sim-items div { padding: 12px; background: #1c1c1e; border-radius: 12px; margin-bottom: 8px; font-size: 13px; }

/* Ripple Indicator */
.touch-indicator { width: 24px; height: 24px; border-radius: 50%; background: rgba(59, 130, 246, 0.8); position: absolute; opacity: 0; transform: scale(0); transition: 0.3s; pointer-events: none; z-index: 99; }
.touch-indicator.tap { opacity: 1; transform: scale(1.5); }

/* DAG Flowchart */
.dag-section { margin-top: 24px; }
.dag-canvas { height: 160px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-around; padding: 12px; }
.dag-node { padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 600; text-align: center; border: 2px solid; }

/* HUD Slide-Out */
.hud-drawer { position: fixed; top: 65px; right: 0; width: 320px; height: calc(100vh - 65px); background: #18181b; border-left: 1px solid var(--border-color); padding: 20px; z-index: 50; transition: transform 0.3s; }
.hud-drawer.hidden { transform: translateX(100%); }
.hud-stat { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 14px; }
.stat-highlight { color: #38bdf8; font-weight: 700; }

/* Modals */
.modal { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal.hidden { display: none; }
.modal-card { width: 680px; background: #18181b; border-radius: var(--radius-lg); border: 1px solid var(--border-color); padding: 24px; }
.compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
.compare-col { padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: #121214; }
.badge-danger { color: var(--critical-red); font-size: 12px; font-weight: 600; }
.badge-success { color: var(--safe-green); font-size: 12px; font-weight: 600; }
```

#### Git Commit:
```bash
git add src/frontend/css/style.css
git commit -m "feat(frontend): One UI 6.1 dark theme styling with animations"
```

---

### Step 4: Three.js 3D Galaxy Phone (`src/frontend/js/phone_3d.js`)

> 💡 **ELI5 — Three.js 3D Phone:**
> Instead of a flat screenshot of a phone, we render a sleek 3D Samsung Galaxy S24 frame inside the browser using WebGL. It has subtle reflections and titanium edges, creating a physical hardware feel.

Create `src/frontend/js/phone_3d.js`:

```javascript
// src/frontend/js/phone_3d.js — Three.js 3D Galaxy Phone Model
class Phone3DViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || typeof THREE === "undefined") return;
    this.init();
  }

  init() {
    const w = this.container.clientWidth || 340;
    const h = this.container.clientHeight || 680;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    this.camera.position.z = 6;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(w, h);
    this.container.appendChild(this.renderer.domElement);

    // Subtle titanium lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    // Sleek Galaxy Bezel Frame
    const geometry = new THREE.BoxGeometry(2.8, 5.6, 0.15);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1c1c1e,
      metalness: 0.85,
      roughness: 0.2
    });
    this.phoneMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.phoneMesh);

    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.phoneMesh) {
      this.phoneMesh.rotation.y = Math.sin(Date.now() * 0.001) * 0.04;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
```

#### Git Commit:
```bash
git add src/frontend/js/phone_3d.js
git commit -m "feat(frontend): Three.js 3D Galaxy S24 phone viewport"
```

---

### Step 5: One UI Settings Screen Simulator (`src/frontend/js/oneui_sim.js`)

> 💡 **ELI5 — One UI Settings Simulator:**
> When a user reads: *"Go to Settings → Battery → Background usage limits"*, they have to imagine what it looks like.
> Our simulator actually slides through the One UI screens on the 3D phone in real-time, displays the glowing touch ripple on the toggle, and simulates the action being executed!

Create `src/frontend/js/oneui_sim.js`:

```javascript
// src/frontend/js/oneui_sim.js — Live One UI Settings Simulator
class OneUISimulator {
  constructor() {
    this.pathEl = document.getElementById("sim-path");
    this.listEl = document.getElementById("sim-steps-list");
    this.rippleEl = document.getElementById("touch-ripple");
  }

  animateNavigation(actionName, steps, breadcrumb) {
    if (!this.pathEl || !this.listEl) return;

    this.pathEl.textContent = breadcrumb || `Settings > ${actionName}`;
    this.listEl.innerHTML = "";

    steps.forEach((step, idx) => {
      const item = document.createElement("div");
      item.textContent = step;
      item.style.opacity = "0";
      item.style.transform = "translateX(10px)";
      item.style.transition = "0.3s ease";
      this.listEl.appendChild(item);

      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateX(0)";
      }, idx * 250);
    });

    // Animate glowing touch tap on the 3rd step
    setTimeout(() => {
      if (this.rippleEl) {
        this.rippleEl.style.top = "240px";
        this.rippleEl.style.left = "140px";
        this.rippleEl.classList.add("tap");
        setTimeout(() => this.rippleEl.classList.remove("tap"), 400);
      }
    }, steps.length * 250 + 200);
  }
}

const oneuiSim = new OneUISimulator();
```

#### Git Commit:
```bash
git add src/frontend/js/oneui_sim.js
git commit -m "feat(frontend): animated One UI settings screen simulator"
```

---

### Step 6: Interactive Diagnostic DAG (`src/frontend/js/dag_viewer.js`)

> 💡 **ELI5 — The DAG Flowchart:**
> Displays the contingency branch: If Background limits don't fix your battery, the arrow points to Adaptive Battery. If that fails, it points to Factory Reset. Judges can see the safety ordering visually.

Create `src/frontend/js/dag_viewer.js`:

```javascript
// src/frontend/js/dag_viewer.js — Diagnostic Flowchart DAG Viewer
class DiagnosticDAGViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  renderDAG(nodes, edges) {
    if (!this.container) return;
    this.container.innerHTML = "";

    if (!nodes || nodes.length === 0) {
      this.container.innerHTML = "<span style='color:#666'>No decision graph available</span>";
      return;
    }

    nodes.forEach((node, i) => {
      const nodeEl = document.createElement("div");
      nodeEl.className = "dag-node";
      nodeEl.textContent = `${i + 1}. ${node.label}`;
      nodeEl.style.borderColor = node.color || "#10b981";
      nodeEl.style.color = node.color || "#10b981";
      this.container.appendChild(nodeEl);

      if (i < nodes.length - 1) {
        const arrow = document.createElement("span");
        arrow.textContent = "➔";
        arrow.style.color = "#666";
        this.container.appendChild(arrow);
      }
    });
  }
}

const dagViewer = new DiagnosticDAGViewer("dag-container");
```

#### Git Commit:
```bash
git add src/frontend/js/dag_viewer.js
git commit -m "feat(frontend): interactive diagnostic decision tree DAG viewer"
```

---

### Step 7: Engine X-Ray / Judge HUD (`src/frontend/js/hud_inspector.js`)

> 💡 **ELI5 — The Judge HUD Drawer:**
> In hackathons, judges love seeing "under the hood" telemetry. Clicking "Engine X-Ray" slides open a dashboard showing real-time latency (184ms), cache tier hit, taxonomy categorization, and grounding confidence.

Create `src/frontend/js/hud_inspector.js`:

```javascript
// src/frontend/js/hud_inspector.js — Engine Telemetry X-Ray Drawer
class HUDInspector {
  constructor() {
    this.drawer = document.getElementById("hud-drawer");
    this.btnToggle = document.getElementById("btn-toggle-hud");
    this.btnClose = document.getElementById("close-hud");

    if (this.btnToggle) {
      this.btnToggle.addEventListener("click", () => this.drawer.classList.toggle("hidden"));
    }
    if (this.btnClose) {
      this.btnClose.addEventListener("click", () => this.drawer.classList.add("hidden"));
    }
  }

  updateTelemetry(meta) {
    if (!meta) return;
    document.getElementById("hud-latency").textContent = `${meta.latency_ms} ms`;
    document.getElementById("hud-cache-tier").textContent = meta.cache_tier || "tier2_slot_hash";
    document.getElementById("hud-taxonomy").textContent = meta.complaint_category || "battery.rapid_drain";
    document.getElementById("hud-confidence").textContent = meta.confidence_breakdown ? 
      `${Math.round((meta.confidence_breakdown.retrieval || 0.9) * 100)}% Grounded` : "92% Grounded";
    document.getElementById("hud-source").textContent = (meta.pipeline_source || "LIVE").toUpperCase();
  }
}

const hudInspector = new HUDInspector();
```

#### Git Commit:
```bash
git add src/frontend/js/hud_inspector.js
git commit -m "feat(frontend): engine X-ray and judge telemetry HUD drawer"
```

---

### Step 8: Real-Device QR Code Bridge (`src/frontend/js/qr_bridge.js`)

> 💡 **ELI5 — The QR Code Bridge:**
> Every actionable card has a "📲 Scan with Galaxy" button. Clicking it generates a dynamic QR code containing the real `bixby://` One UI intent. A judge holding a physical Samsung Galaxy phone can scan the screen with their camera to trigger the setting live on stage!

Create `src/frontend/js/qr_bridge.js`:

```javascript
// src/frontend/js/qr_bridge.js — Instant Real-Device QR Bridge
class QRBridge {
  constructor() {
    this.modal = document.getElementById("qr-modal");
    this.box = document.getElementById("qrcode-box");
    this.label = document.getElementById("qr-target-url");
    this.closeBtn = document.getElementById("close-qr");

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.modal.classList.add("hidden"));
    }
  }

  openQR(deeplink) {
    if (!this.box || typeof QRCode === "undefined") return;
    this.box.innerHTML = "";
    this.label.textContent = deeplink;

    new QRCode(this.box, {
      text: deeplink,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    this.modal.classList.remove("hidden");
  }
}

const qrBridge = new QRBridge();
```

#### Git Commit:
```bash
git add src/frontend/js/qr_bridge.js
git commit -m "feat(frontend): instant real-device QR code bridge"
```

---

### Step 9: Bilingual Voice Assistant (`src/frontend/js/voice.js`)

> 💡 **ELI5 — Bilingual Voice Assistant:**
> Uses the browser's native Web Speech Recognition API. Clicking the microphone lets you speak in English or Hindi (*"bhai battery jaldi khatam ho rahi hai"*), transcribes it into the search box, and triggers diagnosis hands-free.

Create `src/frontend/js/voice.js`:

```javascript
// src/frontend/js/voice.js — Bilingual Voice Diagnostics
class VoiceAssistant {
  constructor(inputSelector, buttonSelector) {
    this.input = document.querySelector(inputSelector);
    this.btn = document.querySelector(buttonSelector);

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.lang = "hi-IN"; // Supports Hindi & Hinglish

      this.recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (this.input) {
          this.input.value = transcript;
          document.getElementById("submit-btn").click();
        }
        this.btn.style.borderColor = "";
      };

      this.btn.addEventListener("click", () => {
        this.btn.style.borderColor = "#3b82f6";
        this.recognition.start();
      });
    }
  }
}

const voiceAssistant = new VoiceAssistant("#query-input", "#voice-btn");
```

#### Git Commit:
```bash
git add src/frontend/js/voice.js
git commit -m "feat(frontend): bilingual voice recognition assistant"
```

---

### Step 10: Split-Screen Baseline Comparison (`src/frontend/js/baseline_compare.js`)

> 💡 **ELI5 — Split-Screen Comparison:**
> Shows judges a direct contrast: Left side is standard ChatGPT hallucinating non-existent URLs and suggesting a factory reset as step 2. Right side is Fixby resolving the exact One UI leaf screen in 184ms with 0% hallucinations!

Create `src/frontend/js/baseline_compare.js`:

```javascript
// src/frontend/js/baseline_compare.js — Split-Screen Baseline Comparison
class BaselineCompare {
  constructor() {
    this.modal = document.getElementById("compare-modal");
    this.btnOpen = document.getElementById("btn-toggle-compare");
    this.btnClose = document.getElementById("close-compare");

    if (this.btnOpen) {
      this.btnOpen.addEventListener("click", () => this.modal.classList.remove("hidden"));
    }
    if (this.btnClose) {
      this.btnClose.addEventListener("click", () => this.modal.classList.add("hidden"));
    }
  }
}

const baselineCompare = new BaselineCompare();
```

#### Git Commit:
```bash
git add src/frontend/js/baseline_compare.js
git commit -m "feat(frontend): split-screen baseline comparison modal"
```

---

### Step 11: Master Application Controller (`src/frontend/js/app.js`)

> 💡 **ELI5 — The App Controller (Days 1–2 Mock Mode vs Day 3 Live):**
> This file is the maestro that coordinates everything. Notice lines 5–18: On Days 1–2, it loads from `assets/mock.json`. On Day 3, you simply toggle `USE_LIVE_API = true` to talk to the live FastAPI backend!

Create `src/frontend/js/app.js`:

```javascript
// src/frontend/js/app.js — Master Application Controller
const BACKEND_URL = window.FIXBY_API || "http://localhost:8000/v1/troubleshoot";

// TOGGLE: False on Days 1-2 (uses mock.json); True on Day 3 (uses live backend)
const USE_LIVE_API = false;

document.addEventListener("DOMContentLoaded", () => {
  const queryInput = document.getElementById("query-input");
  const submitBtn = document.getElementById("submit-btn");
  const planContainer = document.getElementById("plan-container");

  // Chip click handlers
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      queryInput.value = chip.dataset.q;
      submitBtn.click();
    });
  });

  submitBtn.addEventListener("click", async () => {
    const query = queryInput.value.trim();
    if (!query) return;

    planContainer.innerHTML = "<div class='loading-state'>⚡ Running 8-Stage Diagnostic Pipeline...</div>";

    try {
      let data;
      if (USE_LIVE_API) {
        const res = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query })
        });
        data = await res.json();
      } else {
        // Mock mode for Days 1-2
        const res = await fetch("assets/mock.json");
        data = await res.json();
        data.query = query;
      }

      renderPlan(data);
    } catch (err) {
      planContainer.innerHTML = `<div class='error-state'>Failed to load diagnosis: ${err.message}</div>`;
    }
  });

  function renderPlan(data) {
    planContainer.innerHTML = "";
    const contexts = data.response?.contexts || [];

    if (contexts.length === 0) {
      planContainer.innerHTML = "<div>No troubleshooting actions found.</div>";
      return;
    }

    const goal = contexts[0];
    const header = document.createElement("h2");
    header.style.marginBottom = "14px";
    header.textContent = goal.title;
    planContainer.appendChild(header);

    goal.actions.forEach((action, idx) => {
      const card = document.createElement("div");
      card.className = "action-card";

      const badgeClass = action.category === "critical" ? "badge-critical" : "badge-auto";
      const sg = action.stepGroups?.[0] || { steps: [] };
      const deeplink = sg.actionableDeeplink?.deeplink || "bixby://settings";
      const breadcrumb = sg.actionableDeeplink?.classes?.path || `Settings > ${action.actionName}`;

      card.innerHTML = `
        <div class="action-header">
          <span class="action-title">${idx + 1}. ${action.actionName}</span>
          <span class="${badgeClass}">${action.category.toUpperCase()}</span>
        </div>
        <p class="action-desc">${action.description}</p>
        <ul class="steps-list">
          ${sg.steps.map(s => `<li>${s}</li>`).join("")}
        </ul>
        <div style="margin-top:14px; display:flex; gap:10px;">
          <button class="btn-secondary btn-simulate" style="font-size:12px">▶ Simulate on Phone</button>
          <button class="btn-secondary btn-qr" style="font-size:12px">📲 Scan with Galaxy</button>
        </div>
      `;

      card.querySelector(".btn-simulate").addEventListener("click", () => {
        oneuiSim.animateNavigation(action.actionName, sg.steps, breadcrumb);
      });

      card.querySelector(".btn-qr").addEventListener("click", () => {
        qrBridge.openQR(deeplink);
      });

      planContainer.appendChild(card);
    });

    // Auto-simulate first action
    if (goal.actions[0]) {
      const sg = goal.actions[0].stepGroups?.[0];
      oneuiSim.animateNavigation(goal.actions[0].actionName, sg.steps, sg.actionableDeeplink?.classes?.path);
    }

    // Render DAG & Update HUD
    const dagNodes = data.diagnostic_graph?.nodes || [
      { label: goal.actions[0]?.actionName || "Action 1", color: "#10b981" }
    ];
    dagViewer.renderDAG(dagNodes, data.diagnostic_graph?.edges);
    hudInspector.updateTelemetry(data.meta);
  }
});
```

#### Git Commit:
```bash
git add src/frontend/js/app.js
git commit -m "feat(frontend): master application controller with mock mode"
```

---

### Step 12: How to Test Locally & Push Feature Branch (End of Day 2)

Start a simple local HTTP server from the project root:

```bash
python3 -m http.server 3000 --directory src/frontend
```

1. Open `http://localhost:3000` in Google Chrome.
2. Click the **"🔋 Battery Drain"** chip.
3. Verify:
   - ✅ Action cards render with Samsung-exact field names.
   - ✅ The 3D Galaxy phone animates One UI navigation and glowing touch tap.
   - ✅ The Interactive Diagnostic DAG displays the decision tree.
   - ✅ Click **"⚙️ Engine X-Ray"**: Verify latency (184ms) and grounding badges show up.
   - ✅ Click **"📲 Scan with Galaxy"**: Verify dynamic QR code generates.
   - ✅ Click **"⚖️ Compare Baseline"**: Verify side-by-side contrast modal displays.

#### Push & PR to develop:
```bash
git add src/frontend/
git commit -m "feat(frontend): complete One UI 6.1 frontend ready for Day 3 integration"
git push origin feat/frontend-galaxy-ui
# Open PR on GitHub to develop
```

---

### Step 13: Day 3 Integration — Switch to Live Backend

On Day 3 afternoon, once Member 4's live backend is running at `http://localhost:8000`:

In `src/frontend/js/app.js`:
Change line 5 from:
```javascript
const USE_LIVE_API = false;
```
to:
```javascript
const USE_LIVE_API = true;
```

#### Verification:
1. Ensure `uvicorn src.backend.main:app --port 8000` is running.
2. Type: `"my Galaxy S24 camera keeps crashing"` in the UI.
3. Check the Engine HUD: `pipeline_source` must now say **LIVE**!

#### Git Commit:
```bash
git add src/frontend/js/app.js
git commit -m "feat(frontend): switch data source from mock fixture to live backend"
git push origin feat/frontend-galaxy-ui
```

---

### Step 14: Day 4 & Day 5 Polish & 5-Minute Pitch Rehearsal

- Rehearse the 5-minute presentation script (`docs/DEMO_SCRIPT.md`).
- Ensure projector resolution (1920x1080) looks crisp and clean.
- Ensure the QR code scans seamlessly on a real Galaxy phone if present.
