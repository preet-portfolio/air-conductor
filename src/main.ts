import { initHandTracker, onFrame, type NormalizedLandmarkList } from './tracking';
import { MusicEngine } from './music';
import { estimateBeat, BeatEstimatorState } from './tempo';
import { detectAllFingerGestures, createGestureState } from './gestures';

const video = document.getElementById('video') as HTMLVideoElement;
const overlay = document.getElementById('overlay') as HTMLCanvasElement;
const statusEl = document.getElementById('status')!;
const instrumentsContainer = document.getElementById('instruments')!;
const particlesContainer = document.getElementById('particles')!;
const leftZone = document.getElementById('leftZone')!;
const rightZone = document.getElementById('rightZone')!;

// Settings Modal Elements
const settingsTrigger = document.getElementById('settingsTrigger')!;
const settingsModal = document.getElementById('settingsModal')!;
const settingsOverlay = document.getElementById('settingsOverlay')!;
const closeSettings = document.getElementById('closeSettings')!;
const videoToggle = document.getElementById('videoToggle')!;
const distanceMode = document.getElementById('distanceMode')!;
const sensitivityMode = document.getElementById('sensitivityMode')!;
const volumeMode = document.getElementById('volumeMode')!;

let isVideoHidden = false;
let currentVisualMode = 'normal'; // 'normal', 'abstract', 'minimal'
let isDistanceMode = true;
let isHighSensitivity = false;
let isVolumeOn = true;

// Visual mode configurations
const VISUAL_MODES = {
  normal: { showHands: true, showConnections: true, showLabels: true },
  abstract: { showHands: false, showConnections: false, showLabels: false },
  minimal: { showHands: true, showConnections: false, showLabels: false }
};

// Professional status updates
function updateStatus(message: string, type: 'loading' | 'success' | 'error' = 'loading') {
  const statusDot = statusEl.querySelector('.status-dot') as HTMLElement;
  const statusText = statusEl.querySelector('span:last-child') as HTMLElement;
  
  statusDot.className = `status-dot ${type}`;
  statusText.textContent = message;
}

// Settings Modal Functions
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

// Control event listeners
function setupControls() {
  // Settings modal controls
  settingsTrigger.addEventListener('click', openSettings);
  closeSettings.addEventListener('click', closeSettingsModal);
  settingsOverlay.addEventListener('click', closeSettingsModal);
  
  // Escape key to close settings
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSettingsModal();
    }
  });

  // Video toggle
  videoToggle.addEventListener('click', () => {
    isVideoHidden = !isVideoHidden;
    document.body.classList.toggle('video-hidden', isVideoHidden);
    updateToggleState(videoToggle, !isVideoHidden);
  });

    // Setup custom dropdowns
  setupCustomDropdown('visualModeSelect', ['normal', 'abstract', 'minimal'], currentVisualMode, (value: string) => {
    currentVisualMode = value;
    updateVisualModeStyles();
  });

  setupCustomDropdown('musicStyleSelect', ['pop', 'jazz', 'blues', 'classical', 'rock', 'ambient'], 'pop', (value: string) => {
    // Find the index of the selected style and update
    const styleIndex = musicStyles.indexOf(value);
    if (styleIndex !== -1) {
      currentStyleIndex = styleIndex;
      engine.setMusicStyle(value as any);
      
      // Show style change notification
      const styleDescriptions: { [key: string]: string } = {
        'pop': '🎵 Catchy & Modern',
        'jazz': '🎷 Smooth & Sophisticated', 
        'blues': '🎸 Soulful & Expressive',
        'classical': '🎼 Elegant & Refined',
        'rock': '🤘 Energetic & Bold',
        'ambient': '🌊 Atmospheric & Flowing'
      };
      
      showNotification(`${styleDescriptions[value]} - ${value.charAt(0).toUpperCase() + value.slice(1)} Mode`);
    }
  });

  // Distance mode toggle
  distanceMode.addEventListener('click', () => {
    isDistanceMode = !isDistanceMode;
    updateToggleState(distanceMode, isDistanceMode);
    
    // Adjust interaction zones
    leftZone.style.display = isDistanceMode ? 'block' : 'none';
    rightZone.style.display = isDistanceMode ? 'block' : 'none';
  });
  
  // Sensitivity toggle
  sensitivityMode.addEventListener('click', () => {
    isHighSensitivity = !isHighSensitivity;
    updateToggleState(sensitivityMode, isHighSensitivity);
  });
  
  // Volume toggle
  volumeMode.addEventListener('click', () => {
    isVolumeOn = !isVolumeOn;
    updateToggleState(volumeMode, isVolumeOn);
    // TODO: Implement actual volume control
  });
}

