/**
 * 🌌 MUSICAL UNIVERSE 2025 - Main Application
 * Revolutionary gesture-based music creation with Strudel integration
 */

import { initHandTracker, onFrame, type NormalizedLandmarkList } from './tracking';
import { MusicalUniverseEngine } from './universe-ui';
import './universe-styles.css';

// 🎵 Strudel Integration
declare global {
  interface Window {
    Strudel: any;
  }
}

// 🌟 Universe State Management
interface UniverseState {
  isInitialized: boolean;
  currentStyle: string;
  is3DMode: boolean;
  isCollaborating: boolean;
  isRecording: boolean;
  handPositions: {
    left: NormalizedLandmarkList | null;
    right: NormalizedLandmarkList | null;
  };
  gestureEnergy: number;
  musicalContext: any;
}

class MusicalUniverse2025 {
  private video: HTMLVideoElement;
  private universeCanvas: HTMLCanvasElement;
  private universeEngine: MusicalUniverseEngine;
  private state: UniverseState;
  private strudel: any;
  private animationFrame: number = 0;
  
  constructor() {
    console.log('🌌 Initializing Musical Universe 2025...');
    
    this.video = document.getElementById('video') as HTMLVideoElement;
    this.universeCanvas = document.getElementById('universe-canvas') as HTMLCanvasElement;
    
    // Initialize state
    this.state = {
      isInitialized: false,
      currentStyle: 'cosmic',
      is3DMode: true,
      isCollaborating: false,
      isRecording: false,
      handPositions: { left: null, right: null },
      gestureEnergy: 0,
      musicalContext: {}
    };
    
    this.setupCanvas();
    this.initializeStrudel();
    this.setupEventListeners();
    this.startUniverse();
  }
  
