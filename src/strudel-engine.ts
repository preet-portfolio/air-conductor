/**
 * 🎵 STRUDEL GESTURE ENGINE
 * Revolutionary live-coding music generation controlled by natural hand gestures
 * Transforms Air Conductor into a professional musical performance platform
 */

import { Pattern, silence, stack, sound, note } from '@strudel/core';
import type { NormalizedLandmarkList } from './tracking';

export interface GestureMusicalIntent {
  emotion: 'happy' | 'sad' | 'energetic' | 'calm' | 'aggressive' | 'peaceful';
  intensity: number; // 0-1
  tempo: number; // BPM
  complexity: number; // 0-1, affects pattern density
  style: 'electronic' | 'acoustic' | 'hybrid' | 'experimental';
}

export interface StrudelGestureMapping {
  instrument: string;
  pattern: string;
  velocity: number;
  effects: string[];
}

/**
 * 🧠 ADVANCED GESTURE INTELLIGENCE
 * Analyzes hand movements to determine musical intent and generate appropriate Strudel patterns
 */
class MusicalGestureIntelligence {
  private emotionHistory: string[] = [];
  private gestureEnergyBuffer: number[] = [];

  /**
   * Analyze gesture to detect emotional musical intent
   */
  detectEmotion(hands: NormalizedLandmarkList[]): GestureMusicalIntent['emotion'] {
    if (!hands.length) return 'calm';

    let totalMovement = 0;
    let avgHeight = 0;
    let gestureSpread = 0;

    hands.forEach(hand => {
      if (!hand) return;
      
      // Calculate movement intensity
      hand.forEach((point, i) => {
        if (i > 0) {
          const prev = hand[i - 1];
          const movement = Math.sqrt(
            Math.pow(point.x - prev.x, 2) + 
            Math.pow(point.y - prev.y, 2)
          );
          totalMovement += movement;
        }
      });

      // Average hand height (lower Y = higher position)
      avgHeight += hand.reduce((sum, point) => sum + (1 - point.y), 0) / hand.length;

      // Hand openness/spread
      const fingertips = [4, 8, 12, 16, 20].map(i => hand[i]);
      const wrist = hand[0];
      const avgDistance = fingertips.reduce((sum, tip) => {
        return sum + Math.sqrt(
          Math.pow(tip.x - wrist.x, 2) + 
          Math.pow(tip.y - wrist.y, 2)
        );
      }, 0) / fingertips.length;
      gestureSpread += avgDistance;
    });

    avgHeight /= hands.length;
    gestureSpread /= hands.length;
    
    // Emotional analysis
    if (totalMovement > 0.8) return 'aggressive';
    if (totalMovement > 0.5) return 'energetic';
    if (avgHeight > 0.7) return 'happy';
    if (avgHeight < 0.3) return 'sad';
    if (gestureSpread < 0.1) return 'peaceful';
    
    return 'calm';
  }

  /**
   * Calculate musical complexity based on gesture sophistication
   */
  calculateComplexity(hands: NormalizedLandmarkList[]): number {
    if (!hands.length) return 0.1;

    let complexity = 0;

    hands.forEach(hand => {
      // Finger independence - more complex when fingers move independently
      const fingertips = [4, 8, 12, 16, 20];
      let independence = 0;

      for (let i = 0; i < fingertips.length - 1; i++) {
        const current = hand[fingertips[i]];
        const next = hand[fingertips[i + 1]];
        const distance = Math.sqrt(
          Math.pow(current.x - next.x, 2) + 
          Math.pow(current.y - next.y, 2)
        );
        independence += distance;
      }

      complexity += Math.min(1, independence * 3);
    });

    return complexity / hands.length;
  }

