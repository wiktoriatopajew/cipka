// Komponent do obsługi dźwięków w czacie
// Tworzy dźwięki programowo bez potrzeby plików audio

class ChatSounds {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Inicjalizacja AudioContext po pierwszej interakcji użytkownika
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    // AudioContext musi być utworzony po interakcji użytkownika (wymóg przeglądarek)
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log('Audio not supported on this device');
      }
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.log('Could not resume audio context');
      }
    }
  }

  private isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    const setting = localStorage.getItem('chatSoundsEnabled');
    return setting !== 'false'; // Default to enabled
  }

  // Dźwięk wysłania wiadomości - krótki "pop"
  async playMessageSent() {
    if (!this.isSoundEnabled()) return;
    
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Krótki dźwięk o częstotliwości 800Hz
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';

      // Szybko zanikający dźwięk
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Could not play sent sound:', error);
    }
  }

  // Dźwięk otrzymania wiadomości - delikatny "ding"
  async playMessageReceived() {
    if (!this.isSoundEnabled()) return;
    
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    try {
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Dwutonowy dźwięk (harmoniczny)
      oscillator1.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
      oscillator2.frequency.setValueAtTime(659, this.audioContext.currentTime); // E5
      
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';

      // Delikatny dźwięk
      gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      oscillator1.start(this.audioContext.currentTime);
      oscillator2.start(this.audioContext.currentTime);
      oscillator1.stop(this.audioContext.currentTime + 0.3);
      oscillator2.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not play received sound:', error);
    }
  }

  // Dźwięk powiadomienia o nowej wiadomości (gdy czat nie jest aktywny)
  async playNotification() {
    if (!this.isSoundEnabled()) return;
    
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    try {
      // Sekwencja trzech tonów
      const times = [0, 0.15, 0.3];
      const frequencies = [440, 554, 659]; // A4, C#5, E5

      times.forEach((time, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.setValueAtTime(frequencies[index], this.audioContext!.currentTime + time);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.08, this.audioContext!.currentTime + time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + time + 0.12);

        oscillator.start(this.audioContext!.currentTime + time);
        oscillator.stop(this.audioContext!.currentTime + time + 0.12);
      });
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  // Inicjalizacja audio po pierwszym kliknięciu użytkownika
  async initializeOnUserInteraction() {
    await this.ensureAudioContext();
    // Odtwarzamy bardzo cichy dźwięk żeby "odblokować" audio
    if (this.audioContext) {
      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.01);
      } catch (error) {
        console.log('Could not initialize audio');
      }
    }
  }

  // Ustawienia dźwięków
  setSoundEnabled(enabled: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSoundsEnabled', enabled.toString());
    }
  }

  getSoundEnabled(): boolean {
    return this.isSoundEnabled();
  }
}

// Singleton instance
export const chatSounds = new ChatSounds();

// React hook do używania dźwięków w komponentach
export function useChatSounds() {
  return {
    playMessageSent: () => chatSounds.playMessageSent(),
    playMessageReceived: () => chatSounds.playMessageReceived(),
    playNotification: () => chatSounds.playNotification(),
    initializeAudio: () => chatSounds.initializeOnUserInteraction(),
    setSoundEnabled: (enabled: boolean) => chatSounds.setSoundEnabled(enabled),
    getSoundEnabled: () => chatSounds.getSoundEnabled()
  };
}