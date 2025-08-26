/**
 * 🎨 SIMPLE PARTICLE SYSTEM
 * Clean, performant particle effects for hand gestures
 */

export interface SimpleParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  instrument: string;
}

export class SimpleParticleEngine {
  private particles: SimpleParticle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private nextId = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
  }

  createParticle(x: number, y: number, instrument: string, velocity: number = 1) {
    const colors = {
      'Piano': '#4A90E2',
      'Guitar': '#F5A623', 
      'Violin': '#BD10E0',
      'Flute': '#7ED321',
      'Drums': '#D0021B',
      'Bass': '#50E3C2',
      'Harp': '#B8E986',
      'Trumpet': '#F8E71C',
      'Saxophone': '#FF6B35',
      'Percussion': '#9013FE'
    };

    const particle: SimpleParticle = {
      id: `particle_${this.nextId++}`,
      x: (1 - x) * this.canvas.width, // Mirror X coordinate
      y: y * this.canvas.height,
      vx: (Math.random() - 0.5) * 4 * velocity,
      vy: (Math.random() - 0.5) * 4 * velocity - 1, // Slight upward drift
      life: 1.0,
      maxLife: 1.0,
      size: 6 + velocity * 4,
      color: colors[instrument as keyof typeof colors] || '#FFFFFF',
      instrument
    };

    this.particles.push(particle);

    // Limit total particles for performance
    if (this.particles.length > 200) {
      this.particles.splice(0, 50); // Remove oldest particles
    }
  }

  update(deltaTime: number) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // Gravity
      particle.vx *= 0.99; // Air resistance
      particle.vy *= 0.99;
      
      // Update life
      particle.life -= deltaTime * 0.001;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Render particle
      this.renderParticle(particle);
    }
  }

  private renderParticle(particle: SimpleParticle) {
    const alpha = particle.life / particle.maxLife;
    
    // Create glow effect
    this.ctx.save();
    this.ctx.globalAlpha = alpha * 0.3;
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Main particle
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  clear() {
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getParticleCount(): number {
    return this.particles.length;
  }
}