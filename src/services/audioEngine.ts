import { SettingsState, TalkState } from '../types';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private isTransmitting = false;
  private vadHangoverTimeout: any = null;
  private animationFrameId: number | null = null;

  // Callbacks
  private onVolumeChange: ((volume: number) => void) | null = null;
  private onTalkStateChange: ((state: TalkState) => void) | null = null;
  private isMuted = false;
  private isDeafened = false;

  private settings: SettingsState;

  constructor(settings: SettingsState) {
    this.settings = settings;
  }

  public updateSettings(settings: SettingsState) {
    this.settings = settings;

    // Update gain
    if (this.gainNode && this.audioContext) {
      const boost = (this.settings.inputVolume / 100);
      this.gainNode.gain.setValueAtTime(boost, this.audioContext.currentTime);
    }

    // Update preprocessor / filter settings
    if (this.compressorNode && this.audioContext) {
      if (this.settings.preprocessorEnabled) {
        this.compressorNode.threshold.setValueAtTime(-24, this.audioContext.currentTime);
        this.compressorNode.knee.setValueAtTime(30, this.audioContext.currentTime);
        this.compressorNode.ratio.setValueAtTime(12, this.audioContext.currentTime);
        this.compressorNode.attack.setValueAtTime(0.003, this.audioContext.currentTime);
        this.compressorNode.release.setValueAtTime(0.25, this.audioContext.currentTime);
      } else {
        this.compressorNode.threshold.setValueAtTime(0, this.audioContext.currentTime);
        this.compressorNode.ratio.setValueAtTime(1, this.audioContext.currentTime);
      }
    }
  }

  public setCallbacks(
    onVolume: (vol: number) => void,
    onTalkState: (state: TalkState) => void
  ) {
    this.onVolumeChange = onVolume;
    this.onTalkStateChange = onTalkState;
  }

  public setMuteDeafen(muted: boolean, deafened: boolean) {
    this.isMuted = muted;
    this.isDeafened = deafened;
    if (muted || deafened) {
      this.setTransmitting(false);
    }
  }

  public async startMicrophone(): Promise<boolean> {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx({
          sampleRate: this.settings.inputSampleRate || 48000,
        });
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Constraints with active noise suppression and echo cancellation
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: this.settings.echoCancellation,
          noiseSuppression: this.settings.noiseSuppression,
          autoGainControl: true,
          sampleRate: this.settings.inputSampleRate,
        },
        video: false,
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Preprocessor chain: Highpass Filter -> Lowpass Filter -> Dynamics Compressor -> Gain -> Analyser
      this.highpassFilter = this.audioContext.createBiquadFilter();
      this.highpassFilter.type = 'highpass';
      this.highpassFilter.frequency.setValueAtTime(80, this.audioContext.currentTime);

      this.lowpassFilter = this.audioContext.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.setValueAtTime(7500, this.audioContext.currentTime);

      this.compressorNode = this.audioContext.createDynamicsCompressor();
      if (this.settings.preprocessorEnabled) {
        this.compressorNode.threshold.setValueAtTime(-24, this.audioContext.currentTime);
        this.compressorNode.knee.setValueAtTime(30, this.audioContext.currentTime);
        this.compressorNode.ratio.setValueAtTime(12, this.audioContext.currentTime);
        this.compressorNode.attack.setValueAtTime(0.003, this.audioContext.currentTime);
        this.compressorNode.release.setValueAtTime(0.25, this.audioContext.currentTime);
      }

      this.gainNode = this.audioContext.createGain();
      const boost = (this.settings.inputVolume / 100);
      this.gainNode.gain.setValueAtTime(boost, this.audioContext.currentTime);

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 512;
      this.analyserNode.smoothingTimeConstant = 0.4;

      // Connect nodes
      this.sourceNode.connect(this.highpassFilter);
      this.highpassFilter.connect(this.lowpassFilter);
      this.lowpassFilter.connect(this.compressorNode);
      this.compressorNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);

      this.startMeterLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access denied or audio device unavailable, using simulated input:', err);
      this.startSimulatedMeterLoop();
      return false;
    }
  }

  public stopMicrophone() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.setTransmitting(false);
  }

  private startMeterLoop() {
    if (!this.analyserNode) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const update = () => {
      if (!this.analyserNode) return;

      this.analyserNode.getByteTimeDomainData(dataArray);

      // Calculate Root Mean Square (RMS) volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const normalizedVolume = Math.min(100, Math.round(rms * 220));

      if (this.onVolumeChange) {
        this.onVolumeChange(normalizedVolume);
      }

      // Check VAD transmission
      if (!this.isMuted && !this.isDeafened) {
        if (this.settings.audioInputMethod === 'voiceActivity') {
          if (normalizedVolume >= this.settings.vadThreshold) {
            if (this.vadHangoverTimeout) {
              clearTimeout(this.vadHangoverTimeout);
              this.vadHangoverTimeout = null;
            }
            if (!this.isTransmitting) {
              this.setTransmitting(true);
            }
          } else if (this.isTransmitting && !this.vadHangoverTimeout) {
            // 350ms hangover time
            this.vadHangoverTimeout = setTimeout(() => {
              this.setTransmitting(false);
              this.vadHangoverTimeout = null;
            }, 350);
          }
        } else if (this.settings.audioInputMethod === 'continuous') {
          if (!this.isTransmitting) {
            this.setTransmitting(true);
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  private startSimulatedMeterLoop() {
    let mockVol = 0;
    const interval = () => {
      if (this.isTransmitting) {
        mockVol = Math.floor(Math.random() * 40) + 45;
      } else {
        mockVol = Math.max(0, Math.floor(Math.random() * 8));
      }

      if (this.onVolumeChange) {
        this.onVolumeChange(mockVol);
      }

      this.animationFrameId = requestAnimationFrame(interval);
    };
    interval();
  }

  public setPttActive(active: boolean) {
    if (this.settings.audioInputMethod !== 'ptt') return;
    if (this.isMuted || this.isDeafened) {
      this.setTransmitting(false);
      return;
    }

    if (active !== this.isTransmitting) {
      if (this.settings.pttSound) {
        this.playPttChirp(active);
      }
      this.setTransmitting(active);
    }
  }

  public togglePtt() {
    if (this.settings.audioInputMethod !== 'ptt') return;
    this.setPttActive(!this.isTransmitting);
  }

  private setTransmitting(transmitting: boolean) {
    if (this.isMuted || this.isDeafened) {
      transmitting = false;
    }
    this.isTransmitting = transmitting;
    if (this.onTalkStateChange) {
      this.onTalkStateChange(transmitting ? 'talking' : 'passive');
    }
  }

  public getIsTransmitting(): boolean {
    return this.isTransmitting;
  }

  // Classic Mumble PTT chirp sounds synthesized via Web Audio
  public playPttChirp(on: boolean) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (on) {
        // High ascending beep
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      } else {
        // Lower descending chirp
        osc.frequency.setValueAtTime(1100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
      }

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      // Audio autoplay policy
    }
  }
}
