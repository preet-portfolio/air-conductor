import type { NormalizedLandmarkList } from './tracking';

export interface SpatialZone {
  id: string;
  bounds: {
    x: [number, number];
    y: [number, number]; 
    z: [number, number];
  };
  instrument: string;
  effect: 'reverb' | 'delay' | 'filter' | 'distortion' | 'chorus';
  color: string;
}

export interface HandTrajectory {
  positions: Array<{
    x: number;
    y: number;
    z: number;
    timestamp: number;
    velocity: number;
  }>;
  maxLength: number;
}

export interface SpatialMusicState {
  leftHand: HandTrajectory;
  rightHand: HandTrajectory;
  currentZones: {
    left: SpatialZone | null;
    right: SpatialZone | null;
  };
  handDistance: number;
  harmonicResonance: number;
  gestureIntensity: number;
}

// Define 3D spatial zones for different musical behaviors
export const SPATIAL_ZONES: SpatialZone[] = [
  // Upper zones - Ethereal/Ambient instruments
  {
    id: 'ethereal_left',
    bounds: { x: [0, 0.4], y: [0, 0.3], z: [-0.2, 0.2] },
    instrument: 'Harp',
    effect: 'reverb',
    color: '#E1F5FE'
  },
  {
    id: 'ethereal_right', 
    bounds: { x: [0.6, 1], y: [0, 0.3], z: [-0.2, 0.2] },
    instrument: 'Flute',
    effect: 'reverb',
    color: '#F3E5F5'
  },
  
  // Middle zones - Melodic instruments
  {
    id: 'melody_left',
    bounds: { x: [0, 0.4], y: [0.3, 0.7], z: [-0.1, 0.3] },
    instrument: 'Piano',
    effect: 'chorus',
    color: '#E8F5E8'
  },
  {
    id: 'melody_right',
    bounds: { x: [0.6, 1], y: [0.3, 0.7], z: [-0.1, 0.3] },
    instrument: 'Violin',
    effect: 'delay',
    color: '#FFF3E0'
  },
  
  // Lower zones - Rhythmic/Bass instruments
  {
    id: 'rhythm_left',
    bounds: { x: [0, 0.4], y: [0.7, 1], z: [0, 0.4] },
    instrument: 'Drums',
    effect: 'distortion',
    color: '#FFEBEE'
  },
  {
    id: 'rhythm_right',
    bounds: { x: [0.6, 1], y: [0.7, 1], z: [0, 0.4] },
    instrument: 'Bass',
    effect: 'filter',
    color: '#E0F2F1'
  },
  
  // Center zone - Harmonic control
  {
    id: 'harmony_center',
    bounds: { x: [0.4, 0.6], y: [0.2, 0.8], z: [-0.1, 0.3] },
    instrument: 'Choir',
    effect: 'chorus',
    color: '#FFF8E1'
  }
];

export class SpatialMusicEngine {
  private state: SpatialMusicState;
  private lastHandPositions: {
    left: { x: number; y: number; z: number } | null;
    right: { x: number; y: number; z: number } | null;
  };

  constructor() {
    this.state = {
      leftHand: { positions: [], maxLength: 15 }, // Reduced from 30 to 15
      rightHand: { positions: [], maxLength: 15 }, // Reduced from 30 to 15
      currentZones: { left: null, right: null },
      handDistance: 0,
      harmonicResonance: 0,
      gestureIntensity: 0
    };
    
    this.lastHandPositions = { left: null, right: null };
  }

  update(leftHand: NormalizedLandmarkList | null, rightHand: NormalizedLandmarkList | null): SpatialMusicState {
    const now = performance.now();
    
    // Update hand trajectories and calculate velocities
    if (leftHand) {
      const wrist = leftHand[0];
      const currentPos = { x: wrist.x, y: wrist.y, z: wrist.z };
      
      let velocity = 0;
      if (this.lastHandPositions.left) {
        const dx = currentPos.x - this.lastHandPositions.left.x;
        const dy = currentPos.y - this.lastHandPositions.left.y;
        const dz = currentPos.z - this.lastHandPositions.left.z;
        velocity = Math.sqrt(dx*dx + dy*dy + dz*dz);
      }
      
      this.addToTrajectory(this.state.leftHand, currentPos.x, currentPos.y, currentPos.z, now, velocity);
      this.lastHandPositions.left = currentPos;
      this.state.currentZones.left = this.getZoneForPosition(currentPos.x, currentPos.y, currentPos.z);
    }
    
    if (rightHand) {
      const wrist = rightHand[0];
      const currentPos = { x: wrist.x, y: wrist.y, z: wrist.z };
      
      let velocity = 0;
      if (this.lastHandPositions.right) {
        const dx = currentPos.x - this.lastHandPositions.right.x;
        const dy = currentPos.y - this.lastHandPositions.right.y;
        const dz = currentPos.z - this.lastHandPositions.right.z;
        velocity = Math.sqrt(dx*dx + dy*dy + dz*dz);
      }
      
      this.addToTrajectory(this.state.rightHand, currentPos.x, currentPos.y, currentPos.z, now, velocity);
      this.lastHandPositions.right = currentPos;
      this.state.currentZones.right = this.getZoneForPosition(currentPos.x, currentPos.y, currentPos.z);
    }
    
    // Calculate hand distance and harmonic relationships
    this.updateHandDistance();
    this.updateHarmonicResonance();
    this.updateGestureIntensity();
    
    return this.state;
  }

