/**
 * 🌊 REAL-TIME PATTERN EVOLUTION ENGINE
 * Continuously evolves Strudel patterns based on gesture changes
 * Creates living, breathing music that responds to every hand movement
 */

import { Pattern, silence, stack } from '@strudel/core';
import type { NormalizedLandmarkList } from './tracking';

export interface GestureEvolution {
  type: 'swipe_left' | 'swipe_right' | 'pinch' | 'spread' | 'circle' | 'wave' | 'tap' | 'hold';
  intensity: number; // 0-1
  direction?: 'up' | 'down' | 'left' | 'right';
  speed: number; // pixels per second
  position: { x: number; y: number };
}

export interface EvolvingPattern {
  id: string;
  basePattern: string;
  currentPattern: string;
  lastEvolution: number;
  evolutionHistory: string[];
  gestureInfluence: number; // How much gestures affect this pattern
}

/**
 * 🧠 GESTURE EVOLUTION DETECTOR
 * Analyzes hand movement sequences to detect musical evolution gestures
 */
class GestureEvolutionDetector {
  private handHistory: { left: NormalizedLandmarkList[], right: NormalizedLandmarkList[] } = {
    left: [],
    right: []
  };
  private maxHistoryLength = 10;
  private lastGestureTime = 0;
  private velocityThreshold = 0.02;

  updateHandHistory(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null) {
    if (left) {
      this.handHistory.left.push(left);
      if (this.handHistory.left.length > this.maxHistoryLength) {
        this.handHistory.left.shift();
      }
    }

    if (right) {
      this.handHistory.right.push(right);
      if (this.handHistory.right.length > this.maxHistoryLength) {
        this.handHistory.right.shift();
      }
    }
  }

  detectEvolutions(): GestureEvolution[] {
    const evolutions: GestureEvolution[] = [];
    const now = performance.now();

    // Detect left hand evolutions
    if (this.handHistory.left.length >= 3) {
      const leftEvolution = this.analyzeHandEvolution(this.handHistory.left, 'left');
      if (leftEvolution) evolutions.push(leftEvolution);
    }

    // Detect right hand evolutions
    if (this.handHistory.right.length >= 3) {
      const rightEvolution = this.analyzeHandEvolution(this.handHistory.right, 'right');
      if (rightEvolution) evolutions.push(rightEvolution);
    }

    // Detect two-hand collaborative evolutions
    if (this.handHistory.left.length >= 2 && this.handHistory.right.length >= 2) {
      const collaborativeEvolution = this.detectCollaborativeEvolution();
      if (collaborativeEvolution) evolutions.push(collaborativeEvolution);
    }

    this.lastGestureTime = now;
    return evolutions;
  }

  private analyzeHandEvolution(handHistory: NormalizedLandmarkList[], hand: 'left' | 'right'): GestureEvolution | null {
    const recent = handHistory.slice(-3);
    const [first, middle, last] = recent;

    if (!first || !middle || !last) return null;

    const wristFirst = first[0];
    const wristMiddle = middle[0];
    const wristLast = last[0];

    // Calculate movement vectors
    const dx1 = wristMiddle.x - wristFirst.x;
    const dy1 = wristMiddle.y - wristFirst.y;
    const dx2 = wristLast.x - wristMiddle.x;
    const dy2 = wristLast.y - wristMiddle.y;

    const speed1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const speed2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const avgSpeed = (speed1 + speed2) / 2;

    if (avgSpeed < this.velocityThreshold) return null;

    // Detect gesture type
    const gestureType = this.classifyGesture(dx1, dy1, dx2, dy2, first, last);
    if (!gestureType) return null;

    return {
      type: gestureType,
      intensity: Math.min(1, avgSpeed * 10),
      speed: avgSpeed * 1000, // Convert to pixels per second
      position: { x: wristLast.x, y: wristLast.y },
      direction: this.getDirection(dx1 + dx2, dy1 + dy2)
    };
  }

  private classifyGesture(dx1: number, dy1: number, dx2: number, dy2: number, 
                         first: NormalizedLandmarkList, last: NormalizedLandmarkList): GestureEvolution['type'] | null {
    // Swipe detection
    if (Math.abs(dx1 + dx2) > Math.abs(dy1 + dy2)) {
      return (dx1 + dx2) > 0 ? 'swipe_right' : 'swipe_left';
    }

    // Pinch/spread detection
    const firstSpread = this.calculateHandSpread(first);
    const lastSpread = this.calculateHandSpread(last);
    const spreadChange = lastSpread - firstSpread;

    if (Math.abs(spreadChange) > 0.05) {
      return spreadChange > 0 ? 'spread' : 'pinch';
    }

    // Wave detection (oscillating Y movement)
    if (Math.abs(dy1) > 0.02 && Math.abs(dy2) > 0.02 && dy1 * dy2 < 0) {
      return 'wave';
    }

    // Circular motion detection
    const totalMovement = Math.abs(dx1) + Math.abs(dy1) + Math.abs(dx2) + Math.abs(dy2);
    if (totalMovement > 0.08 && this.isCircularMotion(dx1, dy1, dx2, dy2)) {
      return 'circle';
    }

    return null;
  }

