/**
 * 🌌 STRUDEL 3D INTEGRATION ENGINE
 * Seamlessly integrates Strudel live-coding with the existing 3D visual system
 * Creates synchronized audio-visual experiences
 */

import { GestureToStrudelEngine } from './strudel-engine';
import { StrudelEvolutionEngine } from './strudel-evolution';
import type { NormalizedLandmarkList } from './tracking';
import type { ArtisticParticleEngine } from './artistic-particles';
import type { AmbientUniverse } from './ambient-universe';

export interface StrudelVisualizationEvent {
  type: 'pattern_start' | 'pattern_change' | 'beat' | 'accent' | 'harmony';
  instrument: string;
  intensity: number; // 0-1
  position: { x: number; y: number; z?: number };
  color: string;
  duration: number; // milliseconds
}

export interface Strudel3DState {
  activePatterns: string[];
  currentEmotion: string;
  intensity: number;
  complexity: number;
  tempo: number;
  visualEvents: StrudelVisualizationEvent[];
}

/**
 * 🎨 VISUAL EVENT GENERATOR
 * Converts Strudel patterns into visual events for 3D particle systems
 */
class StrudelVisualEventGenerator {
  private lastBeatTime = 0;
  private beatInterval = 500; // ms

  generateEventsFromPattern(pattern: string, position: { x: number; y: number }, 
                           emotion: string, intensity: number): StrudelVisualizationEvent[] {
    const events: StrudelVisualizationEvent[] = [];
    const now = performance.now();

    // Parse pattern for visual cues
    const instruments = this.extractInstruments(pattern);
    const effects = this.extractEffects(pattern);
    
    instruments.forEach(instrument => {
      // Create visual event for each instrument
      events.push({
        type: 'pattern_start',
        instrument,
        intensity,
        position: { 
          x: position.x + (Math.random() - 0.5) * 0.1, 
          y: position.y + (Math.random() - 0.5) * 0.1, 
          z: Math.random() * 0.2 
        },
        color: this.getInstrumentColor(instrument, emotion),
        duration: this.getInstrumentDuration(instrument, intensity)
      });
    });

    // Generate beat events
    if (now - this.lastBeatTime > this.beatInterval) {
      events.push({
        type: 'beat',
        instrument: 'master',
        intensity: intensity * 0.8,
        position: { x: 0.5, y: 0.5, z: 0 },
        color: this.getEmotionColor(emotion),
        duration: 200
      });
      this.lastBeatTime = now;
    }

    // Add harmony events for complex patterns
    if (pattern.includes('stack(') || pattern.includes('chord')) {
      events.push({
        type: 'harmony',
        instrument: 'harmony',
        intensity: intensity * 1.2,
        position,
        color: this.getHarmonyColor(emotion),
        duration: 1000
      });
    }

    return events;
  }

  private extractInstruments(pattern: string): string[] {
    const instruments = [];
    
    // Extract from sound() calls
    const soundMatches = pattern.match(/sound\("([^"]+)"\)/g);
    if (soundMatches) {
      soundMatches.forEach(match => {
        const instrument = match.match(/sound\("([^"]+)"\)/)?.[1];
        if (instrument && !instruments.includes(instrument)) {
          instruments.push(instrument);
        }
      });
    }

    // Extract from .s() calls (synth selection)
    const synthMatches = pattern.match(/\.s\("([^"]+)"\)/g);
    if (synthMatches) {
      synthMatches.forEach(match => {
        const synth = match.match(/\.s\("([^"]+)"\)/)?.[1];
        if (synth && !instruments.includes(synth)) {
          instruments.push(synth);
        }
      });
    }

    return instruments.length ? instruments : ['default'];
  }

  private extractEffects(pattern: string): string[] {
    const effects = [];
    
    if (pattern.includes('.reverb') || pattern.includes('.room')) effects.push('reverb');
    if (pattern.includes('.delay')) effects.push('delay');
    if (pattern.includes('.chorus')) effects.push('chorus');
    if (pattern.includes('.distortion') || pattern.includes('.gain')) effects.push('distortion');
    if (pattern.includes('.lpf')) effects.push('lowpass');
    if (pattern.includes('.hpf')) effects.push('highpass');

    return effects;
  }

