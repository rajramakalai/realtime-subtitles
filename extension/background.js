import { VoskASR } from './asr/vosk.js';
import { WhisperASR } from './asr/whisper.js';
import { AudioProcessor } from './lib/audioProcessor.js';

let asrEngine = null;
let audioProcessor = null;
let currentTabId = null;

// Toggle ASR processing
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.type === 'TOGGLE_ASR') {
    currentTabId = sender.tab.id;
    if (request.active) {
      startASR(request.engine);
    } else {
      stopASR();
    }
  }
});

// Initialize ASR engine
async function startASR(engineType) {
  // Stop existing processors
  if (audioProcessor) stopASR();
  
  // Initialize selected ASR
  if (engineType === 'vosk') {
    asrEngine = new VoskASR();
    await asrEngine.loadModel();
  } else {
    asrEngine = new WhisperASR();
  }
  
  // Start audio processing
  audioProcessor = new AudioProcessor(asrEngine, (result) => {
    chrome.tabs.sendMessage(currentTabId, {
      type: 'SUBTITLE_RESULT',
      text: result.text,
      partial: result.partial
    });
  });
  
  await audioProcessor.start();
}

// Cleanup resources
function stopASR() {
  if (audioProcessor) audioProcessor.stop();
  if (asrEngine) asrEngine.cleanup();
  audioProcessor = null;
  asrEngine = null;
}