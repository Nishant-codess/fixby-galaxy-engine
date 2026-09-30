/* src/frontend/js/scroll-engine.js - Scroll Animation & Observer Engine */

class ScrollEngine {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    // Check if native scroll animation is supported
    const supportsNativeScroll = CSS.supports('animation-timeline', 'view()');
    
    // Always attach IntersectionObserver for cross-browser fallback
    this.setupIntersectionObserver();
    this.setupScrollProgressBar();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.15
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Trigger counter animation if element is a stat counter
          if (entry.target.hasAttribute('data-counter')) {
            window.CounterEngine?.animateCounter(entry.target);
          }
        }
      });
    }, options);

    // Observe all elements with .scroll-reveal class
    document.querySelectorAll('.scroll-reveal, [data-counter]').forEach(el => {
      this.observer.observe(el);
    });
  }

  setupScrollProgressBar() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }, { passive: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.ScrollEngine = new ScrollEngine();
});
