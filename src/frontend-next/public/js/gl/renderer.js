// js/gl/renderer.js
import * as THREE from 'three';

export function setupRenderer(state, tierSettings) {
  const canvas = document.getElementById('webgl-canvas');
  state.renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: false, // We'll use post-processing SMAA or no AA on low tier
    alpha: true 
  });
  
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, tierSettings.dpr));
  
  // Modern color management
  state.renderer.outputColorSpace = THREE.SRGBColorSpace;
  state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  state.renderer.toneMappingExposure = 1.0;
  
  state.camera.position.z = 2; // Default viewing distance
  
  const clock = new THREE.Clock();
  
  const render = () => {
    const elapsed = clock.getElapsedTime();
    if (state.postUniforms) {
      state.postUniforms.time.value = elapsed;
    }
    
    if (state.composer) {
      state.composer.render();
    } else {
      state.renderer.render(state.scene, state.camera);
    }
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}