  private detectCollaborativeEvolution(): GestureEvolution | null {
    const leftRecent = this.handHistory.left.slice(-2);
    const rightRecent = this.handHistory.right.slice(-2);

    if (leftRecent.length < 2 || rightRecent.length < 2) return null;

    const leftWrist1 = leftRecent[0][0];
    const leftWrist2 = leftRecent[1][0];
    const rightWrist1 = rightRecent[0][0];
    const rightWrist2 = rightRecent[1][0];

    // Calculate hand distance change
    const dist1 = Math.sqrt(
      Math.pow(leftWrist1.x - rightWrist1.x, 2) + 
      Math.pow(leftWrist1.y - rightWrist1.y, 2)
    );
    const dist2 = Math.sqrt(
      Math.pow(leftWrist2.x - rightWrist2.x, 2) + 
      Math.pow(leftWrist2.y - rightWrist2.y, 2)
    );

    const distanceChange = dist2 - dist1;

    if (Math.abs(distanceChange) > 0.05) {
      return {
        type: distanceChange > 0 ? 'spread' : 'pinch',
        intensity: Math.min(1, Math.abs(distanceChange) * 10),
        speed: Math.abs(distanceChange) * 1000,
        position: {
          x: (leftWrist2.x + rightWrist2.x) / 2,
          y: (leftWrist2.y + rightWrist2.y) / 2
        }
      };
    }

    return null;
  }

  private calculateHandSpread(hand: NormalizedLandmarkList): number {
    const fingertips = [4, 8, 12, 16, 20].map(i => hand[i]);
    const wrist = hand[0];
    
    return fingertips.reduce((sum, tip) => {
      return sum + Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) + 
        Math.pow(tip.y - wrist.y, 2)
      );
    }, 0) / fingertips.length;
  }

  private isCircularMotion(dx1: number, dy1: number, dx2: number, dy2: number): boolean {
    // Simple circular motion detection based on perpendicular vectors
    const dotProduct = dx1 * dx2 + dy1 * dy2;
    const magnitude1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const magnitude2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    
    if (magnitude1 === 0 || magnitude2 === 0) return false;
    
    const cosAngle = dotProduct / (magnitude1 * magnitude2);
    return cosAngle < 0.5; // Angle > 60 degrees suggests circular motion
  }

  private getDirection(dx: number, dy: number): 'up' | 'down' | 'left' | 'right' {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }
}

/**
 * 🎵 PATTERN EVOLUTION ENGINE
 * Applies real-time transformations to Strudel patterns based on gestures
 */
export class StrudelEvolutionEngine {
  private detector = new GestureEvolutionDetector();
  private evolvingPatterns: Map<string, EvolvingPattern> = new Map();
  private globalEvolutionRate = 0.5; // How quickly patterns evolve
  private maxPatternComplexity = 10;

  /**
   * Process gesture evolutions and update patterns
   */
  evolvePatterns(left: NormalizedLandmarkList | null, right: NormalizedLandmarkList | null, 
                basePatterns: Map<string, string>): Map<string, string> {
    
    // Update gesture history
    this.detector.updateHandHistory(left, right);
    
    // Detect evolution gestures
    const evolutions = this.detector.detectEvolutions();
    
    // Initialize or update evolving patterns
    basePatterns.forEach((pattern, id) => {
      if (!this.evolvingPatterns.has(id)) {
        this.evolvingPatterns.set(id, {
          id,
          basePattern: pattern,
          currentPattern: pattern,
          lastEvolution: performance.now(),
          evolutionHistory: [pattern],
          gestureInfluence: 1.0
        });
      }
    });

    // Apply evolutions
    const evolvedPatterns = new Map<string, string>();
    
    this.evolvingPatterns.forEach((evolvingPattern, id) => {
      let evolved = evolvingPattern.currentPattern;
      
      // Apply each detected evolution
      evolutions.forEach(evolution => {
        evolved = this.applyEvolution(evolved, evolution, evolvingPattern);
      });

      // Apply natural pattern drift (slow evolution even without gestures)
      if (performance.now() - evolvingPattern.lastEvolution > 2000) {
        evolved = this.applyNaturalEvolution(evolved);
        evolvingPattern.lastEvolution = performance.now();
      }

      // Update pattern history
      if (evolved !== evolvingPattern.currentPattern) {
        evolvingPattern.currentPattern = evolved;
        evolvingPattern.evolutionHistory.push(evolved);
        
        // Limit history size
        if (evolvingPattern.evolutionHistory.length > 20) {
          evolvingPattern.evolutionHistory.shift();
        }
      }

      evolvedPatterns.set(id, evolved);
    });

    return evolvedPatterns;
  }

