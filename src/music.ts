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

/** Enhanced MusicEngine with Professional Audio and Realistic Instruments */
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
    
    // Create realistic instrument synthesizers
    this.createInstruments();

    // Start enhanced AI music intelligence
    this.startEnhancedMusicAI();
    
    Tone.Transport.start();
    const resume = () => { Tone.start(); document.removeEventListener('pointerdown', resume); };
    document.addEventListener('pointerdown', resume);
  }

  private createInstruments() {
    // Piano - Rich harmonic content
    this.instruments['Piano'] = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.002, decay: 0.3, sustain: 0.2, release: 1.5 }
    }).connect(this.delay);

    // Guitar - Plucked string simulation
    this.instruments['Guitar'] = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.9
    }).connect(this.delay);

    // Violin - FM synthesis for bowing simulation
    this.instruments['Violin'] = new Tone.FMSynth({
      harmonicity: 3,
      modulationIndex: 12,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.2, decay: 0.1, sustain: 0.9, release: 0.5 }
    }).connect(this.delay);

    // Flute - Pure tone with breath-like attack
    this.instruments['Flute'] = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.4 }
    }).connect(this.delay);

    // Bass - Deep fundamental frequencies
    this.instruments['Bass'] = new Tone.FMSynth({
      harmonicity: 0.25,
      modulationIndex: 10,
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.5 }
    }).connect(this.gain);

    // Trumpet - Brass-like FM synthesis
    this.instruments['Trumpet'] = new Tone.FMSynth({
      harmonicity: 2,
      modulationIndex: 8,
      oscillator: { type: 'square' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.3 }
    }).connect(this.delay);

    // Saxophone - Warm reed-like tone
    this.instruments['Saxophone'] = new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 6,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.03, decay: 0.2, sustain: 0.8, release: 0.4 }
    }).connect(this.delay);

    // Drums - Percussive with short decay
    this.instruments['Drums'] = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 }
    }).connect(this.gain);

    // Percussion - Varied attack for different timbres
    this.instruments['Percussion'] = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.3 }
    }).connect(this.delay);

    // Harp - Plucked with long resonance
    this.instruments['Harp'] = new Tone.PluckSynth({
      attackNoise: 0.5,
      dampening: 2000,
      resonance: 0.95
    }).connect(this.reverb);

    // Initialize active notes
    Object.keys(this.instruments).forEach(instrument => {
      this.activeNotes[instrument as FingerInstrument] = null;
    });
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

  /** Play note with enhanced musical intelligence */
  playInstrument(instrument: FingerInstrument, note: string, velocity = 0.7) {
    const synth = this.instruments[instrument];
    if (!synth) {
      console.warn(`No synth found for instrument: ${instrument}`);
      return;
    }
    
    const current = this.activeNotes[instrument];
    if (current && current.note === note) return; // already playing
    
    if (current) {
      // Release previous note
      if ('triggerRelease' in current.synth) {
        (current.synth as any).triggerRelease(Tone.now());
      }
    }
    
    // Apply musical intelligence
    const isRhythm = ['Drums', 'Bass', 'Percussion'].includes(instrument);
    const enhancedNote = isRhythm ? note : this.musicallyEnhance(note);
    
    console.log(`🎵 Playing ${instrument}: ${enhancedNote} (velocity: ${velocity})`);
    
    // Trigger note with proper velocity
    if ('triggerAttack' in synth) {
      (synth as any).triggerAttack(enhancedNote, Tone.now());
      if ('volume' in synth) {
        (synth as any).volume.value = Math.log10(Math.min(1, Math.max(0.1, velocity))) * 20;
      }
    }
    
    this.activeNotes[instrument] = { note: enhancedNote, synth };
    
    // Enhanced AI backing
    if (!isRhythm && Math.random() < 0.08 && this.getActiveInstrumentCount() >= 3) { 
      this.playProfessionalHarmony();
    }
    
    // Intelligent bassline
    if (this.getActiveInstrumentCount() >= 2) {
      this.playIntelligentBassline();
    }
  }

  /** Enhanced musical processing using music theory */
  private musicallyEnhance(note: string): string {
    const currentChord = this.getCurrentChord();
    const currentScale = this.getCurrentScale();
    
    const noteName = note.replace(/\d/, '');
    const octave = note.match(/\d/) ? note.match(/\d/)![0] : '4';
    
    const chordNotes = CHORD_NOTES[currentChord as keyof typeof CHORD_NOTES] || [];
    
    if (chordNotes.includes(noteName)) {
      return note; // Already a chord tone
    }
    
    // Find closest chord tone
    const noteIndex = currentScale.indexOf(noteName);
    if (noteIndex !== -1) {
      for (const offset of [0, 1, -1, 2, -2]) {
        const targetIndex = (noteIndex + offset + currentScale.length) % currentScale.length;
        const targetNote = currentScale[targetIndex];
        if (chordNotes.includes(targetNote)) {
          return targetNote + octave;
        }
      }
    }
    
    return note; // Fallback
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

  /** Enhanced AI Music Intelligence */
  private startEnhancedMusicAI() {
    // Professional chord progression
    setInterval(() => {
      if (this.hasActiveGestures() && this.getActiveInstrumentCount() >= 2) {
        this.advanceChordProgression();
      }
    }, this.chordChangeDuration);
    
    // Musical rhythm
    setInterval(() => {
      if (this.hasActiveGestures() && this.getActiveInstrumentCount() >= 2) {
        this.advanceRhythm();
      }
    }, (60000 / this.bpm));
  }

  private hasActiveGestures(): boolean {
    const activeCount = Object.values(this.activeNotes).filter(note => note !== null).length;
    return activeCount >= 2;
  }

  private getActiveInstrumentCount(): number {
    return Object.values(this.activeNotes).filter(note => note !== null).length;
  }

  private advanceChordProgression() {
    const progression = CHORD_PROGRESSIONS[this.currentStyle];
    this.currentChordIndex = (this.currentChordIndex + 1) % progression.length;
    this.lastChordChange = Date.now();
    
    console.log(`🎵 AI: Chord progression advanced to ${progression[this.currentChordIndex]}`);
  }

  private getCurrentChord(): string {
    const progression = CHORD_PROGRESSIONS[this.currentStyle];
    return progression[this.currentChordIndex];
  }

  private advanceRhythm() {
    this.rhythmIndex = (this.rhythmIndex + 1) % this.rhythmPattern.length;
  }

  /** Professional harmony */
  private playProfessionalHarmony() {
    const currentChord = this.getCurrentChord();
    const chordNotes = CHORD_NOTES[currentChord as keyof typeof CHORD_NOTES];
    
    if (chordNotes && chordNotes.length >= 3) {
      const voicing = [
        chordNotes[0] + '3',
        chordNotes[1] + '4',
        chordNotes[2] + '4'
      ];
      
      setTimeout(() => {
        this.harmonizer.triggerAttackRelease(voicing, '1n', Tone.now(), 0.08);
      }, 150);
    }
  }

  /** Intelligent bassline */
  private playIntelligentBassline() {
    if (Math.random() < 0.3) {
      const currentChord = this.getCurrentChord();
      const chordNotes = CHORD_NOTES[currentChord as keyof typeof CHORD_NOTES];
      
      if (chordNotes) {
        const bassNote = chordNotes[0] + '2';
        this.bassline.triggerAttackRelease(bassNote, '4n', Tone.now(), 0.4);
      }
    }
  }

  setMusicStyle(style: keyof typeof CHORD_PROGRESSIONS) {
    this.currentStyle = style;
    this.currentChordIndex = 0;
    
    // Apply style-specific audio processing and instrument modifications
    this.applyStyleEffects(style);
    
    console.log(`🎵 AI: Music style changed to ${style.toUpperCase()}`);
  }

  // Apply different audio effects and instrument characteristics for each style
  private applyStyleEffects(style: keyof typeof CHORD_PROGRESSIONS) {
    // Release all current notes to hear the style change immediately
    this.releaseAll();
    
    switch (style) {
      case 'jazz':
        // Jazz: More reverb, softer attack, swing feel
        this.reverb.wet.rampTo(0.4, 0.5);
        this.delay.wet.rampTo(0.25, 0.5);
        this.chordChangeDuration = 2500; // Faster chord changes
        break;
        
      case 'blues':
        // Blues: Raw sound, less reverb, more sustain
        this.reverb.wet.rampTo(0.2, 0.5);
        this.delay.wet.rampTo(0.1, 0.5);
        this.chordChangeDuration = 4000; // Slower, more emotional
        break;
        
      case 'classical':
        // Classical: Clean, precise, moderate reverb
        this.reverb.wet.rampTo(0.35, 0.5);
        this.delay.wet.rampTo(0.15, 0.5);
        this.chordChangeDuration = 3500; // Structured timing
        break;
        
      case 'rock':
        // Rock: Punchy, compressed, shorter decay
        this.reverb.wet.rampTo(0.15, 0.5);
        this.delay.wet.rampTo(0.2, 0.5);
        this.chordChangeDuration = 2000; // Fast, energetic
        break;
        
      case 'ambient':
        // Ambient: Lots of reverb and delay, long sustains
        this.reverb.wet.rampTo(0.6, 0.5);
        this.delay.wet.rampTo(0.4, 0.5);
        this.chordChangeDuration = 6000; // Very slow evolution
        break;
        
      case 'pop':
      default:
        // Pop: Balanced, commercial sound
        this.reverb.wet.rampTo(0.3, 0.5);
        this.delay.wet.rampTo(0.15, 0.5);
        this.chordChangeDuration = 3000; // Standard timing
        break;
    }
    
    // Trigger a chord change to demonstrate the new style immediately
    this.triggerStyleChange();
  }

  // Trigger an immediate demonstration of the new style
  private triggerStyleChange() {
    const progression = CHORD_PROGRESSIONS[this.currentStyle];
    const currentChord = progression[this.currentChordIndex];
    const chordNotes = CHORD_NOTES[currentChord as keyof typeof CHORD_NOTES];
    
    if (chordNotes) {
      // Play a brief chord to demonstrate the new style
      const chord = chordNotes.map(note => note + '4');
      this.harmonizer.triggerAttackRelease(chord, '1n', Tone.now(), 0.3);
      
      // Play bass note
      const bassNote = chordNotes[0] + '2';
      this.bassline.triggerAttackRelease(bassNote, '2n', Tone.now(), 0.4);
    }
  }

  intelligentBpmAdjustment(gestureEnergy: number) {
    const targetBpm = Math.max(70, Math.min(160, 100 + (gestureEnergy - 0.5) * 60));
    
    if (Math.abs(targetBpm - this.bpm) > 8) {
      this.setBpm(targetBpm);
      console.log(`🤖 AI: Auto-adjusted BPM to ${Math.round(targetBpm)} based on gesture energy`);
    }
  }

  releaseInstrument(instrument: FingerInstrument) {
    const current = this.activeNotes[instrument];
    if (current) {
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

  // Legacy compatibility
  get activeSection() { return 'Professional Orchestra'; }
  setActiveSection() {}
  playSectionNote() {}
  releaseSection() {}
  triggerDrum() {}
}