function updateVisualModeStyles() {
  const mode = VISUAL_MODES[currentVisualMode as keyof typeof VISUAL_MODES];
  overlay.style.opacity = mode.showHands ? '1' : '0.3';
}

// Custom dropdown setup function
function setupCustomDropdown(selectId: string, options: string[], currentValue: string, onSelect: (value: string) => void) {
  const dropdown = document.getElementById(selectId)!;
  const button = dropdown.querySelector('.select-button')!;
  const valueSpan = button.querySelector('.select-value')!;
  const optionsContainer = dropdown.querySelector('.select-options')!;
  
  // Set initial value
  valueSpan.textContent = currentValue.charAt(0).toUpperCase() + currentValue.slice(1);
  
  // Toggle dropdown
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = button.classList.contains('active');
    
    // Close all other dropdowns
    document.querySelectorAll('.select-button.active').forEach(btn => {
      if (btn !== button) {
        btn.classList.remove('active');
        btn.parentElement!.querySelector('.select-options')!.classList.remove('show');
      }
    });
    
    // Toggle this dropdown
    button.classList.toggle('active', !isOpen);
    optionsContainer.classList.toggle('show', !isOpen);
  });
  
  // Handle option selection
  optionsContainer.addEventListener('click', (e) => {
    const option = (e.target as HTMLElement).closest('.select-option') as HTMLElement;
    if (!option) return;
    
    const value = option.dataset.value!;
    
    // Update UI
    valueSpan.textContent = value.charAt(0).toUpperCase() + value.slice(1);
    
    // Update selected state
    optionsContainer.querySelectorAll('.select-option').forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    
    // Close dropdown
    button.classList.remove('active');
    optionsContainer.classList.remove('show');
    
    // Call the callback
    onSelect(value);
  });
}

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.select-button.active').forEach(btn => {
    btn.classList.remove('active');
    btn.parentElement!.querySelector('.select-options')!.classList.remove('show');
  });
});

// Update dropdown selection programmatically
function updateDropdownSelection(selectId: string, value: string) {
  const dropdown = document.getElementById(selectId);
  if (!dropdown) return;
  
  const valueSpan = dropdown.querySelector('.select-value')!;
  const optionsContainer = dropdown.querySelector('.select-options')!;
  
  // Update displayed value
  valueSpan.textContent = value.charAt(0).toUpperCase() + value.slice(1);
  
  // Update selected state in options
  optionsContainer.querySelectorAll('.select-option').forEach(opt => {
    opt.classList.toggle('selected', opt.getAttribute('data-value') === value);
  });
}

// Simple notification function
function showNotification(message: string) {
  const notification = document.createElement('div');
  notification.className = 'style-notification';
  notification.innerHTML = `<span>${message}</span>`;
  notification.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%); 
    background: var(--glass-bg); border: 1px solid var(--glass-border); 
    border-radius: var(--radius); padding: 12px 24px; 
    backdrop-filter: blur(16px); z-index: 10000; color: var(--text-primary);
    animation: slideInDown 0.3s ease-out; font-size: 0.875rem;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Zone activity indicators
function updateZoneActivity(hands: NormalizedLandmarkList[]) {
  const [left, right] = hands;
  
  // Check if hands are in zones (for distance mode)
  if (isDistanceMode) {
    let leftActive = false;
    let rightActive = false;
    
    if (left) {
      const wrist = left[0];
      // Updated for new smaller zone proportions (5% to 35% width, 20% to 70% height)
      const mirroredX = 1 - wrist.x;
      if (mirroredX >= 0.05 && mirroredX <= 0.35 && wrist.y >= 0.2 && wrist.y <= 0.7) {
        leftActive = true;
      }
    }
    
    if (right) {
      const wrist = right[0];
      // Updated for new smaller zone proportions (65% to 95% width, 20% to 70% height)
      const mirroredX = 1 - wrist.x;
      if (mirroredX >= 0.65 && mirroredX <= 0.95 && wrist.y >= 0.2 && wrist.y <= 0.7) {
        rightActive = true;
      }
    }
    
    leftZone.classList.toggle('active', leftActive);
    rightZone.classList.toggle('active', rightActive);
  }
}

// Instrument display data with fixed emojis
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

// Create professional instrument display cards
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

// Create floating particles for visual effects
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

