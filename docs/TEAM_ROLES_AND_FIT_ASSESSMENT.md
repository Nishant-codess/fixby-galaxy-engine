# 🎯 Fixby — Team Roles, ELI5 Explanations & Fit Assessment
### Samsung PRISM GenAI Hackathon 3rd Edition
**Who should read this:** All 4 team members before assigning roles.  
**Purpose:** Understand each role in detail, read a simple ELI5 breakdown, review technical prerequisites, and take a 5-question MCQ quiz to decide who should take which role.

---

## 👥 Confirmed Team Roster

| Role | Assignee | Branch | Focus Area | Playbook Link |
|:---|:---|:---|:---|:---|
| **👑 Member 1** | **Nishant** *(Lead)* | `feat/lead-core-pipeline` | Core Architecture, 8-Stage Pipeline, 3-Tier Cache, SHKG | [Member 1 Guide](guides/MEMBER_1_LEAD_GUIDE.md) |
| **🤖 Member 2** | **G. Vishal** | `feat/aiml-engine` | Dual-LLM Circuit Breaker, Extractor, Hinglish, DAG | [Member 2 Guide](guides/MEMBER_2_AIML_GUIDE.md) |
| **🎨 Member 3** | **Nidhi Nayana** | `feat/frontend-galaxy-ui` | One UI 6.1 SPA, Three.js 3D, HUD, Voice Orb, QR Bridge | [Member 3 Guide](guides/MEMBER_3_FRONTEND_GUIDE.md) |
| **⚙️ Member 4** | **Rangesh** | `feat/backend-fastapi` | FastAPI Gateway, CORS, Telemetry, Self-Auditing Benchmark | [Member 4 Guide](guides/MEMBER_4_BACKEND_GUIDE.md) |

---

# 👑 Member 1 (Nishant) — Team Lead & Core Engine Architect

### 1. Detailed Work Description
As the Team Lead and Core Engine Architect, you are responsible for the system's foundational contract, pipeline sequencing, and deterministic algorithmic layers:
- **`contracts/schema.py`:** Author the single source of truth Pydantic v2 data models matching Samsung's Appendix A/B contract byte-for-byte.
- **`contracts/mock_responses.json`:** Generate realistic test fixtures so Members 2, 3, and 4 are completely unblocked on Day 1.
- **`src/core/taxonomy.py`:** Build the domain ontology classifying Galaxy issues across 5 subsystems (Battery, Display, Camera, Performance, Connectivity) with bilingual slot extraction.
- **`src/core/cache.py`:** Implement the 3-tier cascading cache: Tier 1 (MD5 hash, <5ms), Tier 2 (Semantic Slot Hash, <20ms), and Tier 3 (`sentence-transformers` vector cosine similarity, <200ms).
- **`src/core/settings_graph.py`:** Construct the Settings Hierarchy Knowledge Graph (SHKG) using `networkx` to resolve candidate deeplinks to the deepest leaf screens (`Settings > Battery > Background usage limits`).
- **`src/core/validator.py`:** Create the code-level auto-repair loop enforcing Samsung's exact goal template syntax, 5-7 word action descriptions starting with `"It will"`, and safety ordering (safe auto-actions first, factory reset last).
- **`src/core/scorer.py`:** Write the compositional confidence formula ($w_1 \cdot \text{retrieval} + w_2 \cdot \text{consistency} + w_3 \cdot \text{coverage}$).
- **`src/core/pipeline.py`:** Build the 8-stage pipeline orchestrator with Day 1–2 stubs, swapping in Member 2's AI modules on Day 3.
- **`docker/`:** Configure `Dockerfile` and `docker-compose.yml` for containerized submission.

### 2. 💡 ELI5 (Explain Like I'm 5)
> Think of yourself as the **Master Chef and General Contractor**. 
> You draw the blueprint of the house on Day 1 morning (`contracts/schema.py`) and hand copies to everyone so they know exact room measurements. When an order arrives, you check your pantry first (3-Tier Cache) to see if you already have the answer ready in 5 milliseconds. If it's a new recipe, you check your map of Samsung settings (SHKG) so users aren't sent to the wrong room. Finally, before anything leaves the kitchen, you inspect every plate (Auto-Repair Validator) to ensure safety and perfect presentation.

