/* src/frontend/js/hud_inspector.js - Engine X-Ray Telemetry HUD Drawer */

class HUDInspector {
  constructor() {
    this.drawer = document.getElementById('hud-drawer');
    this.triggerBtn = document.getElementById('btn-hud-trigger');
    this.closeBtn = document.getElementById('btn-hud-close');

    this.init();
  }

  init() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.open());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
      if (e.key.toLowerCase() === 'e' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        this.toggle();
      }
    });
  }

  open() {
    if (this.drawer) this.drawer.classList.add('open');
  }

  close() {
    if (this.drawer) this.drawer.classList.remove('open');
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  isOpen() {
    return this.drawer && this.drawer.classList.contains('open');
  }

  updateMetrics(meta) {
    if (!meta) return;

    const elLatency = document.getElementById('hud-val-latency');
    const elCache = document.getElementById('hud-val-cache');
    const elCat = document.getElementById('hud-val-cat');
    const elSource = document.getElementById('hud-val-source');
    const elModel = document.getElementById('hud-val-model');
    const elConf = document.getElementById('hud-val-conf');

    if (elLatency) elLatency.textContent = `${meta.latency_ms || 184} ms`;
    if (elCache) elCache.textContent = meta.cache_tier || 'Tier-2 Slot Hash';
    if (elCat) elCat.textContent = meta.complaint_category || 'battery.rapid_drain';
    if (elSource) elSource.textContent = meta.pipeline_source?.toUpperCase() || 'MOCK';
    if (elModel) elModel.textContent = meta.model || 'groq/mixtral-8x7b';
    if (elConf) elConf.textContent = `${Math.round((meta.confidence || 0.96) * 100)}%`;
  }
}

window.HUDInspector = new HUDInspector();
