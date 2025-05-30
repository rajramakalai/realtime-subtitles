export class AudioProcessor {
  constructor(asrEngine, callback) {
    this.asrEngine = asrEngine;
    this.callback = callback;
    this.audioContext = null;
    this.processor = null;
    this.stream = null;
    this.buffer = [];
    this.chunkSize = 4800; // 300ms at 16kHz
    this.overlap = 3200;   // 200ms overlap
  }

  async start() {
    this.stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      },
      video: false
    });
    
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    const source = this.audioContext.createMediaStreamSource(this.stream);
    
    this.processor = this.audioContext.createScriptProcessor(1024, 1, 1);
    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    
    this.processor.onaudioprocess = async (event) => {
      const pcm = new Int16Array(event.inputBuffer.getChannelData(0).map(
        n => Math.max(-1, Math.min(1, n)) * 32767
      ));
      
      // Buffer management with overlap
      this.buffer = [...this.buffer, ...pcm];
      while (this.buffer.length >= this.chunkSize) {
        const chunk = this.buffer.slice(0, this.chunkSize);
        this.buffer = this.buffer.slice(this.chunkSize - this.overlap);
        
        // Process audio chunk
        const result = await this.asrEngine.processAudio(chunk);
        this.callback(result);
      }
    };
  }

  stop() {
    if (this.processor) this.processor.disconnect();
    if (this.audioContext) this.audioContext.close();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
  }
}