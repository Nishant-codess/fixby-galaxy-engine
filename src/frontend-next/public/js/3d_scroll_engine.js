// src/frontend/js/3d_scroll_engine.js

// Ensure GSAP plugins are registered
gsap.registerPlugin(ScrollTrigger);

// 1. Scene Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050507, 0.05);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 12;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 2. Post-Processing (Bloom)
const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // strength
  0.4, // radius
  0.85 // threshold
);
bloomPass.strength = 1.0;
bloomPass.radius = 0.5;
bloomPass.threshold = 0.85; // Increased threshold so only very bright things bloom

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// 3. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x4cd7f6, 2, 20);
blueLight.position.set(-5, 5, 5);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0x5d3a9b, 2, 20);
purpleLight.position.set(5, -5, 5);
scene.add(purpleLight);

// 4. Load 3D Phone Model
const phoneGroup = new THREE.Group();
scene.add(phoneGroup);

const loader = new THREE.GLTFLoader();
console.log("Starting model load: /assets/models/source/Untitled.glb");
loader.load('/assets/models/source/Untitled.glb', function (gltf) {
  console.log("Model loaded successfully!", gltf);
  const model = gltf.scene;
  
  // Scale first
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  
  if (maxDim > 0) {
    const scale = 7 / maxDim;
    model.scale.setScalar(scale);
    console.log(`Scaled model by factor: ${scale}`);
  }
  
  // Recompute box after scaling and center it
  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = scaledBox.getCenter(new THREE.Vector3());
  model.position.sub(center);
  console.log("Centered model at offset:", center);

  // Add gentle extra light to ensure it's visible but not overblown
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
  model.add(hemiLight);

  phoneGroup.add(model);
  console.log("Added model to phoneGroup");
  
  // Remove preloader if it exists
  const preloader = document.getElementById('preloader');
  if (preloader) {
    gsap.to(preloader, {
      opacity: 0,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => preloader.remove()
    });
  }
}, undefined, function (error) {
  console.error('An error happened loading the model:', error);
});

// 5. Create Data Particles
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 1500;
const particlePos = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);

const colorPrimary = new THREE.Color(0x4cd7f6); // Electric Blue
const colorSecondary = new THREE.Color(0x5d3a9b); // Purple
const colorCritical = new THREE.Color(0xffb4ab); // Red/Error

for(let i = 0; i < particleCount; i++) {
  particlePos[i*3] = (Math.random() - 0.5) * 20;
  particlePos[i*3+1] = (Math.random() - 0.5) * 20;
  particlePos[i*3+2] = (Math.random() - 0.5) * 10 - 5;

  const mixedColor = Math.random() > 0.5 ? colorPrimary : colorSecondary;
  particleColors[i*3] = mixedColor.r;
  particleColors[i*3+1] = mixedColor.g;
  particleColors[i*3+2] = mixedColor.b;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);


// 6. GSAP ScrollTrigger Animations

// Set initial states
phoneGroup.position.set(2, -1, 0);
phoneGroup.rotation.set(0.1, -0.3, 0.05);

// Create timeline for the whole page scroll
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5 // Smooth scrubbing
  }
});

// Intro -> Problem Section (Phone moves left, rotates to show side/back, red particles surge)
tl.to(phoneGroup.position, {
  x: -3,
  y: 0,
  z: 2,
  ease: "power2.inOut"
}, 0)
.to(phoneGroup.rotation, {
  x: 0.2,
  y: 2.5, // rotate around to back
  z: 0.1,
  ease: "power2.inOut"
}, 0)
// Color shift particles to red in the problem section
.to(particleMaterial.color, {
  r: colorCritical.r,
  g: colorCritical.g,
  b: colorCritical.b,
  ease: "power1.inOut"
}, 0.1);

// Problem -> Pipeline Section (Phone recedes, returns to blue/purple, moves to right)
tl.to(phoneGroup.position, {
  x: 3,
  y: 1,
  z: -2,
  ease: "power2.inOut"
}, 0.4)
.to(phoneGroup.rotation, {
  x: -0.2,
  y: -0.5,
  z: 0,
  ease: "power2.inOut"
}, 0.4)
.to(particleMaterial.color, {
  r: 1, g: 1, b: 1, // Reset to vertex colors multiplier
  ease: "power1.inOut"
}, 0.4);

// Pipeline -> CTA
tl.to(phoneGroup.position, {
  x: 0,
  y: -2,
  z: 4,
  ease: "power2.inOut"
}, 0.7)
.to(phoneGroup.rotation, {
  x: -0.5,
  y: 0,
  z: 0,
  ease: "power2.inOut"
}, 0.7);


// 7. Render Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Idle floating animation
  phoneGroup.position.y += Math.sin(elapsedTime * 2) * 0.002;
  
  // Rotate particles slowly
  particleSystem.rotation.y = elapsedTime * 0.05;
  particleSystem.rotation.x = elapsedTime * 0.02;

  composer.render();
}
animate();

// 8. Handle Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
