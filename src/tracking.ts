import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';

export interface Landmark { x:number; y:number; z:number; }
export type NormalizedLandmarkList = Landmark[];

type FrameCallback = (hands: NormalizedLandmarkList[]) => void;

const callbacks: FrameCallback[] = [];
let handLandmarker: HandLandmarker | null = null;
let running = false;

export async function initHandTracker(video: HTMLVideoElement) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      } 
    });
    video.srcObject = stream;
    await new Promise((res, rej) => {
      video.onloadedmetadata = () => res(null);
      video.onerror = () => rej(new Error('Video load failed'));
      setTimeout(() => rej(new Error('Video load timeout')), 5000);
    });

    console.log('Loading MediaPipe HandLandmarker...');
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );
    
    handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
      },
      numHands: 2,
      runningMode: 'VIDEO',
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    console.log('MediaPipe HandLandmarker loaded successfully');

    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  } catch (error) {
    console.error('Hand tracker initialization failed:', error);
    throw error;
  }
}

export function onFrame(cb: FrameCallback) { callbacks.push(cb); }

async function loop() {
  if (!running || !handLandmarker) {
    requestAnimationFrame(loop);
    return;
  }
  
  const video = document.getElementById('video') as HTMLVideoElement;
  if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
    try {
      const now = performance.now();
      const result: HandLandmarkerResult = handLandmarker.detectForVideo(video, now);
      
      // Convert landmarks and ensure they're valid
      const hands: NormalizedLandmarkList[] = (result.landmarks || [])
        .filter(lm => lm && lm.length === 21) // Ensure we have all 21 hand landmarks
        .map(lm => lm.map(p => ({ x: p.x, y: p.y, z: p.z || 0 })));
      
      // Call callbacks synchronously to avoid frame timing issues
      for (const cb of callbacks) {
        try {
          cb(hands);
        } catch (error) {
          console.error('Frame callback error:', error);
        }
      }
    } catch (error) {
      console.error('Hand detection error:', error);
    }
  }
  
  requestAnimationFrame(loop);
}