  private getInstrumentColor(instrument: string, emotion: string): string {
    const instrumentColors = {
      'bd': '#ff4757', // Bass drum - red
      'sn': '#ffa502', // Snare - orange
      'hh': '#fffa65', // Hi-hat - yellow
      'piano': '#45b7d1', // Piano - blue
      'bass': '#26de81', // Bass - green
      '808': '#8e44ad', // 808 - purple
      'pad': '#f8b500', // Pad - warm orange
      'bells': '#00d8ff', // Bells - cyan
      'space': '#9c27b0', // Space - purple
      'wind': '#607d8b', // Wind - blue-grey
      'default': '#ffffff' // Default - white
    };

    const emotionModifiers = {
      'happy': 1.2, // Brighter
      'energetic': 1.4, // Much brighter
      'aggressive': 1.3, // Bright with more red
      'sad': 0.6, // Darker
      'calm': 0.8, // Slightly darker
      'peaceful': 0.7 // Softer
    };

    let baseColor = instrumentColors[instrument as keyof typeof instrumentColors] || instrumentColors.default;
    const modifier = emotionModifiers[emotion as keyof typeof emotionModifiers] || 1;

    // Apply emotion modifier to color brightness
    return this.adjustColorBrightness(baseColor, modifier);
  }

  private getEmotionColor(emotion: string): string {
    const emotionColors = {
      'happy': '#ffeb3b', // Bright yellow
      'sad': '#3f51b5', // Deep blue
      'energetic': '#ff5722', // Vibrant red-orange
      'calm': '#4caf50', // Calm green
      'aggressive': '#f44336', // Intense red
      'peaceful': '#9c27b0' // Soft purple
    };

    return emotionColors[emotion as keyof typeof emotionColors] || '#ffffff';
  }

  private getHarmonyColor(emotion: string): string {
    // Harmony colors are complementary to emotion colors
    const harmonyColors = {
      'happy': '#9c27b0', // Purple complements yellow
      'sad': '#ff9800', // Orange complements blue
      'energetic': '#2196f3', // Blue complements red-orange
      'calm': '#e91e63', // Pink complements green
      'aggressive': '#00bcd4', // Cyan complements red
      'peaceful': '#ffeb3b' // Yellow complements purple
    };

    return harmonyColors[emotion as keyof typeof harmonyColors] || '#ffffff';
  }

  private getInstrumentDuration(instrument: string, intensity: number): number {
    const baseDurations = {
      'bd': 200, // Bass drum - short
      'sn': 150, // Snare - short
      'hh': 100, // Hi-hat - very short
      'piano': 800, // Piano - longer
      'bass': 600, // Bass - medium
      'pad': 2000, // Pad - very long
      'bells': 1200, // Bells - long
      'default': 400
    };

    const baseDuration = baseDurations[instrument as keyof typeof baseDurations] || baseDurations.default;
    return baseDuration * (0.5 + intensity * 1.5); // Scale with intensity
  }

  private adjustColorBrightness(hex: string, factor: number): string {
    // Convert hex to RGB, adjust brightness, convert back
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  setBPM(bpm: number): void {
    this.beatInterval = 60000 / bpm; // Convert BPM to milliseconds
  }
}

/**
 * 🚀 MAIN STRUDEL INTEGRATION ENGINE
 * Orchestrates Strudel pattern generation with 3D visual effects
 */
export class Strudel3DIntegration {
  private strudelEngine = new GestureToStrudelEngine();
  private evolutionEngine = new StrudelEvolutionEngine();
  private visualGenerator = new StrudelVisualEventGenerator();
  private isEnabled = false;
  private currentPatterns = new Map<string, string>();
  
