import type { NormalizedLandmarkList } from './tracking';

// Map each finger to a different instrument
export const FINGER_INSTRUMENTS = {
  // Left hand - Rhythm Section
  'left_thumb': 'Drums',
  'left_index': 'Bass', 
  'left_middle': 'Piano',
  'left_ring': 'Guitar',
  'left_pinky': 'Percussion',
  // Right hand - Melody Section
  'right_thumb': 'Violin',
  'right_index': 'Trumpet',
  'right_middle': 'Flute', 
  'right_ring': 'Saxophone',
  'right_pinky': 'Harp'
} as const;

export type FingerInstrument = typeof FINGER_INSTRUMENTS[keyof typeof FINGER_INSTRUMENTS];

export interface FingerGesture {
  finger: keyof typeof FINGER_INSTRUMENTS;
  instrument: FingerInstrument;
  active: boolean;
  note: string | null;
  velocity: number;
  sustained: boolean; // Whether this gesture should be held
}

export interface GestureState {
  sustainedFingers: Map<keyof typeof FINGER_INSTRUMENTS, {
    note: string;
    velocity: number;
    startTime: number;
  }>;
  handPositions: {
    leftHeight: number;
    rightHeight: number;
  };
  gestureStability: Map<keyof typeof FINGER_INSTRUMENTS, {
    consecutiveFrames: number;
    lastConfidence: number;
  }>;
}

// MediaPipe hand landmark indices
const FINGERTIP_INDICES = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky
const FINGER_BASE_INDICES = [3, 6, 10, 14, 18]; // Base joints for extension detection

// Musical scales - more varied for different hands with auto-tuning
const PENTATONIC_SCALE = ['C','D','E','G','A']; // Easy, always sounds good
const MAJOR_SCALE = ['C','D','E','F','G','A','B']; // Classic major scale
const BLUES_SCALE = ['C','Eb','F','Gb','G','Bb']; // Blues pentatonic

// Auto-tuning: Different scales for different instrument types
function getScaleForInstrument(instrument: FingerInstrument): string[] {
  switch(instrument) {
    case 'Drums':
    case 'Percussion':
      return ['C','C','C','C','C']; // Drums always same note
    case 'Bass':
      return ['C','D','E','G','A'].map(n => n + '2'); // Low bass notes
    case 'Piano':
    case 'Guitar':
      return MAJOR_SCALE; // Classic major scale
    case 'Violin':
    case 'Flute':
      return PENTATONIC_SCALE; // Always harmonious
    case 'Trumpet':
    case 'Saxophone':
      return BLUES_SCALE; // Jazzy sound
    case 'Harp':
      return ['C','D','F','G','A','C','D']; // Ethereal harp scale
    default:
      return PENTATONIC_SCALE; // Safe default
  }
}

function quantizePitch(x: number, instrument: FingerInstrument, fingerIndex: number): string {
  const scale = getScaleForInstrument(instrument);
  const baseOctave = instrument === 'Bass' ? 2 : 
                     ['Drums', 'Percussion'].includes(instrument) ? 3 :
                     ['Violin', 'Flute', 'Trumpet', 'Saxophone'].includes(instrument) ? 5 : 4;
  
  const idx = Math.min(scale.length - 1, Math.max(0, Math.floor(x * scale.length)));
  const note = scale[idx];
  
  // Add octave variation based on finger (pinky = higher, thumb = lower)
  const octaveOffset = fingerIndex - 2; // -2 to +2 range
  const finalOctave = Math.max(1, Math.min(7, baseOctave + octaveOffset));
  
  return note + finalOctave;
}

