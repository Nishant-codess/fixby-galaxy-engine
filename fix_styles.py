import re

with open('src/frontend/css/layout.css', 'a') as f:
    f.write("""
/* Utility Classes for Spacing & Layout */
.mt-4 { margin-top: var(--s-4); }
.mt-6 { margin-top: var(--s-6); }
.mt-8 { margin-top: var(--s-8); }
.mb-2 { margin-bottom: var(--s-2); }
.mb-3 { margin-bottom: var(--s-3); }
.mb-4 { margin-bottom: var(--s-4); }
.mr-2 { margin-right: var(--s-2); }
.mr-3 { margin-right: var(--s-3); }
.mr-4 { margin-right: var(--s-4); }
.ml-auto { margin-left: auto; }
.mr-auto { margin-right: auto; }
.p-2 { padding: var(--s-2); }
.p-3 { padding: var(--s-3); }
.p-4 { padding: var(--s-4); }
.p-5 { padding: var(--s-5); }
.p-8 { padding: var(--s-8); }
.p-0 { padding: 0; }
.px-3 { padding-left: var(--s-3); padding-right: var(--s-3); }
.py-2 { padding-top: var(--s-2); padding-bottom: var(--s-2); }
.py-3 { padding-top: var(--s-3); padding-bottom: var(--s-3); }
.max-w-600 { max-width: 600px; }
.text-center { text-align: center; }
.w-full { width: 100%; }
.bg-transparent { background: transparent; }
.border-none { border: none; }
.outline-none { outline: none; }
.cursor-pointer { cursor: pointer; }
.overflow-x-auto { overflow-x: auto; }
.whitespace-nowrap { white-space: nowrap; }
.flex-shrink-0 { flex-shrink: 0; }
.flex-1 { flex: 1; }
.overflow-y-auto { overflow-y: auto; }
.border-b-edge { border-bottom: var(--glass-edge); }
.min-w-auto { min-width: auto; }
.pointer-events-none { pointer-events: none; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.z-40 { z-index: 40; }
.z-50 { z-index: 50; }
.z-100 { z-index: 100; }
.z-200 { z-index: 200; }
.fixed { position: fixed; }
.absolute { position: absolute; }
.relative { position: relative; }
""")

with open('src/frontend/css/beats.css', 'a') as f:
    f.write("""
/* Specific Beat Layouts */
.preloader-label { color: var(--trace); }
.hero-desc { max-width: 600px; margin-top: var(--s-6); }
.hero-actions { margin-top: var(--s-8); }
.glass-panel-lg { max-width: 600px; padding: var(--s-8); }
.glass-panel-lg.right { margin-left: auto; }
.glass-panel-lg.center { text-align: center; }
.glass-panel-lg.center p { margin: var(--s-4) auto 0; max-width: 600px; }
.beat-metrics { margin-top: var(--s-8); }
.fake-url-box { margin-top: var(--s-6); padding: var(--s-4); }

/* Custom HUD styling */
.hud-progress-bar { display: flex; height: 6px; border-radius: 3px; overflow: hidden; background: rgba(255,255,255,0.1); }
.hud-progress-safe { flex: 0.4; background: var(--safe); }
.hud-progress-trace { flex: 0.3; background: var(--trace); }
.hud-progress-filament { flex: 0.26; background: var(--filament); }
.hud-json-box { margin-top: var(--s-6); }
.hud-json-title { margin-bottom: var(--s-2); }
.hud-json-pre { color: var(--text-mid); }
.qr-modal-content { padding: var(--s-8); position: relative; }
.qr-modal-close-btn { position: absolute; top: 16px; right: 16px; }
.qr-modal-title { margin-bottom: var(--s-4); }
.qr-canvas-box { margin-bottom: var(--s-4); }
.qr-url { color: var(--trace); }
""")

print("Added utility classes to layout.css and beats.css")