### 3. Technical Knowledge Required
- **Python 3.10+ & Pydantic v2:** Data modeling, validation, enums, schema serialization.
- **Data Structures & Algorithms:** Hashing, caching policies, directed graph traversals (`networkx`), shortest-path algorithms.
- **Sentence Transformers & Vector Math:** Embeddings (`all-MiniLM-L6-v2`), cosine similarity, NumPy.
- **System Architecture:** Pipeline orchestration, stubbing, dependency inversion, clean separation of concerns.
- **DevOps & Git:** Docker, Docker Compose, Git feature branching, PR merges, merge conflict resolution.

---

### 4. 📝 5-Question Fit Quiz: Member 1 (Lead Architect)

**Q1: Why must all team-specific metadata (latency, cache hit, confidence breakdown) live inside `meta` rather than inside `Goal` or `Action`?**  
- A) To save memory in Python  
- B) Because Samsung's automated grading script strictly validates the schema of `Goal`/`Action` and rejects unexpected extra fields  
- C) Because Pydantic does not support numbers inside `Action`  
- D) Because the frontend cannot parse nested JSON  

**Q2: In our 3-Tier Cache, what is the primary advantage of Tier-2 Semantic Slot Hashing over Tier-1 Exact MD5 Hashing?**  
- A) Slot hashing is faster than exact MD5 hashing  
- B) Slot hashing produces smaller file sizes  
- C) Different phrasings with identical intent (e.g. "battery dies fast" and "phone charge nahi tik raha") generate the exact same slot hash key  
- D) Slot hashing calls Gemini in the background  

**Q3: What problem does the Settings Hierarchy Knowledge Graph (SHKG) solve?**  
- A) It translates English into Hindi  
- B) It prevents the engine from stopping at broad parent menus (like "Settings > Battery") and resolves down to the exact target leaf screen (like "Settings > Battery > Background usage limits")  
- C) It connects the backend to WiFi  
- D) It generates random deeplinks  

**Q4: Why does Member 1 use stub functions (`_stub_extract()`, `_stub_get_candidate_ids()`) inside `pipeline.py` on Day 2?**  
- A) Because Member 1 doesn't know how to write AI code  
- B) To allow Member 1 to test and execute the entire 8-stage pipeline solo without waiting for Member 2 to finish AI modules  
- C) Because stubs run faster in production  
- D) Because Samsung requires stubs in the final submission  

**Q5: When the Auto-Repair Validator encounters an action description with only 3 words (e.g. "It saves battery"), what does it do?**  
- A) Throws an unhandled exception and crashes the API  
- B) Prompts the LLM again over the network (costing 2 seconds of latency)  
- C) Mechanically pads the sentence in Python with appropriate terms to meet Samsung's 5–7 word requirement in 0.01ms  
- D) Deletes the action from the response  

*(Answers: 1-B, 2-C, 3-B, 4-B, 5-C)*

---

# 🤖 Member 2 (G. Vishal) — AI/ML Engineer

### 1. Detailed Work Description
As the AI/ML Engineer, you own the intelligence layer and natural language understanding:
- **`src/ai/llm_client.py`:** Build a resilient dual-LLM client utilizing Google Gemini 1.5 Flash as primary, with a sub-second circuit breaker falling back to Groq LLaMA-3.3-70B if Gemini takes longer than 4.0 seconds or encounters rate limits.
- **`src/ai/matcher.py`:** Create the catalog retriever scanning `contracts/deeplinks.json` (~575 entries) to produce a constrained shortlist of the top-$k$ candidate IDs.
- **`src/ai/extractor.py`:** Implement retrieval-bound generation where the LLM is **structurally prohibited** from outputting URLs. The prompt presents candidates as an enum; the model selects an ID or assigns null; code deterministically binds the verified URI. Result: **provably 0.0% hallucination rate**.
- **`src/ai/paraphraser.py`:** Build the query variation generator producing 8–10 distinct linguistic phrasings across multiple registers (formal, casual, frustrated, Hinglish) for Samsung spec compliance and cache pre-warming.
- **`src/ai/translator.py`:** Build an order-tolerant, token-set Hinglish normalizer that maps colloquial Indian tech complaints (*"bhai mera phone bohot garam ho raha hai"*) into canonical technical intents (`device overheating`).
- **`src/ai/graph_generator.py`:** Generate the interactive diagnostic decision tree (DAG) nodes and edges with color-coded safety badges (🟢 Safe, 🟡 Caution, 🔴 Critical).
- **`tests/test_ai/`:** Develop standalone unit tests verifying extractor output, timeout handling, and Hinglish parsing.