  constructor(
    private particleEngine: ArtisticParticleEngine,
    private ambientUniverse: AmbientUniverse
  ) {}

  /**
   * Main update loop - call this every frame
   */
  update(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null): Strudel3DState {
    if (!this.isEnabled || !this.strudelEngine.isReady()) {
      return this.getEmptyState();
    }

    // Generate base Strudel patterns from gestures
    const gesturePatterns = this.generateGesturePatterns(left, right);
    
    // Evolve patterns based on gesture changes
    const evolvedPatterns = this.evolutionEngine.evolvePatterns(left, right, gesturePatterns);
    
    // Update current patterns
    this.currentPatterns = evolvedPatterns;

    // Generate visual events
    const visualEvents = this.generateVisualEvents(left, right, evolvedPatterns);

    // Apply visual events to particle systems
    this.applyVisualEvents(visualEvents);

    // Return current state
    return {
      activePatterns: Array.from(evolvedPatterns.keys()),
      currentEmotion: this.getCurrentEmotion(left, right),
      intensity: this.getCurrentIntensity(left, right),
      complexity: this.getCurrentComplexity(evolvedPatterns),
      tempo: this.getCurrentTempo(left, right),
      visualEvents
    };
  }

  private generateGesturePatterns(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null): Map<string, string> {
    const patterns = new Map<string, string>();
    
    const strudelCode = this.strudelEngine.generateStrudelCode(left, right);
    
    if (strudelCode !== 'silence()') {
      patterns.set('main', strudelCode);
      
      // Generate additional patterns for left and right hands separately
      if (left) {
        const leftPattern = this.strudelEngine.generateStrudelCode(left, null);
        patterns.set('left', leftPattern);
      }
      
      if (right) {
        const rightPattern = this.strudelEngine.generateStrudelCode(null, right);
        patterns.set('right', rightPattern);
      }
    }

    return patterns;
  }

  private generateVisualEvents(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null,
                              patterns: Map<string, string>): StrudelVisualizationEvent[] {
    const allEvents: StrudelVisualizationEvent[] = [];
    const emotion = this.getCurrentEmotion(left, right);
    const intensity = this.getCurrentIntensity(left, right);

    patterns.forEach((pattern, patternId) => {
      let position = { x: 0.5, y: 0.5 };
      
      // Position based on pattern source
      if (patternId === 'left' && left) {
        position = { x: left[0].x, y: left[0].y };
      } else if (patternId === 'right' && right) {
        position = { x: right[0].x, y: right[0].y };
      } else if (left && right) {
        position = { 
          x: (left[0].x + right[0].x) / 2, 
          y: (left[0].y + right[0].y) / 2 
        };
      }

      const events = this.visualGenerator.generateEventsFromPattern(pattern, position, emotion, intensity);
      allEvents.push(...events);
    });

    return allEvents;
  }

  private applyVisualEvents(events: StrudelVisualizationEvent[]): void {
    events.forEach(event => {
      switch (event.type) {
        case 'pattern_start':
          this.createPatternVisual(event);
          break;
        case 'beat':
          this.createBeatVisual(event);
          break;
        case 'harmony':
          this.createHarmonyVisual(event);
          break;
        case 'accent':
          this.createAccentVisual(event);
          break;
      }
    });
  }

  private createPatternVisual(event: StrudelVisualizationEvent): void {
    // Create mosaic particle for pattern start
    this.particleEngine.createMosaicParticle(
      event.position.x,
      event.position.y,
      event.position.z || 0,
      event.instrument,
      'C4', // Default note
      event.intensity
    );

    // Create ambient universe energy burst
    this.ambientUniverse.createEnergyBurst(
      event.position.x,
      event.position.y,
      event.intensity,
      event.instrument
    );
  }

  private createBeatVisual(event: StrudelVisualizationEvent): void {
    // Create plasma field for beats
    this.ambientUniverse.createPlasmaField(
      event.position.x,
      event.position.y,
      50 + event.intensity * 100
    );
  }

