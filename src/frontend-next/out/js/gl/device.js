// js/gl/device.js
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function buildDevice(scene, manager) {
  const deviceGroup = new THREE.Group();
  deviceGroup.position.set(0, -30, 0); // Position at Beat 10

  const gltfLoader = new GLTFLoader(manager);
  gltfLoader.load('assets/models/source/Untitled.glb', (gltf) => {
    const phone = gltf.scene;
    // Scale and orient the model to fit the scene
    phone.scale.set(5, 5, 5); 
    phone.position.set(0, 0, 0);
    // Rotate to face front (might need adjustment based on GLB origin)
    phone.rotation.set(0, 0, 0);
    
    deviceGroup.add(phone);
    
    // Attempt to load HDR for the GLB model
    try {
      const rgbeLoader = new RGBELoader(manager);
      rgbeLoader.setPath('./assets/env/');
      rgbeLoader.load('studio.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        phone.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.envMap = texture;
            child.material.needsUpdate = true;
          }
        });
      }, undefined, (err) => {
        console.warn('HDR env map failed to load', err);
      });
    } catch (e) {
      console.warn('RGBELoader error:', e);
    }
  }, undefined, (err) => {
    console.error('Failed to load Untitled.glb', err);
  });

  // Live Screen Texture
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Base One UI Mock
  ctx.fillStyle = '#05070B';
  ctx.fillRect(0, 0, 512, 1024);
  
  ctx.fillStyle = '#161D28';
  ctx.beginPath();
  ctx.roundRect(32, 100, 512 - 64, 80, 24);
  ctx.fill();
  
  ctx.fillStyle = '#4C8DFF';
  ctx.beginPath();
  ctx.roundRect(32, 200, 512 - 64, 80, 24);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const screenGeo = new THREE.PlaneGeometry(2.6, 5.6);
  const screenMat = new THREE.MeshBasicMaterial({
    map: texture
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.z = 0.16;
  deviceGroup.add(screen);
  
  // Expose texture so external scripts (One UI Sim) can draw to it
  deviceGroup.userData.screenContext = ctx;
  deviceGroup.userData.screenTexture = texture;
  window.OneUIScreen = { context: ctx, texture: texture };
  
  scene.add(deviceGroup);
  
  // Hover animation
  gsap.to(deviceGroup.position, {
    y: "-=0.1",
    duration: 2,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

  return deviceGroup;
}
