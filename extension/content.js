class SubtitleRenderer {
  constructor() {
    this.container = this.findVideoContainer();
    this.element = document.createElement('div');
    this.setupElement();
  }

  findVideoContainer() {
    return document.querySelector('video') || document.body;
  }

  setupElement() {
    Object.assign(this.element.style, {
      position: 'absolute',
      bottom: '10%',
      left: '0',
      width: '100%',
      textAlign: 'center',
      color: 'white',
      fontSize: '2em',
      textShadow: '0 0 5px black',
      zIndex: '10000',
      transition: 'opacity 0.2s',
      opacity: '0',
      pointerEvents: 'none'
    });
    
    this.container.appendChild(this.element);
    if (this.container === document.body) {
      this.container.style.position = 'relative';
    }
  }

  updateSubtitle(text, partial) {
    if (!text) return;
    
    this.element.textContent = text;
    this.element.style.opacity = '1';
    this.element.style.fontStyle = partial ? 'italic' : 'normal';
    
    // Auto-position relative to video
    const video = document.querySelector('video');
    if (video) {
      const rect = video.getBoundingClientRect();
      this.element.style.bottom = `${window.innerHeight - rect.bottom + 50}px`;
    }
  }
}

// Initialize renderer
const renderer = new SubtitleRenderer();

// Handle ASR results
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SUBTITLE_RESULT') {
    renderer.updateSubtitle(message.text, message.partial);
  }
});

// Handle video context changes
new MutationObserver(() => {
  const video = document.querySelector('video');
  if (video && !video.dataset.subtitlesAdded) {
    video.dataset.subtitlesAdded = true;
    renderer.container = video.parentElement;
    renderer.setupElement();
  }
}).observe(document.body, { childList: true, subtree: true });