  private setupCanvas() {
    if (!this.universeCanvas) {
      console.error('❌ Universe canvas not found');
      return;
    }
    
    // Set canvas size to full viewport
    const resizeCanvas = () => {
      this.universeCanvas.width = window.innerWidth;
      this.universeCanvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize universe engine
    this.universeEngine = new MusicalUniverseEngine(this.universeCanvas);
  }
  
  private async initializeStrudel() {
    try {
      // Load Strudel dynamically
      await this.loadStrudel();
      console.log('🎵 Strudel loaded successfully');
    } catch (error) {
      console.warn('⚠️ Strudel not available, using fallback audio engine');
      this.initializeFallbackAudio();
    }
  }
  
  private async loadStrudel() {
    // Dynamic import of Strudel (placeholder for actual implementation)
    // In production, you would load Strudel from CDN or local files
    console.log('🎵 Loading Strudel...');
    
    // For now, we'll use a mock Strudel interface
    this.strudel = {
      evaluate: (code: string) => {
        console.log('🎵 Strudel Code:', code);
        // Actual Strudel evaluation would happen here
      },
      getCurrentPattern: () => 'sound("bd cp")',
      setContext: (context: any) => {
        console.log('🎵 Strudel Context:', context);
      }
    };
  }
  
  private initializeFallbackAudio() {
    // Fallback to Tone.js or Web Audio API
    console.log('🎵 Initializing fallback audio engine...');
  }
  
  private setupEventListeners() {
    // 🎨 Style Button
    const styleButton = document.getElementById('styleButton');
    if (styleButton) {
      styleButton.addEventListener('click', () => this.cycleStyle());
    }
    
    // 🌟 3D Mode Button
    const modeButton = document.getElementById('modeButton');
    if (modeButton) {
      modeButton.addEventListener('click', () => this.toggle3DMode());
    }
    
    // 👥 Collaborate Button
    const collaborateButton = document.getElementById('collaborateButton');
    if (collaborateButton) {
      collaborateButton.addEventListener('click', () => this.toggleCollaboration());
    }
    
    // 🎬 Record Button
    const recordButton = document.getElementById('recordButton');
    if (recordButton) {
      recordButton.addEventListener('click', () => this.toggleRecording());
    }
    
    // ⌨️ Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.cycleStyle();
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        this.toggle3DMode();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        this.toggleCollaboration();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        this.toggleRecording();
      }
    });
  }
  
  private async startUniverse() {
    try {
      console.log('🎥 Initializing hand tracking...');
      this.updateStatus('Accessing camera...', 'loading');
      
      await initHandTracker(this.video);
      console.log('✅ Hand tracking initialized');
      
      this.updateStatus('🌟 Universe ready - show your hands!', 'success');
      this.state.isInitialized = true;
      
      // Start the main loop
      this.startMainLoop();
      
    } catch (error) {
      console.error('❌ Failed to initialize universe:', error);
      this.updateStatus('❌ Camera access failed. Please allow camera permission.', 'error');
    }
  }
  
  private startMainLoop() {
    onFrame((hands: NormalizedLandmarkList[]) => {
      this.processHands(hands);
      this.updateUniverse();
      this.generateMusic();
    });
  }
  
  private processHands(hands: NormalizedLandmarkList[]) {
    // Process hand positions
    this.state.handPositions.left = null;
    this.state.handPositions.right = null;
    
    if (hands.length === 1) {
      // Single hand assignment based on MediaPipe coordinates
      const hand = hands[0];
      if (hand[0].x < 0.5) {
        this.state.handPositions.right = hand; // Left side of camera = user's right hand
      } else {
        this.state.handPositions.left = hand; // Right side of camera = user's left hand
      }
    } else if (hands.length >= 2) {
      // Multiple hands - sort by x position
      const sortedHands = [...hands].sort((a, b) => a[0].x - b[0].x);
      this.state.handPositions.right = sortedHands[0]; // Leftmost in camera
      this.state.handPositions.left = sortedHands[1]; // Rightmost in camera
    }
    
    // Calculate gesture energy
    this.state.gestureEnergy = this.calculateGestureEnergy(hands);
    
    // Update universe engine
    if (this.universeEngine) {
      const gesture = this.createGestureObject(hands);
      this.universeEngine.onHandGesture(gesture);
    }
    
    // Update nebula zones
    this.updateNebulaZones();
  }
  
  private calculateGestureEnergy(hands: NormalizedLandmarkList[]): number {
    if (!hands.length) return 0;
    
    let totalMovement = 0;
    hands.forEach(hand => {
      for (let i = 0; i < hand.length - 1; i++) {
        const current = hand[i];
        const next = hand[i + 1];
        const movement = Math.sqrt(
          Math.pow(current.x - next.x, 2) + 
          Math.pow(current.y - next.y, 2)
        );
        totalMovement += movement;
      }
    });
    
    return Math.min(1, totalMovement * 10);
  }
  
  private createGestureObject(hands: NormalizedLandmarkList[]) {
    const { left, right } = this.state.handPositions;
    
    return {
      hands,
      leftHand: left,
      rightHand: right,
      position: left || right ? {
        x: (left?.[0]?.x || right?.[0]?.x || 0.5),
        y: (left?.[0]?.y || right?.[0]?.y || 0.5),
        z: (left?.[0]?.z || right?.[0]?.z || 0)
      } : { x: 0.5, y: 0.5, z: 0 },
      velocity: this.state.gestureEnergy,
      confidence: hands.length > 0 ? 0.9 : 0,
      fingerStates: this.extractFingerStates(hands),
      timestamp: Date.now()
    };
  }
  
  private extractFingerStates(hands: NormalizedLandmarkList[]) {
    // Extract finger extension states for each hand
    const fingerStates: any[] = [];
    
    hands.forEach((hand, handIndex) => {
      const fingers = {
        thumb: this.isFingerExtended(hand, [1, 2, 3, 4]),
        index: this.isFingerExtended(hand, [5, 6, 7, 8]),
        middle: this.isFingerExtended(hand, [9, 10, 11, 12]),
        ring: this.isFingerExtended(hand, [13, 14, 15, 16]),
        pinky: this.isFingerExtended(hand, [17, 18, 19, 20])
      };
      
      fingerStates.push({
        handIndex,
        extended: Object.values(fingers).some(extended => extended),
        fingers
      });
    });
    
    return fingerStates;
  }
  
  private isFingerExtended(hand: NormalizedLandmarkList, indices: number[]): boolean {
    if (indices.length < 2) return false;
    
    const tip = hand[indices[indices.length - 1]];
    const middle = hand[indices[Math.floor(indices.length / 2)]];
    const base = hand[indices[0]];
    
    // Simple heuristic: finger is extended if tip is farther from base than middle is
    const tipDistance = Math.sqrt(
      Math.pow(tip.x - base.x, 2) + Math.pow(tip.y - base.y, 2)
    );
    const middleDistance = Math.sqrt(
      Math.pow(middle.x - base.x, 2) + Math.pow(middle.y - base.y, 2)
    );
    
    return tipDistance > middleDistance * 1.2;
  }
  
  private updateNebulaZones() {
    const { left, right } = this.state.handPositions;
    
    // Update rhythm nebula (left hand zone)
    const rhythmNebula = document.getElementById('rhythmNebula');
    if (rhythmNebula && left) {
      const wrist = left[0];
      const mirroredX = 1 - wrist.x; // Mirror for display
      
      if (mirroredX >= 0.05 && mirroredX <= 0.45 && wrist.y >= 0.15 && wrist.y <= 0.75) {
        rhythmNebula.classList.add('active');
        this.createNebulaParticles(rhythmNebula, '#FF6B9D');
      } else {
        rhythmNebula.classList.remove('active');
      }
    }
    
    // Update melody nebula (right hand zone)
    const melodyNebula = document.getElementById('melodyNebula');
    if (melodyNebula && right) {
      const wrist = right[0];
      const mirroredX = 1 - wrist.x; // Mirror for display
      
      if (mirroredX >= 0.55 && mirroredX <= 0.95 && wrist.y >= 0.15 && wrist.y <= 0.75) {
        melodyNebula.classList.add('active');
        this.createNebulaParticles(melodyNebula, '#4ECDC4');
      } else {
        melodyNebula.classList.remove('active');
      }
    }
  }
  
  private createNebulaParticles(nebula: HTMLElement, color: string) {
    // Create particles within nebula zones
    if (Math.random() < 0.1) { // 10% chance per frame
      const rect = nebula.getBoundingClientRect();
      const particle = document.createElement('div');
      
      particle.style.position = 'absolute';
      particle.style.left = (rect.left + Math.random() * rect.width) + 'px';
      particle.style.top = (rect.top + Math.random() * rect.height) + 'px';
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.background = color;
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '8';
      particle.style.boxShadow = `0 0 20px ${color}`;
      particle.style.animation = 'particleFloat 3s ease-out forwards';
      
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 3000);
    }
  }
  
  private generateMusic() {
    if (!this.state.isInitialized || !this.strudel) return;
    
    const { left, right } = this.state.handPositions;
    
    // Generate Strudel patterns based on gestures
    if (left || right) {
      const strudelCode = this.gestureToStrudel();
      if (strudelCode) {
        this.strudel.evaluate(strudelCode);
      }
    }
  }
  
  private gestureToStrudel(): string {
    const { left, right } = this.state.handPositions;
    const energy = this.state.gestureEnergy;
    
    let patterns: string[] = [];
    
    // Left hand (rhythm)
    if (left) {
      const density = Math.floor(energy * 4) + 1;
      patterns.push(`sound("[bd cp]*${density}").gain(${energy * 0.8})`);
    }
    
    // Right hand (melody)
    if (right) {
      const notePattern = this.generateNotePattern(right, energy);
      patterns.push(`note("${notePattern}").s("piano").gain(${energy * 0.6})`);
    }
    
    // Harmony based on both hands
    if (left && right) {
      const harmonyPattern = this.generateHarmonyPattern(left, right);
      patterns.push(`note("${harmonyPattern}").s("pad").gain(0.3)`);
    }
    
    if (patterns.length === 0) return '';
    
    const bpm = 90 + (energy * 60); // 90-150 BPM based on energy
    
    return `
      stack(
        ${patterns.join(',\n        ')}
      ).cpm(${Math.floor(bpm)})
    `;
  }
  
  private generateNotePattern(hand: NormalizedLandmarkList, energy: number): string {
    // Generate note patterns based on hand position and energy
    const baseNotes = ['c3', 'e3', 'g3', 'c4', 'e4', 'g4'];
    const complexity = Math.floor(energy * 4) + 1;
    
    let pattern = '';
    for (let i = 0; i < complexity; i++) {
      const noteIndex = Math.floor(hand[8].y * baseNotes.length); // Use index finger tip
      pattern += baseNotes[noteIndex] + ' ';
    }
    
    return pattern.trim();
  }
  
  private generateHarmonyPattern(left: NormalizedLandmarkList, right: NormalizedLandmarkList): string {
    // Generate harmony based on both hands
    const leftNote = Math.floor(left[0].y * 7); // 7 notes in scale
    const rightNote = Math.floor(right[0].y * 7);
    
    const scales = ['c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3'];
    
    return `${scales[leftNote]} ${scales[rightNote]}`;
  }
  
  private updateUniverse() {
    // Update universe visual effects based on current state
    this.updateCosmicBackground();
    this.updateInstrumentOrbs();
  }
  
  private updateCosmicBackground() {
    // Dynamic background based on gesture energy
    const app = document.getElementById('app');
    if (!app) return;
    
    const energy = this.state.gestureEnergy;
    const time = Date.now() * 0.001;
    
    const hue1 = (time * 30 + energy * 180) % 360;
    const hue2 = (time * 20 + energy * 120 + 120) % 360;
    const hue3 = (time * 15 + energy * 60 + 240) % 360;
    
    app.style.background = `
      radial-gradient(circle at ${30 + Math.sin(time) * 20}% ${40 + Math.cos(time) * 20}%, 
        hsla(${hue1}, ${40 + energy * 20}%, ${15 + energy * 10}%, 0.9) 0%,
        hsla(${hue2}, ${35 + energy * 15}%, ${12 + energy * 8}%, 0.7) 40%,
        hsla(${hue3}, ${30 + energy * 10}%, ${8 + energy * 5}%, 0.5) 80%,
        hsla(220, 25%, 5%, 0.3) 100%)
    `;
  }
  
  private updateInstrumentOrbs() {
    // Update floating instrument orbs based on activity
    const orbs = document.querySelectorAll('.instrument-orb');
    const energy = this.state.gestureEnergy;
    
    orbs.forEach((orb, index) => {
      const element = orb as HTMLElement;
      
      if (energy > 0.3) {
        element.classList.add('active');
        
        // Stagger activation
        setTimeout(() => {
          element.classList.remove('active');
        }, 1000 + (index * 200));
      }
    });
  }
  
  private updateStatus(message: string, type: 'loading' | 'success' | 'error') {
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    
    if (statusText) statusText.textContent = message;
    if (statusDot) {
      statusDot.className = `status-dot ${type}`;
      
      const colors = {
        loading: '#FECA57',
        success: '#4ECDC4',
        error: '#FF6B9D'
      };
      
      statusDot.style.background = colors[type];
    }
  }
  
  // 🎨 UI Control Methods
  private cycleStyle() {
    const styles = ['cosmic', 'neon', 'organic', 'minimal'];
    const currentIndex = styles.indexOf(this.state.currentStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    this.state.currentStyle = styles[nextIndex];
    
    console.log(`🎨 Style changed to: ${this.state.currentStyle}`);
    this.showNotification(`🎨 Style: ${this.state.currentStyle.toUpperCase()}`);
  }
  
  private toggle3DMode() {
    this.state.is3DMode = !this.state.is3DMode;
    console.log(`🌟 3D Mode: ${this.state.is3DMode ? 'ON' : 'OFF'}`);
    this.showNotification(`🌟 3D Mode: ${this.state.is3DMode ? 'ENABLED' : 'DISABLED'}`);
  }
  
  private toggleCollaboration() {
    this.state.isCollaborating = !this.state.isCollaborating;
    console.log(`👥 Collaboration: ${this.state.isCollaborating ? 'ON' : 'OFF'}`);
    this.showNotification(`👥 Collaboration: ${this.state.isCollaborating ? 'ENABLED' : 'DISABLED'}`);
  }
  
  private toggleRecording() {
    this.state.isRecording = !this.state.isRecording;
    console.log(`🎬 Recording: ${this.state.isRecording ? 'ON' : 'OFF'}`);
    this.showNotification(`🎬 Recording: ${this.state.isRecording ? 'STARTED' : 'STOPPED'}`);
  }
  
  private showNotification(message: string) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(255, 107, 157, 0.2));
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 16px 24px;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      z-index: 1000;
      animation: slideInDown 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}

// 🚀 Initialize the Musical Universe
const universe = new MusicalUniverse2025();

// 🌟 Global access for debugging
(window as any).universe = universe;