### 2. 💡 ELI5 (Explain Like I'm 5)
> Think of yourself as the **Genius Translator and Safety Officer**.  
> When users talk to AI, standard chatbots often hallucinate and make up web links that don't exist (leading to 404 errors). Your job is to make the AI smart, fast, and completely safe. You give the AI a closed multiple-choice quiz so it can *never* invent fake URLs. If Google Gemini is slow or sleepy, you wake up Groq LLaMA in half a second. And when someone complains in Indian slang (*"phone garam ho raha hai"*), you instantly translate it into clean technical English.

### 3. Technical Knowledge Required
- **LLM APIs & Prompt Engineering:** Google Generative AI SDK, Groq SDK, system instructions, structured JSON mode.
- **Asynchronous Python (`asyncio`):** Handling async coroutines, timeouts with `asyncio.wait_for`, circuit breaker patterns.
- **Hallucination Prevention:** Retrieval-bound generation, constrained candidate decoding, closed-world assumptions.
- **NLP & Text Processing:** Token-set matching, keyword extraction, register diversity, synthetic query generation.
- **Testing AI Systems:** Mocking API calls, handling non-deterministic outputs, JSON schema compliance testing.

---

### 4. 📝 5-Question Fit Quiz: Member 2 (AI/ML Engineer)

**Q1: How does Fixby's Retrieval-Bound Extractor guarantee a 0.0% URL hallucination rate?**  
- A) By asking Gemini very nicely in the prompt not to lie  
- B) By running a post-generation regex that deletes all URLs  
- C) By structurally prohibiting the LLM from outputting URIs; it only selects an ID from a pre-retrieved candidate enum, and code binds verified links from a certified catalog  
- D) By disabling web access on the server  

**Q2: What happens if Google Gemini takes 4.1 seconds to respond during a live demo?**  
- A) The entire backend freezes and the user gets a 504 Gateway Timeout  
- B) The circuit breaker triggers at 4.0s via `asyncio.wait_for`, canceling Gemini and instantly falling back to Groq LLaMA-3.3-70B  
- C) The server restarts automatically  
- D) The user is asked to re-type their query  

**Q3: Why does Fixby use token-set matching instead of regular expressions (regex) for Hinglish normalization?**  
- A) Regular expressions are deprecated in Python 3  
- B) Token sets don't care about word order or natural word insertions (e.g. handling "battery **bhi** jaldi khatam" vs "jaldi battery khatam")  
- C) Token sets run on the GPU  
- D) Regex cannot handle Hindi characters  

**Q4: In the 8-stage pipeline, why MUST candidate retrieval (`matcher.py`) run BEFORE schema extraction (`extractor.py`)?**  
- A) To save memory on the server  
- B) Because the extractor requires the candidate deeplink IDs as a mandatory prompt argument so the LLM knows which IDs it can pick from  
- C) Because the extractor deletes the database  
- D) Candidate retrieval is optional and can run anytime  

**Q5: What is the dual purpose of the 8–10 query variations produced by `paraphraser.py`?**  
- A) Displaying them as search suggestions AND pre-warming Tier 1 and Tier 3 cache so similar unseen queries hit the 5ms cache later  
- B) Storing them in a database for marketing  
- C) Translating them into Spanish and French  
- D) Sending them to Samsung's email servers  

*(Answers: 1-C, 2-B, 3-B, 4-B, 5-A)*

---

# 🎨 Member 3 (Nidhi Nayana) — Frontend Developer