// Abstract background drawing for creative mode
function drawAbstractBackground(ctx: CanvasRenderingContext2D, hands: NormalizedLandmarkList[]) {
  const time = Date.now() * 0.001;
  
  // Create flowing gradients based on hand positions
  hands.forEach((hand, idx) => {
    if (!hand) return;
    
    const wrist = hand[0];
    const centerX = (1 - wrist.x) * overlay.width; // Fix inversion
    const centerY = wrist.y * overlay.height;
    
    // Create radial gradient that follows hand
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 200
    );
    
    const hue = idx === 0 ? 120 : 240; // Green for left, blue for right
    gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.3)`);
    gradient.addColorStop(0.5, `hsla(${hue + 30}, 60%, 50%, 0.2)`);
    gradient.addColorStop(1, `hsla(${hue + 60}, 50%, 40%, 0.1)`);
    
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillRect(0, 0, overlay.width, overlay.height);
    ctx.globalCompositeOperation = 'source-over';
  });
  
  // Add flowing wave patterns
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(time + i) * 50;
    const gradient = ctx.createLinearGradient(0, 0, overlay.width, overlay.height + wave);
    gradient.addColorStop(0, `hsla(${time * 50 + i * 60}, 70%, 60%, 0.3)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, overlay.width, overlay.height);
  }
  ctx.globalAlpha = 1;
}

// Show welcome modal initially
let welcomeShown = false;
function showWelcome() {
  if (!welcomeShown) {
    const welcomeModal = document.getElementById('welcomeModal');
    if (welcomeModal) {
      welcomeModal.style.display = 'flex';
      welcomeShown = true;
    }
  }
}

const engine = new MusicEngine();
const beatState: BeatEstimatorState = { lastY: null, lastDirection: null, lastBeatTime: null, intervals: [] };
const gestureState = createGestureState();

let activeInstruments = new Set<string>();
const gestureEnergyHistory: number[] = [];

// Enhanced AI Music Style Controls with more variety
const musicStyles = ['pop', 'jazz', 'blues', 'classical', 'rock', 'ambient'];
let currentStyleIndex = 0;

function cycleMusicStyle() {
  currentStyleIndex = (currentStyleIndex + 1) % musicStyles.length;
  const newStyle = musicStyles[currentStyleIndex];
  engine.setMusicStyle(newStyle as any);
  
  // Update the dropdown to reflect the new style
  updateDropdownSelection('musicStyleSelect', newStyle);
  
  // Enhanced style change notification with musical context
  const styleDescriptions = {
    'pop': '🎵 Catchy & Modern',
    'jazz': '🎷 Smooth & Sophisticated', 
    'blues': '🎸 Soulful & Expressive',
    'classical': '🎼 Elegant & Refined',
    'rock': '🤘 Energetic & Bold',
    'ambient': '🌙 Atmospheric & Dreamy'
  };
  
  const notification = document.createElement('div');
  notification.className = 'style-notification';
  notification.innerHTML = `
    <div style="font-size: 1.2rem; margin-bottom: 4px;">${styleDescriptions[newStyle as keyof typeof styleDescriptions]}</div>
    <div style="font-size: 0.9rem; opacity: 0.8;">Style: ${newStyle.toUpperCase()}</div>
  `;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 16px 24px;
    border-radius: 16px;
    font-weight: 600;
    z-index: 1000;
    animation: fadeInOut 4s ease-in-out;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

// Add style cycling on space key
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    cycleMusicStyle();
  }
});

// Calculate gesture energy for AI
function calculateGestureEnergy(hands: any[]): number {
  if (!hands.length) return 0;
  
  let totalMovement = 0;
  hands.forEach(hand => {
    hand.forEach((landmark: any, i: number) => {
      if (i < hand.length - 1) {
        const next = hand[i + 1];
        const movement = Math.sqrt(
          Math.pow(landmark.x - next.x, 2) + 
          Math.pow(landmark.y - next.y, 2)
        );
        totalMovement += movement;
      }
    });
  });
  
  return Math.min(1, totalMovement * 10); // Normalize to 0-1
}

