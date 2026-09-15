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
bloomPass.strength = 1.2;
bloomPass.radius = 0.5;
bloomPass.threshold = 0.1;

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// 3. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const blueLight = new THREE.PointLight(0x4cd7f6, 2, 20);
blueLight.position.set(-5, 5, 5);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0x5d3a9b, 2, 20);
purpleLight.position.set(5, -5, 5);
scene.add(purpleLight);

// 4. Create Abstract Phone Object
const phoneGroup = new THREE.Group();

// Phone Chassis (Dark glossy)
const chassisGeometry = new THREE.BoxGeometry(3.5, 7, 0.4);
const chassisMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x111318,
  metalness: 0.9,
  roughness: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.0
});
const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
phoneGroup.add(chassis);

// Phone Screen (Glowing)
const screenGeometry = new THREE.PlaneGeometry(3.2, 6.7);
const screenMaterial = new THREE.MeshBasicMaterial({
  color: 0x050507, // Very dark
});
const screen = new THREE.Mesh(screenGeometry, screenMaterial);
screen.position.z = 0.21;
phoneGroup.add(screen);

// Screen Edge Glow
const edgesGeometry = new THREE.EdgesGeometry(chassisGeometry);
const edgesMaterial = new THREE.LineBasicMaterial({
  color: 0x5d3a9b,
  linewidth: 2,
  transparent: true,
  opacity: 0.8
});
const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
phoneGroup.add(edges);

scene.add(phoneGroup);

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
}, 0.1)
.to(edgesMaterial.color, {
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
}, 0.4)
.to(edgesMaterial.color, {
  r: colorPrimary.r,
  g: colorPrimary.g,
  b: colorPrimary.b,
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