### 1. Detailed Work Description
As the Frontend Developer, you own the presentation layer and the **6 visible innovations** that win over the judges in the first 30 seconds:
- **`src/frontend/index.html` & `css/style.css`:** Build an authentic Samsung One UI 6.1 Single Page Application with dark mode (`#0a0a0c`), glassmorphism, responsive dual-pane layout, and polished micro-animations.
- **`src/frontend/assets/mock.json`:** Create and maintain your comprehensive mock response fixture so you can build and animate all 6 innovations on Days 1 and 2 without waiting for the backend.
- **`src/frontend/js/phone_3d.js` (Innovation 1):** Construct a Three.js 3D viewport rendering a metallic Samsung Galaxy S24 frame with dynamic lighting and subtle floating animations.
- **`src/frontend/js/oneui_sim.js` (Innovation 1):** Build the One UI settings simulator that animates breadcrumb navigation (`Settings > Battery > Background limits`) and renders a glowing touch-ripple tapping the setting toggle inside the 3D phone screen.
- **`src/frontend/js/dag_viewer.js` (Innovation 2):** Create the interactive diagnostic decision tree flowchart with color-coded nodes (🟢 Safe, 🟡 Caution, 🔴 Critical) and branching paths.
- **`src/frontend/js/hud_inspector.js` (Innovation 3):** Implement the slide-out Engine X-Ray / Judge HUD drawer displaying live latency (184ms), cache tier badges, taxonomy tags, and grounding percentages.
- **`src/frontend/js/qr_bridge.js` (Innovation 4):** Generate real-device dynamic QR codes using QRCode.js so judges holding a physical Galaxy phone can scan the screen to trigger native One UI settings intents live on stage.
- **`src/frontend/js/voice.js` (Innovation 5):** Integrate the Web Speech API for hands-free bilingual (English + Hindi) voice diagnostics with a pulsing Bixby voice orb.
- **`src/frontend/js/baseline_compare.js` (Innovation 6):** Build the side-by-side split-screen modal contrasting standard ChatGPT (hallucinated links, dangerous advice) against Fixby (verified leaf links in 184ms).
- **`src/frontend/js/app.js`:** Orchestrate UI state, managing `mock.json` loading on Days 1–2 and seamlessly switching to the live FastAPI endpoint on Day 3.

### 2. 💡 ELI5 (Explain Like I'm 5)
> Think of yourself as the **Movie Director and Magician**.  
> If an AI team shows up with just black-and-white text in a terminal, judges get bored in 10 seconds. You build the "WOW factor." You put a realistic 3D Samsung Galaxy phone on the screen, make the phone settings slide open automatically with glowing touch taps, create a QR code that opens settings on a real phone in the judge's hand, and show an "X-Ray HUD" that proves how fast the engine is. You make the invisible backend visible and stunning!

### 3. Technical Knowledge Required
- **Modern HTML5 & Semantic Web:** Clean structure, accessibility, modal dialogs, SVG graphics.
- **Modern CSS3:** CSS variables, Flexbox, Grid, Glassmorphism (`backdrop-filter`), keyframe animations, mobile responsiveness.
- **Vanilla JavaScript (ES6+):** Async/await, `fetch` API, DOM manipulation, custom events, modular architecture (zero build tools required).
- **Three.js (WebGL):** 3D scenes, cameras, perspective, mesh geometry, materials, directional lighting, requestAnimationFrame loops.
- **Browser APIs:** Web Speech API (`SpeechRecognition`), Canvas, local JSON fetching.

---

### 4. 📝 5-Question Fit Quiz: Member 3 (Frontend Developer)

**Q1: How can Member 3 build and test all 6 visible innovations on Days 1 and 2 without the backend running?**  
- A) By waiting until Day 3 for the backend to be completed  
- B) By writing mock data directly into `assets/mock.json` matching the frozen contract and loading it locally  
- C) By writing Python backend code themselves  
- D) By taking screenshots of a real phone  

**Q2: In Three.js, what function must be used to continuously rotate the 3D phone model smoothly at 60 frames per second?**  
- A) `setInterval(..., 10)`  
- B) `while (true) { render(); }`  
- C) `requestAnimationFrame(this.animate)`  
- D) `setTimeout(render, 1000)`  

**Q3: In the Samsung-exact schema, where does the actionable deeplink live?**  
- A) Directly as `action.deeplink`  
- B) Inside `action.stepGroups[0].actionableDeeplink.deeplink`  
- C) As a header in the HTTP response  
- D) Inside `meta.deeplink`  

