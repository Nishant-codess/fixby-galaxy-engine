// js/boot.js
import * as THREE from 'three';
import { setupRenderer } from './gl/renderer.js';
import { initMasterTimeline } from './choreo/master.js';
import { buildNodeField } from './gl/nodefield.js';
import { buildAtmosphere } from './gl/atmosphere.js';
import { setupPostProcessing } from './gl/post.js';
import { buildCage } from './gl/cage.js';
import { initBeat06 } from './choreo/beat-06.js';
import { buildDevice } from './gl/device.js';

// Global singletons
export const state = {
  tier: 'mid',
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100),
  renderer: null,
  composer: null,
};

function detectTier() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return 'fallback';
    const mem = navigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    if (window.innerWidth < 900) return 'low';
    if (mem <= 4 || cores <= 4) return 'low';
    if (mem >= 8 && cores >= 8) return 'high';
    return 'mid';
  } catch (e) {
    return 'fallback';
  }
}

export const TIERS = {
  high: { dpr: 2.0, nodes: 575, bloom: true, transmission: true, fogPlanes: 3, aa: 'smaa' },
  mid:  { dpr: 1.5, nodes: 320, bloom: true, transmission: false, fogPlanes: 2, aa: 'smaa' },
  low:  { dpr: 1.0, nodes: 140, bloom: false, transmission: false, fogPlanes: 0, aa: 'none' },
};

function stepTierDown(s) {
  if (s.tier === 'high') {
    s.tier = 'mid';
    s.renderer.setPixelRatio(Math.min(window.devicePixelRatio, TIERS.mid.dpr));
    console.warn('Performance Guard: Stepped down to mid tier');
  } else if (s.tier === 'mid') {
    s.tier = 'low';
    s.renderer.setPixelRatio(Math.min(window.devicePixelRatio, TIERS.low.dpr));
    if (s.composer && s.composer.passes) {
      const bloomPass = s.composer.passes.find(p => p.constructor.name === 'UnrealBloomPass');
      if (bloomPass) bloomPass.enabled = false;
    }
    console.warn('Performance Guard: Stepped down to low tier');
  }
}

// ---  Failsafe preloader dismissal  ---
function dismissPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader || preloader.dataset.dismissed) return;
  preloader.dataset.dismissed = 'true';

  if (typeof gsap !== 'undefined') {
    gsap.to(preloader, {
      opacity: 0, duration: 0.8, onComplete: () => {
        preloader.style.display = 'none';
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(state.camera.position, { y: 10 }, { y: 0, duration: 2, ease: 'power3.out' });
        }
      }
    });
  } else {
    // Raw DOM fallback when GSAP is unavailable
    preloader.style.transition = 'opacity 0.8s ease';
    preloader.style.opacity = '0';
    setTimeout(() => { preloader.style.display = 'none'; }, 800);
  }
}

async function init() {
  state.tier = detectTier();
  if (state.tier === 'fallback') {
    document.body.classList.add('no-webgl');
    dismissPreloader();
    return;
  }

  // Setup LoadingManager
  const manager = new THREE.LoadingManager();
  const progressFill = document.getElementById('load-progress');

  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    if (progressFill) {
      progressFill.style.width = (itemsLoaded / itemsTotal * 100) + '%';
    }
  };

  manager.onLoad = () => {
    dismissPreloader();
  };

  // FAILSAFE: If assets hang for any reason, force-dismiss preloader after 5s
  manager.onError = (url) => {
    console.warn('Asset failed to load:', url, '— continuing anyway.');
  };
  setTimeout(dismissPreloader, 5000);

  // Build Scene
  try {
    setupRenderer(state, TIERS[state.tier]);
    setupPostProcessing(state, TIERS[state.tier]);
    buildNodeField(state.scene, TIERS[state.tier], manager);
    buildAtmosphere(state.scene, TIERS[state.tier], manager);
    const { cage, modelMesh } = buildCage(state.scene, manager);
    state.scene.userData.cage = cage;
    state.scene.userData.modelMesh = modelMesh;
    const device = buildDevice(state.scene, manager);
    state.scene.userData.device = device;
  } catch (err) {
    console.error('Scene build error:', err);
    dismissPreloader();
    return;
  }

  // Setup Lenis & GSAP with graceful degradation
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: false });
      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
      }
    } catch (e) {
      console.warn('Lenis failed to initialize, using native scroll:', e);
      lenis = null;
    }
  } else {
    console.warn('Lenis not loaded — using native browser scroll.');
  }

  // Performance Guard: 60-frame rolling window
  let frameTimes = [];
  let lastTime = performance.now();
  let violations = 0;

  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => {
      if (lenis) lenis.raf(time * 1000);

      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;

      frameTimes.push(delta);
      if (frameTimes.length >= 60) {
        const avg = frameTimes.reduce((a, b) => a + b, 0) / 60;
        frameTimes = [];
        if (avg > 22) {
          violations++;
          if (violations >= 2) {
            violations = 0;
            stepTierDown(state);
          }
        } else {
          violations = 0;
        }
      }
    });

    gsap.ticker.lagSmoothing(0);

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
      try {
        initMasterTimeline(state);
      } catch (e) {
        console.warn('initMasterTimeline failed:', e);
      }
    }
  } else {
    // Fallback render loop without GSAP
    console.warn('GSAP not loaded — scroll animation disabled.');
    if (lenis) {
      function rafLoop(time) {
        lenis.raf(time);
        requestAnimationFrame(rafLoop);
      }
      requestAnimationFrame(rafLoop);
    }
  }

  try {
    initBeat06(state);
  } catch (e) {
    console.warn('initBeat06 failed:', e);
  }

  window.addEventListener('destroy-lenis', () => {
    if (lenis) {
      lenis.destroy();
      console.warn('Performance Guard: Lenis destroyed for reduced-motion');
    }
  });

  window.addEventListener('resize', () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
    if (state.composer) state.composer.setSize(window.innerWidth, window.innerHeight);
  });
}

init();
