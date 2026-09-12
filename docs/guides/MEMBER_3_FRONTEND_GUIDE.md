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

## 📋 Step 0 to Step 100 Execution Roadmap

### Step 0: Git Checkout & Isolation Setup
```bash
# 1. Fetch latest changes
git fetch origin
git checkout develop

# 2. Create your feature branch
git checkout -b feat/frontend-galaxy-ui

# 3. No npm build or node backend required! 
# You can serve static files with any standard lightweight tool:
# E.g. VS Code Live Server extension OR:
python3 -m http.server 3000 --directory src/frontend
```

---

### Step 10: Contract-First Development (Day 1 Mock Mode)
You don't need the backend to start building! Copy `contracts/mock_responses.json` into `src/frontend/assets/mock.json` so you have real data immediately:
```bash
mkdir -p src/frontend/assets src/frontend/css src/frontend/js
cp contracts/mock_responses.json src/frontend/assets/mock.json
```

---

### Step 20: Design System & Structure (`src/frontend/index.html` & `css/style.css`)
Implement Samsung One UI typography, glassmorphism, and dark mode palette:
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
        <!-- Interactive One UI Simulator renders here -->
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
Sets up the Three.js viewport with lighting and camera:
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

  // Studio Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0x2d88ff, 1.2);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Geometric Galaxy Phone Mesh (Titanium Frame)
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
Animates simulated settings navigation on the phone screen:
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
Renders the decision tree with safety badges:
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
Updates live telemetry stats when a query returns:
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
Integrates browser speech recognition and speech synthesis:
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
  recognition.lang = "hi-IN"; // Supports Hindi & English

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
Connects mock data during Day 1-2, and switches to live backend on Day 3:
```javascript
// src/frontend/js/app.js
const BACKEND_URL = "http://localhost:8000/v1/troubleshoot";

async function fetchTroubleshootPlan(query) {
  try {
    // Try live backend first
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query })
    });
    return await res.json();
  } catch (err) {
    console.warn("Backend not running yet — falling back to local mock data.");
    const mockRes = await fetch("assets/mock.json");
    return await mockRes.json();
  }
}
```

---

### Step 100: Pre-Commit & PR Checklist
```bash
# 1. Test in browser (ensure 3D canvas loads and mock buttons work)
# 2. Stage only frontend files
git add src/frontend/ tests/test_frontend/

# 3. Commit and push to develop
git commit -m "feat(frontend): implement 3D Galaxy phone, One UI simulator, HUD, and voice orb"
git push origin feat/frontend-galaxy-ui
```
