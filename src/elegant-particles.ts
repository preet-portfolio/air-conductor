export interface ElegantParticle {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  maxSize: number;
  color: string;
  type: 'note' | 'harmony' | 'energy' | 'trail' | 'constellation';
  instrument: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  energy: number;
  pulsePhase: number;
}

export interface ElegantParticleSystem {
  particles: ElegantParticle[];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
}

export class ElegantParticleEngine {
  private system: ElegantParticleSystem;
  private nextId = 0;
  private audioAnalyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array | null = null;
  private lastCleanup = 0;
  
  // Performance optimization
  private maxParticles = 150; // Reduced from unlimited
  private frameSkip = 0;
  
  // Visual design constants
  private readonly COLORS = {
    primary: '#4A90E2',      // Elegant blue
    secondary: '#F5A623',    // Warm gold
    accent: '#BD10E0',       // Sophisticated purple
    harmony: '#7ED321',      // Fresh green
    energy: '#FFFFFF',       // Pure white
    trail: '#50E3C2'         // Cyan accent
  };

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    
    this.system = {
      particles: [],
      canvas,
      ctx,
      width: canvas.width,
      height: canvas.height,
      time: 0
    };
    
    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  setAudioAnalyser(analyser: AnalyserNode) {
    this.audioAnalyser = analyser;
    const buffer = new ArrayBuffer(analyser.frequencyBinCount);
    this.frequencyData = new Uint8Array(buffer);
  }

  // Modern, elegant note particle - smooth and minimal
  createNoteParticle(x: number, y: number, z: number, instrument: string, note: string, velocity: number) {
    if (this.system.particles.length >= this.maxParticles) {
      return; // Prevent particle overflow
    }

    const screenX = (1 - x) * this.system.width;
    const screenY = y * this.system.height;
    
    // Create main elegant particle
    const particle: ElegantParticle = {
      id: `note_${this.nextId++}`,
      x: screenX,
      y: screenY,
      z: z * 50,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: (Math.random() - 0.5) * 1.5,
      life: 3.0,
      maxLife: 3.0,
      size: 8 + velocity * 12,
      maxSize: 8 + velocity * 12,
      color: this.getInstrumentColor(instrument),
      type: 'note',
      instrument,
      opacity: 1.0,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      energy: velocity,
      pulsePhase: Math.random() * Math.PI * 2
    };

    this.system.particles.push(particle);
  }

  // Sophisticated harmony visualization - symmetrical and beautiful
  createHarmonyParticle(x: number, y: number, z: number, resonance: number) {
    if (this.system.particles.length >= this.maxParticles - 5) return;

    const screenX = (1 - x) * this.system.width;
    const screenY = y * this.system.height;
    
    // Create central harmony core
    const coreParticle: ElegantParticle = {
      id: `harmony_core_${this.nextId++}`,
      x: screenX,
      y: screenY,
      z: z * 30,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 4.0,
      maxLife: 4.0,
      size: 20 + resonance * 30,
      maxSize: 20 + resonance * 30,
      color: this.COLORS.harmony,
      type: 'harmony',
      instrument: 'harmony',
      opacity: 0.8,
      rotation: 0,
      rotationSpeed: 0.01,
      energy: resonance,
      pulsePhase: 0
    };

    this.system.particles.push(coreParticle);

    // Create symmetrical orbital particles
    const orbitalCount = 6;
    for (let i = 0; i < orbitalCount; i++) {
      const angle = (i / orbitalCount) * Math.PI * 2;
      const radius = 40 + resonance * 30;
      
      const orbitalParticle: ElegantParticle = {
        id: `harmony_orbital_${this.nextId++}`,
        x: screenX + Math.cos(angle) * radius,
        y: screenY + Math.sin(angle) * radius,
        z: z * 30,
        vx: Math.cos(angle + Math.PI/2) * 0.5,
        vy: Math.sin(angle + Math.PI/2) * 0.5,
        vz: 0,
        life: 3.0,
        maxLife: 3.0,
        size: 6 + resonance * 8,
        maxSize: 6 + resonance * 8,
        color: this.COLORS.harmony,
        type: 'harmony',
        instrument: 'harmony_orbital',
        opacity: 0.6,
        rotation: angle,
        rotationSpeed: 0.005,
        energy: resonance * 0.7,
        pulsePhase: angle
      };

      this.system.particles.push(orbitalParticle);
    }
  }

