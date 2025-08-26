/**
 * 🎵 AIR CONDUCTOR - CLEAN VERSION
 * Gesture-controlled music creation with hand tracking
 */

import { initHandTracker, onFrame, type NormalizedLandmarkList } from './tracking';
import { detectAllFingerGestures, createGestureState } from './gestures';
import { MusicEngine } from './music';
import { SimpleParticleEngine } from './simple-particles';
import * as Tone from 'tone';

// DOM Elements
const video = document.getElementById('video') as HTMLVideoElement;
const overlay = document.getElementById('overlay') as HTMLCanvasElement;
const statusEl = document.getElementById('status')!;
const instrumentsContainer = document.getElementById('instruments')!;
const particlesContainer = document.getElementById('particles')!;
const leftZone = document.getElementById('leftZone')!;
const rightZone = document.getElementById('rightZone')!;

// Settings Elements
const settingsTrigger = document.getElementById('settingsTrigger')!;
const settingsModal = document.getElementById('settingsModal')!;
const settingsOverlay = document.getElementById('settingsOverlay')!;
const closeSettings = document.getElementById('closeSettings')!;
const videoToggle = document.getElementById('videoToggle')!;
const distanceMode = document.getElementById('distanceMode')!;
const volumeMode = document.getElementById('volumeMode')!;

// App State
let isVideoHidden = false;
let isDistanceMode = true;
let isVolumeOn = true;
let currentMusicStyleIndex = 0;

const musicStyles = ['pop', 'jazz', 'blues', 'classical', 'rock', 'ambient'];

// Engines
const musicEngine = new MusicEngine();
let particleEngine: SimpleParticleEngine | null = null;
const gestureState = createGestureState();

// Instrument data for UI
const INSTRUMENT_DATA = {
  'Drums': { emoji: '🥁', color: '#ff6b6b' },
  'Bass': { emoji: '🎸', color: '#4ecdc4' },
  'Piano': { emoji: '🎹', color: '#45b7d1' },
  'Guitar': { emoji: '🎸', color: '#96ceb4' },
  'Percussion': { emoji: '🪘', color: '#feca57' },
  'Violin': { emoji: '🎻', color: '#ff9ff3' },
  'Trumpet': { emoji: '🎺', color: '#54a0ff' },
  'Flute': { emoji: '🎵', color: '#5f27cd' },
  'Saxophone': { emoji: '🎷', color: '#00d2d3' },
  'Harp': { emoji: '🪕', color: '#ff6348' }
};

let activeInstruments = new Set<string>();

/**
 * STATUS & UI FUNCTIONS
 */
function updateStatus(message: string, type: 'loading' | 'success' | 'error' = 'loading') {
  const statusDot = statusEl.querySelector('.status-dot') as HTMLElement;
  const statusText = statusEl.querySelector('span:last-child') as HTMLElement;
  
  statusDot.className = `status-dot ${type}`;
  statusText.textContent = message;
}

function showNotification(message: string) {
  const notification = document.createElement('div');
  notification.className = 'style-notification';
  notification.innerHTML = `<span>${message}</span>`;
  notification.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
    background: rgba(0, 0, 0, 0.8); border: 1px solid rgba(255, 255, 255, 0.3); 
    border-radius: 8px; padding: 12px 24px; 
    backdrop-filter: blur(16px); z-index: 10000; color: white;
    animation: slideInDown 0.3s ease-out; font-size: 0.875rem;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

/**
 * SETTINGS FUNCTIONS
 */
function openSettings() {
  settingsModal.classList.add('show');
  settingsOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeSettingsModal() {
  settingsModal.classList.remove('show');
  settingsOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

function updateToggleState(toggle: HTMLElement, isActive: boolean) {
  toggle.classList.toggle('active', isActive);
}

function setupControls() {
  // Settings modal
  settingsTrigger.addEventListener('click', openSettings);
  closeSettings.addEventListener('click', closeSettingsModal);
  settingsOverlay.addEventListener('click', closeSettingsModal);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettingsModal();
  });

  // Video toggle
  videoToggle.addEventListener('click', () => {
    isVideoHidden = !isVideoHidden;
    document.body.classList.toggle('video-hidden', isVideoHidden);
    updateToggleState(videoToggle, !isVideoHidden);
  });

  // Distance mode toggle
  distanceMode.addEventListener('click', () => {
    isDistanceMode = !isDistanceMode;
    updateToggleState(distanceMode, isDistanceMode);
    leftZone.style.display = isDistanceMode ? 'block' : 'none';
    rightZone.style.display = isDistanceMode ? 'block' : 'none';
  });
  
  // Volume toggle
  volumeMode.addEventListener('click', () => {
    isVolumeOn = !isVolumeOn;
    updateToggleState(volumeMode, isVolumeOn);
    musicEngine.setVolume(isVolumeOn ? 0.7 : 0);
  });

  // Music style cycling
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      cycleMusicStyle();
    }
  });
}

