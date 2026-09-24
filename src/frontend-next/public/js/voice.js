/* src/frontend/js/voice.js - Web Speech API Voice Input Assistant */

class VoiceAssistant {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.micBtn = document.getElementById('btn-voice-mic');
    this.queryInput = document.getElementById('query-input');

    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (this.micBtn) this.micBtn.style.display = 'none';
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US'; // Supports bilingual fallback

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.micBtn) this.micBtn.classList.add('listening');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.micBtn) this.micBtn.classList.remove('listening');
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (this.queryInput) {
        this.typewriterText(transcript);
      }
    };

    if (this.micBtn) {
      this.micBtn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (!this.recognition) return;

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }

  typewriterText(text) {
    if (!this.queryInput) return;
    this.queryInput.value = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        this.queryInput.value += text.charAt(i);
        i++;
      } else {
        clearInterval(interval);
        // Trigger auto submit
        window.AppController?.handleSearch(text);
      }
    }, 25);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.VoiceAssistant = new VoiceAssistant();
});
