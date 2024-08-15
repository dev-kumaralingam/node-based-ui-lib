import { LitElement, html, css } from 'lit';
import './node-element.js';
import './edge-element.js';

class MindMapApp extends LitElement {
  static properties = {
    nodes: { type: Array },
    edges: { type: Array },
    connectingNodeId: { type: Number },
  };

  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100vh;
    }
    .create-button {
      position: absolute;
      top: 10px;
      left: 10px;
    }
  `;

  constructor() {
    super();
    this.nodes = [];
    this.edges = [];
    this.connectingNodeId = null;
  }

  render() {
    return html`
      <button class="create-button" @click=${this._createNode}>Create Node</button>
      ${this.edges.map(edge => html`
        <edge-element .edge=${edge} .nodes=${this.nodes}></edge-element>
      `)}
      ${this.nodes.map(node => html`
        <node-element
          .node=${node}
          .isConnecting=${this.connectingNodeId === node.id}
          @nodeupdate=${this._handleNodeUpdate}
          @connectrequest=${this._handleConnectRequest}
          @deletenode=${(e) => this._deleteNode(e.detail.id)}
          @click=${() => this._handleNodeClick(node.id)}
        ></node-element>
      `)}
    `;
  }

  _createNode() {
    const nodeName = prompt('Enter node name:');
    if (nodeName) {
      const newNode = {
        id: Date.now(),
        name: nodeName,
        x: Math.random() * (this.clientWidth - 100),
        y: Math.random() * (this.clientHeight - 100),
      };
      this.nodes = [...this.nodes, newNode];
    }
  }

  _handleNodeUpdate(e) {
    const updatedNode = e.detail;
    this.nodes = this.nodes.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    );
    this.requestUpdate();
  }

  _handleConnectRequest(e) {
    const sourceId = e.detail.sourceId;
    this.connectingNodeId = sourceId;
  }

  _handleNodeClick(nodeId) {
    if (this.connectingNodeId && this.connectingNodeId !== nodeId) {
      this._createEdge(this.connectingNodeId, nodeId);
      this.connectingNodeId = null;
    }
  }

  _createEdge(sourceId, targetId) {
    const newEdge = {
      id: `${sourceId}-${targetId}`,
      sourceId,
      targetId,
    };
    this.edges = [...this.edges, newEdge];
  }

  _deleteNode(nodeId) {
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    this.edges = this.edges.filter(edge => edge.sourceId !== nodeId && edge.targetId !== nodeId);
    this.requestUpdate();
  }
}

customElements.define('mind-map-app', MindMapApp);