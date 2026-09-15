/* src/frontend/js/qr_bridge.js - Real Device QR Generator Modal */

class QRBridge {
  constructor() {
    this.overlay = document.getElementById('qr-modal-overlay');
    this.closeBtn = document.getElementById('qr-modal-close');
    this.targetUrlEl = document.getElementById('qr-target-url');
    this.qrCanvasContainer = document.getElementById('qr-canvas-container');

    this.init();
  }

  init() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }
  }

  open(deeplink) {
    if (!this.overlay) return;

    const targetUrl = deeplink || 'intent://com.samsung.android.settings#Intent;scheme=android-app;end';
    if (this.targetUrlEl) this.targetUrlEl.textContent = targetUrl;

    // Render simple SVG QR placeholder / canvas
    if (this.qrCanvasContainer) {
      this.qrCanvasContainer.innerHTML = `
        <svg viewBox="0 0 100 100" style="width: 200px; height: 200px; background: #ffffff; padding: 12px; border-radius: 16px;">
          <rect x="10" y="10" width="25" height="25" fill="#000"/>
          <rect x="15" y="15" width="15" height="15" fill="#fff"/>
          <rect x="18" y="18" width="9" height="9" fill="#000"/>
          <rect x="65" y="10" width="25" height="25" fill="#000"/>
          <rect x="70" y="15" width="15" height="15" fill="#fff"/>
          <rect x="73" y="18" width="9" height="9" fill="#000"/>
          <rect x="10" y="65" width="25" height="25" fill="#000"/>
          <rect x="15" y="70" width="15" height="15" fill="#fff"/>
          <rect x="18" y="73" width="9" height="9" fill="#000"/>
          <rect x="40" y="20" width="8" height="8" fill="#000"/>
          <rect x="50" y="30" width="12" height="12" fill="#000"/>
          <rect x="40" y="50" width="10" height="10" fill="#000"/>
          <rect x="60" y="60" width="15" height="15" fill="#000"/>
          <rect x="45" y="75" width="12" height="12" fill="#000"/>
        </svg>
      `;
    }

    this.overlay.classList.add('open');
  }

  close() {
    if (this.overlay) this.overlay.classList.remove('open');
  }
}

window.QRBridge = new QRBridge();