function updateActiveInstruments(instruments: string[]) {
  // Update active instrument display
  document.querySelectorAll('.instrument-button').forEach(el => {
    const instrument = el.getAttribute('data-instrument');
    const isActive = instruments.includes(instrument!);
    el.classList.toggle('selected', isActive);
    
    // Create particles for newly active instruments with enhanced effects
    if (isActive && !activeInstruments.has(instrument!)) {
      const rect = el.getBoundingClientRect();
      const data = INSTRUMENT_DATA[instrument! as keyof typeof INSTRUMENT_DATA];
      
      // Create multiple particles for more dramatic effect
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          createParticle(
            rect.left + rect.width / 2 + (Math.random() - 0.5) * 30,
            rect.top + rect.height / 2 + (Math.random() - 0.5) * 30,
            data.color
          );
        }, i * 100); // Stagger the particles
      }
    }
  });
  
  activeInstruments = new Set(instruments);
}

async function start() {
  try {
    console.log('Initializing hand tracker...');
    updateStatus('Loading camera...', 'loading');
    await initHandTracker(video);
    console.log('Hand tracker initialized successfully');
    updateStatus('Ready - show your hands! ✨', 'success');
    
    // Show welcome modal on first load
    showWelcome();
  } catch (error) {
    console.error('Failed to initialize hand tracker:', error);
    updateStatus('❌ Camera access failed. Please allow camera permission and reload.', 'error');
    return;
  }

  onFrame((hands: NormalizedLandmarkList[]) => {
    const ctx = overlay.getContext('2d')!;
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    ctx.clearRect(0,0,overlay.width, overlay.height);

    if (!hands.length) {
      engine.releaseAll();
      updateStatus('👋 No hands detected - show your hands!', 'loading');
      updateActiveInstruments([]);
      return;
    }

    updateStatus('🎵 Conducting your orchestra...', 'success');

    // Hand assignment - MediaPipe coordinates vs user's actual hands
    // MediaPipe sees the original camera view, but user sees mirrored view
    let left: NormalizedLandmarkList | null = null;
    let right: NormalizedLandmarkList | null = null;
    
    if (hands.length === 1) {
      // Single hand - assign based on MediaPipe coordinates
      const hand = hands[0];
      // In MediaPipe space: x < 0.5 = left side of camera = user's RIGHT hand (because camera is mirrored for user)
      // x > 0.5 = right side of camera = user's LEFT hand (because camera is mirrored for user)
      if (hand[0].x < 0.5) {
        right = hand;  // Left side of camera = user's right hand
      } else {
        left = hand;   // Right side of camera = user's left hand
      }
    } else if (hands.length >= 2) {
      // Sort hands by x position and assign correctly
      const sorted = [...hands].sort((a,b) => a[0].x - b[0].x);
      right = sorted[0]; // Leftmost in camera = user's right hand  
      left = sorted[1];  // Rightmost in camera = user's left hand
    }

    // Clear canvas with dynamic background
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Add dynamic background effects for abstract mode
    if (currentVisualMode === 'abstract') {
      drawAbstractBackground(ctx, hands);
    }

    // Update zone activity
    updateZoneActivity(hands);

    // Draw hands with enhanced visualization based on current mode
    const mode = VISUAL_MODES[currentVisualMode as keyof typeof VISUAL_MODES];
    
    if (mode.showHands || mode.showConnections) {
      ctx.lineWidth = 4;
      [left, right].forEach((h, idx) => {
        if (!h) return;
        
        const isLeftHand = idx === 0;
        const handColor = isLeftHand ? '#22c55e' : '#3b82f6';
        const handLabel = isLeftHand ? 'LEFT HAND' : 'RIGHT HAND';
        const instrumentTypes = isLeftHand ? 'RHYTHM' : 'MELODY';
        
        ctx.strokeStyle = handColor;
        ctx.fillStyle = handColor;
        
        // Draw hand labels only if enabled and in distance mode
        if (mode.showLabels && isDistanceMode) {
          const wrist = h[0];
          const labelX = (1 - wrist.x) * overlay.width; // Fix inversion
          const labelY = wrist.y * overlay.height - 50;
          
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = handColor;
          ctx.textAlign = 'center';
          ctx.fillText(handLabel, labelX, labelY);
          
          ctx.font = '12px Arial';
          ctx.fillText(`(${instrumentTypes})`, labelX, labelY + 16);
        }
        
        // Draw connections if enabled
        if (mode.showConnections) {
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
          ctx.strokeStyle = handColor;
          connections.forEach(([start, end]) => {
            const startPt = h[start];
            const endPt = h[end];
            ctx.beginPath();
            // Fix inversion for connections too
            ctx.moveTo((1 - startPt.x) * overlay.width, startPt.y * overlay.height);
            ctx.lineTo((1 - endPt.x) * overlay.width, endPt.y * overlay.height);
            ctx.stroke();
          });
          ctx.globalAlpha = 1;
        }
        
        // Draw hand landmarks if hands are shown
        if (mode.showHands) {
          ctx.lineWidth = 4;
          ctx.fillStyle = handColor;
          
          h.forEach((pt, i) => {
            ctx.beginPath();
            // Fix inversion: mirror the X coordinate for proper hand orientation
            const drawX = (1 - pt.x) * overlay.width; 
            const drawY = pt.y * overlay.height;
            
            // Enhanced fingertip visualization with better contrast
            const isFingertip = [4, 8, 12, 16, 20].includes(i);
            const isWrist = i === 0;
            const radius = isFingertip ? 16 : isWrist ? 12 : 8;
            
            if (isFingertip) {
              // Multi-layer glow effect for fingertips
              ctx.shadowColor = handColor;
              ctx.shadowBlur = 25;
              
              // Outer glow ring
              ctx.beginPath();
              ctx.arc(drawX, drawY, radius + 8, 0, Math.PI*2);
              ctx.fillStyle = handColor + '30'; // More transparent outer glow
              ctx.fill();
              
              // Middle glow ring
              ctx.beginPath();
              ctx.arc(drawX, drawY, radius + 4, 0, Math.PI*2);
              ctx.fillStyle = handColor + '60'; // Semi-transparent
              ctx.fill();
              
              // Inner bright core
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(drawX, drawY, radius - 4, 0, Math.PI*2);
              ctx.fill();
              
              // Main fingertip dot
              ctx.fillStyle = handColor;
            } else if (isWrist) {
              // Special styling for wrist
              ctx.shadowColor = handColor;
              ctx.shadowBlur = 15;
              ctx.fillStyle = handColor + 'CC';
            } else {
              // Regular hand points
              ctx.shadowBlur = 0;
              ctx.fillStyle = handColor + '88';
            }
            
            ctx.arc(drawX, drawY, radius, 0, Math.PI*2);
            ctx.fill();
            
            if (isFingertip || isWrist) {
              ctx.shadowBlur = 0;
            }
          });
        }
      });
    }

    const now = performance.now();

    // AI: Calculate gesture energy for intelligent BPM adjustment
    const gestureEnergy = calculateGestureEnergy(hands);
    gestureEnergyHistory.push(gestureEnergy);
    if (gestureEnergyHistory.length > 10) gestureEnergyHistory.shift(); // Keep last 10 readings
    
    const avgEnergy = gestureEnergyHistory.reduce((a, b) => a + b, 0) / gestureEnergyHistory.length;
    engine.intelligentBpmAdjustment(avgEnergy);

    // Detect all finger gestures using new extension-based system with AI enhancements
    const fingerGestures = detectAllFingerGestures(left, right, gestureState);
    
    // Process each finger gesture with sustained support
    const activeInstrumentNames: string[] = [];
    fingerGestures.forEach(gesture => {
      if (gesture.active && gesture.note) {
        engine.playInstrument(gesture.instrument, gesture.note, gesture.velocity);
        activeInstrumentNames.push(gesture.instrument);
        
        // Create particles at finger positions for active gestures
        const isLeft = gesture.finger.startsWith('left_');
        const hand = isLeft ? left : right;
        if (hand) {
          const fingerIndex = ['thumb', 'index', 'middle', 'ring', 'pinky']
            .indexOf(gesture.finger.split('_')[1]);
          const fingertipIndex = [4, 8, 12, 16, 20][fingerIndex];
          const fingertip = hand[fingertipIndex];
          
          if (fingertip) {
            const x = (1 - fingertip.x) * overlay.width; // Fix inversion for particles
            const y = fingertip.y * overlay.height;
            const data = INSTRUMENT_DATA[gesture.instrument as keyof typeof INSTRUMENT_DATA];
            
            // Create particles more frequently for better visual feedback
            if (Math.random() < 0.15) { // 15% chance per frame
              createParticle(x, y, data.color);
            }
          }
        }
      } else if (!gesture.active) {
        engine.releaseInstrument(gesture.instrument);
      }
    });

    // Update active instruments display
    updateActiveInstruments(activeInstrumentNames);

    // SIMPLIFIED: Just use a constant comfortable volume - no confusing hand height logic!
    engine.setVolume(0.7); // Nice consistent volume

    // Tempo from left hand conducting (if available)
    if (left) {
      const beat = estimateBeat(left, now, beatState);
      if (beat.bpm) engine.setBpm(beat.bpm);
    }
  });
}

// Initialize the app
createInstrumentCards();
setupControls();
start().catch(console.error);
