/* src/frontend/js/baseline_compare.js - Baseline Comparison Modal Controller */

class BaselineCompareModal {
  constructor() {
    this.overlay = document.getElementById('compare-modal-overlay');
    this.triggerBtn = document.getElementById('btn-compare-trigger');
    this.closeBtn = document.getElementById('compare-modal-close');

    this.init();
  }

  init() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', () => this.open());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
    }
  }

  open() {
    if (this.overlay) this.overlay.classList.add('open');
  }

  close() {
    if (this.overlay) this.overlay.classList.remove('open');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.BaselineCompareModal = new BaselineCompareModal();
});