**Q4: Why is it important to use `backdrop-filter: blur(...)` and `#0a0a0c` dark mode styling?**  
- A) It makes the browser download faster  
- B) It replicates the authentic visual language of Samsung One UI 6.1, instantly signaling production-quality software to Samsung judges  
- C) It is required by HTML5 specification  
- D) Three.js only works with dark colors  

**Q5: On Day 3, what is the single code modification Member 3 needs to make to switch from mock data to the live engine?**  
- A) Rewrite `index.html` from scratch  
- B) Change `const USE_LIVE_API = false` to `true` (pointing to `POST http://localhost:8000/v1/troubleshoot`)  
- C) Install Node.js and React  
- D) Delete `css/style.css`  

*(Answers: 1-B, 2-C, 3-B, 4-B, 5-B)*

---

# ⚙️ Member 4 (Rangesh) — Backend & Systems Engineer

### 1. Detailed Work Description
As the Backend & Systems Engineer, you own the network gateway, telemetry collection, and the empirical benchmark:
- **`src/backend/main.py`:** Build the high-performance FastAPI server with non-blocking async routes, clean exception handlers, and proper CORS middleware (`allow_credentials=False` for security).
- **FastAPI Mock Mode (Days 1–2):** Serve `contracts/mock_responses.json` from `POST /v1/troubleshoot` on Day 1, allowing Member 3 to test live HTTP network calls immediately.
- **`src/backend/telemetry.py`:** Build the in-memory telemetry collector tracking total queries, cache hit rates, pipeline source breakdown (`{"live": N, "mock": M}`), and latency percentiles (p50, p95, **and p99**) using NumPy.
- **Endpoints:** Implement `GET /health`, `POST /v1/troubleshoot` (Samsung contract), `POST /v1/feedback` (cache weight adaptation), and `GET /v1/analytics` (engine statistics).
- **`src/backend/benchmark.py`:** Create the self-auditing benchmark harness that executes test queries against the live system, scans every action description for leaked `http://` URLs via regex, computes percentiles, and generates `metrics.md`.
- **`tests/test_backend/`:** Write API integration test suites using FastAPI's `TestClient` and `pytest`.
- **Day 3 Live Swap:** Replace the mock response loader in `main.py` with `run_troubleshoot_pipeline(...)` and verify end-to-end latency.

### 2. 💡 ELI5 (Explain Like I'm 5)
> Think of yourself as the **Race Car Mechanic and Track Marshall**.  
> You build the highway (FastAPI) that connects the user's browser to the AI engine. You make sure the gates are open and safe (CORS). While the car is driving, you have a stopwatch in your hand measuring how fast each lap takes down to the exact millisecond (Telemetry). And at the end of the race, you inspect the car and generate the official, verified scorecard (`metrics.md`) that proves to the judges our car reached top speed with zero safety violations!

### 3. Technical Knowledge Required
- **FastAPI & Starlette:** ASGI lifecycle, route decorators, Pydantic request/response validation, dependency injection.
- **HTTP & Network Protocols:** Status codes, headers, CORS preflight requests (`OPTIONS`), RESTful architecture.
- **Performance & Statistics:** NumPy percentiles (`p50`, `p95`, `p99`), mean vs median, hit rate calculation.
- **Automated Testing & Benchmarking:** `httpx`, FastAPI `TestClient`, `pytest`, latency benchmarking, regex scanning.
- **Systems & File Management:** Working with `.env`, `.gitignore`, environment variable injection, markdown reporting.

---

### 4. 📝 5-Question Fit Quiz: Member 4 (Backend Engineer)

**Q1: Why must CORS middleware in `main.py` set `allow_credentials=False` when `allow_origins=["*"]` is used?**  
- A) Because credentials make Python run slower  
- B) Because browsers strictly reject wildcards (`*`) with credentials (`cookies/auth`) per the official W3C CORS specification  
- C) Because Samsung devices do not support cookies  
- D) To prevent the database from deleting files  

**Q2: In `telemetry.py`, why does Member 4 compute p50, p95, and p99 percentiles instead of only computing the average latency?**  
- A) Because calculating the average is too difficult in Python  
- B) Because an average hides tail latency bottlenecks (e.g., 9 fast queries and 1 stalled query have a misleadingly low average)  
- C) Because Samsung only accepts percentiles  
- D) Because NumPy cannot calculate averages  

