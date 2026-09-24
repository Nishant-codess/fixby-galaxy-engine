# resolve.md — Fixby Frontend Overhaul
## From "3D background on a scrolling page" to a single continuous descent

**Scope:** Complete visual, motion, and architecture overhaul of `index.html` + `demo.html` and the `css/` + `js/` layer beneath them. This document is written to be executed by an agent in Antigravity with Stitch MCP available, or by a human, in phases.

**Read §1 and §2 before touching code.** The single biggest problem with the current build is not the CSS — it's that the concept doesn't exist yet, so every visual decision is unanchored and defaults to the generic.

---

## Table of Contents

1. [What you're actually building](#1-what-youre-actually-building)
2. [Honest audit of the current build](#2-honest-audit-of-the-current-build)
3. [The concept: The Descent](#3-the-concept-the-descent)
4. [Design token system](#4-design-token-system)
5. [Typography system](#5-typography-system)
6. [The glass system — four tiers, not one class](#6-the-glass-system--four-tiers-not-one-class)
7. [Site architecture — 11 beats](#7-site-architecture--11-beats)
8. [The 3D layer — eight custom elements](#8-the-3d-layer--eight-custom-elements)
9. [Scroll choreography engine](#9-scroll-choreography-engine)
10. [The console (demo.html) overhaul](#10-the-console-demohtml-overhaul)
11. [Copy rewrite — every string on the site](#11-copy-rewrite--every-string-on-the-site)
12. [Performance budget & quality tiers](#12-performance-budget--quality-tiers)
13. [Accessibility & graceful degradation](#13-accessibility--graceful-degradation)
14. [Stitch MCP workflow — exact prompts](#14-stitch-mcp-workflow--exact-prompts)
15. [File structure & build order](#15-file-structure--build-order)
16. [Phased execution plan with a cut list](#16-phased-execution-plan-with-a-cut-list)
17. [Definition of done](#17-definition-of-done)

---

## 1. What you're actually building

Before any aesthetic decision, name the thing precisely, because every good visual choice falls out of this:

> **Fixby takes a vague human sentence and resolves it to one exact coordinate in a tree of ~575 settings screens — and proves it didn't make that coordinate up.**

Three nouns are doing all the work there: **vague**, **descent through a tree**, **proof**.

That's the whole product. Not "AI troubleshooting." Not "precision." The product is *resolution* — in both senses of the word: increasing clarity, and arriving at an answer.

**The design implication, which is the thesis of this entire document:** the website should perform the same operation on the visitor that the engine performs on a query. A visitor arrives confused and high above the problem (vague), descends through structured layers (the tree), and lands on one specific, verified, glowing thing (proof). If the site does that, no judge needs the architecture explained to them — they've just been through it.

This is what unlocks everything else: it tells you the scroll direction is *downward through depth* (not a page scrolling past), it tells you the camera is a character, it tells you color should be *earned* rather than decorative, and it tells you exactly where the single boldest moment goes.

### Audience

Two, and they need different things from the same page:

| Audience | What they need | Where they get it |
|---|---|---|
| **Hackathon judges** (technical, skeptical, 5 minutes) | Proof the engineering is real, fast | Beats 5–7 and 9 — the constrained-generation cage, the SHKG descent, real measured numbers |
| **Anyone who lands on the link later** | To understand the product in 10 seconds | Beat 1 — the hero has to explain the product without jargon |

---

## 2. Honest audit of the current build

Not nitpicks. These are the specific reasons it reads as "amateurish" to you right now.

### Structural

| # | Issue | Why it hurts |
|---|---|---|
| 1 | **The canvas is wallpaper, not content.** `opacity: 0.6`, `pointer-events: none`, `z-index: -1`, and the content sits in glass cards *on top of* it. | Every award-winning 3D site in 2026 makes the canvas the UI itself, not a backdrop. A dimmed 3D scene behind glass cards is indistinguishable from a video background — you pay the full WebGL cost and get a fraction of the impact. |
| 2 | **No smooth-scroll layer.** GSAP ScrollTrigger reads raw native scroll events. | This is *the* single biggest "feels cheap" factor and the easiest fix in the whole document. Raw wheel input is jumpy and stepped; every premium scroll site runs Lenis (or equivalent) so ScrollTrigger reads an interpolated, physics-smoothed value instead. One afternoon of work, enormous perceived-quality delta. |
| 3 | **No pinning, no beats.** Sections are `min-height: 100vh` blocks that scroll past each other. | Content just moves upward. There's no *staging* — no entrance, hold, exit. The 2026 Awwwards pattern that judges reward is narrative pacing: pin a section, play its moment, release. Without pinning you can't choreograph anything, you can only translate it. |
| 4 | **Four sections total.** Hero → Problem → Pipeline → CTA. | You already identified this. There's no room for a story, and worse, the most interesting thing you built (retrieval-bound generation, the SHKG) gets one bullet point each in a list. |
| 5 | **Two hard-navigated pages.** `index.html` → `demo.html` via a link. | The immersion dies at the page boundary. A full reload, a white flash, and the 3D scene rebuilds from scratch. |
| 6 | **Inline styles on nearly every element.** | `style="display: flex; align-items: center; gap: 16px;"` repeated dozens of times means you have no design system, just a token file that nothing enforces. Hierarchy becomes impossible to maintain and every new element drifts. |
| 7 | **`card-glass` is applied to everything.** Nav, cards, chips, the HUD, the query box. | When every surface has the same glass treatment, glass stops encoding hierarchy and becomes noise. Real material systems have tiers. |
| 8 | **The "3D phone" is a CSS div.** `border-radius: 40px` on a `<div>`. | You're loading Three.js, GLTFLoader, and a full post-processing chain on the demo page — and the phone, the thing judges will stare at longest, is a rounded rectangle. |

### Technical

| # | Issue | Why it hurts |
|---|---|---|
| 9 | **Three.js r128 (mid-2021).** | Pre-dates modern color management (`outputColorSpace` / ACES tone mapping), which is why 3D scenes from that era look flat and washed out no matter how you light them. Also no `WebGPURenderer` path, no modern `MeshPhysicalMaterial` transmission improvements — and transmission is exactly what you need for real glass (§8.6). |
| 10 | **Post-processing loaded via `examples/js/`.** | Those global-script builds are deprecated and were removed in later Three versions; you're locked to r128 by this choice. Migrate to an importmap + `three/addons/`, or better, the pmndrs `postprocessing` package which has far better bloom and a proper effect-merging pass. |
| 11 | **Four font families loaded** (Playfair Display, Sora, Geist, Hanken Grotesk). | ~4 families × multiple weights is a real payload cost, and more importantly none of them is doing a distinct job. Cut to two plus one mono. |
| 12 | **No preloader / no `LoadingManager`.** | WebGL sites pop in half-constructed. First impression is a flash of unstyled canvas. |
| 13 | **No DPR cap, no instancing, no quality tiers.** | On a 4K projector or a judge's integrated-GPU laptop this will hitch. A janky 3D site is worse than no 3D site. |
| 14 | **No `prefers-reduced-motion`, no mobile fallback.** | Accessibility floor, and a phone visitor currently gets the worst of both (heavy canvas, broken layout). |

### Content & copy

| # | Issue | Why it hurts |
|---|---|---|
| 15 | **The copy is textbook AI-generated.** "Precision. Absolute." / "The Void of Search" / "Aetheric System Active" / "Enter the Engine". | "Aetheric" means nothing and describes nothing about your product. Grand-abstract-noun headlines are the single most recognizable tell. §11 rewrites all of it. |
| 16 | **Every stylistic cliché is present at once:** ALL-CAPS tracked-out mono eyebrows, `01 / ARCHITECTURE` numbering, `→` glyphs appended to buttons, a one-word gradient-text accent in the headline, near-black `#0b0c10` standing in for black. | Individually fine. All together, on a dark background with a gold gradient, it's the exact cluster that reads as machine-generated. |
| 17 | **The numbered marker `01 / ARCHITECTURE` labels a non-sequence.** | Numbering is information — it should only appear where the content genuinely is a sequence. Ironically, your *pipeline* genuinely is a sequence, and that's the one place numbering is currently absent. |

### One that matters beyond design

| # | Issue |
|---|---|
| 18 | **`demo.html`'s HUD hardcodes `Pipeline Source: MOCK` and styles it green (`--color-safe`).** This directly contradicts the honesty rule in `plan.md` Finding #4 — the whole point of surfacing `pipeline_source` was so a mock fallback is *visibly alarming*, not reassuring. It also hardcodes `184 ms`, `96%`, and `groq/mixtral-8x7b` (a model that isn't in your stack — your `llm_client.py` uses `llama-3.3-70b-versatile`). If a judge opens the HUD and sees static numbers that never change between queries, the credibility of every other claim on the site drops. **Wire the HUD to live response data, and style `MOCK` in `--critical`.** |

---

## 3. The concept: The Descent

### Three concepts considered

I worked through three directions before committing, because the first idea is usually the generic one.

**Concept A — "The Instrument."** The site as precision lab equipment: oscilloscope traces, machined bezels, monospace readouts, calibration marks.
*Rejected.* It's handsome but it describes the *measurement*, not the *product*. And "dark technical dashboard aesthetic" is heavily colonized territory — it would look like every dev-tool landing page from the last three years.

**Concept B — "One UI Cosmos."** Galaxy phone screens floating in space, each a glowing panel you navigate between.
*Rejected.* Pretty, but it's spatially arbitrary — floating panels in space is the default WebGL composition and carries no meaning. It also leans on Samsung's visual identity rather than building Fixby's own.

**Concept C — "The Descent." ✅ Committed.**

### The idea

The entire site is **one continuous downward journey through the settings knowledge graph.**

You begin suspended high above a vast, dim, out-of-focus field of ~575 nodes — the whole Samsung settings tree seen from above, unresolved, foggy, meaningless. As you scroll you *descend*. Fog thins. Nodes sharpen. Structure emerges: the field resolves into a branching tree. You pass through each pipeline stage as a physical stratum of that descent. At the bottom you arrive at exactly one node — lit, gold, named, with a verified deeplink attached. And then the console rises to meet you, so you can do it yourself.

### Why this one

- **It's the product, performed.** Vague → structured → one exact point. The visitor experiences resolution rather than reading about it.
- **Scroll direction is meaningful.** Down means deeper into the tree. Depth in the Z-axis is literal hierarchy depth. Nothing is arbitrary.
- **It's specific to Fixby and can't be lifted.** A fintech site can't use this. That's the test.
- **It solves the two-page problem for free.** The landing page *is* the descent; the console is where you land. Beat 10 makes `demo.html` the destination of the descent rather than a link you click.
- **It gives every technical differentiator a natural stage.** Each pipeline stage is a stratum. The SHKG isn't a bullet point — it's the terrain.
- **It makes color earnable.** High up: desaturated, cold, foggy. Low down: the gold filament of a resolved node. Color arrives as a reward, which is the discipline the frontend-design principles call for — spend boldness in one place.

### The single boldest moment

**Beat 6, the SHKG descent.** Everything else is tuned quiet so this lands: the camera falls down the tree branch by branch — `Settings` → `Display` → `Navigation bar` → `Swipe gestures` — with each parent dimming behind you as you pass it, and the leaf igniting gold on arrival. Roughly 4 seconds of scroll, pinned, no competing UI. That's the shot that ends up in the recording judges remember.

Everything in §4–§9 exists to make that one moment work.

---

## 4. Design token system

Replace `css/tokens.css` wholesale. The current palette (near-black + warm gold gradient on everything) is cliché cluster #2 from the design guidance; this version makes the same warm/cool relationship *semantic* instead of decorative.

### The core idea: color is state, not decoration

Two accents, each with a job:

- **`--trace`** (cold blue) — anything *in motion / searching / unresolved*. Traversal, retrieval, queries in flight.
- **`--filament`** (warm gold) — anything *resolved / verified / arrived*. Leaf nodes, verified deeplinks, confirmed answers.

A visitor never gets told this. They absorb it: cold means looking, warm means found. By beat 8 the arrival reads as triumphant without a single word of copy, because the palette has been teaching them for 60 seconds.

The three safety tiers are already semantic in your backend (`safe` / `caution` / `critical`) — they get their own scale and are used *only* for that, never decoratively.

```css
/* css/tokens.css */
:root {
  /* ——— Depth scale: the descent, bottom of the stack is deepest ——— */
  --void:        #05070B;   /* absolute background, cold not warm black */
  --abyss:       #090D14;   /* section backgrounds */
  --sub:         #0F141D;   /* raised surface */
  --surface:     #161D28;   /* card fill base */
  --edge:        #232C3A;   /* borders, hairlines */
  --edge-lit:    #35425A;   /* hovered / focused borders */

  /* ——— Type ——— */
  --text-hi:     #E9EEF7;   /* headlines, primary */
  --text-mid:    #A9B4C6;   /* body */
  --text-lo:     #6B7789;   /* captions, meta */
  --text-ghost:  #3C4657;   /* disabled, watermark */

  /* ——— The two semantic accents ——— */
  --trace:       #4C8DFF;   /* in motion, searching, unresolved */
  --trace-dim:   #1E3A6B;
  --trace-glow:  #8FB8FF;
  --filament:    #FFC46B;   /* resolved, verified, arrived */
  --filament-dim:#6B4E22;
  --filament-hot:#FFE0AE;

  /* ——— Safety tiers: ONLY for safety semantics, never decoration ——— */
  --safe:        #57D9A3;
  --caution:     #FFAB3F;
  --critical:    #FF5F52;

  /* ——— Glass system (see §6) ——— */
  --glass-vapor-bg:    rgba(14, 20, 30, 0.42);
  --glass-vapor-blur:  blur(28px) saturate(1.5);
  --glass-pane-bg:     rgba(22, 29, 40, 0.62);
  --glass-pane-blur:   blur(14px) saturate(1.3);
  --glass-solid-bg:    rgba(15, 20, 29, 0.94);
  --glass-edge:        1px solid rgba(255, 255, 255, 0.07);
  --glass-edge-lit:    1px solid rgba(140, 180, 255, 0.20);
  --glass-inner-glow:  inset 0 1px 0 rgba(255, 255, 255, 0.08);

  /* ——— Elevation: cold shadow, because the light source is cold ——— */
  --shadow-near:  0 2px 8px rgba(0, 0, 0, 0.5);
  --shadow-mid:   0 12px 32px rgba(0, 0, 0, 0.55);
  --shadow-far:   0 32px 90px rgba(0, 0, 0, 0.7);
  --glow-trace:   0 0 40px rgba(76, 141, 255, 0.28);
  --glow-filament:0 0 48px rgba(255, 196, 107, 0.34);

  /* ——— Radius: three values, each with a job ——— */
  --r-tight:  6px;    /* chips, inline tags, data cells */
  --r-panel:  16px;   /* cards, drawers */
  --r-device: 42px;   /* the phone, and only the phone */

  /* ——— Spatial rhythm (8px base, but with a real scale) ——— */
  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-6: 24px;  --s-8: 32px;  --s-12: 48px; --s-16: 64px;
  --s-24: 96px; --s-32: 128px; --s-48: 192px;

  /* ——— Motion ——— */
  --ease-descend: cubic-bezier(0.16, 1, 0.3, 1);      /* the primary — heavy, settles */
  --ease-snap:    cubic-bezier(0.34, 1.4, 0.64, 1);   /* UI confirmations only */
  --ease-linear:  linear;                              /* scrubbed scroll only */
  --dur-fast: 180ms; --dur-mid: 420ms; --dur-slow: 900ms;
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0ms; --dur-mid: 0ms; --dur-slow: 0ms; }
}
```

**Ban list, enforce in review:** no `rgba(0,0,0,.1)` grey shadows (the SaaS-kit tell), no gradient text on headlines, no radius other than the three above, no accent color used decoratively where it doesn't carry state meaning.

---

## 5. Typography system

Current: Playfair Display + Sora + Geist + Hanken Grotesk. Cut to a pair plus one mono, each with an unambiguous job.

| Role | Family | Why |
|---|---|---|
| **Display** | **Bricolage Grotesque** (variable — width + weight + optical size axes) | Engineered but not sterile; the variable width axis lets a headline compress at large sizes the way real signage does. Crucially it isn't Inter, Sora, or Playfair — the three faces that make a page instantly legible as generated. Free on Google Fonts. |
| **Body / UI** | **Geist** | You already have it, it's excellent, it's quiet, and it sits under Bricolage without competing. |
| **Data** | **Geist Mono** | Same family DNA as body, so the mono doesn't read as a foreign element. |

**Mono is only permitted for actual tabular/machine data:** deeplink URIs, latency figures, node IDs, JSON, cache tier names. It is *not* permitted for eyebrows, labels, or nav — that usage is the template-chrome tell, and it's currently all over both pages.

### Type scale

Modular, ratio 1.333 (perfect fourth), fluid via `clamp()`.

```css
:root {
  --t-display: clamp(3.5rem, 9vw, 8.5rem);   /* beat 1 & 8 only — twice on the whole site */
  --t-h1:      clamp(2.6rem, 5.5vw, 4.6rem);
  --t-h2:      clamp(1.9rem, 3.2vw, 2.9rem);
  --t-h3:      clamp(1.3rem, 1.8vw, 1.6rem);
  --t-body-lg: clamp(1.05rem, 1.25vw, 1.2rem);
  --t-body:    1rem;
  --t-small:   0.875rem;
  --t-micro:   0.75rem;
}

.display {
  font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  font-variation-settings: 'wdth' 92, 'opsz' 48;  /* slight compression at display size */
  font-weight: 700;
  line-height: 0.92;
  letter-spacing: -0.035em;
}

.h2 {
  font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  font-variation-settings: 'wdth' 100, 'opsz' 24;
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

body {
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-mid);
}

.data {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;  /* so live-updating latency doesn't jitter */
  letter-spacing: -0.01em;
}
```

**Measure:** cap body text at `max-width: 62ch`. Currently several blocks run the full container width, which is a large part of why the page reads as unconsidered.

**Type as an active element:** at beats 1 and 8, the display type is not a label sitting on top of the scene — it's *in* the scene (§8.7, the point-cloud text). That's the one place typography and 3D fuse.

---

## 6. The glass system — four tiers, not one class

You asked for more glassmorphism, card blur, etc. The upgrade isn't *more* glass — it's glass that **encodes hierarchy** and, at one specific point, glass that does something CSS genuinely cannot do.

An important technical truth worth knowing before you build this: **`backdrop-filter` cannot refract.** It has ten functions and none of them displace a pixel. Anything advertised as "CSS Liquid Glass" is glassmorphism with a brighter border. Real refraction requires either an SVG `feDisplacementMap` filter (Chromium-only when combined with `backdrop-filter`) or actual 3D transmission material. We use all three approaches, each where it belongs.

### Tier 1 — Vapor (chrome)
Nav bar, HUD drawer, floating controls. Heavy blur, low opacity, barely-there edge. Should feel like it's *not there* until you look at it.

```css
.glass-vapor {
  background: var(--glass-vapor-bg);
  backdrop-filter: var(--glass-vapor-blur);
  -webkit-backdrop-filter: var(--glass-vapor-blur);
  border: var(--glass-edge);
  box-shadow: var(--glass-inner-glow), var(--shadow-mid);
}
```

### Tier 2 — Pane (content)
Content cards, result cards, step cards. More opaque so text is readable, visible top edge highlight to suggest a lit surface.

```css
.glass-pane {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0) 40%),
    var(--glass-pane-bg);
  backdrop-filter: var(--glass-pane-blur);
  -webkit-backdrop-filter: var(--glass-pane-blur);
  border: var(--glass-edge);
  border-radius: var(--r-panel);
  box-shadow: var(--glass-inner-glow), var(--shadow-mid);
}
```

### Tier 3 — Lens (exactly one element on the site)
The query input in the console. Real refraction via SVG displacement, with automatic fallback. This is where you spend the expensive effect — once, on the element the visitor will actually touch.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <filter id="lens-refract" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012"
                  numOctaves="2" seed="7" result="noise"/>
    <feGaussianBlur in="noise" stdDeviation="4" result="softNoise"/>
    <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="14"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
```

```css
.glass-lens {
  background: var(--glass-pane-bg);
  backdrop-filter: blur(10px) saturate(1.4);
  border: var(--glass-edge-lit);
  border-radius: var(--r-panel);
  isolation: isolate;              /* keeps the text layer un-distorted and legible */
  contain: strict;                 /* protects INP — filters are GPU-expensive */
  will-change: transform;
}

@supports (backdrop-filter: url(#lens-refract)) {
  .glass-lens { backdrop-filter: url(#lens-refract) blur(8px) saturate(1.4); }
}
```

Two non-negotiables here, both from hard-won community experience with this effect: keep the text on an isolated layer (`isolation: isolate`) or displacement will make it illegible, and keep the filtered node small and `contain: strict` or you'll tank interaction responsiveness. Also disable the displacement animation entirely under `prefers-reduced-motion`.

### Tier 4 — Solid (data density)
The HUD's metric rows, the JSON viewer, anything with dense small text. **No blur at all.** Glass behind 12px tabular data is a legibility failure — this is the tier people forget to build, and its absence is why data-heavy glass UIs feel muddy.

```css
.glass-solid {
  background: var(--glass-solid-bg);
  border: var(--glass-edge);
  border-radius: var(--r-tight);
}
```

### The premium detail: progressive blur edges

A single `backdrop-filter` has a hard cut-off line where the blur stops, and that hard edge is one of the quietest tells of unrefined work. A stacked, mask-faded set of blur layers eliminates it. Apply at the top of the viewport (under the nav) and the bottom (over the scene).

```css
.progressive-blur {
  position: fixed; left: 0; right: 0; height: 140px;
  pointer-events: none; z-index: 40;
}
.progressive-blur > span {
  position: absolute; inset: 0;
  backdrop-filter: blur(var(--b));
  -webkit-backdrop-filter: blur(var(--b));
  mask-image: linear-gradient(to bottom,
              rgba(0,0,0,1) var(--from), rgba(0,0,0,0) var(--to));
}
/* six layers, each blurring more and masked to a narrower band */
.progressive-blur > span:nth-child(1) { --b: 1px;  --from: 0%;   --to: 25%; }
.progressive-blur > span:nth-child(2) { --b: 2px;  --from: 12%;  --to: 40%; }
.progressive-blur > span:nth-child(3) { --b: 4px;  --from: 25%;  --to: 55%; }
.progressive-blur > span:nth-child(4) { --b: 8px;  --from: 40%;  --to: 70%; }
.progressive-blur > span:nth-child(5) { --b: 16px; --from: 55%;  --to: 85%; }
.progressive-blur > span:nth-child(6) { --b: 28px; --from: 70%;  --to: 100%; }
```

### Noise

Every glass surface gets a very subtle procedural grain overlay (`opacity: 0.025`, an inline SVG `feTurbulence` as a data-URI background). Without it, large blurred areas band visibly on 8-bit displays — and on a projector, banding is extremely obvious.

### One rule that makes or breaks all of it

**Glass needs something behind it.** `backdrop-filter` samples actual content; over an empty section it renders as a flat translucent box no matter how much blur you set. In the current build several glass cards float over dim empty canvas and therefore look like plain dark rectangles. The Descent concept fixes this structurally — there's always a lit node field behind every panel — but check it section by section.

---

## 7. Site architecture — 11 beats

Each beat is a **staged moment**: entrance → hold → exit. Pinned where marked. Scroll length in viewport heights (`vh`) is given so you can budget the total page height.

```
┌── BEAT 0 ── Calibration (preloader)                             0vh   ── not scrolled
│   Real asset progress. Camera drop-in on completion.
├── BEAT 1 ── Above the graph (hero)                            100vh   PIN
│   Fog. 575 dim nodes far below. Hinglish headline in point-cloud type.
├── BEAT 2 ── What vague looks like to a normal model           180vh   PIN
│   Nodes jitter. A fake samsung.com URL materialises, then dissolves to noise.
├── BEAT 3 ── Descent begins · Layer 0: Normalisation           140vh   scrub
│   Camera drops. Hinglish string resolves character-by-character into slots.
├── BEAT 4 ── Layer 1: The cache cascade                        160vh   PIN
│   Three concentric rings. Query passes through. A hit ejects sideways at speed.
├── BEAT 5 ── Layer 2: The cage  ★ TECHNICAL CENTREPIECE        200vh   PIN
│   Candidate deeplink IDs in a visible cage. The model can point, never write.
├── BEAT 6 ── Layer 3: SHKG descent  ★★ EMOTIONAL CENTREPIECE   240vh   PIN
│   Fall down the tree. Parents dim behind. The leaf ignites gold.
├── BEAT 7 ── Layer 4: The verifier                             140vh   scrub
│   Violations struck through and repaired in place. Code, not vibes.
├── BEAT 8 ── Arrival                                           120vh   PIN
│   One gold node, full screen. Deeplink. QR. The phone materialises.
├── BEAT 9 ── Proof                                             120vh   scrub
│   Live measured numbers. Honest. Sourced from metrics.md.
├── BEAT 10 ─ The console rises                                 100vh   PIN
│   Not a link. The console slides up from below and takes over.
└── BEAT 11 ─ Credits                                            80vh
                                                        TOTAL ≈ 1580vh
```

~1580vh is roughly 90–110 seconds of scroll at a comfortable pace. That's the right length for this kind of experience — long enough to be a journey, short enough that a judge reaches the console before they get impatient. **Add a persistent "Skip to console" affordance** in the nav for judges who want the demo immediately; never trap someone in a scroll narrative.

### Depth-marker rail

A thin fixed rail down the left edge showing current depth in the tree, with tick marks at each beat. It's a progress indicator, but it's *diegetic* — it reads as a depth gauge, which reinforces the descent and gives orientation. This is a legitimate use of numbering, unlike the current `01 / ARCHITECTURE` label, because depth genuinely is a sequence.

### Adaptive pacing

A detail that meaningfully separates award-level scroll work from ordinary scroll work: read `lenis.velocity` and adapt. Fast scrolling plays abbreviated transitions so a rushing visitor isn't stuck; slow scrolling reveals secondary detail — node labels fade in, the sub-annotations on each stratum appear. It costs maybe 30 lines and it's the thing that makes the experience feel like it's responding to *you*.

---

## 8. The 3D layer — eight custom elements

All hand-built. No purchased GLB, no downloaded model. Everything below is procedural or shader-driven, which keeps the payload tiny and means it's genuinely yours.

### 8.1 The node field — `InstancedMesh`, 575 nodes, one draw call

The spine of the whole site. Every beat manipulates this object.

```js
const COUNT = 575;
const geo = new THREE.IcosahedronGeometry(0.07, 1);
const mat = new THREE.MeshStandardMaterial({
  color: 0x4C8DFF, emissive: 0x1E3A6B, emissiveIntensity: 0.6,
  roughness: 0.35, metalness: 0.1
});
const nodes = new THREE.InstancedMesh(geo, mat, COUNT);
nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
nodes.setColorAt(i, color);   // per-instance colour = per-node state
```

Node positions are computed from the **real hierarchy**: build the same parent→child paths `settings_graph.py` builds, then lay them out as a 3D radial tree — depth maps to Y (down), siblings fan out in XZ. Feed it your actual `deeplinks.json` paths so the shape on screen is the shape of Samsung's real settings tree. That authenticity is invisible to a casual viewer and immediately obvious to a judge who asks.

Per-instance colour encodes state: `--text-ghost` for dormant, `--trace` for on the active path, `--filament` for resolved leaf.

### 8.2 Traces — animated connection lines

Parent→child edges drawn as `LineSegments2` (fat lines, `three/addons/lines/`) with a custom shader that pushes a bright pulse along the line's UV. During the SHKG descent, the active path's traces pulse gold; everything else stays dim.

```glsl
// fragment — pulse travelling along a line
float head = fract(uProgress);
float d = abs(vLineU - head);
float pulse = smoothstep(0.06, 0.0, d);
vec3 col = mix(uDim, uHot, pulse);
gl_FragColor = vec4(col, uOpacity * (0.25 + pulse * 0.75));
```

### 8.3 Volumetric fog — the unresolved state

`FogExp2` alone is flat. Layer three things:
- `scene.fog = new THREE.FogExp2(0x05070B, density)` where `density` is **scroll-driven** — `0.09` at beat 1, `0.012` by beat 6. Fog literally lifting as you descend is the clarity metaphor made physical.
- Two or three large, slowly-drifting alpha-mapped planes with a noise texture, additive-blended, for volumetric texture.
- A god-ray shaft from above, brightest at beat 1, gone by beat 6.

### 8.4 The cage — beat 5's centrepiece

Your best technical differentiator deserves a real object. A wireframe polyhedral cage containing ~5 floating candidate-ID tokens. Outside the cage, a "model" presence (an abstract pulsing form, not a robot — don't literalize it) reaches toward the cage; a beam extends from it and can only *touch and select* a token inside, never write outside it. When the model tries to reach past the cage's edge, the edge flares `--critical` and the beam is refused.

Sounds elaborate; it's a wireframe `IcosahedronGeometry`, five instanced planes with `CanvasTexture` labels, and one `Line` with an animated endpoint. Half a day's work, and it's the single clearest explanation of retrieval-bound generation anyone will ever produce.

### 8.5 The phone — procedural, with a live screen

Delete the CSS `<div>` phone. Build it:

```js
// Rounded-rect extrusion — no GLB required
const shape = new THREE.Shape();
roundedRect(shape, -0.36, -0.75, 0.72, 1.5, 0.08);
const body = new THREE.ExtrudeGeometry(shape, {
  depth: 0.05, bevelEnabled: true, bevelSize: 0.008,
  bevelThickness: 0.008, bevelSegments: 4
});
const titanium = new THREE.MeshStandardMaterial({
  color: 0x9AA3B0, metalness: 0.95, roughness: 0.28,
  envMap: environmentMap          // an env map is what sells metal — do not skip
});
```

The screen is a separate plane with a **`CanvasTexture`**: render the One UI simulator to an offscreen 2D canvas, `texture.needsUpdate = true` each frame it changes. The result is a real 3D phone, held at a real angle, with a live, animating One UI screen on it — and when the plan navigates to `Settings → Display → Navigation bar`, that happens *on the phone in the 3D scene*. That is the moment worth having on stage.

Add a subtle `MeshPhysicalMaterial` glass layer over the screen with `clearcoat: 1` for the cover-glass reflection.

### 8.6 Real glass — where CSS can't follow

For the hero's floating panels, use `MeshPhysicalMaterial` with `transmission: 1`, `thickness`, `ior: 1.45`, and `roughness: 0.05`. This gives you **actual refraction** of the node field behind the panel — the light-bending that `backdrop-filter` fundamentally cannot do.

This is the strongest answer to "more glassmorphism": put the hero glass in WebGL where refraction is real, and keep CSS glass for the flat UI chrome. Two materially different kinds of glass, each doing what it's best at. Almost nobody does this, because it requires having a 3D scene in the first place — and you already do.

### 8.7 Point-cloud type — scatter and reform

At beats 1 and 8, the display headline is built from GPU points. Sample the text's glyph outlines into ~30k point positions (render the text to an offscreen canvas, read pixel data, emit a point per lit pixel), then drive a vertex shader that lerps each point between a scattered position and its target. Scroll drives the lerp: scattered (unresolved) → formed (resolved).

At beat 1 the headline *arrives* out of chaos. At beat 8 a second one does. Twice, on the whole site — that restraint is what makes it land.

### 8.8 Post-processing chain

Migrate off the deprecated `examples/js/` passes to the pmndrs `postprocessing` package, which merges effects into fewer passes and has a substantially better bloom.

```
RenderPass
 → SelectiveBloom   (ONLY nodes tagged resolved/active — never bloom everything)
 → ChromaticAberration (radial, offset 0.0006 — barely perceptible, adds lens realism)
 → Vignette        (darkness 0.45)
 → Noise           (opacity 0.022, film grain — hides banding on projectors)
 → SMAA
```

Bloom is where 3D sites most commonly go wrong: blooming everything produces a washed-out haze. Selective bloom on the resolved nodes only is what makes the gold filament read as *lit* rather than just bright.

---

## 9. Scroll choreography engine

### Stack

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.3.26/dist/lenis.min.js"></script>
```

Three.js via importmap so you can use modern addons:

```html
<script type="importmap">
{ "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.171.0/examples/jsm/"
}}
</script>
```

### Wiring Lenis to GSAP — get this exactly right

```js
const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: false });

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
```

`lagSmoothing(0)` is the line people miss — without it GSAP tries to compensate for frame drops and fights Lenis, producing exactly the stutter you're trying to eliminate. Also call `ScrollTrigger.refresh()` once fonts and the WebGL scene have finished loading, or every pin will be positioned against a stale layout.

### One master timeline

Don't scatter independent ScrollTriggers. Build a single normalized timeline `0 → 1` representing the full descent, and drive *everything* — camera Y, fog density, node colours, post-processing intensity — from it. This is what makes the site feel like one continuous surface rather than eleven separate animations.

```js
const descent = gsap.timeline({
  scrollTrigger: {
    trigger: '#descent-track',
    start: 'top top', end: 'bottom bottom',
    scrub: 1.1, invalidateOnRefresh: true
  }
});

descent
  .to(camera.position, { y: -4,  ease: 'none' }, 0.00)
  .to(scene.fog,       { density: 0.055, ease: 'none' }, 0.00)
  .to(camera.position, { y: -12, ease: 'none' }, 0.28)
  .to(scene.fog,       { density: 0.022, ease: 'none' }, 0.28)
  .to(camera.position, { y: -26, ease: 'none' }, 0.55)   // SHKG descent
  .to(scene.fog,       { density: 0.010, ease: 'none' }, 0.55)
  .to(bloom,           { intensity: 1.9,  ease: 'none' }, 0.72);
```

Per-beat DOM timelines are separate and pinned, but they read their progress from the same master so nothing desynchronizes.

### Motion discipline

The frontend-design guidance is explicit and correct here: fade-and-slide-up on every section plus hover transitions on every card is the generic default and reads as machine-generated. So:

- **One orchestrated entrance** (beat 0 → 1 camera drop). Not one per section.
- Section content **cross-dissolves in place** with a depth shift rather than sliding up.
- Hover motion exists **only** on genuinely interactive elements (buttons, chips, nodes), and it's a border/glow change, not a transform.
- Every other motion on the site is **scrubbed** — tied to scroll position, so the visitor is causing it. Motion that answers an action is welcome; motion that plays at you is not.

---

## 10. The console (demo.html) overhaul

### It stops being a separate page

Merge `demo.html` into `index.html` as beat 10, or — if you keep the file split for code-organization reasons — do a **shared-element transition**: the WebGL scene persists (same canvas, same renderer), the camera flies to the console position, DOM cross-fades. No white flash, no scene rebuild. Use the View Transitions API where supported and a manual cross-fade elsewhere.

### Layout

```
┌───────────────────────────────────────────────────────────────────────────┐
│  [Fixby]                                    depth ▓▓▓▓▓░  [Engine X-Ray]  │  vapor nav
├───────────────────────────────┬───────────────────────────────────────────┤
│                               │                                           │
│   ╭─────────────────────────╮ │            ╭───────────────╮              │
│   │  ⌕  describe the issue  │ │            │               │              │
│   ╰─────────────────────────╯ │            │   3D phone    │              │
│     glass-lens · the ONE      │            │   live One UI │              │
│     refractive element        │            │   screen      │              │
│                               │            │               │              │
│   [battery] [garam] [camera]  │            ╰───────────────╯              │
│                               │              real geometry                │
│   ╭─ RESOLVED ──────────────╮ │              real env map                 │
│   │ ● Background usage      │ │              live CanvasTexture           │
│   │   limits                │ │                                           │
│   │   Settings › Battery ›  │ │            ▓ depth rail                   │
│   │   Background usage      │ │                                           │
│   │   bixby://masked/0002   │ │                                           │
│   │   [QR]     safe · auto  │ │                                           │
│   ╰─────────────────────────╯ │                                           │
│                               │                                           │
│   ╭─ the graph, live ───────╮ │                                           │
│   │  the SAME 3D node field │ │                                           │
│   │  highlighting the path  │ │                                           │
│   ╰─────────────────────────╯ │                                           │
└───────────────────────────────┴───────────────────────────────────────────┘
```

### The change that matters most

**The DAG is not a separate SVG.** Right now `#dag-canvas` is an empty `<svg>` next to the 3D scene — two competing visualizations of the same thing. Instead: when a query resolves, **the same node field from the landing page lights up the path.** The visitor has already spent 90 seconds learning to read that field. Reusing it means the console needs zero explanation, and it makes the whole site one system rather than a landing page bolted to a tool.

### Query resolution sequence (≈1.4s, and it's the demo's whole value)

| t | What happens |
|---|---|
| 0ms | Input glass-lens edge flares `--trace`. Keystroke ripple. |
| 120ms | Node field: candidate nodes brighten to `--trace`. Others recede. |
| 300ms | Cache tier resolves. If hit: a fast lateral streak, counter snaps green. If cold: traces pulse down through the tree. |
| 600ms | Path traces ignite one branch at a time, top → bottom. |
| 900ms | Leaf node ignites `--filament`. Selective bloom spikes. |
| 1000ms | Result card materializes. Phone screen begins its One UI navigation. |
| 1400ms | QR code draws on. Latency counter settles. |

Under `prefers-reduced-motion`, collapse this to a single 180ms cross-fade with the same end state.

### HUD — fix the credibility problem

Per §2 issue #18, rebuild it against live data:

```js
hud.latency.textContent  = `${meta.latency_ms} ms`;
hud.cacheTier.textContent = meta.cache_tier;
hud.source.textContent    = meta.pipeline_source.toUpperCase();
hud.source.className = meta.pipeline_source === 'mock'
  ? 'data alert-critical'    // MOCK is a WARNING, not a reassurance
  : 'data alert-safe';
hud.model.textContent = meta.model ?? '—';
```

Add a **confidence breakdown bar** — three stacked segments (retrieval / consistency / coverage) summing to the composite score, rather than a single opaque "96%". It shows the score is composed rather than guessed, which is exactly the thing your `scorer.py` does differently from everyone else's, and it's currently invisible.

Add a **live JSON drawer** showing the actual Samsung-schema response. A judge asking "does it really produce the required contract?" gets answered by a button rather than a claim.

---

## 11. Copy rewrite — every string on the site

Current copy is the strongest tell on the page. Replace it all.

### Beat 1 — hero

**Delete:** "Aetheric System Active" / "Precision. Absolute." / "Zero hallucinations. We map natural language directly to exact One UI leaf nodes with sub-200ms latency."

**Replace with** — the product's own premise, in a real user's words. This is the single highest-leverage change in the document:

> ### *"mera phone garam ho raha hai"*
>
> Four words, no technical terms, no idea which setting is wrong.
> Fixby turns it into one tap on the right screen.
>
> `[ Try it ]`   `[ See how ↓ ]`

Why this works: it's concrete, it's specific to the Indian market you're actually building for, it demonstrates the Hinglish capability without claiming it, and any judge understands the product in two seconds. Grand abstract nouns explain nothing; a real complaint explains everything.

Set the Hinglish line in the point-cloud type (§8.7) so it *assembles* out of scattered points on load. The headline being unresolved-then-resolved is the concept in the first three seconds.

### Beat 2 — the failure mode

**Delete:** "The Void of Search" / "Traditional LLMs fabricate paths."

> ### Ask a normal model and it invents a link
>
> Language models are trained on the open web, so when they don't know a
> settings path they write one that looks right. Users tap it. It goes nowhere.
>
> ~~samsung.com/support/battery-fix~~ `— does not exist`

Show the fake URL rendering, then dissolving into noise particles. Don't assert the problem; demonstrate it.

### Beat 5 — the cage

> ### The model never writes a link. It picks one.
>
> Retrieval hands it five verified IDs from Samsung's catalogue and the output
> format accepts nothing else. A fabricated URL isn't filtered out downstream —
> there's no code path that could produce one.

### Beat 6 — the SHKG

> ### Parent menus are the wrong answer
>
> "Go to Settings › Battery" is where most systems stop. The setting the user
> needs is three levels below that. We model the menu tree as a graph and
> resolve to the deepest screen that matches — so the tap lands on the toggle,
> not the folder.

### Beat 8 — arrival

> ### One screen. One tap.
> `bixby://masked/act/0002`
> Settings › Battery › Background usage limits

### Beat 9 — proof

Headline it honestly, and pull the numbers from your real `metrics.md`:

> ### Measured, not claimed
>
> Every number here comes from a 100-query benchmark run, computed from the
> actual responses. The script that generates them is in the repo.

This framing is worth more to a technical judge than bigger numbers would be. It also keeps the site consistent with the honesty standard in `plan.md`.

### Buttons and micro-copy

| Current | Replace with | Why |
|---|---|---|
| "Initialize Demo →" | "Try it" | Says what happens. Drop the `→` glyph — it's template chrome. |
| "Scroll to Initiate ↓" | "See how" | Plain verb. |
| "Enter the Engine" | "Describe an issue" | An empty screen is an invitation to act, not a mood. |
| "Compare Engine" | "Compare with a plain model" | Names the actual comparison. |
| "Engine X-Ray" | Keep — it's good, memorable, and accurate | |

### Empty and error states

Currently: *"Select any query to simulate One UI navigation."* Passive and system-centric. Replace: **"Type an issue, or tap one of the examples."** And an error state that says what went wrong and what to do: **"Couldn't reach the engine. The backend may not be running — try `uvicorn src.backend.main:app`."**

---

## 12. Performance budget & quality tiers

This is not optional. A hackathon demo that stutters on the judge's laptop or a venue projector actively loses you points, and a heavy WebGL scene is the easiest way to get there.

### Budgets

| Metric | Target |
|---|---|
| Time to first meaningful paint | < 1.2s (DOM/CSS first; canvas can follow) |
| Scene ready | < 3.5s on mid-range laptop |
| Sustained FPS | 60 on discrete GPU, ≥ 45 on integrated |
| Draw calls | < 60 |
| Total JS | < 400KB gzipped |
| Texture memory | < 90MB |

### Quality tiers — detect once at boot, never re-detect mid-scroll

```js
function detectTier() {
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return 'fallback';                       // no WebGL2 → static 2D
  const mem = navigator.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (window.innerWidth < 900) return 'low';
  if (mem <= 4 || cores <= 4) return 'low';
  if (mem >= 8 && cores >= 8) return 'high';
  return 'mid';
}

const TIERS = {
  high: { dpr: 2.0, nodes: 575, bloom: true, transmission: true, fogPlanes: 3, aa: 'smaa' },
  mid:  { dpr: 1.5, nodes: 320, bloom: true, transmission: false, fogPlanes: 2, aa: 'smaa' },
  low:  { dpr: 1.0, nodes: 140, bloom: false, transmission: false, fogPlanes: 0, aa: 'none' },
};
renderer.setPixelRatio(Math.min(window.devicePixelRatio, TIERS[tier].dpr));
```

`transmission: true` (real glass refraction) is the most expensive single feature — it forces an extra render pass. High tier only, and swap `MeshPhysicalMaterial` for a cheap fresnel-shaded `MeshStandardMaterial` below that. Visually close, a fraction of the cost.

### Runtime guard

Sample frame time over a rolling 60-frame window. If the average exceeds 22ms for two consecutive windows, step the tier down once (drop DPR first, then bloom, then node count). Never step back up — oscillating quality is more noticeable than low quality.

### Loading

Use `THREE.LoadingManager` and drive the beat-0 progress bar from `onProgress`. **Real progress, not a fake timed bar** — a fake bar that finishes before the scene is ready produces exactly the half-constructed pop-in you have now. Show DOM content first; the canvas fades in behind it when ready.

---

## 13. Accessibility & graceful degradation

Build to the floor without announcing it.

**Reduced motion.** Under `prefers-reduced-motion: reduce`: disable Lenis smoothing entirely (`lenis.destroy()`, restore native scroll), set all scrubbed timelines to their end state, freeze camera motion to static per-section positions, disable the lens displacement animation, keep bloom static. The site must remain *fully comprehensible* — all content reachable, all beats readable as static compositions.

**Keyboard.** Every interactive element focusable with a visible focus ring (`outline: 2px solid var(--trace); outline-offset: 3px`). Nav includes "Skip to console." All beats reachable without scroll-jacking — anchor links work because Lenis wraps native scroll rather than transform-hijacking it (which is precisely why Lenis is the right choice over Locomotive-style implementations).

**Screen readers.** The canvas is `aria-hidden="true"`. Every beat's meaning lives in real DOM text, not in the 3D. The 3D is an amplifier, never the sole carrier of information. `#dag-canvas` and the node field both need a text equivalent of the resolved path.

**Contrast.** Body text on glass must clear 4.5:1 *against the blurred backdrop at its lightest*, not against the token color. Test over the brightest part of the node field. This is where glass UIs usually fail audit — use the Tier-4 solid treatment wherever dense text sits.

**Mobile.** Below 900px, drop to the `low` tier and restructure: the node field becomes a simplified 2D canvas or a static hero image, beats collapse from pinned to stacked-scroll, the phone becomes a flat rendered image. Don't ship a broken desktop layout at 380px.

**No-WebGL fallback.** A designed static page — hero image, all copy, functional console. It should look intentional, not broken.

---

## 14. Stitch MCP workflow — exact prompts

### Be clear about what Stitch is and isn't for here

Stitch generates flat HTML/CSS screens via AI and exposes them through MCP so an agent can fetch the code, fetch screenshots, extract "design DNA" from an existing screen, and generate new screens that match that DNA.

**It will not produce this site.** It cannot generate WebGL, shaders, scroll choreography, or the descent. If you hand it the whole brief you'll get a competent, generic SaaS landing page — the exact thing you're trying to escape.

**Use it for the 2D chrome, which is roughly 40% of the work and the least interesting 40%:** the console layout, result cards, the HUD drawer, the metrics section, forms, footer, empty/error states. Hand-build the canvas, the choreography, and every beat transition. That division is what gets you the speed benefit without the generic penalty.

### Workflow

The consistency pattern is a two-step: extract context from a canonical screen, then generate everything else *using* that context.

**Step 1 — create the project and the canonical screen.** Generate the console first, because it's the most constrained and most component-dense. It becomes your design DNA source.

```
generate_screen_from_text:

"A dark diagnostic console for a mobile-device troubleshooting engine.
Background #05070B. Two-column desktop layout: left column 58% width holds a
search input and results, right column holds a device preview area.

The search input is a rounded 16px panel, background rgba(22,29,40,0.62), 1px
border rgba(140,180,255,0.20), with a search icon button and a microphone icon
button right-aligned inside it. Below it, a row of three small pill-shaped
suggestion chips with 6px radius.

Below that, a stack of result cards. Each result card: 16px radius, background
rgba(22,29,40,0.62), 1px border rgba(255,255,255,0.07), subtle top-edge
highlight gradient. Each card contains a small colored status dot, a title in
semibold sans, a breadcrumb path in muted grey using a chevron separator, a
monospace URI string in a darker inset box with 6px radius, a small QR code
square, and two tiny tag pills at the bottom right.

Typography: headings in Bricolage Grotesque semibold, body in Geist regular,
all numeric and URI data in Geist Mono with tabular figures.

Accent colours used sparingly: cold blue #4C8DFF for anything in progress,
warm gold #FFC46B for anything resolved or verified. Status dots use
#57D9A3 safe, #FFAB3F caution, #FF5F52 critical.

No gradients on text. No all-caps labels. No arrow glyphs in buttons.
Generous spacing, 8px rhythm. Desktop 1440px wide."
```

**Step 2 — extract the DNA.**

```
extract_design_context on the console screen
```

**Step 3 — generate the rest against that context.** Each of these should be prefixed with *"Using the extracted design context from the console screen, generate…"*:

- **HUD drawer:** *"a 340px-wide right-side telemetry drawer with a header row and a close button, then eight metric rows each with a muted label on the left and a monospace value on the right separated by a hairline. One row shows a three-segment horizontal stacked bar labelled retrieval / consistency / coverage. One row's value is styled in the critical red as a warning state. Below, a collapsible code block showing formatted JSON in monospace on a darker inset background."*
- **Metrics / proof section:** *"a full-width band with a short heading and four large monospace figures, each with a small muted caption beneath and a thin horizontal rule above. No cards, no boxes — just figures on the background with generous spacing."*
- **Result card variants:** *"three variants of the result card — one safe state, one caution state, one critical state — differing only in the status dot colour, the tag pill colour, and a left border accent."*
- **Empty and error states:** *"an empty state with a single line of instructional text and three example chips, and an error state with a short problem statement and a monospace command to run. Both centred, both quiet."*
- **Footer:** *"a minimal footer with a wordmark, four team names in a row, a repo link, and a one-line credit. Left aligned, hairline rule above, generous vertical padding."*
- **Mobile console:** *"the console at 390px width, single column, device preview collapsed to a small inline card above the results."*

**Step 4 — harvest, don't paste.** `fetch_screen_code` gives you HTML/CSS. Take the **spacing values, component structure, and class hierarchy**. Rewrite it into your own token-based CSS — do not paste Stitch's output into the repo. Two reasons: Stitch emits utility-heavy flat markup that will fight your token system, and the generated output won't know about your glass tiers, your progressive blur, or your motion rules.

**Step 5 — QA.** `fetch_screen_image` each screen and compare side by side with your built version in Antigravity's browser. If your build has drifted from the design, fix the build; if the design is wrong, regenerate with a sharper prompt rather than hand-patching both.

### Prompt hygiene

Stitch responds much better to **named hex values, explicit pixel radii, and named typefaces** than to adjectives. "Premium and immersive" produces generic output. "16px radius, rgba(22,29,40,0.62) fill, 1px rgba(255,255,255,0.07) border, Geist Mono tabular figures" produces what you asked for. Every prompt above follows that rule.

---

## 15. File structure & build order

```
src/frontend/
├── index.html                 # all 11 beats, one document
├── console.html               # optional split; shares the renderer
├── css/
│   ├── tokens.css             # §4 — rewrite completely
│   ├── reset.css              # new — modern normalize
│   ├── type.css               # §5 — scale + families
│   ├── glass.css              # §6 — four tiers + progressive blur + noise
│   ├── layout.css             # grid, container, beat scaffolding
│   ├── components.css         # buttons, chips, cards, HUD, rail
│   ├── beats.css              # per-beat composition
│   └── responsive.css
├── js/
│   ├── boot.js                # tier detect, LoadingManager, Lenis+GSAP wiring
│   ├── gl/
│   │   ├── renderer.js        # renderer, camera, composer, resize, RAF
│   │   ├── nodefield.js       # §8.1 InstancedMesh from real deeplinks.json
│   │   ├── traces.js          # §8.2 fat lines + pulse shader
│   │   ├── atmosphere.js      # §8.3 fog, drift planes, god ray
│   │   ├── cage.js            # §8.4 beat-5 centrepiece
│   │   ├── device.js          # §8.5 procedural phone + CanvasTexture screen
│   │   ├── glasspanel.js      # §8.6 transmission material
│   │   ├── pointtype.js       # §8.7 scatter/reform text
│   │   └── post.js            # §8.8 effect chain
│   ├── choreo/
│   │   ├── master.js          # §9 the one 0→1 timeline
│   │   ├── beat-01.js … beat-11.js
│   │   └── pacing.js          # velocity-adaptive pacing
│   ├── console/
│   │   ├── query.js           # input, chips, voice
│   │   ├── resolve.js         # the 1.4s resolution sequence
│   │   ├── hud.js             # live telemetry — §10
│   │   ├── results.js         # result cards
│   │   └── qr.js
│   └── util/
│       ├── graph-layout.js    # deeplinks.json → 3D radial tree positions
│       └── a11y.js            # reduced-motion, focus management
└── assets/
    ├── env/studio.hdr         # small env map — metal needs it
    └── mock.json
```

Load order matters: `reset → tokens → type → glass → layout → components → beats → responsive`. Defining `.beat` padding in `layout.css` and again in `beats.css` is exactly the specificity collision to avoid — keep spacing ownership in one file.

---

## 16. Phased execution plan with a cut list

Ordered by impact per hour. If you run out of time, stop at any phase boundary and you still have something coherent.

### Phase 1 — Foundation (≈4h) · **highest impact per hour on the whole list**
1. Install Lenis, wire to GSAP with `lagSmoothing(0)`.
2. Rewrite `tokens.css` (§4). Delete every inline `style=` attribute; move to classes.
3. Cut fonts to Bricolage + Geist + Geist Mono. Implement the type scale.
4. Build the four glass tiers (§6) and replace every `card-glass` with the correct tier.
5. Rewrite hero copy (§11).

**Stop here and the site already feels twice as expensive.** Smooth scroll plus a real type scale plus glass hierarchy is most of the perceived-quality gap.

### Phase 2 — The descent skeleton (≈6h)
6. Migrate Three.js to r171 via importmap; enable ACES tone mapping + correct color space.
7. Build the node field from real `deeplinks.json` paths (§8.1) and the trace lines (§8.2).
8. Scroll-driven fog (§8.3).
9. Master timeline (§9) with camera and fog driven by one 0→1 scrub.
10. Pin beats 1, 2, 6, 8. Stub the rest.
11. Preloader with real `LoadingManager` progress.

### Phase 3 — The two centrepieces (≈6h)
12. Beat 6, SHKG descent — branch-by-branch fall, parents dimming, leaf ignition. **Build this before beat 5.**
13. Beat 5, the cage.
14. Selective bloom + post chain (§8.8).
15. Depth-marker rail.

### Phase 4 — The console (≈6h)
16. Procedural 3D phone with live `CanvasTexture` screen (§8.5).
17. Node field reused as the DAG — delete the separate SVG.
18. The 1.4s resolution sequence (§10).
19. HUD wired to live data, `MOCK` in red, confidence breakdown bar, JSON drawer.
20. Stitch-generated card/HUD/footer chrome harvested into tokens.

### Phase 5 — Polish (≈4h)
21. Point-cloud type at beats 1 and 8 (§8.7).
22. Transmission glass panels, high tier only (§8.6).
23. Progressive blur edges, grain overlay.
24. Velocity-adaptive pacing.
25. Quality tiers + runtime guard (§12).
26. Reduced motion, keyboard, mobile, no-WebGL fallback (§13).

### Cut list — if time runs out, drop in this order

1. Point-cloud type (§8.7) — beautiful, expensive, replaceable with a good static treatment
2. Transmission glass (§8.6) — CSS glass carries it
3. Velocity-adaptive pacing
4. The cage's refused-beam interaction (keep the static cage)
5. Beats 4 and 7 (collapse into scrubbed, non-pinned sections)

**Never cut:** Lenis, the type scale, the glass tiers, beat 6, the live HUD, the reduced-motion path, or the mobile fallback. Those are either the foundation or the floor.

---

## 17. Definition of done

- [ ] Zero inline `style=` attributes in either HTML file
- [ ] Exactly three font families loaded; mono appears only on machine data
- [ ] Four distinct glass tiers in use, each in its correct role; no `card-glass` remains
- [ ] Lenis running, `lagSmoothing(0)` set, `ScrollTrigger.refresh()` after load
- [ ] One master 0→1 timeline drives camera, fog, and post — not eleven independent triggers
- [ ] Node field built from real `deeplinks.json` paths, not random positions
- [ ] Beat 6 lands: a judge watching the recording can point to the moment the leaf ignites
- [ ] The console's DAG is the same node field from the landing page
- [ ] The phone is real 3D geometry with a live screen texture
- [ ] HUD reads live `meta` — no hardcoded numbers, `MOCK` styled as a warning
- [ ] Every number in the proof section traces to a real `metrics.md` run
- [ ] 60fps on a discrete GPU, ≥45fps on integrated, tier-stepping verified by throttling
- [ ] `prefers-reduced-motion` produces a complete, readable, static version
- [ ] Tab-navigable with visible focus; "Skip to console" in the nav
- [ ] 390px mobile layout is designed, not merely unbroken
- [ ] No arrow glyphs in button text, no ALL-CAPS mono eyebrows, no gradient-text headline
- [ ] Someone who has never seen the project understands what Fixby does within 10 seconds of the hero

---

### One last note on restraint

Everything in this document is buildable, but building all of it at maximum intensity would produce something noisier than what you have now. The 2026 award pattern is consistent: the sites that win pick one hard idea and execute it cleanly rather than stacking effects.

Your one hard idea is **the descent to the leaf**. Beat 6 is the site. Every other beat exists to make beat 6 mean something, and every effect that doesn't serve it should be the first thing you cut.

Before you ship, do the Chanel test: look at it, and take one thing off.
