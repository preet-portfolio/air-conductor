import * as Tone from 'tone';
import type { FingerInstrument } from './gestures';
import type { SpatialMusicState } from './spatial3d';

interface SpatialAudioEffects {
  spatialReverb: Tone.Reverb;
  spatialDelay: Tone.FeedbackDelay;
  spatialFilter: Tone.Filter;
  spatialDistortion: Tone.Distortion;
  spatialChorus: Tone.Chorus;
  spatialPanner: Tone.Panner3D;
}

interface Enhanced3DInstrument {
  synth: Tone.Synth | Tone.Sampler | Tone.PluckSynth | Tone.FMSynth;
  effects: SpatialAudioEffects;
  spatialPosition: { x: number; y: number; z: number };
  lastNote: string | null;
  sustainedNote: boolean;
}

export class Enhanced3DMusicEngine {
  private instruments: Record<FingerInstrument, Enhanced3DInstrument> = {} as any;
  private masterGain: Tone.Gain;
  private spatialAnalyser: AnalyserNode;
  private audioContext: AudioContext;
  private currentBpm = 120;
  private harmonicField: Map<string, number> = new Map();

  constructor() {
    // Initialize audio context
    this.audioContext = Tone.getContext().rawContext as AudioContext;
    this.spatialAnalyser = this.audioContext.createAnalyser();
    this.spatialAnalyser.fftSize = 256;
    
    // Create master gain
    this.masterGain = new Tone.Gain(0.7);
    this.masterGain.toDestination();
    
    // Connect analyser
    this.masterGain.connect(this.spatialAnalyser);
    
    // Initialize 3D instruments
    this.create3DInstruments();
    
    // Start transport
    Tone.Transport.bpm.value = this.currentBpm;
    Tone.Transport.start();
    
    // Enable audio on first interaction
    const resume = () => { 
      Tone.start(); 
      document.removeEventListener('pointerdown', resume); 
    };
    document.addEventListener('pointerdown', resume);
  }