  /**
   * Estimate tempo from conducting patterns
   */
  estimateTempo(hands: NormalizedLandmarkList[]): number {
    // Store gesture energy for tempo analysis
    const energy = hands.reduce((sum, hand) => {
      if (!hand) return sum;
      const wrist = hand[0];
      return sum + Math.abs(wrist.y - 0.5); // Movement from center
    }, 0);

    this.gestureEnergyBuffer.push(energy);
    if (this.gestureEnergyBuffer.length > 20) {
      this.gestureEnergyBuffer.shift();
    }

    // Simple tempo estimation based on energy fluctuation
    if (this.gestureEnergyBuffer.length < 10) return 120;

    const avgEnergy = this.gestureEnergyBuffer.reduce((a, b) => a + b) / this.gestureEnergyBuffer.length;
    const baseTempo = 80 + (avgEnergy * 100); // Range: 80-180 BPM
    
    return Math.min(180, Math.max(60, Math.round(baseTempo)));
  }
}

/**
 * 🎹 GESTURE TO STRUDEL PATTERN CONVERTER
 * Maps natural hand gestures to sophisticated Strudel live-coding patterns
 */
export class GestureToStrudelEngine {
  private intelligence = new MusicalGestureIntelligence();
  private currentPatterns: Map<string, Pattern> = new Map();
  private lastGestureTime = 0;
  private isActive = false;

  constructor() {
    this.initializeStrudel();
  }

  private async initializeStrudel() {
    try {
      // Initialize Strudel with Web Audio
      // Note: Web Audio context will be created when user interacts
      console.log('🎵 Strudel engine initialized for gesture-controlled live coding');
      this.isActive = true;
    } catch (error) {
      console.error('Failed to initialize Strudel:', error);
      this.isActive = false;
    }
  }

  /**
   * 🎭 SPATIAL GESTURE MAPPING
   * Maps hand positions in 3D space to musical parameters
   */
  mapSpatialGestures(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null): StrudelGestureMapping[] {
    const mappings: StrudelGestureMapping[] = [];
    
    if (!this.isActive) return mappings;

    const hands = [left, right].filter(Boolean) as NormalizedLandmarkList[];
    if (!hands.length) return mappings;

    // Analyze musical intent
    const emotion = this.intelligence.detectEmotion(hands);
    const complexity = this.intelligence.calculateComplexity(hands);
    const tempo = this.intelligence.estimateTempo(hands);

    // LEFT HAND: Rhythm and Bass
    if (left) {
      const leftWrist = left[0];
      const leftHeight = 1 - leftWrist.y; // 0=bottom, 1=top
      
      // Bass pattern based on hand height
      const bassPattern = this.generateBassPattern(leftHeight, complexity, emotion);
      mappings.push({
        instrument: 'bass',
        pattern: bassPattern,
        velocity: Math.min(1, leftHeight + 0.3),
        effects: this.getEffectsForEmotion(emotion, 'bass')
      });

      // Drum pattern based on hand movement
      const drumPattern = this.generateDrumPattern(left, complexity, emotion);
      mappings.push({
        instrument: 'drums',
        pattern: drumPattern,
        velocity: complexity,
        effects: this.getEffectsForEmotion(emotion, 'drums')
      });
    }

    // RIGHT HAND: Melody and Harmony
    if (right) {
      const rightWrist = right[0];
      const rightHeight = 1 - rightWrist.y;
      
      // Melody pattern based on finger positions
      const melodyPattern = this.generateMelodyPattern(right, rightHeight, emotion);
      mappings.push({
        instrument: 'melody',
        pattern: melodyPattern,
        velocity: Math.min(1, rightHeight + 0.2),
        effects: this.getEffectsForEmotion(emotion, 'melody')
      });

      // Harmony based on hand openness
      const handSpread = this.calculateHandSpread(right);
      if (handSpread > 0.15) {
        const harmonyPattern = this.generateHarmonyPattern(handSpread, emotion);
        mappings.push({
          instrument: 'harmony',
          pattern: harmonyPattern,
          velocity: handSpread * 0.8,
          effects: this.getEffectsForEmotion(emotion, 'harmony')
        });
      }
    }

    // BOTH HANDS: Special combined effects
    if (left && right) {
      const handDistance = this.calculateHandDistance(left, right);
      
      // Close hands = special harmony effects
      if (handDistance < 0.2) {
        const specialPattern = this.generateSpecialPattern(handDistance, emotion, complexity);
        mappings.push({
          instrument: 'special',
          pattern: specialPattern,
          velocity: 1 - handDistance, // Closer = louder
          effects: ['reverb', 'delay', 'chorus']
        });
      }
    }

    return mappings;
  }

