# 🎨 Member 3 (Frontend Developer) — 0-to-Hero Playbook
### Domain: 3D Galaxy Simulation, One UI Design, Visible Innovations, & HUD
### Assigned Files: `src/frontend/*`, `tests/test_frontend/*`
### ⚠️ Note: NO Docker, NO Nginx, NO Python Backend required for your setup!

---

## 🎯 Mission Objective
You are the Frontend & UX Developer. You build the **visual centerpiece** that wins the hackathon:
1. Render a gorgeous **3D Samsung Galaxy S24 phone** using Three.js with orbit controls.
2. Build **Visible Innovation #1: Live One UI Settings Simulator** (animated touch navigation on the phone screen).
3. Build **Visible Innovation #2: Interactive Diagnostic DAG Visualizer** (dynamic flowchart with safety colors).
4. Build **Visible Innovation #3: Real-Time Engine X-Ray / Judge HUD** (telemetry, latency gauge, grounding badge).
5. Build **Visible Innovation #4: Instant Real-Device QR Bridge** (scan to launch Samsung deeplink on a real Galaxy).
6. Build **Visible Innovation #5: Bilingual Voice Assistant** with animated pulsing Bixby voice orb.
7. Work completely independently from Day 1 using `contracts/mock_responses.json`!

---

## 📋 Phase 0: Ground-Zero GitHub & Local Setup

