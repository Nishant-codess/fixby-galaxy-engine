/* src/frontend/js/counter.js - Animated Number Counters */

class CounterEngine {
  constructor() {
    this.animatedElements = new Set();
  }

  animateCounter(element) {
    if (this.animatedElements.has(element)) return;
    this.animatedElements.add(element);

    const targetValue = parseFloat(element.getAttribute('data-counter'));
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const decimals = parseInt(element.getAttribute('data-decimals') || '0', 10);
    const duration = 1400; // ms
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutQuart
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      const currentValue = (targetValue * easedProgress).toFixed(decimals);

      element.textContent = `${prefix}${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = `${prefix}${targetValue.toFixed(decimals)}${suffix}`;
      }
    };

    requestAnimationFrame(update);
  }
}

window.CounterEngine = new CounterEngine();