  /**
   * 🎵 PATTERN GENERATORS
   * Generate Strudel patterns based on musical analysis
   */
  private generateBassPattern(height: number, complexity: number, emotion: string): string {
    const densityMap = {
      'calm': 'x..',
      'peaceful': 'x...',
      'happy': 'x.x.',
      'energetic': 'x.xx',
      'aggressive': 'xxxx',
      'sad': 'x...x..'
    };

    const basePattern = densityMap[emotion as keyof typeof densityMap] || 'x.x.';
    const note = this.getEmotionalNote(emotion, 'bass');
    const octave = Math.floor(height * 3) + 1; // 1-4

    return `sound("808").note("${note}${octave}").struct("${basePattern}")`;
  }

  private generateDrumPattern(hand: NormalizedLandmarkList, complexity: number, emotion: string): string {
    const fingertips = [4, 8, 12, 16, 20].map(i => hand[i]);
    
    // Use finger positions to create drum pattern
    const pattern = fingertips.map((tip, i) => {
      const height = 1 - tip.y;
      const instruments = ['bd', 'sn', 'hh', 'cp', 'oh'];
      return height > 0.6 ? instruments[i] : '~';
    });

    const patternStr = pattern.join(' ');
    const speed = emotion === 'energetic' || emotion === 'aggressive' ? '.fast(1.5)' : '';
    
    return `sound("${patternStr}")${speed}`;
  }

  private generateMelodyPattern(hand: NormalizedLandmarkList, height: number, emotion: string): string {
    const fingertips = [4, 8, 12, 16, 20].map(i => hand[i]);
    
    // Map fingertips to scale notes
    const scale = this.getEmotionalScale(emotion);
    const notes = fingertips.map((tip, i) => {
      const noteHeight = 1 - tip.y;
      const scaleIndex = Math.floor(noteHeight * scale.length);
      return noteHeight > 0.4 ? scale[scaleIndex] : '~';
    });

    const octave = Math.floor(height * 2) + 4; // 4-6
    const notePattern = notes.join(' ');
    
    return `note("${notePattern}").scale("${this.getScaleName(emotion)}").octave(${octave}).s("piano")`;
  }

  private generateHarmonyPattern(handSpread: number, emotion: string): string {
    const chords = this.getEmotionalChords(emotion);
    const chordIndex = Math.floor(handSpread * chords.length);
    const selectedChord = chords[chordIndex] || chords[0];
    
    return `note("${selectedChord}").s("pad").slow(4).room(0.8)`;
  }

  private generateSpecialPattern(distance: number, emotion: string, complexity: number): string {
    // Create special effects when hands are close together
    const intensity = 1 - distance; // Closer = more intense
    
    const effects = [
      `sound("space").gain(${intensity}).slow(8).room(0.9)`,
      `sound("wind").gain(${intensity * 0.7}).slow(6).lpf(2000)`,
      `note("<c e g>").s("bells").gain(${intensity * 0.8}).delay(0.5)`
    ];

    return effects[Math.floor(complexity * effects.length)] || effects[0];
  }

  /**
   * 🎨 EMOTIONAL MUSICAL MAPPING
   * Maps emotions to musical elements
   */
  private getEmotionalNote(emotion: string, instrument: string): string {
    const noteMap = {
      'happy': instrument === 'bass' ? 'C' : 'E',
      'sad': instrument === 'bass' ? 'A' : 'Am',
      'energetic': instrument === 'bass' ? 'G' : 'D',
      'calm': instrument === 'bass' ? 'F' : 'C',
      'aggressive': instrument === 'bass' ? 'E' : 'F#',
      'peaceful': instrument === 'bass' ? 'D' : 'G'
    };

    return noteMap[emotion as keyof typeof noteMap] || 'C';
  }

