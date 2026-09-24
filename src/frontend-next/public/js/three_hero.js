/* src/frontend/js/three_hero.js - Three.js WebGL 3D Interactive Scene */

class ThreeHeroScene {
  constructor() {
    this.canvas = document.getElementById('hero-webgl-canvas');
    if (!this.canvas || typeof THREE === 'undefined') return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.phoneGroup = null;
    this.particles = null;
    this.grid = null;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;

    this.init();
  }

  init() {
    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.03);

    // 2. Camera Setup
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 8);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x0072de, 4, 20);
    blueLight.position.set(3, 3, 4);
    this.scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 20);
    cyanLight.position.set(-3, -2, 3);
    this.scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2, 20);
    purpleLight.position.set(0, 4, -2);
    this.scene.add(purpleLight);

    // 5. Create 3D Phone Mesh Group
    this.create3DPhone();

    // 6. Create 3D Particle Galaxy Ring
    this.createParticleGalaxy();

    // 7. Create 3D Grid Floor
    this.createGridFloor();

    // 8. Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });

    // 9. Start Animation Loop
    this.animate();
  }

  create3DPhone() {
    this.phoneGroup = new THREE.Group();

    // Phone Body Frame
    const geometry = new THREE.BoxGeometry(2.2, 4.4, 0.22);
    const material = new THREE.MeshStandardMaterial({
      color: 0x111116,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: false
    });
    const phoneBody = new THREE.Mesh(geometry, material);
    this.phoneGroup.add(phoneBody);

    // Outer Glowing Edges (Wireframe Overlay)
    const wireGeo = new THREE.EdgesGeometry(geometry);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    this.phoneGroup.add(wireframe);

    // Screen Plane with Glowing Cyan/Blue Material
    const screenGeo = new THREE.PlaneGeometry(2.05, 4.25);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0072de,
      emissive: 0x003b8e,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.115;
    this.phoneGroup.add(screen);

    // Floating Screen Nodes
    for (let i = 0; i < 4; i++) {
      const nodeGeo = new THREE.BoxGeometry(1.6, 0.6, 0.02);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.7
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(0, 1.2 - i * 0.9, 0.13);
      this.phoneGroup.add(node);
    }

    this.phoneGroup.rotation.x = 0.2;
    this.phoneGroup.rotation.y = -0.3;
    this.scene.add(this.phoneGroup);
  }

  createParticleGalaxy() {
    const count = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color1 = new THREE.Color(0x0072de);
    const color2 = new THREE.Color(0x06b6d4);
    const color3 = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.5;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const mixedColor = color1.clone().lerp(Math.random() > 0.5 ? color2 : color3, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createGridFloor() {
    const size = 30;
    const divisions = 30;
    this.grid = new THREE.GridHelper(size, divisions, 0x0072de, 0x1f1f26);
    this.grid.position.y = -3.5;
    this.grid.material.opacity = 0.25;
    this.grid.material.transparent = true;
    this.scene.add(this.grid);
  }

  onMouseMove(e) {
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    this.targetRotationY = this.mouseX * 0.5;
    this.targetRotationX = this.mouseY * 0.3;
  }

  onScroll() {
    const scrollY = window.scrollY;
    if (this.camera) {
      this.camera.position.z = 8 - scrollY * 0.003;
      this.camera.position.y = -scrollY * 0.002;
    }
  }

  onWindowResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.phoneGroup) {
      this.phoneGroup.rotation.y += (this.targetRotationY - this.phoneGroup.rotation.y + -0.3) * 0.05;
      this.phoneGroup.rotation.x += (this.targetRotationX - this.phoneGroup.rotation.x + 0.2) * 0.05;
      this.phoneGroup.position.y = Math.sin(Date.now() * 0.0015) * 0.15;
    }

    if (this.particles) {
      this.particles.rotation.y += 0.001;
      this.particles.rotation.x += 0.0005;
    }

    if (this.grid) {
      this.grid.position.z = (Date.now() * 0.001) % 1;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ThreeHeroScene();
});
