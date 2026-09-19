// js/gl/nodefield.js
import * as THREE from 'three';

import { fetchAndLayoutGraph } from '../util/graph-layout.js';

export function buildNodeField(scene, tierSettings, manager) {
  fetchAndLayoutGraph(manager, (graph) => {
    const nodesList = graph.nodes;
    if (nodesList.length === 0) return;
    
    // Scale count if on low tier? We'll just render whatever is in deeplinks
    // as it's only ~283 nodes which is very cheap.
    const COUNT = nodesList.length;
    const geo = new THREE.IcosahedronGeometry(0.07, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4C8DFF, 
      emissive: 0x1E3A6B, 
      emissiveIntensity: 0.6,
      roughness: 0.35, 
      metalness: 0.1
    });
    
    const nodesMesh = new THREE.InstancedMesh(geo, mat, COUNT);
    nodesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    
    nodesList.forEach((n, i) => {
      dummy.position.copy(n.position);
      dummy.updateMatrix();
      nodesMesh.setMatrixAt(i, dummy.matrix);
      
      // Color logic: leaf=ghost, trunk=trace
      if (n.isLeaf) {
        color.setHex(0xFFC46B); // filament/gold for leaves
      } else if (n.depth > 1) {
        color.setHex(0x4C8DFF); // trace for deep branches
      } else {
        color.setHex(0x3C4657); // ghost for root/shallow
      }
      nodesMesh.setColorAt(i, color);
    });
    
    nodesMesh.instanceColor.needsUpdate = true;
    nodesMesh.instanceMatrix.needsUpdate = true;
    
    scene.add(nodesMesh);
    scene.userData.nodes = nodesMesh;
    scene.userData.graph = graph; // store graph for app.js to use
    
    window.highlightDAGPath = function(targetDeeplink) {
      const targetLeaf = nodesList.find(n => n.isLeaf && n.deeplink === targetDeeplink);
      if (!targetLeaf) return;
      
      const targetPath = targetLeaf.path;
      
      nodesList.forEach((n, i) => {
        // Reset colors
        if (n.isLeaf) {
          color.setHex(0xFFC46B);
        } else if (n.depth > 1) {
          color.setHex(0x4C8DFF);
        } else {
          color.setHex(0x3C4657);
        }
        
        // Highlight logic
        if (targetPath.startsWith(n.path)) {
          color.setHex(0xFFFFFF); // Bright white for active path
        }
        
        nodesMesh.setColorAt(i, color);
      });
      nodesMesh.instanceColor.needsUpdate = true;
    };
  });
}
