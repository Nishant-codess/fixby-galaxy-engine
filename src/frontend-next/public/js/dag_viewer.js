/* src/frontend/js/dag_viewer.js - Interactive SVG Diagnostic Flowchart */

class DAGViewer {
  constructor() {
    this.container = document.getElementById('dag-container');
    this.canvas = document.getElementById('dag-canvas');
  }

  render(dagData) {
    if (!this.canvas || !dagData) return;

    const nodes = dagData.nodes || [];
    const edges = dagData.edges || [];

    let svgContent = `<defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
      </marker>
    </defs>`;

    // Layout node positions (horizontal tree layout)
    const nodePositions = {
      'start': { x: 40, y: 140 },
      'node_auto': { x: 260, y: 70 },
      'node_check': { x: 480, y: 140 },
      'node_deep': { x: 260, y: 210 },
      'node_done': { x: 700, y: 140 }
    };

    // Draw Edges
    edges.forEach(edge => {
      const fromPos = nodePositions[edge.from] || { x: 100, y: 100 };
      const toPos = nodePositions[edge.to] || { x: 300, y: 100 };

      svgContent += `
        <path class="dag-edge" d="M ${fromPos.x + 120} ${fromPos.y + 20} C ${fromPos.x + 180} ${fromPos.y + 20}, ${toPos.x - 40} ${toPos.y + 20}, ${toPos.x} ${toPos.y + 20}" marker-end="url(#arrow)" />
        <text x="${(fromPos.x + toPos.x) / 2 + 30}" y="${(fromPos.y + toPos.y) / 2 + 10}" fill="#64748b" font-size="10" font-family="sans-serif">${edge.label}</text>
      `;
    });

    // Draw Nodes
    nodes.forEach(node => {
      const pos = nodePositions[node.id] || { x: 100, y: 100 };
      const isStart = node.type === 'entry';
      const isDone = node.type === 'terminal';
      const strokeColor = isStart ? '#10b981' : isDone ? '#3b82f6' : '#64748b';

      svgContent += `
        <g class="dag-node-group" style="cursor: pointer;">
          <rect class="dag-node" x="${pos.x}" y="${pos.y}" width="140" height="40" rx="8" stroke="${strokeColor}" />
          <text x="${pos.x + 12}" y="${pos.y + 24}" fill="#f8fafc" font-size="11" font-weight="600" font-family="sans-serif">${node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}</text>
        </g>
      `;
    });

    this.canvas.innerHTML = svgContent;
  }
}

window.DAGViewer = new DAGViewer();
