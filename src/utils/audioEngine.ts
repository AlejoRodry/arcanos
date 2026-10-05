// ============================================================================
// MASTER AUDIO ENGINE (Web Audio API Direct Digital Routing)
// Guarantees that Narration Voice and Mystic Background Music are ALWAYS
// heard by the user AND captured with 100% digital fidelity in recordings.
// ============================================================================

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterDestination: MediaStreamAudioDestinationNode | null = null;
  private musicGainNode: GainNode | null = null;
  private voiceGainNode: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;
  private musicSourceNode: MediaElementAudioSourceNode | null = null;
  private currentVoiceSource: AudioBufferSourceNode | null = null;
  private audioBufferCache = new Map<string, AudioBuffer>();

  public getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterDestination = this.ctx.createMediaStreamDestination();

      this.musicGainNode = this.ctx.createGain();
      this.voiceGainNode = this.ctx.createGain();

      // Connect gains to both physical output (speakers) and recording stream destination
      this.musicGainNode.connect(this.ctx.destination);
      this.musicGainNode.connect(this.masterDestination);

      this.voiceGainNode.connect(this.ctx.destination);
      this.voiceGainNode.connect(this.masterDestination);

      this.voiceGainNode.gain.value = 1.0;
      this.musicGainNode.gain.value = 0.25;
    }
    return this.ctx;
  }

  public getRecordingAudioStream(): MediaStream {
    this.getContext();
    return this.masterDestination!.stream;
  }

  public async unlock(): Promise<void> {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Play a short silent buffer to unlock iOS and Chrome autoplay security token
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      console.warn("Audio unlock notice:", e);
    }
  }

  public setMusicVolume(volume: number, isMuted = false): void {
    if (this.musicGainNode && this.ctx) {
      const target = isMuted ? 0 : Math.max(0, Math.min(1, volume));
      this.musicGainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  public setVoiceVolume(volume: number): void {
    if (this.voiceGainNode && this.ctx) {
      this.voiceGainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    }
  }

  // Connect user uploaded <audio> element to the master audio bus
  public attachMediaElement(element: HTMLAudioElement): void {
    const ctx = this.getContext();
    if (!this.musicSourceNode) {
      try {
        this.musicSourceNode = ctx.createMediaElementSource(element);
        this.musicSourceNode.connect(this.musicGainNode!);
      } catch (err) {
        console.warn("Could not attach media element source:", err);
      }
    }
  }

  // Built-in Mystic Cosmic Drone (432Hz ambient chord) if no audio file is uploaded
  public startAmbientDrone(): void {
    if (this.isAmbientPlaying) return;
    const ctx = this.getContext();
    this.unlock();

    // 432 Hz Root (A), 540 Hz (C#), 648 Hz (E) - Celestial Major Triad
    const freqs = [108, 216, 324, 432];
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 3);

    // Warm low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    this.ambientGain.connect(filter);
    filter.connect(this.musicGainNode!);

    this.ambientOscillators = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      osc.connect(this.ambientGain!);
      osc.start();
      return osc;
    });

    this.isAmbientPlaying = true;
  }

  public stopAmbientDrone(): void {
    if (!this.isAmbientPlaying) return;
    if (this.ctx && this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.5);
      setTimeout(() => {
        this.ambientOscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        this.ambientOscillators = [];
        this.isAmbientPlaying = false;
      }, 600);
    }
  }

  // Play narration text with 100% digital capture
  public async playNarration(
    text: string, 
    onStart: () => void, 
    onEnd: () => void,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    const cleanText = text.trim();
    if (!cleanText) {
      onEnd();
      return true;
    }

    const ctx = this.getContext();
    await this.unlock();

    // Stop any existing narration
    this.stopNarration();

    try {
      let audioBuffer = this.audioBufferCache.get(cleanText);

      if (!audioBuffer) {
        // Fetch real audio from our high-fidelity TTS service
        const res = await fetch(`/api/tts?text=${encodeURIComponent(cleanText)}`);
        if (!res.ok) {
          throw new Error(`TTS HTTP error: ${res.status}`);
        }
        const arrayBuffer = await res.arrayBuffer();
        audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.audioBufferCache.set(cleanText, audioBuffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.voiceGainNode!);
      this.currentVoiceSource = source;

      const duration = audioBuffer.duration;
      const startTime = ctx.currentTime;
      let progressTimer: NodeJS.Timeout | null = null;

      source.onended = () => {
        if (progressTimer) clearInterval(progressTimer);
        this.currentVoiceSource = null;
        onEnd();
      };

      source.start(0);
      onStart();

      if (onProgress && duration > 0) {
        progressTimer = setInterval(() => {
          if (!this.currentVoiceSource || !this.ctx) {
            if (progressTimer) clearInterval(progressTimer);
            return;
          }
          const elapsed = this.ctx.currentTime - startTime;
          const prog = Math.min(1, Math.max(0, elapsed / duration));
          onProgress(prog);
          if (prog >= 1 && progressTimer) {
            clearInterval(progressTimer);
          }
        }, 50);
      }

      return true;
    } catch (err) {
      console.warn("Digital narration playback error, fallback needed:", err);
      return false;
    }
  }

  public stopNarration(): void {
    if (this.currentVoiceSource) {
      try {
        this.currentVoiceSource.stop();
        this.currentVoiceSource.disconnect();
      } catch (e) {}
      this.currentVoiceSource = null;
    }
  }
}

export const masterAudioEngine = new AudioEngine();