// Detect if a finger is extended (more natural than movement) with stricter requirements
function isFingerExtended(
  hand: NormalizedLandmarkList,
  fingerIndex: number
): { extended: boolean; confidence: number } {
  const tipIndex = FINGERTIP_INDICES[fingerIndex];
  const baseIndex = FINGER_BASE_INDICES[fingerIndex];
  
  const tip = hand[tipIndex];
  const base = hand[baseIndex];
  
  // Calculate finger extension based on distance from base
  const fingerLength = Math.sqrt(
    Math.pow(tip.x - base.x, 2) + Math.pow(tip.y - base.y, 2)
  );
  
  // Calculate expected extension for this finger with stricter requirements
  const expectedLength = fingerIndex === 0 ? 0.1 : 0.15; // Higher thresholds - require more extension
  
  // Extension confidence based on length ratio
  const confidence = Math.min(1, fingerLength / expectedLength);
  const extended = confidence > 0.85; // Much higher threshold - only very extended fingers
  
  // Additional check: ensure finger is actually pointing up/out, not just spread
  const wrist = hand[0];
  const isPointingUp = fingerIndex === 0 ? 
    tip.y < wrist.y - 0.1 : // Thumb should be clearly above wrist
    tip.y < base.y - 0.05;  // Other fingers should be above their base
  
  return { extended: extended && isPointingUp, confidence };
}

