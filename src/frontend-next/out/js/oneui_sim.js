/* src/frontend/js/oneui_sim.js - One UI Phone Simulator Controller */

class OneUISimulator {
  constructor() {
    this.screenContent = document.getElementById('phone-screen-content');
  }

  simulateAction(action) {
    if (!this.screenContent || !action) return;

    const steps = action.steps || [];
    const target = action.deeplink_target || 'com.android.settings';

    // Update Breadcrumb & Header
    let html = `
      <div class="oneui-header">
        <div class="oneui-breadcrumb">Target: ${target}</div>
        <div class="oneui-title">${action.action_name}</div>
      </div>
      <div style="margin-top: 12px;">
    `;

    steps.forEach((step, index) => {
      const isLast = index === steps.length - 1;
      html += `
        <div class="oneui-setting-item ${isLast ? 'active-step' : ''}" id="sim-step-${index}">
          <div>
            <div style="font-weight: 600; font-size: 0.875rem;">Step ${index + 1}</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">${step}</div>
          </div>
          ${isLast ? '<div class="oneui-switch on"></div>' : '<div style="color: #64748b; font-size: 0.75rem;">▶</div>'}
        </div>
      `;
    });

    html += `</div>`;
    this.screenContent.innerHTML = html;

    // Trigger pulse tap on last item
    const lastEl = document.getElementById(`sim-step-${steps.length - 1}`);
    if (lastEl) {
      lastEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  reset() {
    if (!this.screenContent) return;
    this.screenContent.innerHTML = `
      <div style="text-align: center; margin-top: 80px; color: #64748b;">
        <svg class="icon" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;" viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
        <div style="font-size: 0.875rem; font-weight: 600;">One UI 6.1 Simulator</div>
        <div style="font-size: 0.75rem; margin-top: 4px;">Click "Simulate on Phone" on any action card to see step navigation</div>
      </div>
    `;
  }
}

window.OneUISimulator = new OneUISimulator();