function cycleMusicStyle() {
  currentMusicStyleIndex = (currentMusicStyleIndex + 1) % musicStyles.length;
  const newStyle = musicStyles[currentMusicStyleIndex];
  musicEngine.setMusicStyle(newStyle as any);
  
  const styleDescriptions = {
    'pop': '🎵 Catchy & Modern',
    'jazz': '🎷 Smooth & Sophisticated', 
    'blues': '🎸 Soulful & Expressive',
    'classical': '🎼 Elegant & Refined',
    'rock': '🤘 Energetic & Bold',
    'ambient': '🌊 Atmospheric & Flowing'
  };
  
  showNotification(`${styleDescriptions[newStyle as keyof typeof styleDescriptions]} - ${newStyle.charAt(0).toUpperCase() + newStyle.slice(1)} Mode`);
}

/**
 * INSTRUMENT UI FUNCTIONS
 */
function createInstrumentCards() {
  const leftInstruments = ['Drums', 'Bass', 'Piano', 'Guitar', 'Percussion'];
  const rightInstruments = ['Violin', 'Trumpet', 'Flute', 'Saxophone', 'Harp'];
  
  [...leftInstruments, ...rightInstruments].forEach((instrument, index) => {
    const button = document.createElement('button');
    button.className = `instrument-button ${index < 5 ? 'left' : 'right'}`;
    button.dataset.instrument = instrument;
    
    const data = INSTRUMENT_DATA[instrument as keyof typeof INSTRUMENT_DATA];
    button.innerHTML = `
      <div class="emoji">${data.emoji}</div>
      <div class="name">${instrument}</div>
    `;
    
    instrumentsContainer.appendChild(button);
  });
}

function updateActiveInstruments(instruments: string[]) {
  document.querySelectorAll('.instrument-button').forEach(el => {
    const instrument = el.getAttribute('data-instrument');
    const isActive = instruments.includes(instrument!);
    el.classList.toggle('selected', isActive);
    
    // Create particles for newly active instruments
    if (isActive && !activeInstruments.has(instrument!)) {
      const rect = el.getBoundingClientRect();
      const data = INSTRUMENT_DATA[instrument! as keyof typeof INSTRUMENT_DATA];
      
      createParticle(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        data.color
      );
    }
  });
  
  activeInstruments = new Set(instruments);
}

/**
 * PARTICLE FUNCTIONS
 */
function createParticle(x: number, y: number, color: string) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.color = color;
  particle.style.setProperty('--random-x', (Math.random() - 0.5) * 100 + 'px');
  particlesContainer.appendChild(particle);
  
  setTimeout(() => particle.remove(), 2500);
}

/**
 * ZONE ACTIVITY FUNCTIONS
 */
function updateZoneActivity(hands: NormalizedLandmarkList[]) {
  const [left, right] = hands;
  
  if (isDistanceMode) {
    let leftActive = false;
    let rightActive = false;
    
    if (left) {
      const wrist = left[0];
      const mirroredX = 1 - wrist.x;
      if (mirroredX >= 0.05 && mirroredX <= 0.35 && wrist.y >= 0.2 && wrist.y <= 0.7) {
        leftActive = true;
      }
    }
    
    if (right) {
      const wrist = right[0];
      const mirroredX = 1 - wrist.x;
      if (mirroredX >= 0.65 && mirroredX <= 0.95 && wrist.y >= 0.2 && wrist.y <= 0.7) {
        rightActive = true;
      }
    }
    
    leftZone.classList.toggle('active', leftActive);
    rightZone.classList.toggle('active', rightActive);
  }
}

/**
 * HAND DRAWING FUNCTIONS
 */
