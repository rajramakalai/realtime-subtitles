// vosk.js
export class VoskASR {
  constructor() {
    this.model = null;
    this.recognizer = null;
    this.initialized = false;
  }

  async loadModel() {
    if (this.initialized) return;
    
    return new Promise((resolve, reject) => {
      // Dynamically load Vosk library
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('asr/vosk/vosk.js');
      script.onload = async () => {
        try {
          const modelPath = chrome.runtime.getURL('asr/vosk/model');
          const { Model, Recognizer } = window;
          
          this.model = new Model(modelPath);
          this.recognizer = new Recognizer({
            model: this.model,
            sampleRate: 16000
          });
          
          this.initialized = true;
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  processAudio(chunk) {
    if (!this.initialized) return { text: '', partial: true };
    
    if (this.recognizer.acceptWaveform(chunk)) {
      return { text: this.recognizer.result().text, partial: false };
    }
    return { text: this.recognizer.partialResult().partial, partial: true };
  }

  cleanup() {
    if (this.recognizer) this.recognizer.free();
    if (this.model) this.model.free();
    this.initialized = false;
  }
}