// js/gl/atmosphere.js
import * as THREE from 'three';

export function buildAtmosphere(scene, tierSettings, manager) {
  // Volumetric fog
  scene.fog = new THREE.FogExp2(0x05070B, 0.09); // Dense fog at top

  // Ambient & directional light
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);
  
  const dirLight = new THREE.DirectionalLight(0x8FB8FF, 0.8);
  dirLight.position.set(5, 10, 2);
  scene.add(dirLight);

  // Drift planes if tier supports it
  if (tierSettings.fogPlanes > 0) {
    // Generate simple noise texture manually or load one. For now just placeholder geometry.
    const planeGeo = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x1E3A6B,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    for(let i=0; i<tierSettings.fogPlanes; i++) {
      const p = new THREE.Mesh(planeGeo, planeMat);
      p.position.y = - (i * 10) - 2;
      p.rotation.x = -Math.PI / 2;
      scene.add(p);
    }
  }
}