export function detectAllFingerGestures(
  leftHand: NormalizedLandmarkList | null,
  rightHand: NormalizedLandmarkList | null,
  state: GestureState
): FingerGesture[] {
  const gestures: FingerGesture[] = [];
  const now = performance.now();
  
  // Process left hand - Rhythm section
  if (leftHand && leftHand.length >= 21) {
    state.handPositions.leftHeight = leftHand[0].y; // Track hand height
    
    FINGERTIP_INDICES.forEach((tipIndex, fingerIdx) => {
      const fingerNames = ['left_thumb', 'left_index', 'left_middle', 'left_ring', 'left_pinky'] as const;
      const fingerKey = fingerNames[fingerIdx];
      
      const extension = isFingerExtended(leftHand, fingerIdx);
      const isCurrentlyExtended = extension.extended;
      const wasSustained = state.sustainedFingers.has(fingerKey);
      
      // Track gesture stability - require consistent detection over multiple frames
      const stability = state.gestureStability.get(fingerKey) || { consecutiveFrames: 0, lastConfidence: 0 };
      
      if (isCurrentlyExtended && extension.confidence > 0.8) {
        stability.consecutiveFrames++;
        stability.lastConfidence = extension.confidence;
      } else {
        stability.consecutiveFrames = 0;
        stability.lastConfidence = 0;
      }
      
      state.gestureStability.set(fingerKey, stability);
      
      // Only activate if gesture is stable for at least 3 frames (prevents false triggers)
      const isStableGesture = stability.consecutiveFrames >= 3;
      
      if (isCurrentlyExtended && isStableGesture) {
        // Finger is extended - play instrument
        const tip = leftHand[tipIndex];
        const note = quantizePitch(tip.x, FINGER_INSTRUMENTS[fingerKey], fingerIdx); // Use direct x coordinate
        const velocity = Math.max(0.4, extension.confidence); // Higher minimum velocity for clearer intent
        
        // Debug logging for Bass (left_index)
        if (fingerKey === 'left_index') {
          console.log(`Bass finger detected! Extension: ${extension.confidence}, Note: ${note}, Velocity: ${velocity}`);
        }
        
        // Only add as sustained if this is a deliberate gesture (high confidence)
        if (!wasSustained && extension.confidence > 0.8) {
          state.sustainedFingers.set(fingerKey, {
            note,
            velocity,
            startTime: now
          });
        }
        
        gestures.push({
          finger: fingerKey,
          instrument: FINGER_INSTRUMENTS[fingerKey],
          active: true,
          note,
          velocity,
          sustained: extension.confidence > 0.8
        });
        
      } else if (wasSustained && stability.consecutiveFrames < 2) {
        // Finger was extended but now not stable - stop sound
        state.sustainedFingers.delete(fingerKey);
        
        gestures.push({
          finger: fingerKey,
          instrument: FINGER_INSTRUMENTS[fingerKey],
          active: false,
          note: null,
          velocity: 0,
          sustained: false
        });
      }
    });
  } else {
    // No left hand - stop all left hand instruments
    const leftFingers = ['left_thumb', 'left_index', 'left_middle', 'left_ring', 'left_pinky'] as const;
    leftFingers.forEach(fingerKey => {
      if (state.sustainedFingers.has(fingerKey)) {
        state.sustainedFingers.delete(fingerKey);
        gestures.push({
          finger: fingerKey,
          instrument: FINGER_INSTRUMENTS[fingerKey],
          active: false,
          note: null,
          velocity: 0,
          sustained: false
        });
      }
    });
  }
  
  // Process right hand - Melody section
  if (rightHand && rightHand.length >= 21) {
    state.handPositions.rightHeight = rightHand[0].y; // Track hand height
    
    FINGERTIP_INDICES.forEach((tipIndex, fingerIdx) => {
      const fingerNames = ['right_thumb', 'right_index', 'right_middle', 'right_ring', 'right_pinky'] as const;
      const fingerKey = fingerNames[fingerIdx];
      
      const extension = isFingerExtended(rightHand, fingerIdx);
      const isCurrentlyExtended = extension.extended;
      const wasSustained = state.sustainedFingers.has(fingerKey);
      
      // Track gesture stability - require consistent detection over multiple frames
      const stability = state.gestureStability.get(fingerKey) || { consecutiveFrames: 0, lastConfidence: 0 };
      
      if (isCurrentlyExtended && extension.confidence > 0.8) {
        stability.consecutiveFrames++;
        stability.lastConfidence = extension.confidence;
      } else {
        stability.consecutiveFrames = 0;
        stability.lastConfidence = 0;
      }
      
      state.gestureStability.set(fingerKey, stability);
      
      // Only activate if gesture is stable for at least 3 frames (prevents false triggers)
      const isStableGesture = stability.consecutiveFrames >= 3;
      
      if (isCurrentlyExtended && isStableGesture) {
        // Finger is extended - play instrument
        const tip = rightHand[tipIndex];
        const note = quantizePitch(tip.x, FINGER_INSTRUMENTS[fingerKey], fingerIdx); // Use direct x coordinate
        const velocity = Math.max(0.4, extension.confidence); // Higher minimum velocity for clearer intent
        
        // Only add as sustained if this is a deliberate gesture (high confidence)
        if (!wasSustained && extension.confidence > 0.8) {
          state.sustainedFingers.set(fingerKey, {
            note,
            velocity,
            startTime: now
          });
        }
        
        gestures.push({
          finger: fingerKey,
          instrument: FINGER_INSTRUMENTS[fingerKey],
          active: true,
          note,
          velocity,
          sustained: extension.confidence > 0.8
        });
        
      } else if (wasSustained && stability.consecutiveFrames < 2) {
        // Finger was extended but now not stable - stop sound
        state.sustainedFingers.delete(fingerKey);
        
        gestures.push({
          finger: fingerKey,
          instrument: FINGER_INSTRUMENTS[fingerKey],
          active: false,
          note: null,
          velocity: 0,
          sustained: false
        });
      }
    });
  } else {
    // No right hand - stop all right hand instruments
    const rightFingers = ['right_thumb', 'right_index', 'right_middle', 'right_ring', 'right_pinky'] as const;
    rightFingers.forEach(fingerKey => {
      if (state.sustainedFingers.has(fingerKey)) {
        state.sustainedFingers.delete(fingerKey);
        gestures.push({
          finger: fingerKey,
          instrument: FINGER_INSTRUMENTS[fingerKey],
          active: false,
          note: null,
          velocity: 0,
          sustained: false
        });
      }
    });
  }
  
  return gestures;
}

export function createGestureState(): GestureState {
  return {
    sustainedFingers: new Map(),
    handPositions: {
      leftHeight: 0.5,
      rightHeight: 0.5
    },
    gestureStability: new Map()
  };
}

// Get current volume based on hand heights (higher = louder, like real conducting!)
export function getVolumeFromHands(state: GestureState): number {
  const avgHeight = (state.handPositions.leftHeight + state.handPositions.rightHeight) / 2;
  // Invert the Y coordinate so higher hands = higher volume (natural conducting)
  return Math.max(0.1, Math.min(1.0, 1.2 - avgHeight)); // 0.1 to 1.0 range
}

// Legacy functions for backward compatibility
export function detectNoteGesture(): { active: boolean; note: null; velocity: 0 } {
  return { active: false, note: null, velocity: 0 };
}

export function detectThumbDrum(): { hit: false; accent: false } {
  return { hit: false, accent: false };
}
