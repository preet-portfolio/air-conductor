import * as Tone from 'tone';
import type { FingerInstrument } from './gestures';

interface ActiveNote { 
  note: string; 
  synth: Tone.Synth | Tone.Sampler | Tone.PluckSynth | Tone.FMSynth; 
}

// Enhanced Musical Intelligence - More Sophisticated Progressions
const CHORD_PROGRESSIONS = {
  'pop': ['C', 'Am', 'F', 'G', 'C', 'F', 'Am', 'G'],
  'jazz': ['Cmaj7', 'A7', 'Dm7', 'G7', 'Em7', 'A7', 'Dm7', 'G7'],
  'blues': ['C7', 'F7', 'C7', 'C7', 'F7', 'F7', 'C7', 'G7'],
  'classical': ['C', 'F', 'G', 'Am', 'F', 'C', 'G', 'C'],
  'rock': ['C', 'F', 'G', 'Am', 'F', 'C', 'Bb', 'F'],
  'ambient': ['Cmaj9', 'Fmaj9', 'Am7', 'G6', 'Dm9', 'Gmaj7', 'Cmaj9', 'Fmaj9']
};

const CHORD_NOTES = {
  'C': ['C', 'E', 'G'], 'Am': ['A', 'C', 'E'], 'F': ['F', 'A', 'C'], 'G': ['G', 'B', 'D'],
  'Cmaj7': ['C', 'E', 'G', 'B'], 'A7': ['A', 'C#', 'E', 'G'], 'Dm7': ['D', 'F', 'A', 'C'], 
  'G7': ['G', 'B', 'D', 'F'], 'C7': ['C', 'E', 'G', 'Bb'], 'F7': ['F', 'A', 'C', 'Eb'],
  'Em7': ['E', 'G', 'B', 'D'], 'Bb': ['Bb', 'D', 'F'],
  'Cmaj9': ['C', 'E', 'G', 'B', 'D'], 'Fmaj9': ['F', 'A', 'C', 'E', 'G'],
  'Am7': ['A', 'C', 'E', 'G'], 'G6': ['G', 'B', 'D', 'E'], 'Dm9': ['D', 'F', 'A', 'C', 'E'],
  'Gmaj7': ['G', 'B', 'D', 'F#']
};

// Musical Scales for Different Moods
const SCALES = {
  'major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'minor': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
  'pentatonic': ['C', 'D', 'E', 'G', 'A'],
  'blues': ['C', 'Eb', 'F', 'Gb', 'G', 'Bb'],
  'dorian': ['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'],
  'mixolydian': ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
  'lydian': ['C', 'D', 'E', 'F#', 'G', 'A', 'B']
};

/** Enhanced MusicEngine with Realistic Instruments and Professional Audio Effects */
export class MusicEngine {
  bpm = 100;
  masterVolume = 0.5;
  private gain: Tone.Gain;
  private reverb: Tone.Reverb;
  private delay: Tone.FeedbackDelay;
  private compressor: Tone.Compressor;
  private instruments: Record<FingerInstrument, Tone.Synth | Tone.Sampler | Tone.PluckSynth | Tone.FMSynth> = {} as any;
  private activeNotes: Record<FingerInstrument, ActiveNote | null> = {} as any;
  
  // Enhanced AI Music Intelligence State
  private currentStyle: keyof typeof CHORD_PROGRESSIONS = 'pop';
  private currentChordIndex = 0;
  private lastChordChange = 0;
  private chordChangeDuration = 3000; // 3 seconds per chord for more musical flow
  private harmonizer: Tone.PolySynth;
  private bassline: Tone.FMSynth;
  private rhythmPattern: boolean[] = [true, false, true, false, true, false, true, false];
  private rhythmIndex = 0;