  // Elegant energy field around hands
  createEnergyField(x: number, y: number, z: number, energy: number, handType: 'left' | 'right') {
    if (this.system.particles.length >= this.maxParticles - 3) return;

    const screenX = (1 - x) * this.system.width;
    const screenY = y * this.system.height;
    const color = handType === 'left' ? this.COLORS.primary : this.COLORS.secondary;
    
    const fieldParticle: ElegantParticle = {
      id: `energy_${handType}_${this.nextId++}`,
      x: screenX,
      y: screenY,
      z: z * 20,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 1.5,
      maxLife: 1.5,
      size: 30 + energy * 40,
      maxSize: 30 + energy * 40,
      color,
      type: 'energy',
      instrument: 'energy_field',
      opacity: 0.3 + energy * 0.4,
      rotation: 0,
      rotationSpeed: handType === 'left' ? 0.008 : -0.008,
      energy,
      pulsePhase: 0
    };

    this.system.particles.push(fieldParticle);
  }

  // Smooth, elegant trail particles
  createTrailParticle(x: number, y: number, z: number, velocity: number, handType: 'left' | 'right') {
    if (this.system.particles.length >= this.maxParticles - 1) return;

    const screenX = (1 - x) * this.system.width;
    const screenY = y * this.system.height;
    const color = handType === 'left' ? this.COLORS.primary : this.COLORS.secondary;
    
    const trailParticle: ElegantParticle = {
      id: `trail_${handType}_${this.nextId++}`,
      x: screenX,
      y: screenY,
      z: z * 30,
      vx: (Math.random() - 0.5) * velocity * 3,
      vy: (Math.random() - 0.5) * velocity * 3,
      vz: (Math.random() - 0.5) * velocity * 3,
      life: 2.0,
      maxLife: 2.0,
      size: 4 + velocity * 8,
      maxSize: 4 + velocity * 8,
      color,
      type: 'trail',
      instrument: 'trail',
      opacity: 0.8,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      energy: velocity,
      pulsePhase: Math.random() * Math.PI * 2
    };

    this.system.particles.push(trailParticle);
  }

  // Create elegant constellation patterns
  createConstellation(centerX: number, centerY: number, size: number, color: string) {
    if (this.system.particles.length >= this.maxParticles - 8) return;

    const screenX = (1 - centerX) * this.system.width;
    const screenY = centerY * this.system.height;
    
    // Create constellation pattern (7 stars in a meaningful arrangement)
    const starPositions = [
      { x: 0, y: 0, size: 1.5 }, // Center star
      { x: -30, y: -20, size: 1.0 },
      { x: 30, y: -20, size: 1.0 },
      { x: -40, y: 20, size: 0.8 },
      { x: 40, y: 20, size: 0.8 },
      { x: 0, y: -40, size: 1.2 },
      { x: 0, y: 35, size: 0.9 }
    ];

    starPositions.forEach((star, index) => {
      const starParticle: ElegantParticle = {
        id: `constellation_${this.nextId++}`,
        x: screenX + star.x,
        y: screenY + star.y,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 5.0,
        maxLife: 5.0,
        size: (6 + size * 4) * star.size,
        maxSize: (6 + size * 4) * star.size,
        color,
        type: 'constellation',
        instrument: 'constellation',
        opacity: 0.9,
        rotation: 0,
        rotationSpeed: 0,
        energy: star.size,
        pulsePhase: index * 0.5
      };

      this.system.particles.push(starParticle);
    });
  }

  update(deltaTime: number) {
    this.system.time += deltaTime;
    
    // Skip some frames for performance
    this.frameSkip++;
    if (this.frameSkip % 2 === 0) return; // Update every other frame
    
    // Update canvas dimensions
    this.system.width = this.system.canvas.width;
    this.system.height = this.system.canvas.height;
    
    // Clear canvas with subtle background
    this.renderBackground();
    
    // Update and render particles
    for (let i = this.system.particles.length - 1; i >= 0; i--) {
      const particle = this.system.particles[i];
      
      // Update particle physics
      this.updateParticle(particle, deltaTime);
      
      // Remove dead particles
      if (particle.life <= 0 || particle.opacity <= 0) {
        this.system.particles.splice(i, 1);
        continue;
      }
      
      // Render particle
      this.renderParticle(particle);
    }
    
    // Cleanup old particles periodically
    if (this.system.time - this.lastCleanup > 5000) {
      this.cleanup();
      this.lastCleanup = this.system.time;
    }
  }