  /**
   * Apply specific evolution to pattern
   */
  private applyEvolution(pattern: string, evolution: GestureEvolution, evolvingPattern: EvolvingPattern): string {
    const intensity = evolution.intensity * evolvingPattern.gestureInfluence;
    
    switch (evolution.type) {
      case 'swipe_right':
        return this.evolveReverse(pattern, intensity);
      
      case 'swipe_left':
        return this.evolveReverse(pattern, intensity);
      
      case 'pinch':
        return this.evolveSlowDown(pattern, intensity);
      
      case 'spread':
        return this.evolveSpeedUp(pattern, intensity);
      
      case 'circle':
        return this.evolvePalindrome(pattern, intensity);
      
      case 'wave':
        return this.evolveModulation(pattern, intensity);
      
      case 'tap':
        return this.evolveAccent(pattern, intensity);
      
      case 'hold':
        return this.evolveSustain(pattern, intensity);
      
      default:
        return pattern;
    }
  }

  /**
   * PATTERN EVOLUTION METHODS
   */
  private evolveReverse(pattern: string, intensity: number): string {
    if (intensity > 0.5) {
      return pattern.includes('.rev()') ? pattern : pattern + '.rev()';
    }
    return pattern;
  }

  private evolveSlowDown(pattern: string, intensity: number): string {
    const slowFactor = 1 + intensity;
    if (pattern.includes('.slow(')) {
      return pattern.replace(/\.slow\([\d.]+\)/, `.slow(${slowFactor.toFixed(1)})`);
    }
    return pattern + `.slow(${slowFactor.toFixed(1)})`;
  }

  private evolveSpeedUp(pattern: string, intensity: number): string {
    const fastFactor = 1 + intensity;
    if (pattern.includes('.fast(')) {
      return pattern.replace(/\.fast\([\d.]+\)/, `.fast(${fastFactor.toFixed(1)})`);
    }
    return pattern + `.fast(${fastFactor.toFixed(1)})`;
  }

  private evolvePalindrome(pattern: string, intensity: number): string {
    if (intensity > 0.6) {
      return pattern.includes('.palindrome()') ? pattern : pattern + '.palindrome()';
    }
    return pattern;
  }

  private evolveModulation(pattern: string, intensity: number): string {
    const modDepth = intensity * 0.5;
    return pattern + `.gain(sine.range(${(1 - modDepth).toFixed(1)}, ${(1 + modDepth).toFixed(1)}).slow(4))`;
  }

  private evolveAccent(pattern: string, intensity: number): string {
    if (intensity > 0.4) {
      return pattern + `.sometimes(rev)`;
    }
    return pattern;
  }

  private evolveSustain(pattern: string, intensity: number): string {
    const sustainLength = 2 + (intensity * 4);
    return pattern + `.sustain(${sustainLength.toFixed(1)})`;
  }

  /**
   * Natural evolution without direct gestures
   */
  private applyNaturalEvolution(pattern: string): string {
    const evolutionTypes = [
      () => pattern + '.sometimes(rev)',
      () => pattern + '.sometimesBy(0.25, fast(2))',
      () => pattern + '.every(4, slow(2))',
      () => pattern + '.whenmod(8, 0, gain(1.2))',
    ];

    const randomEvolution = evolutionTypes[Math.floor(Math.random() * evolutionTypes.length)];
    return Math.random() < this.globalEvolutionRate ? randomEvolution() : pattern;
  }

  /**
   * Get evolution statistics for UI display
   */
  getEvolutionStats(): { 
    activePatterns: number; 
    totalEvolutions: number; 
    averageComplexity: number 
  } {
    const patterns = Array.from(this.evolvingPatterns.values());
    
    return {
      activePatterns: patterns.length,
      totalEvolutions: patterns.reduce((sum, p) => sum + p.evolutionHistory.length, 0),
      averageComplexity: patterns.reduce((sum, p) => {
        const complexity = (p.currentPattern.match(/\./g) || []).length;
        return sum + complexity;
      }, 0) / Math.max(1, patterns.length)
    };
  }

  /**
   * Reset all pattern evolutions
   */
  reset(): void {
    this.evolvingPatterns.clear();
  }

  /**
   * Set global evolution parameters
   */
  setEvolutionRate(rate: number): void {
    this.globalEvolutionRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * Get pattern history for analysis
   */
  getPatternHistory(patternId: string): string[] {
    return this.evolvingPatterns.get(patternId)?.evolutionHistory || [];
  }
}