### Step 0.0: Accept GitHub Collaborator Invitation
1. Check your email or notifications at [github.com/notifications](https://github.com/notifications).
2. Accept the collaborator invitation sent by the Team Lead (`<LEAD_GITHUB_USERNAME>`).

---

### Step 0.1: Configure Your Local Git Identity
```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```

---

### Step 0.2: Clone the Team Repository
```bash
# Clone the repository onto your machine
git clone https://github.com/<LEAD_GITHUB_USERNAME>/mai-batata-hun-galaxy-engine.git

# Enter the directory
cd mai-batata-hun-galaxy-engine
```

---

### Step 0.3: Checkout Your Assigned Feature Branch
```bash
# Fetch remote branches
git fetch origin

# Switch to your pre-created branch
git checkout feat/frontend-galaxy-ui

# Verify current branch
git branch
# Output should show: * feat/frontend-galaxy-ui
```

---

### Step 0.4: Run Lightweight Local Web Server
You don't need Python backend or Node.js to develop the frontend!
Run any static web server:

#### Option A: VS Code Live Server Extension
Right-click `src/frontend/index.html` $\rightarrow$ **Open with Live Server**.

#### Option B: Python Simple HTTP Server
```bash
# Serves the frontend directory on http://localhost:3000
python3 -m http.server 3000 --directory src/frontend
# (On Windows: python -m http.server 3000 --directory src/frontend)
```

---

### Step 0.5: Set Up Day 1 Mock Data (100% Independent)
Copy the locked contract mock so your UI can fetch data without waiting for the backend:
```bash
mkdir -p src/frontend/assets src/frontend/css src/frontend/js
cp contracts/mock_responses.json src/frontend/assets/mock.json
# (On Windows: Copy-Item contracts/mock_responses.json src/frontend/assets/mock.json)
```

---

## 📋 Phase 1: Visual UI & Experiential Innovations

### Step 20: HTML & One UI Style System (`src/frontend/index.html` & `css/style.css`)
```html
<!-- src/frontend/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mai Batata Hun — Samsung Galaxy Troubleshooting Engine</title>
  <link rel="stylesheet" href="css/style.css">
  <!-- Three.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="dark-theme">
  <header class="navbar">
    <div class="brand">
      <span class="logo-icon">🔧</span>
      <h1>Mai Batata Hun <span class="tag">One UI 6.1</span></h1>
    </div>
    <div class="nav-controls">
      <button id="toggle-hud" class="btn-secondary">⚙️ Engine X-Ray HUD</button>
      <button id="toggle-dag" class="btn-secondary">🌿 Diagnostic Tree</button>
    </div>
  </header>

  <main class="container">
    <!-- Left Column: 3D Galaxy Phone Viewport -->
    <section class="phone-container">
      <div id="three-canvas-container"></div>
      <div class="phone-screen-overlay" id="phone-screen">
        <div id="sim-screen" class="sim-screen"></div>
      </div>
    </section>

    <!-- Right Column: Diagnostic Controls & Step Cards -->
    <section class="controls-container">
      <div class="input-card">
        <label for="complaint-input">Describe your Galaxy issue in any language / Hinglish:</label>
        <div class="input-row">
          <input type="text" id="complaint-input" placeholder="e.g. mera phone hang ho raha hai aur battery drain ho rahi hai...">
          <button id="mic-btn" class="btn-mic">🎙️</button>
          <button id="submit-btn" class="btn-primary">Diagnose</button>
        </div>
      </div>

      <!-- Visible Innovation 5: Animated Voice Orb -->
      <div id="voice-orb" class="voice-orb hidden">
        <div class="orb-ring"></div>
        <span id="voice-status">Listening...</span>
      </div>

      <!-- Structured Troubleshooting Plan -->
      <div id="plan-container" class="plan-container"></div>
    </section>
  </main>

  <!-- Visible Innovation 3: Collapsible Real-Time HUD Inspector -->
  <aside id="hud-drawer" class="hud-drawer collapsed">
    <h3>🔍 Real-Time Engine Telemetry</h3>
    <div class="hud-metric"><span>Latency:</span> <strong id="hud-latency">-- ms</strong></div>
    <div class="hud-metric"><span>Cache Tier:</span> <strong id="hud-cache">--</strong></div>
    <div class="hud-metric"><span>Taxonomy Intent:</span> <strong id="hud-category">--</strong></div>
    <div class="hud-metric"><span>Grounding Confidence:</span> <strong id="hud-grounding">100%</strong></div>
  </aside>

  <!-- Visible Innovation 2: Diagnostic DAG Modal -->
  <div id="dag-modal" class="modal hidden">
    <div class="modal-content">
      <span id="close-dag" class="close-btn">&times;</span>
      <h2>🌿 Interactive Diagnostic Decision Graph</h2>
      <div id="dag-canvas" class="dag-canvas"></div>
    </div>
  </div>

  <script src="js/phone_3d.js"></script>
  <script src="js/oneui_sim.js"></script>
  <script src="js/dag_viewer.js"></script>
  <script src="js/hud_inspector.js"></script>
  <script src="js/voice.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

---

### Step 30: 3D Galaxy Phone Scene (`src/frontend/js/phone_3d.js`)
```javascript
// src/frontend/js/phone_3d.js
function init3DPhone() {
  const container = document.getElementById("three-canvas-container");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0x2d88ff, 1.2);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Geometric Galaxy S24 Titanium Frame
  const geometry = new THREE.BoxGeometry(7, 14.5, 0.8);
  const material = new THREE.MeshStandardMaterial({ color: 0x1f242d, metalness: 0.85, roughness: 0.2 });
  const phone = new THREE.Mesh(geometry, material);
  scene.add(phone);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
window.addEventListener("DOMContentLoaded", init3DPhone);
```

---

### Step 40: Visible Innovation #1 — Live One UI Simulator (`src/frontend/js/oneui_sim.js`)
```javascript
// src/frontend/js/oneui_sim.js
function simulateStepNavigation(actionTitle, deeplink) {
  const simScreen = document.getElementById("sim-screen");
  simScreen.innerHTML = `
    <div class="oneui-header">Settings</div>
    <div class="oneui-step-banner">⚡ Automated Navigation</div>
    <div class="oneui-menu-item active">
      <span class="icon">⚙️</span>
      <span class="text">${actionTitle}</span>
      <span class="touch-ripple"></span>
    </div>
    <div class="oneui-footer">Deeplink: ${deeplink || 'Manual Step'}</div>
  `;
}
```

---

### Step 50: Visible Innovation #2 — Diagnostic DAG Visualizer (`src/frontend/js/dag_viewer.js`)
```javascript
// src/frontend/js/dag_viewer.js
function renderDAG(graphData) {
  const container = document.getElementById("dag-canvas");
  if (!graphData || !graphData.nodes) return;

  container.innerHTML = graphData.nodes.map((node, i) => `
    <div class="dag-node ${node.safety_level}">
      <span class="dag-badge">${node.safety_level.toUpperCase()}</span>
      <h4>${node.label}</h4>
      <p>${node.status === 'recommended' ? 'Primary Fix' : 'Escalation Contingency'}</p>
    </div>
    ${i < graphData.nodes.length - 1 ? '<div class="dag-arrow">⬇️ If persists</div>' : ''}
  `).join("");
}
```

---

### Step 60: Visible Innovation #3 — Engine X-Ray HUD (`src/frontend/js/hud_inspector.js`)
```javascript
// src/frontend/js/hud_inspector.js
function updateHUD(meta) {
  if (!meta) return;
  document.getElementById("hud-latency").textContent = `${meta.latency_ms} ms`;
  document.getElementById("hud-cache").textContent = meta.cache_tier.toUpperCase();
  document.getElementById("hud-category").textContent = meta.complaint_category;
  document.getElementById("hud-grounding").textContent = `${Math.round(meta.grounding_score * 100)}% Grounded`;
}
```

---

### Step 70: Visible Innovation #5 — Bilingual Voice Assistant (`src/frontend/js/voice.js`)
```javascript
// src/frontend/js/voice.js
function setupVoice() {
  const micBtn = document.getElementById("mic-btn");
  const input = document.getElementById("complaint-input");
  
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    micBtn.style.display = "none";
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "hi-IN";

  micBtn.addEventListener("click", () => {
    recognition.start();
    document.getElementById("voice-orb").classList.remove("hidden");
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    document.getElementById("voice-orb").classList.add("hidden");
    document.getElementById("submit-btn").click();
  };
}
```

---

### Step 80: Main App Controller (`src/frontend/js/app.js`)
```javascript
// src/frontend/js/app.js
const BACKEND_URL = "http://localhost:8000/v1/troubleshoot";

async function fetchTroubleshootPlan(query) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query })
    });
    return await res.json();
  } catch (err) {
    console.warn("Backend server not reached — falling back to local mock data.");
    const mockRes = await fetch("assets/mock.json");
    return await mockRes.json();
  }
}
```

---

### Step 100: Pre-Commit & GitHub PR Checklist
```bash
# 1. Pull latest develop
git fetch origin develop
git merge origin/develop

# 2. Stage your files only
git add src/frontend/ tests/test_frontend/

# 3. Commit with semantic tag
git commit -m "feat(frontend): implement 3D Galaxy phone, One UI simulator, HUD, and voice orb"

# 4. Push to your branch on GitHub
git push origin feat/frontend-galaxy-ui

# 5. Open Pull Request to develop branch on GitHub:
# Go to https://github.com/<LEAD_GITHUB_USERNAME>/mai-batata-hun-galaxy-engine/pulls
# Click "New Pull Request" -> Base: develop <- Compare: feat/frontend-galaxy-ui
```
