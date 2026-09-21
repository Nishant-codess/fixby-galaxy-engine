/* src/frontend/js/app.js - Demo Page Master Controller */

// TOGGLE: false = use mock.json, true = fetch live backend API
const USE_LIVE_API = true;
const BACKEND_URL = 'http://localhost:8000/v1/troubleshoot';

class AppController {
  constructor() {
    this.queryInput = document.getElementById('query-input');
    this.searchBtn = document.getElementById('btn-query-search');
    this.resultsContainer = document.getElementById('actions-results-container');
    this.chips = document.querySelectorAll('.chip-btn');

    this.init();
  }

  init() {
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => {
        const query = this.queryInput?.value.trim();
        if (query) this.handleSearch(query);
      });
    }

    if (this.queryInput) {
      this.queryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = this.queryInput.value.trim();
          if (query) this.handleSearch(query);
        }
      });
    }

    this.chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (query && this.queryInput) {
          this.queryInput.value = query;
          this.handleSearch(query);
        }
      });
    });

    // Auto load initial query
    this.handleSearch('battery draining fast');
  }

  async handleSearch(query) {
    this.renderLoading();

    try {
      let rawData;
      if (USE_LIVE_API) {
        const res = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key-123'
          },
          body: JSON.stringify({ query: query })
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        rawData = await res.json();
      } else {
        const res = await fetch('assets/mock.json');
        rawData = await res.json();
        rawData.query = query;
      }

      const data = this.normalizeResponse(rawData);

      this.renderResults(data);

      // Update One UI Sim, DAG, and HUD
      if (data.actions && data.actions.length > 0) {
        window.OneUISimulator?.simulateAction(data.actions[0]);
      }
      if (data.dag) {
        window.DAGViewer?.render(data.dag);
      }
      if (data.meta) {
        window.HUDInspector?.updateMetrics(data.meta);
      }
    } catch (err) {
      console.error('Troubleshoot error:', err);
      this.renderError();
    }
  }

  normalizeResponse(data) {
    if (!data) return { actions: [], meta: {}, dag: null };

    // Flat / mock format
    if (data.actions && Array.isArray(data.actions)) {
      return data;
    }

    // Canonical TroubleshootResponse format
    const actions = [];
    if (data.response && Array.isArray(data.response.contexts)) {
      data.response.contexts.forEach(ctx => {
        if (Array.isArray(ctx.actions)) {
          ctx.actions.forEach(act => {
            const steps = act.stepGroups ? act.stepGroups.flatMap(sg => sg.steps || []) : [];
            const deeplink = act.stepGroups?.[0]?.actionableDeeplink?.deeplink || '';
            actions.push({
              action_name: act.actionName || 'Diagnostic Action',
              description: act.description || '',
              category: (act.category || 'AUTO').toUpperCase(),
              deeplink_target: deeplink,
              steps: steps
            });
          });
        }
      });
    }

    return {
      query: data.query,
      actions: actions,
      meta: data.meta || {},
      dag: data.diagnostic_graph || data.dag || null
    };
  }

  renderLoading() {
    if (!this.resultsContainer) return;
    this.resultsContainer.innerHTML = `
      <div class="action-card" style="opacity: 0.6; animation: fadeIn 0.3s infinite alternate;">
        <div style="height: 20px; width: 60%; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 12px;"></div>
        <div style="height: 14px; width: 85%; background: rgba(255,255,255,0.06); border-radius: 4px;"></div>
      </div>
    `;
  }

  renderResults(data) {
    if (!this.resultsContainer || !data.actions) return;

    let html = '';
    data.actions.forEach((action, idx) => {
      const badgeClass = action.category === 'AUTO' ? 'badge-auto' : action.category === 'CRITICAL' ? 'badge-critical' : 'badge-caution';
      const stepsHtml = (action.steps || []).map((s, i) => `
        <div class="step-item">
          <span class="step-number">${i + 1}</span>
          <span>${s}</span>
        </div>
      `).join('');

      html += `
        <div class="action-card scroll-reveal is-visible" style="animation-delay: ${idx * 100}ms">
          <div class="action-header">
            <h3 class="action-title">${action.action_name}</h3>
            <span class="card-badge ${badgeClass}">${action.category}</span>
          </div>
          <p style="font-size: 0.875rem; color: #94a3b8;">${action.description}</p>
          <div class="step-list">${stepsHtml}</div>
          <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sim" onclick='if(window.trigger3DSimulation) window.trigger3DSimulation()'>
              <svg class="icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Simulate on 3D Phone
            </button>
            <button class="btn btn-secondary" onclick='if(window.QRBridge) window.QRBridge.open("${action.deeplink_target}")'>
              <svg class="icon" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm13-2h3v2h-3zm-3 2h2v3h-2zm3 3h3v3h-3zm-3 0h2v2h-2z"/></svg>
              Scan with Galaxy
            </button>
          </div>
        </div>
      `;
    });

    this.resultsContainer.innerHTML = html;
  }

  renderError() {
    if (!this.resultsContainer) return;
    this.resultsContainer.innerHTML = `
      <div class="action-card" style="border-color: rgba(239,68,68,0.4);">
        <h3 style="color: #ef4444;">Troubleshoot Failed</h3>
        <p style="color: #94a3b8; font-size: 0.875rem;">Unable to connect to diagnostic pipeline. Please check network connection.</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.AppController = new AppController();
});
