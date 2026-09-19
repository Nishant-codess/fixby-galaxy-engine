// js/choreo/master.js
export function initMasterTimeline(state) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Under reduced motion: Jump to static legible view, disable scrub
    gsap.set(state.camera.position, { y: -26 }); // Jump to cage/console depth
    gsap.set(state.scene.fog, { density: 0.010 });
    
    // Destroy Lenis so native scrolling works normally
    if (window.Lenis) {
      window.dispatchEvent(new CustomEvent('destroy-lenis'));
    }
    return;
  }

  const descent = gsap.timeline({
    scrollTrigger: {
      trigger: '#descent-track',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.1,
      invalidateOnRefresh: true
    }
  });

  // 0 -> 1 normalized timeline
  // Y = -4 (Beat 1 to 2)
  // Y = -12 (Beat 3 to 4)
  // Y = -26 (Beat 6, SHKG descent)
  
  descent
    .to(state.camera.position, { y: -4,  ease: 'none' }, 0.00)
    .to(state.scene.fog,       { density: 0.055, ease: 'none' }, 0.00)
    .to(state.camera.position, { y: -12, ease: 'none' }, 0.28)
    .to(state.scene.fog,       { density: 0.022, ease: 'none' }, 0.28)
    .to(state.camera.position, { y: -26, ease: 'none' }, 0.55)
    .to(state.scene.fog,       { density: 0.010, ease: 'none' }, 0.55)
    
    // In Beat 8 and 10 we might go deeper or stay
    .to(state.camera.position, { y: -30, ease: 'none' }, 0.72)
    .to(state.scene.fog,       { density: 0.005, ease: 'none' }, 0.72);
    
  // Depth Rail Ticks update based on scroll
  const ticks = document.querySelectorAll('.depth-tick');
  if (ticks.length > 0) {
    gsap.to({}, {
      scrollTrigger: {
        trigger: '#descent-track',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const activeIndex = Math.floor(progress * ticks.length);
          ticks.forEach((tick, idx) => {
            if (idx <= activeIndex) {
              tick.classList.add('active');
            } else {
              tick.classList.remove('active');
            }
          });
        }
      }
    });
  }
}
