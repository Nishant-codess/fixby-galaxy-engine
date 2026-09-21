# 🚀 Fixby Galaxy Engine — Developer Task Sheet

> **Project:** Samsung Prism — Gen AI Hackathon  
> **Date:** September 21, 2026  
> **Status:** Phase 2 — Feature Completion & Polish  

---

> **NOTE:** The work completed so far is amazing — solid backend pipeline, working NLP classification, and a functional phone simulator. The tasks below represent the **final push** to turn this into a polished, demo-ready product. Each section is a self-contained workstream.

---

## Table of Contents

1. [UI/UX & App Restructuring (Samsung One UI Focus)](#1-uiux--app-restructuring-samsung-one-ui-focus)
2. [Backend Mapping & Query Efficiency Fixes](#2-backend-mapping--query-efficiency-fixes)
3. [Multilingual Support & System Translation](#3-multilingual-support--system-translation)
4. [Multi-Layered Resolution Tree & Demo Pipeline](#4-multi-layered-resolution-tree--demo-pipeline)
5. [Priority Matrix](#5-priority-matrix)

---

## 1. UI/UX & App Restructuring (Samsung One UI Focus)

### 1.1 Standalone Settings App

> ⚠️ **IMPORTANT:** The Settings app must function **exactly** like a standard Samsung Settings app. Completely **remove** the current Fixby engine integration from the search bar.

**What to do:**
- Rebuild the Settings screen to mirror Samsung One UI's native Settings layout.
- The search bar at the top should behave like a **standard Samsung Settings search** — searching through settings categories/options only (e.g., "Wi-Fi", "Display", "Battery").
- **Remove all Fixby AI/NLP logic** from the search bar. Fixby should have NO presence in the search bar.
- Settings categories, icons, toggles, and sub-screens should match Samsung One UI styling (rounded cards, Samsung color palette, proper typography).

**Acceptance Criteria:**
- [ ] Search bar only filters/searches through settings menu items.
- [ ] No Fixby branding, AI responses, or NLP processing in the search bar.
- [ ] Settings layout matches Samsung One UI design (icons, grouping, toggles, sub-menus).

---

### 1.2 Fixby Floating Action Button (FAB)

**What to do:**
- Implement a **persistent floating Fixby icon** (FAB) in the **bottom-right corner** of the Settings app.
- The FAB should be always visible, hovering above the Settings content.
- It should have a subtle pulse/glow animation to indicate it's interactive.
- Tapping the FAB opens the **Fixby NLP Overlay** (see 1.3 below).

**Design Specs:**
- Position: Bottom-right, ~16px margin from edges.
- Size: ~56px diameter circle.
- Style: Samsung-blue gradient or Fixby brand color with a subtle shadow.
- Icon: Fixby logo or a chat/assistant icon.
- Animation: Gentle floating/pulse animation on idle.

**Acceptance Criteria:**
- [ ] FAB is always visible on the Settings screen (does not scroll away).
- [ ] FAB has a polished design with animation.
- [ ] Tapping opens the Fixby overlay.

---

### 1.3 NLP Interaction & Automated Traversal

> ⚠️ **IMPORTANT:** This is the **core differentiator** of Fixby. When the user asks a question via the FAB overlay, Fixby must **automatically navigate the user to the correct setting** inside the phone simulator.

**What to do:**
- When the FAB is clicked, an **overlay/modal** should appear with a chat-like input field.
- The user types their query in natural language (e.g., *"my camera is blurry"*, *"how to turn on dark mode"*).
- Fixby processes the query via the backend NLP engine.
- Upon receiving the resolution, Fixby **programmatically animates the navigation** through the Settings app:
  - Example: User asks *"how to turn off location"*
  - Fixby shows: `Settings → Privacy → Location → Toggle OFF`
  - The phone simulator **visually walks through each screen** in sequence, highlighting the final destination.
- The overlay should display:
  - The identified issue/intent.
  - The navigation path (breadcrumb-style).
  - A "Navigate Now" button that triggers the animated walkthrough.

**Acceptance Criteria:**
- [ ] Overlay appears on FAB click with a text input field.
- [ ] Query is sent to the backend and response is displayed.
- [ ] Navigation path is shown as a breadcrumb trail.
- [ ] Clicking "Navigate" programmatically walks through the settings screens with visible transitions.
- [ ] Final destination setting is highlighted/focused.

---

### 1.4 Fully Working Phone Simulation

> ⚠️ **CRITICAL:** The project must simulate a **fully functioning Samsung phone**, not just a Settings app wrapper. Users should feel like they're interacting with a real device.

**What to do:**
- **Home Screen:** Implement a Samsung One UI home screen with:
  - Status bar (time, battery, signal icons).
  - Wallpaper background.
  - App icon grid (default Samsung apps).
  - Bottom dock (Phone, Messages, Browser, Camera).
  - Navigation bar (Back, Home, Recent).
- **App Drawer:** Swipe up or tap the app drawer icon to reveal all installed apps in a grid, including:
  - Settings ⚙️
  - Camera 📷
  - Gallery 🖼️
  - Phone 📞
  - Messages 💬
  - Chrome / Samsung Internet 🌐
  - Clock ⏰
  - Calculator 🧮
  - Calendar 📅
  - Files 📁
  - Samsung Notes 📝
- **App Launch:** Tapping the **Settings** app icon from the Home Screen or App Drawer should open the full Settings app (from 1.1).
- **Lock Screen (Optional but Recommended):** A simple lock screen with clock, date, and swipe-to-unlock.

**Acceptance Criteria:**
- [ ] Home Screen renders with Samsung One UI layout.
- [ ] App Drawer opens and displays app icons in a grid.
- [ ] Tapping Settings opens the standalone Settings app.
- [ ] Navigation bar (Back/Home/Recent) is functional.
- [ ] Status bar displays time, battery, and signal indicators.

---

## 2. Backend Mapping & Query Efficiency Fixes

### 2.1 Intent Correction & Domain Mapping

> ⚠️ **WARNING:** The current intent mapping is **highly inefficient**. Example: When a user types *"my phone is overheating"*, the engine routes them to **Network Settings to reset network settings**, which is completely irrelevant. This must be fixed.

**What to do:**
- Audit and fix the intent-to-domain mapping in the backend pipeline.
- Ensure every user query maps to the **most relevant** settings domain:

  | Query Example | ❌ Current Behavior | ✅ Expected Behavior |
  |---|---|---|
  | *"my phone is overheating"* | Network Settings → Reset | Battery → Device Care → Optimization |
  | *"camera is not working"* | Battery Settings | Camera → Permissions / App Settings |
  | *"bluetooth won't connect"* | Battery Settings | Connections → Bluetooth |
  | *"storage is full"* | Battery Settings | Device Care → Storage |

- Implement **domain isolation** — a camera query should NEVER route to battery, a network query should NEVER route to display, etc.
- Add a domain-confidence threshold: if confidence is below threshold, show "I'm not sure, but here are some possibilities" with multiple options.

**Acceptance Criteria:**
- [ ] All 15 benchmark queries in `tests/test_domain_rigidity.py` pass with 0% cross-domain leakage.
- [ ] New queries across all domains return contextually correct results.
- [ ] Low-confidence queries show multiple possible solutions instead of a wrong one.

---

### 2.2 Robust Input Tolerance

**What to do:**
- The backend must gracefully handle:
  - **Vague queries:** *"phone slow"*, *"not working"*, *"help"*
  - **Fragmented context:** *"camera blur sometimes dark"*
  - **Typos & misspellings:** *"camra not wrking"*, *"blu tooth"*, *"overheeting"*
  - **Mixed-language input:** *"mera phone slow hai"* (Hinglish)
- Implement fuzzy matching or edit-distance-based keyword resolution.
- Add a synonym/alias map for common misspellings of tech terms.
- For extremely vague queries, ask a clarifying follow-up question instead of guessing wrong.

**Acceptance Criteria:**
- [ ] Typo-heavy queries (up to 2 character errors per word) still resolve correctly.
- [ ] Vague single-word queries trigger clarification prompts or show top-3 possibilities.
- [ ] Hinglish/mixed queries are understood and routed correctly.

---

## 3. Multilingual Support & System Translation

### 3.1 Supported Languages

| Language | Code | Script | Priority |
|---|---|---|---|
| English | `en` | Latin | ✅ Already working |
| Hindi | `hi` | Devanagari | 🔴 Required |
| Hinglish | `hi-en` | Latin (mixed) | 🔴 Required |
| Korean | `ko` | Hangul | 🔴 Required |

### 3.2 Functional Language Settings

> ⚠️ **IMPORTANT:** Changing the language must update the **entire OS environment**, not just Fixby responses.

**What to do:**
- Add a **Language & Input** setting inside the Settings app.
- When the user switches language:
  - **All Settings menu items** translate (e.g., "Connections" → "कनेक्शन" → "연결").
  - **System app names** translate in the App Drawer.
  - **Status bar text** updates.
  - **Fixby overlay** responds in the selected language.
  - **Keyboard layout** changes script (Latin → Devanagari → Hangul).
- Implement a `TranslationProvider` (React Context) that wraps the entire app and provides translated strings based on the active locale.
- Create translation JSON files:
  ```
  src/frontend-next/public/locales/
  ├── en.json
  ├── hi.json
  ├── hi-en.json   (Hinglish)
  └── ko.json
  ```

**Acceptance Criteria:**
- [ ] Language can be changed from Settings → General Management → Language.
- [ ] All UI text (menus, labels, buttons) updates to the selected language.
- [ ] Fixby NLP overlay accepts queries and responds in the selected language.
- [ ] Keyboard visual changes to match the language script.
- [ ] Translations cover at minimum: all Settings categories, Home Screen labels, App Drawer names, Fixby UI strings.

---

## 4. Multi-Layered Resolution Tree & Demo Pipeline

### 4.1 Comprehensive Solutions (Resolution Tree)

> ⚠️ **IMPORTANT:** Fixby must NOT rely on just **one predefined fix** for a problem. It should present a tree of possible solutions.

**What to do:**
- For every identified issue, the backend should return **multiple resolution paths**, ranked by likelihood/recommendation.
- The frontend should display these as **expandable resolution cards**:
  ```
  🔍 Issue Identified: Camera is blurry
  
  ⭐ Recommended Fix (90% match)
  ├── Clean the camera lens
  ├── Step 1: Use a microfiber cloth...
  ├── Step 2: Check for scratches...
  └── [Watch Demo] [Perform Automatically]
  
  📋 Alternative Fix 1 (72% match)
  ├── Reset Camera App Settings
  ├── Step 1: Go to Settings → Apps → Camera
  ├── Step 2: Tap "Clear Cache"...
  └── [Watch Demo] [Perform Manually]
  
  📋 Alternative Fix 2 (58% match)
  ├── Update Camera Software
  ├── Step 1: Go to Settings → Software Update
  └── [Watch Demo] [Perform Manually]
  ```
- Each fix should have:
  - A confidence/match percentage.
  - Step-by-step instructions.
  - Action buttons (see 4.2).

**Acceptance Criteria:**
- [ ] Backend returns 2–4 ranked solutions per query.
- [ ] Frontend displays solutions as expandable cards with confidence scores.
- [ ] Primary/recommended fix is visually highlighted (star icon, accent border).
- [ ] Alternative fixes are collapsed by default but expandable.

---

### 4.2 Interactive Navigation & "Watch Demo"

**What to do:**
- Each resolution card must feature **two action modes**:

  **🎬 Watch Demo:**
  - Shows a **live visual demonstration** of how to perform the fix on the phone simulator.
  - The phone simulator animates through each navigation step automatically.
  - Example: For *"Clear Camera Cache"* — the demo visually opens Settings → Apps → Camera → Storage → Clear Cache, with each screen transition animated.
  
  **⚡ Perform Automatically:**
  - Fixby executes the fix **programmatically** inside the phone simulator.
  - Instant navigation to the target setting with the action applied.
  - Shows a success confirmation after completion.

  **🔧 Perform Manually:**
  - Displays the step-by-step breadcrumb path.
  - User navigates manually through the Settings app following the highlighted path.
  - Each step shows a checkpoint indicator (✅ when reached).

**Acceptance Criteria:**
- [ ] "Watch Demo" button triggers an animated walkthrough on the phone simulator.
- [ ] "Perform Automatically" navigates directly and applies the setting change.
- [ ] "Perform Manually" shows a guided breadcrumb trail with progress checkpoints.
- [ ] Transitions between screens are smooth and visually clear (~500ms per step).

---

## 5. Priority Matrix

| # | Task | Priority | Complexity | Estimated Effort |
|---|---|---|---|---|
| 1.1 | Standalone Settings App (remove Fixby from search) | 🔴 Critical | Medium | 3–4 hours |
| 1.2 | Fixby FAB | 🔴 Critical | Low | 1–2 hours |
| 1.3 | NLP Overlay + Automated Traversal | 🔴 Critical | High | 6–8 hours |
| 1.4 | Full Phone Simulation (Home Screen, App Drawer) | 🟡 High | High | 8–10 hours |
| 2.1 | Intent Correction & Domain Mapping | 🔴 Critical | Medium | 4–5 hours |
| 2.2 | Robust Input Tolerance (typos, vague queries) | 🟡 High | Medium | 3–4 hours |
| 3.1–3.2 | Multilingual Support (EN/HI/KO + OS translation) | 🟡 High | High | 8–10 hours |
| 4.1 | Multi-Layered Resolution Tree | 🟡 High | Medium | 4–5 hours |
| 4.2 | Watch Demo + Auto/Manual Execution | 🟠 Medium | High | 6–8 hours |

---

## Quick Reference — File Locations

| Component | Path |
|---|---|
| Frontend (Next.js) | `src/frontend-next/` |
| Phone Simulator | `src/frontend-next/src/app/components/PhoneSimulator.tsx` |
| Backend API | `src/backend/main.py` |
| AI Extractor | `src/ai/extractor.py` |
| Taxonomy/Domain Map | `src/core/taxonomy.py` |
| Settings Graph | `src/core/settings_graph.py` |
| Deeplinks Contract | `contracts/deeplinks.json` |
| Domain Rigidity Tests | `tests/test_domain_rigidity.py` |
| Translation Files (to create) | `src/frontend-next/public/locales/*.json` |

---

> **Let's build something incredible. 🚀**  
> If you have questions about any task, reach out before starting to avoid rework.
