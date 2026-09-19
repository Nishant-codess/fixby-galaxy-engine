// src/frontend/js/util/graph-layout.js
import * as THREE from 'three';

export function fetchAndLayoutGraph(manager, callback) {
  const loader = new THREE.FileLoader(manager);
  loader.load('./assets/deeplinks.json', (text) => {
    try {
      const data = JSON.parse(text);
      const root = { name: 'Root', children: {}, depth: 0, path: '' };
      const nodesList = [];
      let idCounter = 0;
      
      function addNode(parts, current, originalItem) {
        if (parts.length === 0) return;
        const part = parts[0];
        if (!current.children[part]) {
          current.children[part] = {
            id: idCounter++,
            name: part,
            children: {},
            depth: current.depth + 1,
            path: current.path ? `${current.path}>${part}` : part,
            isLeaf: false
          };
          nodesList.push(current.children[part]);
        }
        if (parts.length === 1) {
          current.children[part].isLeaf = true;
          current.children[part].deeplink = originalItem.deeplink;
        }
        addNode(parts.slice(1), current.children[part], originalItem);
      }
      
      data.forEach(item => {
        if (item.classes && item.classes.path) {
          const parts = item.classes.path.split('>');
          addNode(parts, root, item);
        }
      });
      
      const nodesByDepth = {};
      nodesList.forEach(n => {
        if (!nodesByDepth[n.depth]) nodesByDepth[n.depth] = [];
        nodesByDepth[n.depth].push(n);
      });
      
      nodesList.forEach(n => {
        const peers = nodesByDepth[n.depth];
        const index = peers.indexOf(n);
        const angle = (index / peers.length) * Math.PI * 2;
        const radius = 1.0 + (n.depth * 0.8) + (Math.random() * 0.2); 
        
        n.position = new THREE.Vector3(
          Math.cos(angle) * radius,
          -n.depth * 5, 
          Math.sin(angle) * radius
        );
      });
      
      callback({ nodes: nodesList, root });
    } catch (err) {
      console.error(err);
      callback({ nodes: [], root: null });
    }
  });
}