  private updateParticle(particle: ElegantParticle, deltaTime: number) {
    // Update position
    particle.x += particle.vx * deltaTime * 0.1;
    particle.y += particle.vy * deltaTime * 0.1;
    particle.z += particle.vz * deltaTime * 0.1;
    
    // Update life and opacity
    particle.life -= deltaTime * 0.001;
    const lifeRatio = particle.life / particle.maxLife;
    
    // Smooth fade out
    if (lifeRatio < 0.3) {
      particle.opacity = lifeRatio / 0.3;
    }
    
    // Update rotation
    particle.rotation += particle.rotationSpeed * deltaTime * 0.1;
    
    // Update pulse phase
    particle.pulsePhase += deltaTime * 0.002;
    
    // Apply gravity for some particle types
    if (particle.type === 'note' || particle.type === 'trail') {
      particle.vy += 0.1 * deltaTime * 0.001; // Gentle gravity
    }
    
    // Apply drag
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    particle.vz *= 0.98;
    
    // Dynamic size based on energy and pulse
    const pulse = Math.sin(particle.pulsePhase) * 0.1 + 1;
    particle.size = particle.maxSize * lifeRatio * pulse;
  }

  private renderBackground() {
    const { ctx, width, height } = this.system;
    
    // Create subtle gradient background
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.02)');
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  private renderParticle(particle: ElegantParticle) {
    const { ctx } = this.system;
    
    // 3D projection
    const zScale = 500 / (500 + particle.z);
    const x = particle.x * zScale;
    const y = particle.y * zScale;
    const size = particle.size * zScale;
    
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    ctx.translate(x, y);
    ctx.rotate(particle.rotation);
    
    switch (particle.type) {
      case 'note':
        this.renderNoteParticle(ctx, size, particle.color, particle.energy);
        break;
      case 'harmony':
        this.renderHarmonyParticle(ctx, size, particle.color, particle.energy);
        break;
      case 'energy':
        this.renderEnergyParticle(ctx, size, particle.color, particle.energy);
        break;
      case 'trail':
        this.renderTrailParticle(ctx, size, particle.color, particle.energy);
        break;
      case 'constellation':
        this.renderConstellationStar(ctx, size, particle.color, particle.energy);
        break;
    }
    
    ctx.restore();
  }

  private renderNoteParticle(ctx: CanvasRenderingContext2D, size: number, color: string, energy: number) {
    // Create elegant note particle with smooth gradients
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.7, color + '80');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner bright core
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha *= 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderHarmonyParticle(ctx: CanvasRenderingContext2D, size: number, color: string, energy: number) {
    // Create beautiful harmony visualization
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color + 'CC');
    gradient.addColorStop(0.5, color + '60');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Harmonic rings
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, size * (0.3 + i * 0.25), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private renderEnergyParticle(ctx: CanvasRenderingContext2D, size: number, color: string, energy: number) {
    // Create energy field effect
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(0.6, color + '20');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Energy rays
    ctx.strokeStyle = color + '60';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayLength = size * 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
      ctx.stroke();
    }
  }

  private renderTrailParticle(ctx: CanvasRenderingContext2D, size: number, color: string, energy: number) {
    // Create smooth trail particle
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color + 'AA');
    gradient.addColorStop(0.8, color + '40');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderConstellationStar(ctx: CanvasRenderingContext2D, size: number, color: string, energy: number) {
    // Create elegant star shape
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Inner glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius * 2);
    gradient.addColorStop(0, color + '60');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private getInstrumentColor(instrument: string): string {
    const colorMap: { [key: string]: string } = {
      'Piano': this.COLORS.primary,
      'Guitar': this.COLORS.secondary,
      'Violin': this.COLORS.accent,
      'Flute': this.COLORS.harmony,
      'Drums': this.COLORS.secondary,
      'Bass': this.COLORS.primary,
      'Harp': this.COLORS.harmony,
      'Trumpet': this.COLORS.secondary,
      'Saxophone': this.COLORS.accent,
      'Choir': this.COLORS.accent
    };
    
    return colorMap[instrument] || this.COLORS.primary;
  }

  private cleanup() {
    // Remove oldest particles if we have too many
    if (this.system.particles.length > this.maxParticles * 0.8) {
      this.system.particles.splice(0, 20);
    }
  }

  clear() {
    this.system.particles = [];
    this.system.ctx.clearRect(0, 0, this.system.width, this.system.height);
  }

  getParticleCount(): number {
    return this.system.particles.length;
  }
}