  private createHarmonyVisual(event: StrudelVisualizationEvent): void {
    // Create crystal formation for harmony
    this.particleEngine.createCrystalFormation(
      event.position.x,
      event.position.y,
      event.intensity,
      'left' // Use left hand type
    );

    // Create neural network
    this.ambientUniverse.createNeuralNetwork(
      event.position.x,
      event.position.y,
      event.intensity
    );
  }

  private createAccentVisual(event: StrudelVisualizationEvent): void {
    // Create special accent effect
    this.particleEngine.createEnergyField(
      event.position.x,
      event.position.y,
      event.position.z || 0,
      event.intensity,
      'left'
    );
  }

  private getCurrentEmotion(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null): string {
    // Simple emotion detection based on hand positions
    const hands = [left, right].filter(Boolean) as NormalizedLandmarkList[];
    if (!hands.length) return 'calm';

    let totalMovement = 0;
    let avgHeight = 0;

    hands.forEach(hand => {
      avgHeight += (1 - hand[0].y); // Invert Y for intuitive height
      // Simple movement calculation
      hand.forEach((point, i) => {
        if (i > 0) {
          const prev = hand[i - 1];
          totalMovement += Math.abs(point.x - prev.x) + Math.abs(point.y - prev.y);
        }
      });
    });

    avgHeight /= hands.length;
    totalMovement /= hands.length;

    if (totalMovement > 0.5) return 'energetic';
    if (avgHeight > 0.7) return 'happy';
    if (avgHeight < 0.3) return 'sad';
    return 'calm';
  }

  private getCurrentIntensity(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null): number {
    const hands = [left, right].filter(Boolean) as NormalizedLandmarkList[];
    if (!hands.length) return 0;

    // Calculate intensity based on hand spread and movement
    let totalSpread = 0;
    hands.forEach(hand => {
      const fingertips = [4, 8, 12, 16, 20].map(i => hand[i]);
      const wrist = hand[0];
      const spread = fingertips.reduce((sum, tip) => {
        return sum + Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
      }, 0) / fingertips.length;
      totalSpread += spread;
    });

    return Math.min(1, totalSpread / hands.length * 3);
  }

  private getCurrentComplexity(patterns: Map<string, string>): number {
    let totalComplexity = 0;
    patterns.forEach(pattern => {
      // Count pattern elements as complexity measure
      const elements = (pattern.match(/\./g) || []).length;
      totalComplexity += elements;
    });
    
    return totalComplexity / Math.max(1, patterns.size);
  }

  private getCurrentTempo(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null): number {
    // Simple tempo estimation - could be enhanced with actual beat detection
    const intensity = this.getCurrentIntensity(left, right);
    return 60 + intensity * 120; // Range: 60-180 BPM
  }

  private getEmptyState(): Strudel3DState {
    return {
      activePatterns: [],
      currentEmotion: 'calm',
      intensity: 0,
      complexity: 0,
      tempo: 120,
      visualEvents: []
    };
  }

  /**
   * PUBLIC API
   */
  enable(): void {
    this.isEnabled = true;
    console.log('🎵 Strudel 3D Integration enabled');
  }

  disable(): void {
    this.isEnabled = false;
    this.currentPatterns.clear();
    console.log('🎵 Strudel 3D Integration disabled');
  }

  isActiveMode(): boolean {
    return this.isEnabled;
  }

  getCurrentPatterns(): Map<string, string> {
    return new Map(this.currentPatterns);
  }

  setBPM(bpm: number): void {
    this.visualGenerator.setBPM(bpm);
  }

  setEvolutionRate(rate: number): void {
    this.evolutionEngine.setEvolutionRate(rate);
  }

  reset(): void {
    this.evolutionEngine.reset();
    this.strudelEngine.reset();
    this.currentPatterns.clear();
  }

  getStats() {
    return {
      ...this.evolutionEngine.getEvolutionStats(),
      isEnabled: this.isEnabled,
      patternsActive: this.currentPatterns.size
    };
  }
}