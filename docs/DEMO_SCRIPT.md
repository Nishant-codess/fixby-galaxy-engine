# 🎬 Fixby — Demo Script
### The First 30 Seconds Win the Hackathon

---

## The Principle

> Judges decide in the first 30 seconds. Open mid-action, not with introductions.

---

## Demo Flow (5 Minutes Total)

### 🔴 ACT 1: The Hook (0:00 – 0:30)

**No slides. No introductions. Screen is already live.**

1. **Type a deliberately messy, never-before-seen complaint live on stage:**
   ```
   bhai mera phone bohot garam ho raha hai aur battery bhi jaldi khatam ho jaati hai games khelne ke baad
   ```

2. **Split screen is already showing two panels:**

   | LEFT PANEL: "Naive LLM Baseline" | RIGHT PANEL: "Fixby Engine" |
   |---|---|
   | Raw ChatGPT-style response | Our structured diagnostic plan |
   | ❌ Hallucinated URL: `samsung.com/support/battery` | ✅ Verified deeplink: `bixby://settings/device_care/battery` |
   | ❌ "Go to Settings and find Battery" (which sub-menu?) | ✅ Exact leaf screen: `Settings → Battery → Background Usage Limits` |
   | ❌ Factory reset suggested as step 2 | ✅ Safe fixes first, factory reset gated as last resort |
   | ⏱️ No latency info | ⚡ 184ms (Tier-2 Semantic Slot Cache Hit) |

3. **The 3D Galaxy phone on the right animates the One UI navigation live** — Settings sliding to Battery → Background Usage Limits, with a glowing touch ripple tapping the toggle.

4. **The audience sees the contrast instantly.** No explanation needed.

---

### 🟡 ACT 2: The Engine X-Ray (0:30 – 1:30)

5. **Open the Engine HUD drawer** (click "⚙️ Engine X-Ray"):
   - Show the Hinglish normalization: `"bhai mera phone bohot garam..."` → `device_overheating + battery.rapid_drain`
   - Show the latency gauge: ⚡ 184ms (Tier-2 Slot Hash Hit)
   - Show the grounding badge: `siis_responses.json#42` — 98% grounded
   - Show the confidence breakdown: `retrieval: 0.94 + consistency: 0.90 + coverage: 0.88 = 0.91`

6. **Open the Diagnostic Decision Tree** (click "🌿 Diagnostic Tree"):
   - 🟢 Optimize Device Care → 🟢 Background Usage Limits → 🟡 Safe Mode Boot → 🔴 Factory Reset
   - The active path glows green. Click "Issue persists" — the path branches to the next contingency.

---

### 🟢 ACT 3: The Physical Phone Demo (1:30 – 2:30)

7. **If a Samsung Galaxy phone is available at the venue:**
   - Expand the QR code on any "auto" step
   - Scan the QR code with the phone's camera
   - The phone jumps to the **exact Samsung Settings screen** in real-time
   - *Nothing sells "one-tap" like a phone actually doing it on stage*

8. **If no phone available:** Show the QR code expanding and explain the deeplink flow.

---

### 🔵 ACT 4: Now Introduce the Team & Architecture (2:30 – 4:00)

9. **Only now:** "Hi, we're Fixby from [College Name]."
10. **30-second architecture walkthrough** — point to the live HUD:
    - "Every response is grounded against Samsung's official reference data"
    - "The LLM never writes a URL — it picks from a constrained shortlist of verified deeplink IDs"
    - "Cache hit rate of 80%+ means most queries resolve in under 300ms"
11. **Flash the innovation count:** "9 backend algorithms + 6 visible UI innovations"

---

### ⚡ ACT 5: Second Live Query + Close (4:00 – 5:00)

12. **Type a second query in English this time:**
    ```
    my Galaxy S24 camera keeps crashing when I try to take photos
    ```
13. Point out: **cache miss this time** — cold path runs, HUD shows full pipeline execution
14. Show the One UI simulator navigating to `Apps → Camera → Clear Cache`
15. Close with: **"Fixby. Let me tell you how to fix your Galaxy."**

---

## Pre-Demo Checklist

- [ ] Backend server running (`uvicorn src.backend.main:app --port 8000`)
- [ ] Frontend open in Chrome full-screen (`http://localhost:3000`)
- [ ] Split-screen baseline panel visible (left = naive, right = engine)
- [ ] Cache pre-warmed with 5-10 sample queries for instant demo hits
- [ ] Mic tested if doing voice input demo
- [ ] Samsung Galaxy phone charged and ready (if available)
- [ ] QR code scanner app open on phone
- [ ] Screen resolution set to 1920x1080 for projector