  private create3DInstruments() {
    const instrumentConfigs = {
      'Piano': {
        synth: new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.002, decay: 0.3, sustain: 0.2, release: 1.5 }
        }),
        basePosition: { x: 0.3, y: 0.5, z: 0.1 }
      },
      'Guitar': {
        synth: new Tone.PluckSynth({
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.9
        }),
        basePosition: { x: 0.7, y: 0.5, z: 0.1 }
      },
      'Violin': {
        synth: new Tone.FMSynth({
          harmonicity: 3,
          modulationIndex: 12,
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.2, decay: 0.1, sustain: 0.9, release: 0.5 }
        }),
        basePosition: { x: 0.6, y: 0.3, z: 0.2 }
      },
      'Flute': {
        synth: new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.4 }
        }),
        basePosition: { x: 0.7, y: 0.2, z: 0.1 }
      },
      'Bass': {
        synth: new Tone.FMSynth({
          harmonicity: 0.25,
          modulationIndex: 10,
          oscillator: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.5 }
        }),
        basePosition: { x: 0.7, y: 0.8, z: 0.3 }
      },
      'Trumpet': {
        synth: new Tone.FMSynth({
          harmonicity: 2,
          modulationIndex: 8,
          oscillator: { type: 'square' },
          envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.3 }
        }),
        basePosition: { x: 0.6, y: 0.4, z: 0.2 }
      },
      'Saxophone': {
        synth: new Tone.FMSynth({
          harmonicity: 1.5,
          modulationIndex: 6,
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.03, decay: 0.2, sustain: 0.8, release: 0.4 }
        }),
        basePosition: { x: 0.6, y: 0.6, z: 0.2 }
      },
      'Drums': {
        synth: new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 }
        }),
        basePosition: { x: 0.2, y: 0.8, z: 0.3 }
      },
      'Percussion': {
        synth: new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.3 }
        }),
        basePosition: { x: 0.1, y: 0.7, z: 0.2 }
      },
      'Harp': {
        synth: new Tone.PluckSynth({
          attackNoise: 0.5,
          dampening: 2000,
          resonance: 0.95
        }),
        basePosition: { x: 0.2, y: 0.2, z: 0.1 }
      }
    };

    Object.entries(instrumentConfigs).forEach(([name, config]) => {
      const effects = this.createSpatialEffects();
      
      // Connect synth through effects chain to master gain
      config.synth
        .connect(effects.spatialFilter)
        .connect(effects.spatialDistortion)
        .connect(effects.spatialChorus)
        .connect(effects.spatialDelay)
        .connect(effects.spatialReverb)
        .connect(effects.spatialPanner)
        .connect(this.masterGain);

      this.instruments[name as FingerInstrument] = {
        synth: config.synth,
        effects,
        spatialPosition: config.basePosition,
        lastNote: null,
        sustainedNote: false
      };
    });
  }

  private createSpatialEffects(): SpatialAudioEffects {
    return {
      spatialReverb: new Tone.Reverb({
        decay: 2.0,
        wet: 0.2,
        preDelay: 0.01
      }),
      spatialDelay: new Tone.FeedbackDelay({
        delayTime: '8n',
        feedback: 0.1,
        wet: 0.1
      }),
      spatialFilter: new Tone.Filter({
        frequency: 2000,
        type: 'lowpass'
      }),
      spatialDistortion: new Tone.Distortion({
        distortion: 0.1,
        wet: 0.1
      }),
      spatialChorus: new Tone.Chorus({
        frequency: 2,
        delayTime: 3.5,
        depth: 0.7,
        wet: 0.2
      }).start(),
      spatialPanner: new Tone.Panner3D({
        positionX: 0,
        positionY: 0,
        positionZ: 0
      })
    };
  }

  updateSpatialState(spatialState: SpatialMusicState) {
    const params = this.getSpatialMusicalParameters(spatialState);
    
    // Update global effects based on spatial state
    this.updateGlobalSpatialEffects(params);
    
    // Update individual instrument spatial properties
    this.updateInstrumentSpatialProperties(params);
    
    // Generate harmonic field effects
    this.updateHarmonicField(params);
  }

  private getSpatialMusicalParameters(spatialState: SpatialMusicState) {
    const leftRecent = spatialState.leftHand.positions[spatialState.leftHand.positions.length - 1];
    const rightRecent = spatialState.rightHand.positions[spatialState.rightHand.positions.length - 1];
    
    return {
      leftPos: leftRecent || null,
      rightPos: rightRecent || null,
      handDistance: spatialState.handDistance,
      harmonicResonance: spatialState.harmonicResonance,
      gestureIntensity: spatialState.gestureIntensity,
      currentZones: spatialState.currentZones
    };
  }

  private updateGlobalSpatialEffects(params: any) {
    // Update BPM based on gesture intensity
    const targetBpm = 90 + (params.gestureIntensity * 60); // 90-150 BPM range
    if (Math.abs(this.currentBpm - targetBpm) > 5) {
      this.currentBpm = targetBpm;
      Tone.Transport.bpm.rampTo(targetBpm, 2);
    }

    // Update master volume based on harmonic resonance
    const targetVolume = 0.5 + (params.harmonicResonance * 0.3);
    this.masterGain.gain.rampTo(targetVolume, 0.5);
  }

  private updateInstrumentSpatialProperties(params: any) {
    Object.entries(this.instruments).forEach(([name, instrument]) => {
      const { effects } = instrument;
      
      // Update 3D panning based on hand positions
      if (params.leftPos && name.includes('left')) {
        effects.spatialPanner.positionX.rampTo((params.leftPos.x - 0.5) * 20, 0.1);
        effects.spatialPanner.positionY.rampTo((0.5 - params.leftPos.y) * 20, 0.1);
        effects.spatialPanner.positionZ.rampTo(params.leftPos.z * 10, 0.1);
      }
      
      if (params.rightPos && name.includes('right')) {
        effects.spatialPanner.positionX.rampTo((params.rightPos.x - 0.5) * 20, 0.1);
        effects.spatialPanner.positionY.rampTo((0.5 - params.rightPos.y) * 20, 0.1);
        effects.spatialPanner.positionZ.rampTo(params.rightPos.z * 10, 0.1);
      }

      // Update effects based on Z-depth
      const avgDepth = params.leftPos && params.rightPos ? 
        (params.leftPos.z + params.rightPos.z) / 2 : 
        params.leftPos?.z || params.rightPos?.z || 0;

      // Depth affects reverb and filter
      effects.spatialReverb.wet.rampTo(0.1 + avgDepth * 0.4, 0.5);
      effects.spatialFilter.frequency.rampTo(1000 + avgDepth * 3000, 0.3);

      // Hand distance affects chorus and delay
      effects.spatialChorus.wet.rampTo(Math.min(0.4, params.handDistance * 2), 0.5);
      effects.spatialDelay.wet.rampTo(Math.min(0.3, params.handDistance * 1.5), 0.5);

      // Zone-based effects
      if (params.currentZones.left && name in this.instruments) {
        const zone = params.currentZones.left;
        this.applyZoneEffects(instrument, zone.effect);
      }
      
      if (params.currentZones.right && name in this.instruments) {
        const zone = params.currentZones.right;
        this.applyZoneEffects(instrument, zone.effect);
      }
    });
  }

  private applyZoneEffects(instrument: Enhanced3DInstrument, effectType: string) {
    const { effects } = instrument;
    
    switch (effectType) {
      case 'reverb':
        effects.spatialReverb.wet.rampTo(0.6, 0.3);
        break;
      case 'delay':
        effects.spatialDelay.wet.rampTo(0.4, 0.3);
        effects.spatialDelay.feedback.rampTo(0.3, 0.3);
        break;
      case 'filter':
        effects.spatialFilter.frequency.rampTo(500, 0.2);
        break;
      case 'distortion':
        effects.spatialDistortion.wet.rampTo(0.3, 0.3);
        break;
      case 'chorus':
        effects.spatialChorus.wet.rampTo(0.5, 0.3);
        break;
    }
  }

  private updateHarmonicField(params: any) {
    // Create harmonic resonance based on hand proximity and movement
    if (params.handDistance < 0.3 && params.harmonicResonance > 0.7) {
      // Generate harmonic overtones
      this.generateHarmonicOvertones();
    }
  }

  private generateHarmonicOvertones() {
    // Create subtle harmonic background based on recent notes
    const harmonicSynth = new Tone.PolySynth().connect(this.masterGain);
    
    // Get the harmonic series of recently played notes
    this.harmonicField.forEach((strength, note) => {
      if (strength > 0.1) {
        harmonicSynth.triggerAttackRelease(note, '2n', undefined, strength * 0.1);
        this.harmonicField.set(note, strength * 0.9); // Decay
      }
    });
  }

  play3DInstrument(instrument: FingerInstrument, note: string, velocity: number, spatialPosition?: { x: number; y: number; z: number }) {
    const instrumentData = this.instruments[instrument];
    if (!instrumentData) return;

    // Update spatial position if provided
    if (spatialPosition) {
      instrumentData.spatialPosition = spatialPosition;
      instrumentData.effects.spatialPanner.positionX.rampTo((spatialPosition.x - 0.5) * 20, 0.1);
      instrumentData.effects.spatialPanner.positionY.rampTo((0.5 - spatialPosition.y) * 20, 0.1);
      instrumentData.effects.spatialPanner.positionZ.rampTo(spatialPosition.z * 10, 0.1);
    }

    // Play the note with spatial effects
    instrumentData.synth.triggerAttackRelease(note, '8n', undefined, velocity);
    instrumentData.lastNote = note;

    // Add to harmonic field
    this.harmonicField.set(note, velocity);
  }

  getAnalyser(): AnalyserNode {
    return this.spatialAnalyser;
  }

  setMasterVolume(volume: number) {
    this.masterGain.gain.rampTo(Math.max(0, Math.min(1, volume)), 0.1);
  }

  dispose() {
    Object.values(this.instruments).forEach(instrument => {
      instrument.synth.dispose();
      Object.values(instrument.effects).forEach(effect => effect.dispose());
    });
    this.masterGain.dispose();
  }
}
