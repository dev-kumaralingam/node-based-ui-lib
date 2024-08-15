import { LitElement, html, css } from 'lit';

class EdgeElement extends LitElement {
  static properties = {
    edge: { type: Object },
    nodes: { type: Array },
  };

  static styles = css`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  `;

  render() {
    if (!this.edge || !this.nodes) return html``;

    const sourceNode = this.nodes.find(node => node.id === this.edge.sourceId);
    const targetNode = this.nodes.find(node => node.id === this.edge.targetId);

    if (!sourceNode || !targetNode) return html``;

    // Get source and target node positions and dimensions
    const { x: x1, y: y1, width: width1, height: height1 } = this._getNodeBounds(sourceNode);
    const { x: x2, y: y2, width: width2, height: height2 } = this._getNodeBounds(targetNode);

    // Calculate the best attachment points based on the relative positions of the nodes
    const [startX, startY] = this._getAttachmentPoint(sourceNode, targetNode, x1, y1, width1, height1);
    const [endX, endY] = this._getAttachmentPoint(targetNode, sourceNode, x2, y2, width2, height2);

    return html`
      <svg width="100%" height="100%">
        <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="black" stroke-width="2" />
      </svg>
    `;
  }

  // Helper function to calculate node bounds
  _getNodeBounds(node) {
    return {
      x: node.x,
      y: node.y,
      width: node.width || 100, // Default width if not provided
      height: node.height || 50, // Default height if not provided
    };
  }

  // Helper function to determine the best attachment point on a node
  _getAttachmentPoint(node, relativeTo, x, y, width, height) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Calculate relative position of the nodes
    const relativeX = relativeTo.x + relativeTo.width / 2 - centerX;
    const relativeY = relativeTo.y + relativeTo.height / 2 - centerY;

    if (Math.abs(relativeX) > Math.abs(relativeY)) {
      // Nodes are more horizontally aligned
      if (relativeX > 0) {
        return [x + width, centerY]; // Connect from the right side
      } else {
        return [x, centerY]; // Connect from the left side
      }
    } else {
      // Nodes are more vertically aligned
      if (relativeY > 0) {
        return [centerX, y + height]; // Connect from the bottom
      } else {
        return [centerX, y]; // Connect from the top
      }
    }
  }
}

customElements.define('edge-element', EdgeElement);
