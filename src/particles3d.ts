export interface Particle3D {
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
  color: string;
  instrument: string;
  trail: Array<{ x: number; y: number; z: number; alpha: number }>;
  type: 'note' | 'harmony' | 'rhythm' | 'trail' | 'zone' | 'constellation' | 'nebula' | 'comet';
}

export interface ParticleSystem3D {
  particles: Particle3D[];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  trails: Map<string, Array<{ x: number; y: number; z: number; time: number }>>;
}

export class AdvancedParticleEngine {
  private system: ParticleSystem3D;
  private nextId = 0;
  private audioAnalyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.system = {
      particles: [],
      canvas,
      ctx: canvas.getContext('2d')!,
      trails: new Map()
    };

    // Set up canvas for high-quality rendering
    this.setupCanvas();
  }

  private setupCanvas() {
    const { canvas, ctx } = this.system;
    const dpr = window.devicePixelRatio || 1;
    
    // Get display size
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled for DPI)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale the drawing context
    ctx.scale(dpr, dpr);
    
    // Set display size
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }

  setAudioAnalyser(analyser: AnalyserNode) {
    this.audioAnalyser = analyser;
    // Create a properly typed Uint8Array for Web Audio API compatibility
    const buffer = new ArrayBuffer(analyser.frequencyBinCount);
    this.frequencyData = new Uint8Array(buffer);
  }

  createNoteParticle(x: number, y: number, z: number, instrument: string, note: string, velocity: number) {
    const celestialColors = {
      'Piano': '#4A90E2',      // Cosmic Blue
      'Guitar': '#F5A623',     // Solar Gold
      'Violin': '#BD10E0',     // Nebula Purple
      'Flute': '#7ED321',      // Aurora Green
      'Drums': '#D0021B',      // Supernova Red
      'Bass': '#50E3C2',       // Cosmic Cyan
      'Harp': '#B8E986',       // Stardust Green
      'Trumpet': '#F8E71C',    // Solar Flare Yellow
      'Saxophone': '#FF6B35',  // Mars Orange
      'Choir': '#9013FE'       // Deep Space Purple
    };

    // Create pixelated cosmic particle
    const particle: Particle3D = {
      id: `cosmic_${this.nextId++}`,
      x: (1 - x) * this.system.canvas.width,
      y: y * this.system.canvas.height,
      z: z * 100,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      vz: (Math.random() - 0.5) * 3,
      life: 2.0,
      maxLife: 2.0,
      size: 6 + velocity * 8, // Smaller, more pixelated
      color: celestialColors[instrument as keyof typeof celestialColors] || '#FFFFFF',
      instrument,
      trail: [],
      type: 'constellation'
    };

    this.system.particles.push(particle);
    
    // Create constellation effect - multiple smaller particles
    for (let i = 0; i < 3; i++) {
      const starParticle: Particle3D = {
        id: `star_${this.nextId++}`,
        x: particle.x + (Math.random() - 0.5) * 20,
        y: particle.y + (Math.random() - 0.5) * 20,
        z: particle.z + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        vz: (Math.random() - 0.5) * 1,
        life: 1.5,
        maxLife: 1.5,
        size: 2 + Math.random() * 3,
        color: particle.color,
        instrument: 'star',
        trail: [],
        type: 'constellation'
      };
      this.system.particles.push(starParticle);
    }
  }

  createHarmonyParticle(x: number, y: number, z: number, resonance: number) {
    // Create cosmic nebula effect
    const particle: Particle3D = {
      id: `nebula_${this.nextId++}`,
      x: (1 - x) * this.system.canvas.width,
      y: y * this.system.canvas.height,
      z: z * 100,
      vx: 0,
      vy: -0.5,
      vz: 0,
      life: 3.0,
      maxLife: 3.0,
      size: 20 + resonance * 30,
      color: `hsl(${Math.random() * 60 + 260}, 80%, 60%)`, // Purple to blue cosmic colors
      instrument: 'nebula',
      trail: [],
      type: 'nebula'
    };

    this.system.particles.push(particle);
    
    // Create swirling cosmic dust
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 30 + resonance * 20;
      
      const dustParticle: Particle3D = {
        id: `dust_${this.nextId++}`,
        x: particle.x + Math.cos(angle) * radius,
        y: particle.y + Math.sin(angle) * radius,
        z: particle.z,
        vx: Math.cos(angle + Math.PI/2) * 0.5,
        vy: Math.sin(angle + Math.PI/2) * 0.5,
        vz: (Math.random() - 0.5) * 0.3,
        life: 2.0,
        maxLife: 2.0,
        size: 3 + Math.random() * 2,
        color: particle.color,
        instrument: 'cosmic_dust',
        trail: [],
        type: 'nebula'
      };
      this.system.particles.push(dustParticle);
    }
  }

  createTrailParticle(x: number, y: number, z: number, velocity: number, handType: 'left' | 'right') {
    const cosmicTrailColors = {
      left: '#7ED321',   // Aurora Green for left hand
      right: '#BD10E0'   // Nebula Purple for right hand
    };

    // Create comet-like trail effect
    const particle: Particle3D = {
      id: `comet_${this.nextId++}`,
      x: (1 - x) * this.system.canvas.width,
      y: y * this.system.canvas.height,
      z: z * 100,
      vx: (Math.random() - 0.5) * velocity * 8,
      vy: (Math.random() - 0.5) * velocity * 8,
      vz: (Math.random() - 0.5) * velocity * 8,
      life: 2.5,
      maxLife: 2.5,
      size: 4 + velocity * 6,
      color: cosmicTrailColors[handType],
      instrument: 'comet_trail',
      trail: [],
      type: 'comet'
    };

    this.system.particles.push(particle);
    
    // Create pixelated stardust trail
    for (let i = 0; i < 5; i++) {
      const dustParticle: Particle3D = {
        id: `stardust_${this.nextId++}`,
        x: particle.x + (Math.random() - 0.5) * 15,
        y: particle.y + (Math.random() - 0.5) * 15,
        z: particle.z + (Math.random() - 0.5) * 20,
        vx: particle.vx * 0.3,
        vy: particle.vy * 0.3,
        vz: particle.vz * 0.3,
        life: 1.0,
        maxLife: 1.0,
        size: 1 + Math.random() * 2,
        color: particle.color,
        instrument: 'stardust',
        trail: [],
        type: 'comet'
      };
      this.system.particles.push(dustParticle);
    }
  }

  createZoneVisualization(zoneId: string, bounds: any, color: string, active: boolean) {
    // Create cosmic zone portals when active
    if (!active) return;

    const centerX = (bounds.x[0] + bounds.x[1]) / 2 * this.system.canvas.width;
    const centerY = (bounds.y[0] + bounds.y[1]) / 2 * this.system.canvas.height;
    
    // Create cosmic gateway effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 60 + Math.sin(performance.now() * 0.003) * 10;
      
      const portalParticle: Particle3D = {
        id: `portal_${zoneId}_${this.nextId++}`,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        z: Math.sin(angle * 2) * 30,
        vx: Math.cos(angle) * 0.3,
        vy: Math.sin(angle) * 0.3,
        vz: 0,
        life: 1.2,
        maxLife: 1.2,
        size: 4 + Math.sin(performance.now() * 0.005 + i) * 2,
        color: color,
        instrument: 'cosmic_portal',
        trail: [],
        type: 'zone'
      };

      this.system.particles.push(portalParticle);
    }
    
    // Create central cosmic energy
    const energyParticle: Particle3D = {
      id: `energy_${zoneId}_${this.nextId++}`,
      x: centerX,
      y: centerY,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0.8,
      maxLife: 0.8,
      size: 15 + Math.sin(performance.now() * 0.008) * 5,
      color: color,
      instrument: 'cosmic_energy',
      trail: [],
      type: 'zone'
    };
    
    this.system.particles.push(energyParticle);
  }

  createFrequencyVisualization() {
    if (!this.audioAnalyser || !this.frequencyData) return;

    // Use a try-catch to handle any typing issues gracefully
    try {
      // Type assertion to work around TypeScript lib definitions issue
      (this.audioAnalyser.getByteFrequencyData as any)(this.frequencyData);
    } catch (error) {
      console.warn('Frequency data analysis failed:', error);
      return;
    }
    
    const barWidth = this.system.canvas.width / this.frequencyData.length;
    
    for (let i = 0; i < this.frequencyData.length; i += 4) { // Sample every 4th frequency
      const frequency = this.frequencyData[i];
      if (frequency > 50) { // Only create particles for significant frequencies
        const x = i * barWidth;
        const height = (frequency / 255) * this.system.canvas.height * 0.3;
        
        const particle: Particle3D = {
          id: `freq_${this.nextId++}`,
          x,
          y: this.system.canvas.height - height,
          z: 0,
          vx: 0,
          vy: -frequency / 255 * 2,
          vz: 0,
          life: 0.3,
          maxLife: 0.3,
          size: 2,
          color: `hsl(${(i / this.frequencyData.length) * 360}, 100%, 50%)`,
          instrument: 'frequency',
          trail: [],
          type: 'note'
        };

        this.system.particles.push(particle);
      }
    }
  }

  update(deltaTime: number) {
    const { particles, ctx, canvas } = this.system;

    // Clear canvas with fade effect for trailing
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and render particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;
      
      // Apply gravity and air resistance
      particle.vy += 0.02; // Gravity
      particle.vx *= 0.98; // Air resistance
      particle.vy *= 0.98;
      particle.vz *= 0.98;
      
      // Update life
      particle.life -= deltaTime * 0.001;
      
      // Add to trail
      if (particle.trail.length < 10) {
        particle.trail.push({
          x: particle.x,
          y: particle.y,
          z: particle.z,
          alpha: particle.life / particle.maxLife
        });
      } else {
        particle.trail.shift();
        particle.trail.push({
          x: particle.x,
          y: particle.y,
          z: particle.z,
          alpha: particle.life / particle.maxLife
        });
      }
      
      // Remove dead particles
      if (particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      
      // Render particle
      this.renderParticle(particle);
    }

    // Create frequency visualization less frequently for performance
    if (Math.random() < 0.1) { // Reduced from 0.3 to 0.1
      this.createFrequencyVisualization();
    }
  }

  private renderParticle(particle: Particle3D) {
    const { ctx } = this.system;
    const alpha = particle.life / particle.maxLife;
    
    // Render trail first
    for (let i = 0; i < particle.trail.length - 1; i++) {
      const current = particle.trail[i];
      const next = particle.trail[i + 1];
      const trailAlpha = current.alpha * 0.3;
      
      ctx.strokeStyle = particle.color + Math.floor(trailAlpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    
    // Cosmic pixelated rendering based on particle type
    ctx.globalAlpha = alpha;
    const size = particle.size;
    const x = particle.x;
    const y = particle.y;
    
    // Create pixelated cosmic effects
    const pixelSize = Math.max(1, Math.floor(size / 4));
    
    if (particle.instrument === 'cosmic_portal') {
      // Render cosmic portal rings
      ctx.fillStyle = particle.color;
      this.drawPixelatedCircle(ctx, x, y, size, pixelSize, true);
      
      // Add inner glow
      const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      glowGrad.addColorStop(0, particle.color + '40');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);
      
    } else if (particle.instrument === 'cosmic_energy') {
      // Central cosmic energy core
      ctx.fillStyle = particle.color;
      this.drawPixelatedCircle(ctx, x, y, size, pixelSize, false);
      
      // Add pulsing rays
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rayLength = size * 2;
        const endX = x + Math.cos(angle) * rayLength;
        const endY = y + Math.sin(angle) * rayLength;
        
        ctx.strokeStyle = particle.color + '60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
    } else if (particle.type === 'constellation' || particle.instrument === 'constellation') {
      // Constellation star clusters
      ctx.fillStyle = particle.color;
      this.drawPixelatedStar(ctx, x, y, size, pixelSize);
      
    } else if (particle.type === 'nebula' || particle.instrument === 'nebula') {
      // Cosmic dust clouds
      const nebulaGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
      nebulaGrad.addColorStop(0, particle.color + '80');
      nebulaGrad.addColorStop(0.7, particle.color + '40');
      nebulaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaGrad;
      this.drawPixelatedCloud(ctx, x, y, size, pixelSize);
      
    } else if (particle.type === 'comet' || particle.instrument === 'comet_trail') {
      // Comet trail effects
      ctx.fillStyle = particle.color;
      this.drawPixelatedCircle(ctx, x, y, size, pixelSize, false);
      
    } else if (particle.type === 'harmony') {
      // Render harmonic rings with pixelated style
      ctx.fillStyle = particle.color;
      this.drawPixelatedCircle(ctx, x, y, size, pixelSize, false);
      
      // Add pixelated harmonic rings
      for (let i = 1; i <= 3; i++) {
        const ringRadius = size * i * 1.5;
        this.drawPixelatedCircle(ctx, x, y, ringRadius, pixelSize * 2, true);
      }
      
    } else {
      // Default cosmic particle
      ctx.fillStyle = particle.color;
      this.drawPixelatedCircle(ctx, x, y, size, pixelSize, false);
    }
    
    ctx.globalAlpha = 1;
  }

  // Pixelated rendering helper functions
  private drawPixelatedCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, pixelSize: number, hollow: boolean = false) {
    const steps = Math.max(8, Math.floor(radius / pixelSize));
    
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const currentRadius = hollow ? radius : Math.random() * radius;
      const px = x + Math.cos(angle) * currentRadius;
      const py = y + Math.sin(angle) * currentRadius;
      
      ctx.fillRect(
        Math.floor(px / pixelSize) * pixelSize,
        Math.floor(py / pixelSize) * pixelSize,
        pixelSize,
        pixelSize
      );
    }
  }

  private drawPixelatedStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, pixelSize: number) {
    // Create 5-pointed star with pixelated edges
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      // Draw pixelated points along star edges
      for (let j = 0; j < 3; j++) {
        const jitterX = (Math.random() - 0.5) * pixelSize;
        const jitterY = (Math.random() - 0.5) * pixelSize;
        
        ctx.fillRect(
          Math.floor((px + jitterX) / pixelSize) * pixelSize,
          Math.floor((py + jitterY) / pixelSize) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }

  private drawPixelatedCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, pixelSize: number) {
    // Create organic cloud shape with pixelated texture
    const cloudPoints = 20;
    
    for (let i = 0; i < cloudPoints; i++) {
      const angle = (i / cloudPoints) * Math.PI * 2;
      const radiusVariation = 0.7 + Math.random() * 0.6;
      const cloudRadius = size * radiusVariation;
      
      const px = x + Math.cos(angle) * cloudRadius;
      const py = y + Math.sin(angle) * cloudRadius;
      
      // Draw pixelated cloud particles
      for (let j = 0; j < 8; j++) {
        const scatter = Math.random() * size * 0.3;
        const scatterAngle = Math.random() * Math.PI * 2;
        const scatterX = px + Math.cos(scatterAngle) * scatter;
        const scatterY = py + Math.sin(scatterAngle) * scatter;
        
        ctx.fillRect(
          Math.floor(scatterX / pixelSize) * pixelSize,
          Math.floor(scatterY / pixelSize) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }

  clear() {
    this.system.particles = [];
    this.system.ctx.clearRect(0, 0, this.system.canvas.width, this.system.canvas.height);
  }

  getParticleCount(): number {
    return this.system.particles.length;
  }
}
