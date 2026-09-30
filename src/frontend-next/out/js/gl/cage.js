// js/gl/cage.js
import * as THREE from 'three';

export function buildCage(scene, manager) {
  // Wireframe polyhedral cage for Beat 5
  const geo = new THREE.IcosahedronGeometry(1.5, 1);
  const mat = new THREE.LineBasicMaterial({
    color: 0x1E3A6B,
    transparent: true,
    opacity: 0.4
  });
  const wireframe = new THREE.WireframeGeometry(geo);
  const cage = new THREE.LineSegments(wireframe, mat);
  
  // Position it for Beat 5 (Y around -20)
  cage.position.set(0, -20, 0);
  
  // Model presence
  const modelGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const modelMat = new THREE.MeshBasicMaterial({ color: 0x4C8DFF, transparent: true, opacity: 0.8 });
  const modelMesh = new THREE.Mesh(modelGeo, modelMat);
  modelMesh.position.set(-3, -20, 0);
  
  scene.add(cage);
  scene.add(modelMesh);
  
  return { cage, modelMesh };
}
