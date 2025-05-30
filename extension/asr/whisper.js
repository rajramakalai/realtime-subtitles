export class WhisperASR {
  constructor() {
    this.ws = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://localhost:8765');
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  async processAudio(chunk) {
    if (!this.ws) await this.connect();
    this.ws.send(chunk);
    
    return new Promise((resolve) => {
      this.ws.onmessage = (event) => {
        resolve(JSON.parse(event.data));
      };
    });
  }

  cleanup() {
    if (this.ws) this.ws.close();
  }
}