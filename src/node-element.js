import { LitElement, html, css } from 'lit';

class NodeElement extends LitElement {
  static properties = {
    node: { type: Object },
    isConnecting: { type: Boolean },
  };

  static styles = css`
    :host {
      position: absolute;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 10px;
      cursor: move;
      user-select: none;
    }
    :host(.connecting) {
      border-color: #007bff;
      box-shadow: 0 0 5px #007bff;
    }
    input {
      width: calc(100% - 30px); /* Adjust to make space for the delete button */
      box-sizing: border-box;
    }
    .node-content {
      display: flex;
      align-items: center;
      position: relative;
    }
    .delete-button {
      position: absolute;
      top: 0;
      right: 0;
      background-color: red;
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .connect-button {
      margin-top: 5px;
    }
  `;

  render() {
    return html`
      <div class="node-content">
        <input
          type="text"
          .value=${this.node.name}
          @change=${this._handleNameChange}
        >
        <button class="delete-button" @click=${this._handleDeleteClick}>x</button>
      </div>
      <button class="connect-button" @click=${this._requestConnection}>
        ${this.isConnecting ? 'Cancel' : 'Connect'}
      </button>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('isConnecting')) {
      this.classList.toggle('connecting', this.isConnecting);
    }
    if (changedProperties.has('node')) {
      this.style.left = `${this.node.x}px`;
      this.style.top = `${this.node.y}px`;
    }
  }

  firstUpdated() {
    this._makeDraggable();
  }

  _makeDraggable() {
    let isDragging = false;
    let startX, startY;

    const onMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX - this.node.x;
      startY = e.clientY - this.node.y;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - startX;
        const newY = e.clientY - startY;
        this._updatePosition(newX, newY);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    this.addEventListener('mousedown', onMouseDown);
  }

  _updatePosition(x, y) {
    this.node = { ...this.node, x, y };
    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
    this._emitUpdate();
  }

  _handleNameChange(e) {
    this.node = { ...this.node, name: e.target.value };
    this._emitUpdate();
  }

  _emitUpdate() {
    this.dispatchEvent(new CustomEvent('nodeupdate', {
      detail: this.node,
      bubbles: true,
      composed: true,
    }));
  }

  _requestConnection() {
    this.dispatchEvent(new CustomEvent('connectrequest', {
      detail: { sourceId: this.node.id },
      bubbles: true,
      composed: true,
    }));
  }

  _handleDeleteClick() {
    this.dispatchEvent(new CustomEvent('deletenode', {
      detail: { id: this.node.id },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('node-element', NodeElement);