**Q3: What makes Member 4's benchmark harness "self-auditing"?**  
- A) It copies numbers from a marketing document  
- B) It evaluates real responses from live API calls, calculates percentiles using NumPy, scans text for leaked URLs with regex, and writes `metrics.md` from actual measured data  
- C) It asks the LLM to rate itself  
- D) It checks the computer's CPU temperature  

**Q4: How does Member 4 unblock Member 3 on Day 1 before Member 1's pipeline is integrated?**  
- A) By asking Member 3 to wait two days  
- B) By running FastAPI in "Mock Mode", returning `contracts/mock_responses.json` from `POST /v1/troubleshoot` at `localhost:8000`  
- C) By sending Member 3 screenshots of Postman  
- D) By mocking the frontend inside Python  

**Q5: On Day 3, what does Member 4 replace inside `src/backend/main.py`?**  
- A) The entire FastAPI application  
- B) The CORS middleware  
- C) The mock JSON file reading block, replacing it with a call to `run_troubleshoot_pipeline(...)`  
- D) The Python virtual environment  

*(Answers: 1-B, 2-B, 3-B, 4-B, 5-C)*

---

# 📊 Role Scoring & Team Assignment Framework

### How to Use This Assessment:
1. **Option A (Self-Assessment):** Each of the 4 team members takes all 4 quizzes (20 questions total).
2. **Option B (Preference-First):** Each member picks their top 2 favorite roles and takes the corresponding two 5-question quizzes.

### Score Interpretation Table:

| Score | Fit Rating | Recommendation |
|:---:|:---|:---|
| **5 / 5** | 🌟 **Ideal Champion** | Take this role immediately. You will lead this domain with high velocity. |
| **4 / 5** | ✅ **Strong Fit** | Excellent choice. Review the 1 missed concept in your member playbook. |
| **3 / 5** | ⚡ **Capable with Guidance** | Good candidate if paired with the playbook's step-by-step tutorial. |
| **≤ 2 / 5** | 🔄 **Consider Alternate Role** | Try taking the quiz for another role that better matches your interests. |

### Tie-Breaking & Ideal Profile Match:
- **Member 1 (Lead):** Choose the person who enjoys architectural design, system boundaries, and git workflow coordination.
- **Member 2 (AI/ML):** Choose the person passionate about LLMs, prompt crafting, and natural language processing.
- **Member 3 (Frontend):** Choose the person with an eye for UI/UX design, visual animations, and presentation aesthetics.
- **Member 4 (Backend):** Choose the person who loves API performance, testing, telemetry, and empirical data validation.

---

### Master Document Directory
- 👑 [Member 1 Playbook](file:///Users/nishant/Downloads/GEN%20AI%20hackathon_Sasmung%20prism/docs/guides/MEMBER_1_LEAD_GUIDE.md)
- 🤖 [Member 2 Playbook](file:///Users/nishant/Downloads/GEN%20AI%20hackathon_Sasmung%20prism/docs/guides/MEMBER_2_AIML_GUIDE.md)
- 🎨 [Member 3 Playbook](file:///Users/nishant/Downloads/GEN%20AI%20hackathon_Sasmung%20prism/docs/guides/MEMBER_3_FRONTEND_GUIDE.md)
- ⚙️ [Member 4 Playbook](file:///Users/nishant/Downloads/GEN%20AI%20hackathon_Sasmung%20prism/docs/guides/MEMBER_4_BACKEND_GUIDE.md)
- 🗺️ [Team Walkthrough & 5-Day Integration Flow](file:///Users/nishant/Downloads/GEN%20AI%20hackathon_Sasmung%20prism/docs/TEAM_WALKTHROUGH.md)
- 📖 [Master Architecture & Integration Plan](file:///Users/nishant/Downloads/GEN%20AI%20hackathon_Sasmung%20prism/docs/MASTER_ARCHITECTURE_AND_INTEGRATION_PLAN.md)
- 🎬 [5-Minute Winning Pitch Demo Script](file:///Users/nishant/Downloads/GEN%20AI%20hackathon_Sasmung%20prism/docs/DEMO_SCRIPT.md)