  constructor() {
    Tone.Transport.bpm.value = this.bpm;
    
    // Create professional audio effects chain
    this.compressor = new Tone.Compressor(-30, 3);
    this.reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0.3,
      preDelay: 0.01
    });
    this.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.2,
      wet: 0.15
    });
    this.gain = new Tone.Gain(this.masterVolume);
    
    // Connect effects chain: instruments -> delay -> reverb -> compressor -> gain -> destination
    this.delay.connect(this.reverb);
    this.reverb.connect(this.compressor);
    this.compressor.connect(this.gain);
    this.gain.toDestination();
    
    // Create professional harmonizer with multiple voices
    this.harmonizer = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.2, decay: 0.3, sustain: 0.6, release: 1.2 }
    }).connect(this.delay);
    
    // Professional bass synthesizer
    this.bassline = new Tone.FMSynth({
      harmonicity: 0.5,
      modulationIndex: 10,
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 }
    }).connect(this.gain);
    
    // Create realistic instrument synthesizers with professional settings
    const instrumentConfigs = {
      'Drums': this.createDrumKit(),
      'Piano': this.createPiano(),
      'Guitar': this.createGuitar(),
      'Violin': this.createViolin(),
      'Flute': this.createFlute(),
      'Bass': this.createBass(),
      'Trumpet': this.createTrumpet(),
      'Saxophone': this.createSaxophone(),
      'Percussion': this.createPercussion(),
      'Harp': this.createHarp()
    };

    Object.entries(instrumentConfigs).forEach(([name, synth]) => {
      this.instruments[name as FingerInstrument] = synth;
      this.activeNotes[name as FingerInstrument] = null;
    });

    // Start enhanced AI music intelligence
    this.startEnhancedMusicAI();
    
    Tone.Transport.start();
    const resume = () => { Tone.start(); document.removeEventListener('pointerdown', resume); };
    document.addEventListener('pointerdown', resume);
  }

  // Create realistic instrument synthesizers
  private createPiano(): Tone.Synth {
    return new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.002, decay: 0.3, sustain: 0.2, release: 1.5 }
    }).connect(this.delay);
  }

  private createGuitar(): Tone.PluckSynth {
    return new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.9
    }).connect(this.delay);
  }

  private createViolin(): Tone.FMSynth {
    return new Tone.FMSynth({
      harmonicity: 3,
      modulationIndex: 12,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.2, decay: 0.1, sustain: 0.9, release: 0.5 }
    }).connect(this.delay);
  }

  private createFlute(): Tone.Synth {
    return new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.4 }
    }).connect(this.delay);
  }

  private createBass(): Tone.FMSynth {
    return new Tone.FMSynth({
      harmonicity: 0.25,
      modulationIndex: 10,
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.5 }
    }).connect(this.gain);
  }

  private createTrumpet(): Tone.FMSynth {
    return new Tone.FMSynth({
      harmonicity: 2,
      modulationIndex: 8,
      oscillator: { type: 'square' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.3 }
    }).connect(this.delay);
  }

  private createSaxophone(): Tone.FMSynth {
    return new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 6,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.03, decay: 0.2, sustain: 0.8, release: 0.4 }
    }).connect(this.delay);
  }

  private createDrumKit(): Tone.Synth {
    return new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 }
    }).connect(this.gain);
  }

  private createPercussion(): Tone.Synth {
    return new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.3 }
    }).connect(this.delay);
  }

  private createHarp(): Tone.PluckSynth {
    return new Tone.PluckSynth({
      attackNoise: 0.5,
      dampening: 2000,
      resonance: 0.95
    }).connect(this.reverb);
  }

  setBpm(bpm: number) { 
    if (bpm >= 30 && bpm <= 300) { 
      this.bpm = bpm; 
      Tone.Transport.bpm.rampTo(bpm, 0.08); 
    } 
  }

  setVolume(vol: number) { 
    const v = Math.min(1, Math.max(0, vol)); 
    this.masterVolume = v; 
    this.gain.gain.rampTo(v, 0.05); 
  }

  /** Play note on specific instrument with enhanced realism and harmonization */
  playInstrument(instrument: FingerInstrument, note: string, velocity = 0.7) {
    const synth = this.instruments[instrument];
    if (!synth) {
      console.warn(`No synth found for instrument: ${instrument}`);
      return;
    }
    
    const current = this.activeNotes[instrument];
    if (current && current.note === note) return; // already playing
    
    if (current) {
      // Fix: Provide time parameter for triggerRelease
      if ('triggerRelease' in current.synth) {
        current.synth.triggerRelease(Tone.now());
      }
    }
    
    // Enhanced musical intelligence: Use musical scales and chord context
    const isRhythm = ['Drums', 'Bass', 'Percussion'].includes(instrument);
    const enhancedNote = isRhythm ? note : this.musicallyEnhance(note);
    
    console.log(`Playing ${instrument}: ${enhancedNote} (velocity: ${velocity})`);
    
    // Fix: Use proper triggerAttack method based on synth type
    if ('triggerAttack' in synth) {
      (synth as any).triggerAttack(enhancedNote, Tone.now());
      // Set velocity separately if supported
      if ('volume' in synth) {
        (synth as any).volume.value = Math.log10(Math.min(1, Math.max(0.1, velocity))) * 20;
      }
    }
    
    this.activeNotes[instrument] = { note: enhancedNote, synth };
    
    // Enhanced AI: Professional backing with musical context
    if (!isRhythm && Math.random() < 0.08 && this.getActiveInstrumentCount() >= 3) { 
      this.playProfessionalHarmony(enhancedNote);
    }
    
    // Add subtle bassline when multiple instruments are playing
    if (this.getActiveInstrumentCount() >= 2) {
      this.playIntelligentBassline();
    }
  }

  /** Enhanced musical processing using music theory */
  private musicallyEnhance(note: string): string {
    const currentChord = this.getCurrentChord();
    const currentScale = this.getCurrentScale();
    
    // Extract note name and octave
    const noteName = note.replace(/\d/, '');
    const octave = note.match(/\d/) ? note.match(/\d/)![0] : '4';
    
    // Apply musical intelligence: prefer chord tones, then scale tones
    const chordNotes = CHORD_NOTES[currentChord as keyof typeof CHORD_NOTES] || [];
    
    if (chordNotes.includes(noteName)) {
      return note; // Already a chord tone - perfect!
    }
    
    // If not a chord tone, try to find a nearby chord tone
    const noteIndex = currentScale.indexOf(noteName);
    if (noteIndex !== -1) {
      // Find closest chord tone in the scale
      for (const offset of [0, 1, -1, 2, -2]) {
        const targetIndex = (noteIndex + offset + currentScale.length) % currentScale.length;
        const targetNote = currentScale[targetIndex];
        if (chordNotes.includes(targetNote)) {
          return targetNote + octave;
        }
      }
    }
    
    // Fallback: return original note
    return note;
  }

  /** Get current musical scale based on style */
  private getCurrentScale(): string[] {
    switch (this.currentStyle) {
      case 'jazz': return SCALES.dorian;
      case 'blues': return SCALES.blues;
      case 'ambient': return SCALES.lydian;
      case 'classical': return SCALES.major;
      default: return SCALES.pentatonic;
    }
  }

  /** Professional harmony with musical context */
  private playProfessionalHarmony(_rootNote: string) {
    const currentChord = this.getCurrentChord();
    const chordNotes = CHORD_NOTES[currentChord as keyof typeof CHORD_NOTES];
    
    if (chordNotes && chordNotes.length >= 3) {
      // Play a rich chord voicing
      const voicing = [
        chordNotes[0] + '3', // Root in lower octave
        chordNotes[1] + '4', // Third
        chordNotes[2] + '4'  // Fifth
      ];
      
      setTimeout(() => {
        this.harmonizer.triggerAttackRelease(voicing, '1n', Tone.now(), 0.08);
      }, 150);
    }
  }

  /** Intelligent bassline generation */
  private playIntelligentBassline() {
    if (Math.random() < 0.3) { // 30% chance to play bass note
      const currentChord = this.getCurrentChord();
      const chordNotes = CHORD_NOTES[currentChord as keyof typeof CHORD_NOTES];
      
      if (chordNotes) {
        const bassNote = chordNotes[0] + '2'; // Root note in bass octave
        this.bassline.triggerAttackRelease(bassNote, '4n', Tone.now(), 0.4);
      }
    }
  }

  /** Enhanced AI Music Intelligence with professional features */
  private startEnhancedMusicAI() {
    // Professional chord progression with musical timing
    setInterval(() => {
      if (this.hasActiveGestures() && this.getActiveInstrumentCount() >= 2) {
        this.advanceChordProgression();
      }
    }, this.chordChangeDuration);
    
    // Musical rhythm with swing feel
    setInterval(() => {
      if (this.hasActiveGestures() && this.getActiveInstrumentCount() >= 2) {
        this.advanceRhythm();
      }
    }, (60000 / this.bpm)); // Full beat timing
  }

  /** Check if user is actively playing any instruments with significant intent */
  private hasActiveGestures(): boolean {
    const activeCount = Object.values(this.activeNotes).filter(note => note !== null).length;
    return activeCount >= 2; // Require at least 2 active instruments to trigger AI
  }

  /** Count how many instruments are currently active */
  private getActiveInstrumentCount(): number {
    return Object.values(this.activeNotes).filter(note => note !== null).length;
  }

  /** AI: Advance to next chord in progression with musical logic */
  private advanceChordProgression() {
    const progression = CHORD_PROGRESSIONS[this.currentStyle];
    this.currentChordIndex = (this.currentChordIndex + 1) % progression.length;
    this.lastChordChange = Date.now();
    
    console.log(`🎵 AI: Chord progression advanced to ${progression[this.currentChordIndex]}`);
  }

  /** AI: Get current chord for harmonization */
  private getCurrentChord(): string {
    const progression = CHORD_PROGRESSIONS[this.currentStyle];
    return progression[this.currentChordIndex];
  }

  /** AI: Advance rhythm pattern with musical feel */
  private advanceRhythm() {
    this.rhythmIndex = (this.rhythmIndex + 1) % this.rhythmPattern.length;
  }

  /** AI: Change music style dynamically with smooth transitions */
  setMusicStyle(style: keyof typeof CHORD_PROGRESSIONS) {
    this.currentStyle = style;
    this.currentChordIndex = 0;
    console.log(`🎵 AI: Music style changed to ${style.toUpperCase()}`);
  }

  /** Professional harmony with musical context */
  private playProfessionalHarmony(_rootNote: string) {
    const currentChord = this.getCurrentChord();
    const chordNotes = CHORD_NOTES[currentChord as keyof typeof CHORD_NOTES];
    
    if (chordNotes && chordNotes.length >= 3) {
      // Play a rich chord voicing
      const voicing = [
        chordNotes[0] + '3', // Root in lower octave
        chordNotes[1] + '4', // Third
        chordNotes[2] + '4'  // Fifth
      ];
      
      setTimeout(() => {
        this.harmonizer.triggerAttackRelease(voicing, '1n', Tone.now(), 0.08);
      }, 150);
    }
  }

  /** Intelligent bassline generation */
  private playIntelligentBassline() {
    if (Math.random() < 0.3) { // 30% chance to play bass note
      const currentChord = this.getCurrentChord();
      const chordNotes = CHORD_NOTES[currentChord as keyof typeof CHORD_NOTES];
      
      if (chordNotes) {
        const bassNote = chordNotes[0] + '2'; // Root note in bass octave
        this.bassline.triggerAttackRelease(bassNote, '4n', Tone.now(), 0.4);
      }
    }
  }

  /** AI: Auto-detect and suggest optimal BPM based on user gestures */
  intelligentBpmAdjustment(gestureEnergy: number) {
    // AI logic: Adjust BPM based on user energy level with musical constraints
    const targetBpm = Math.max(70, Math.min(160, 100 + (gestureEnergy - 0.5) * 60));
    
    if (Math.abs(targetBpm - this.bpm) > 8) {
      this.setBpm(targetBpm);
      console.log(`🤖 AI: Auto-adjusted BPM to ${Math.round(targetBpm)} based on gesture energy`);
    }
  }

  /** Release note for instrument with proper cleanup */
  releaseInstrument(instrument: FingerInstrument) {
    const current = this.activeNotes[instrument];
    if (current) {
      // Fix: Provide time parameter for triggerRelease
      if ('triggerRelease' in current.synth) {
        (current.synth as any).triggerRelease(Tone.now());
      }
      this.activeNotes[instrument] = null;
    }
  }

  releaseAll() { 
    Object.keys(this.instruments).forEach(instrument => 
      this.releaseInstrument(instrument as FingerInstrument)
    ); 
  }

  // Legacy compatibility methods
  get activeSection() { return 'Professional Orchestra'; }
  setActiveSection() {}
  playSectionNote() {}
  releaseSection() {}
  triggerDrum() {}
}
