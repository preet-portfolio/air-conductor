/**
 * 🌌 MUSICAL UNIVERSE 2025 - Revolutionary UI/UX Design
 * State-of-the-art immersive interface that transforms gestures into visual magic
 */

export interface UniverseElement {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  energy: number;
  lastInteraction: number;
}

export interface NebulaZone {
  id: string;
  center: { x: number; y: number; z: number };
  radius: number;
  density: number;
  color: string;
  instruments: string[];
  activeParticles: Particle[];
}

export interface Particle {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  life: number;
  maxLife: number;
  size: number;
  color: string;
  intensity: number;
  type: 'note' | 'energy' | 'harmony' | 'rhythm';
}

/**
 * 🎵 Musical Universe Engine
 * Transforms the entire screen into a responsive 3D cosmos
 */
export class MusicalUniverseEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private webglCtx: WebGLRenderingContext;
  private particles: Particle[] = [];
  private nebulaZones: NebulaZone[] = [];
  private universeElements: UniverseElement[] = [];
  private time: number = 0;
  private cameraPosition = { x: 0, y: 0, z: 0 };
  private cameraRotation = { x: 0, y: 0, z: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.webglCtx = canvas.getContext('webgl')!;
    this.initializeUniverse();
    this.setupEventListeners();
    this.startRenderLoop();
  }

  private initializeUniverse() {
    // Create nebula zones instead of boring rectangular boxes
    this.nebulaZones = [
      {
        id: 'rhythm_nebula',
        center: { x: -0.3, y: 0, z: 0 },
        radius: 0.25,
        density: 0.8,
        color: '#FF6B9D', // Pink nebula for rhythm
        instruments: ['drums', 'bass', 'percussion'],
        activeParticles: []
      },
      {
        id: 'melody_nebula', 
        center: { x: 0.3, y: 0, z: 0 },
        radius: 0.25,
        density: 0.8,
        color: '#4ECDC4', // Cyan nebula for melody
        instruments: ['piano', 'violin', 'flute'],
        activeParticles: []
      },
      {
        id: 'harmony_nebula',
        center: { x: 0, y: -0.2, z: -0.1 },
        radius: 0.2,
        density: 0.6,
        color: '#45B7D1', // Blue nebula for harmony
        instruments: ['strings', 'pads', 'choir'],
        activeParticles: []
      }
    ];

    // Create floating musical elements
    this.createFloatingInstruments();
    this.generateStarField();
  }

  /**
   * 🎼 Create floating 3D instrument representations
   */
  private createFloatingInstruments() {
    const instruments = [
      { name: 'Piano', symbol: '🎹', position: { x: 0.2, y: 0.1, z: 0.05 } },
      { name: 'Violin', symbol: '🎻', position: { x: 0.25, y: -0.05, z: 0.1 } },
      { name: 'Drums', symbol: '🥁', position: { x: -0.2, y: 0.05, z: 0.08 } },
      { name: 'Guitar', symbol: '🎸', position: { x: -0.15, y: -0.1, z: 0.12 } },
      { name: 'Flute', symbol: '🪈', position: { x: 0.1, y: 0.15, z: 0.06 } },
      { name: 'Saxophone', symbol: '🎷', position: { x: 0.0, y: -0.15, z: 0.09 } }
    ];

    instruments.forEach((instrument, index) => {
      this.universeElements.push({
        id: `instrument_${instrument.name.toLowerCase()}`,
        position: instrument.position,
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
        energy: 0,
        lastInteraction: 0
      });
    });
  }

  /**
   * ✨ Generate dynamic star field background
   */
  private generateStarField() {
    for (let i = 0; i < 200; i++) {
      this.particles.push({
        position: {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4,
          z: (Math.random() - 0.5) * 2
        },
        velocity: { x: 0, y: 0, z: 0 },
        life: 1,
        maxLife: 1,
        size: Math.random() * 2 + 1,
        color: `hsla(${Math.random() * 60 + 200}, 70%, ${Math.random() * 40 + 60}%, 0.8)`,
        intensity: Math.random(),
        type: 'energy'
      });
    }
  }

  /**
   * 🖐️ Process hand gesture and create universe response
   */
  public onHandGesture(gesture: any) {
    const { position, velocity, confidence, fingerStates } = gesture;
    
    // Convert screen coordinates to universe coordinates
    const universePos = this.screenToUniverse(position);
    
    // Check which nebula zone is being activated
    const activeZone = this.findActiveZone(universePos);
    
    if (activeZone) {
      this.activateNebulaZone(activeZone, gesture);
    }

    // Create gesture trail particles
    this.createGestureTrail(universePos, velocity, confidence);
    
    // Update floating instruments based on proximity
    this.updateInstrumentProximity(universePos, gesture);
    
    // Generate musical notes as 3D objects
    this.spawnMusicalNotes(universePos, fingerStates);
  }

  /**
   * 🌟 Activate nebula zone with spectacular effects
   */
  private activateNebulaZone(zone: NebulaZone, gesture: any) {
    // Create energy explosion at gesture position
    const explosionParticles = this.createEnergyExplosion(
      zone.center,
      gesture.velocity * 50,
      zone.color
    );
    
    zone.activeParticles.push(...explosionParticles);
    
    // Pulse the entire zone
    this.pulseZone(zone, gesture.confidence);
    
    // Create connecting energy streams between fingers
    if (gesture.fingerStates) {
      this.createFingerConnections(gesture.fingerStates, zone);
    }
  }

  /**
   * 💫 Create energy explosion effects
   */
  private createEnergyExplosion(center: any, intensity: number, color: string): Particle[] {
    const particles: Particle[] = [];
    const count = Math.floor(intensity * 20) + 10;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = (Math.random() + 0.5) * intensity * 0.01;
      
      particles.push({
        position: { ...center },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          z: (Math.random() - 0.5) * speed * 0.5
        },
        life: 1,
        maxLife: 2 + Math.random() * 2,
        size: Math.random() * 8 + 4,
        color: color,
        intensity: Math.random() * 0.8 + 0.2,
        type: 'energy'
      });
    }
    
    return particles;
  }

  /**
   * 🎵 Spawn 3D musical notes from gestures
   */
  private spawnMusicalNotes(position: any, fingerStates: any) {
    if (!fingerStates) return;

    // Create musical note for each extended finger
    fingerStates.forEach((finger: any, index: number) => {
      if (finger.extended && Math.random() < 0.3) { // 30% chance per frame
        const noteSymbols = ['♪', '♫', '♬', '♩', '♭', '♯'];
        const noteColors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
        
        this.particles.push({
          position: {
            x: position.x + (Math.random() - 0.5) * 0.1,
            y: position.y + (Math.random() - 0.5) * 0.1,
            z: position.z + (Math.random() - 0.5) * 0.05
          },
          velocity: {
            x: (Math.random() - 0.5) * 0.02,
            y: -Math.random() * 0.03 - 0.01, // Float upward
            z: (Math.random() - 0.5) * 0.01
          },
          life: 1,
          maxLife: 3 + Math.random() * 2,
          size: Math.random() * 15 + 10,
          color: noteColors[index % noteColors.length],
          intensity: 0.9,
          type: 'note'
        });
      }
    });
  }

  /**
   * 🎨 Render the entire musical universe
   */
  private render() {
    // Clear canvas with cosmic background
    this.renderCosmicBackground();
    
    // Render nebula zones with dynamic effects
    this.nebulaZones.forEach(zone => this.renderNebulaZone(zone));
    
    // Render all particles with proper depth sorting
    this.renderParticles();
    
    // Render floating instruments with 3D transforms
    this.renderFloatingInstruments();
    
    // Render UI overlay (minimal and transparent)
    this.renderUIOverlay();
    
    // Update camera for subtle drift effect
    this.updateCamera();
  }

  /**
   * 🌌 Render cosmic background with flowing gradients
   */
  private renderCosmicBackground() {
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
    );
    
    // Dynamic colors based on time and activity
    const hue1 = (this.time * 0.5) % 360;
    const hue2 = (this.time * 0.3 + 120) % 360;
    const hue3 = (this.time * 0.2 + 240) % 360;
    
    gradient.addColorStop(0, `hsla(${hue1}, 40%, 15%, 0.9)`);
    gradient.addColorStop(0.4, `hsla(${hue2}, 35%, 12%, 0.7)`);
    gradient.addColorStop(0.8, `hsla(${hue3}, 30%, 8%, 0.5)`);
    gradient.addColorStop(1, 'hsla(220, 25%, 5%, 0.3)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 🌟 Render nebula zones with dynamic particle effects
   */
  private renderNebulaZone(zone: NebulaZone) {
    const screenPos = this.universeToScreen(zone.center);
    const screenRadius = zone.radius * Math.min(this.canvas.width, this.canvas.height) * 0.5;
    
    // Create nebula gradient
    const gradient = this.ctx.createRadialGradient(
      screenPos.x, screenPos.y, 0,
      screenPos.x, screenPos.y, screenRadius
    );
    
    const alpha = zone.density * (0.3 + Math.sin(this.time * 0.01) * 0.1);
    gradient.addColorStop(0, zone.color.replace(')', `, ${alpha})`).replace('hsla(', 'hsla(').replace('#', 'hsla('));
    gradient.addColorStop(0.6, zone.color.replace(')', `, ${alpha * 0.5})`));
    gradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Render zone particles
    zone.activeParticles.forEach(particle => {
      this.renderParticle(particle);
    });
    
    // Update and cleanup particles
    zone.activeParticles = zone.activeParticles.filter(particle => {
      this.updateParticle(particle);
      return particle.life > 0;
    });
  }

  private startRenderLoop() {
    const render = () => {
      this.time += 16.67; // ~60fps
      this.render();
      requestAnimationFrame(render);
    };
    render();
  }

  // Helper methods
  private screenToUniverse(screenPos: { x: number; y: number }): { x: number; y: number; z: number } {
    return {
      x: (screenPos.x / this.canvas.width) * 2 - 1,
      y: -((screenPos.y / this.canvas.height) * 2 - 1), // Flip Y
      z: 0
    };
  }

  private universeToScreen(universePos: { x: number; y: number; z: number }): { x: number; y: number } {
    return {
      x: (universePos.x + 1) * this.canvas.width / 2,
      y: (-universePos.y + 1) * this.canvas.height / 2
    };
  }

  // Additional helper methods would go here...
  private findActiveZone(position: any): NebulaZone | null { return null; }
  private createGestureTrail(position: any, velocity: any, confidence: any) {}
  private updateInstrumentProximity(position: any, gesture: any) {}
  private pulseZone(zone: NebulaZone, confidence: any) {}
  private createFingerConnections(fingerStates: any, zone: NebulaZone) {}
  private renderParticles() {}
  private renderFloatingInstruments() {}
  private renderUIOverlay() {}
  private updateCamera() {}
  private renderParticle(particle: Particle) {}
  private updateParticle(particle: Particle) {}
  private setupEventListeners() {}
}