  private addToTrajectory(trajectory: HandTrajectory, x: number, y: number, z: number, timestamp: number, velocity: number) {
    trajectory.positions.push({ x, y, z, timestamp, velocity });
    
    // Keep only recent positions
    while (trajectory.positions.length > trajectory.maxLength) {
      trajectory.positions.shift();
    }
  }

  private getZoneForPosition(x: number, y: number, z: number): SpatialZone | null {
    for (const zone of SPATIAL_ZONES) {
      const { bounds } = zone;
      if (x >= bounds.x[0] && x <= bounds.x[1] &&
          y >= bounds.y[0] && y <= bounds.y[1] &&
          z >= bounds.z[0] && z <= bounds.z[1]) {
        return zone;
      }
    }
    return null;
  }

  private updateHandDistance() {
    const leftRecent = this.state.leftHand.positions[this.state.leftHand.positions.length - 1];
    const rightRecent = this.state.rightHand.positions[this.state.rightHand.positions.length - 1];
    
    if (leftRecent && rightRecent) {
      const dx = leftRecent.x - rightRecent.x;
      const dy = leftRecent.y - rightRecent.y;
      const dz = leftRecent.z - rightRecent.z;
      this.state.handDistance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
  }

  private updateHarmonicResonance() {
    // Calculate harmonic resonance based on hand synchronization
    const leftTraj = this.state.leftHand.positions;
    const rightTraj = this.state.rightHand.positions;
    
    if (leftTraj.length < 3 || rightTraj.length < 3) return;
    
    // Analyze movement correlation
    let correlation = 0;
    const minLength = Math.min(leftTraj.length, rightTraj.length);
    
    for (let i = 1; i < minLength; i++) {
      const leftVel = leftTraj[i].velocity;
      const rightVel = rightTraj[i].velocity;
      correlation += Math.abs(leftVel - rightVel);
    }
    
    // Inverse correlation = higher resonance when hands move similarly
    this.state.harmonicResonance = Math.max(0, 1 - (correlation / minLength));
  }

  private updateGestureIntensity() {
    // Calculate overall gesture intensity from recent movements
    const allPositions = [...this.state.leftHand.positions, ...this.state.rightHand.positions];
    
    if (allPositions.length === 0) {
      this.state.gestureIntensity = 0;
      return;
    }
    
    const avgVelocity = allPositions.reduce((sum, pos) => sum + pos.velocity, 0) / allPositions.length;
    this.state.gestureIntensity = Math.min(1, avgVelocity * 10); // Scale and clamp
  }

  // Get musical parameters based on spatial state
  getMusicalParameters() {
    return {
      depth: {
        left: this.getAverageDepth(this.state.leftHand),
        right: this.getAverageDepth(this.state.rightHand)
      },
      velocity: {
        left: this.getAverageVelocity(this.state.leftHand),
        right: this.getAverageVelocity(this.state.rightHand)
      },
      zones: this.state.currentZones,
      handDistance: this.state.handDistance,
      harmonicResonance: this.state.harmonicResonance,
      gestureIntensity: this.state.gestureIntensity
    };
  }

  private getAverageDepth(trajectory: HandTrajectory): number {
    if (trajectory.positions.length === 0) return 0;
    const recentPositions = trajectory.positions.slice(-5); // Last 5 positions
    return recentPositions.reduce((sum, pos) => sum + pos.z, 0) / recentPositions.length;
  }

  private getAverageVelocity(trajectory: HandTrajectory): number {
    if (trajectory.positions.length === 0) return 0;
    const recentPositions = trajectory.positions.slice(-5);
    return recentPositions.reduce((sum, pos) => sum + pos.velocity, 0) / recentPositions.length;
  }

  getTrajectories() {
    return {
      left: this.state.leftHand.positions,
      right: this.state.rightHand.positions
    };
  }
}
