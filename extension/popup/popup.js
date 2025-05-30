document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle');
  const engineSelect = document.getElementById('engine');
  const statusEl = document.getElementById('status');
  
  let isActive = false;
  
  // Load saved settings
  chrome.storage.sync.get(['asrActive', 'asrEngine'], (data) => {
    isActive = data.asrActive || false;
    engineSelect.value = data.asrEngine || 'vosk';
    updateButtonState();
  });
  
  toggleBtn.addEventListener('click', () => {
    isActive = !isActive;
    chrome.storage.sync.set({ asrActive: isActive });
    chrome.runtime.sendMessage({
      type: 'TOGGLE_ASR',
      active: isActive,
      engine: engineSelect.value
    });
    updateButtonState();
  });
  
  engineSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ asrEngine: engineSelect.value });
  });
  
  function updateButtonState() {
    toggleBtn.textContent = isActive ? 'Stop Subtitles' : 'Start Subtitles';
    toggleBtn.className = isActive ? 'active' : '';
    statusEl.textContent = isActive ? 'Listening...' : 'Ready';
  }
});