function drawHands(ctx: CanvasRenderingContext2D, hands: NormalizedLandmarkList[]) {
  ctx.lineWidth = 4;
  
  hands.forEach((hand, idx) => {
    if (!hand) return;
    
    const isLeftHand = idx === 0;
    const handColor = isLeftHand ? '#22c55e' : '#3b82f6';
    
    ctx.strokeStyle = handColor;
    ctx.fillStyle = handColor;
    
    // Draw connections
    const connections = [
      [0,1],[1,2],[2,3],[3,4], // thumb
      [0,5],[5,6],[6,7],[7,8], // index
      [0,9],[9,10],[10,11],[11,12], // middle
      [0,13],[13,14],[14,15],[15,16], // ring
      [0,17],[17,18],[18,19],[19,20], // pinky
      [5,9],[9,13],[13,17] // palm connections
    ];
    
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    connections.forEach(([start, end]) => {
      const startPt = hand[start];
      const endPt = hand[end];
      ctx.beginPath();
      ctx.moveTo((1 - startPt.x) * overlay.width, startPt.y * overlay.height);
      ctx.lineTo((1 - endPt.x) * overlay.width, endPt.y * overlay.height);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    
    // Draw hand points
    hand.forEach((pt, i) => {
      ctx.beginPath();
      const drawX = (1 - pt.x) * overlay.width;
      const drawY = pt.y * overlay.height;
      
      const isFingertip = [4, 8, 12, 16, 20].includes(i);
      const isWrist = i === 0;
      const radius = isFingertip ? 12 : isWrist ? 8 : 6;
      
      if (isFingertip) {
        ctx.shadowColor = handColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.arc(drawX, drawY, radius - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = handColor;
      }
      
      ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      if (isFingertip) {
        ctx.shadowBlur = 0;
      }
    });
  });
}

/**
 * MAIN APPLICATION LOGIC
 */
async function startApp() {
  try {
    console.log('🚀 Starting Air Conductor...');
    updateStatus('Loading systems...', 'loading');
    
    // Initialize particle engine
    particleEngine = new SimpleParticleEngine(overlay);
    
    // Initialize hand tracker
    updateStatus('Loading camera...', 'loading');
    await initHandTracker(video);
    
    updateStatus('Ready - show your hands! ✨', 'success');
    
  } catch (error) {
    console.error('Failed to initialize:', error);
    updateStatus('❌ Camera access failed. Please allow camera permission and reload.', 'error');
    return;
  }

  // Main frame processing
  onFrame(async (hands: NormalizedLandmarkList[]) => {
    const ctx = overlay.getContext('2d')!;
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;

    if (!hands.length) {
      musicEngine.releaseAll();
      updateStatus('👋 No hands detected - show your hands!', 'loading');
      updateActiveInstruments([]);
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      return;
    }

    updateStatus('🎵 Making music with your hands!', 'success');

    // Hand assignment
    let left: NormalizedLandmarkList | null = null;
    let right: NormalizedLandmarkList | null = null;
    
    if (hands.length === 1) {
      const hand = hands[0];
      if (hand[0].x < 0.5) {
        right = hand; // Left side of camera = user's right hand
      } else {
        left = hand; // Right side of camera = user's left hand
      }
    } else if (hands.length >= 2) {
      const sorted = [...hands].sort((a,b) => a[0].x - b[0].x);
      right = sorted[0];
      left = sorted[1];
    }

    // Clear canvas
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Update particle system
    if (particleEngine) {
      particleEngine.update(16.67); // 60fps
    }
    
    // Update zones
    updateZoneActivity(hands);

    // Draw hands
    drawHands(ctx, [left, right].filter(Boolean) as NormalizedLandmarkList[]);

    // Ensure audio context is running
    if (Tone.getContext().state !== 'running') {
      try {
        await Tone.start();
        console.log('✅ Audio context started');
      } catch (error) {
        console.error('Failed to start audio context:', error);
      }
    }
    
    // Process gestures
    const fingerGestures = detectAllFingerGestures(left, right, gestureState);
    const activeInstrumentNames: string[] = [];
    
    fingerGestures.forEach(gesture => {
      if (gesture.active && gesture.note) {
        musicEngine.playInstrument(gesture.instrument, gesture.note, gesture.velocity);
        
        // Create particles for active gestures
        if (particleEngine && Math.random() < 0.3) {
          const isLeft = gesture.finger.startsWith('left_');
          const hand = isLeft ? left : right;
          if (hand) {
            const fingerIndex = ['thumb', 'index', 'middle', 'ring', 'pinky']
              .indexOf(gesture.finger.split('_')[1]);
            const fingertipIndex = [4, 8, 12, 16, 20][fingerIndex];
            const fingertip = hand[fingertipIndex];
            
            if (fingertip) {
              particleEngine.createParticle(
                fingertip.x, 
                fingertip.y, 
                gesture.instrument, 
                gesture.velocity
              );
            }
          }
        }
        
        activeInstrumentNames.push(gesture.instrument);
      } else if (!gesture.active) {
        musicEngine.releaseInstrument(gesture.instrument);
      }
    });
    
    // Update UI
    updateActiveInstruments(activeInstrumentNames);
    
    // Set volume
    musicEngine.setVolume(isVolumeOn ? 0.7 : 0);
  });
}

// Ensure audio starts on user interaction
document.addEventListener('click', async () => {
  if (Tone.getContext().state !== 'running') {
    try {
      await Tone.start();
      console.log('✅ Audio enabled via user interaction');
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  }
});

// Show welcome modal on first load
function showWelcome() {
  const welcomeModal = document.getElementById('welcomeModal');
  if (welcomeModal) {
    welcomeModal.style.display = 'flex';
  }
}

// Initialize app
createInstrumentCards();
setupControls();
showWelcome();
startApp().catch(console.error);