  private getEmotionalScale(emotion: string): string[] {
    const scales = {
      'happy': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      'sad': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      'energetic': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
      'calm': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
      'aggressive': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
      'peaceful': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#']
    };

    return scales[emotion as keyof typeof scales] || scales['calm'];
  }

  private getScaleName(emotion: string): string {
    const scaleNames = {
      'happy': 'major',
      'sad': 'minor',
      'energetic': 'mixolydian',
      'calm': 'lydian',
      'aggressive': 'phrygian',
      'peaceful': 'dorian'
    };

    return scaleNames[emotion as keyof typeof scaleNames] || 'major';
  }

  private getEmotionalChords(emotion: string): string[] {
    const chords = {
      'happy': ['<c e g>', '<f a c5>', '<g b d5>'],
      'sad': ['<a c5 e5>', '<d f a>', '<g bb d5>'],
      'energetic': ['<g b d5>', '<c5 e5 g5>', '<d5 f# a5>'],
      'calm': ['<f a c5>', '<bb d5 f5>', '<c5 e5 g5>'],
      'aggressive': ['<e g# b>', '<f# a# c#5>', '<b d# f#5>'],
      'peaceful': ['<d f# a>', '<g b d5>', '<a c#5 e5>']
    };

    return chords[emotion as keyof typeof chords] || chords['calm'];
  }

  private getEffectsForEmotion(emotion: string, instrument: string): string[] {
    const effectMap = {
      'happy': ['chorus', 'delay'],
      'sad': ['reverb', 'lpf'],
      'energetic': ['distortion', 'hpf'],
      'calm': ['reverb', 'room'],
      'aggressive': ['distortion', 'gain'],
      'peaceful': ['reverb', 'delay', 'room']
    };

    return effectMap[emotion as keyof typeof effectMap] || ['reverb'];
  }

  /**
   * 🔧 UTILITY FUNCTIONS
   */
  private calculateHandSpread(hand: NormalizedLandmarkList): number {
    const fingertips = [4, 8, 12, 16, 20].map(i => hand[i]);
    const wrist = hand[0];
    
    const avgDistance = fingertips.reduce((sum, tip) => {
      return sum + Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) + 
        Math.pow(tip.y - wrist.y, 2)
      );
    }, 0) / fingertips.length;

    return avgDistance;
  }

  private calculateHandDistance(left: NormalizedLandmarkList, right: NormalizedLandmarkList): number {
    const leftWrist = left[0];
    const rightWrist = right[0];
    
    return Math.sqrt(
      Math.pow(leftWrist.x - rightWrist.x, 2) + 
      Math.pow(leftWrist.y - rightWrist.y, 2)
    );
  }

  /**
   * 🎮 PUBLIC API
   */
  generateStrudelCode(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null): string {
    const mappings = this.mapSpatialGestures(left, right);
    
    if (!mappings.length) {
      return 'silence()';
    }

    // Combine all patterns using stack()
    const patterns = mappings.map(mapping => {
      let pattern = mapping.pattern;
      
      // Add effects
      mapping.effects.forEach(effect => {
        switch (effect) {
          case 'reverb':
            pattern += '.room(0.6)';
            break;
          case 'delay':
            pattern += '.delay(0.3)';
            break;
          case 'chorus':
            pattern += '.chorus(0.8)';
            break;
          case 'distortion':
            pattern += '.gain(1.2)';
            break;
          case 'lpf':
            pattern += '.lpf(1000)';
            break;
          case 'hpf':
            pattern += '.hpf(200)';
            break;
        }
      });

      // Add velocity
      pattern += `.gain(${mapping.velocity})`;
      
      return pattern;
    });

    return `stack(\n  ${patterns.join(',\n  ')}\n)`;
  }

  isReady(): boolean {
    return this.isActive;
  }

  reset(): void {
    this.currentPatterns.clear();
    this.lastGestureTime = 0;
  }
}