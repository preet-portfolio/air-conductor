import type { NormalizedLandmarkList } from './tracking';

export interface BeatEstimatorState {
  lastY: number | null;
  lastDirection: 'up' | 'down' | null;
  lastBeatTime: number | null;
  intervals: number[]; // ms
}

export function estimateBeat(hand: NormalizedLandmarkList, now: number, state: BeatEstimatorState) {
  const palm = hand[0];
  const y = palm.y; // 0 top, 1 bottom
  let bpm: number | null = null;

  if (state.lastY != null) {
    const dy = y - state.lastY;
    const direction = dy > 0 ? 'down' : 'up';
    if (state.lastDirection && direction !== state.lastDirection && direction === 'up') {
      // upward transition (after downstroke) => treat as beat
      if (state.lastBeatTime) {
        const interval = now - state.lastBeatTime;
        state.intervals.push(interval);
        if (state.intervals.length > 6) state.intervals.shift();
        const avg = state.intervals.reduce((a,b)=>a+b,0)/state.intervals.length;
        bpm = 60000/avg;
      }
      state.lastBeatTime = now;
    }
    state.lastDirection = direction;
  }
  state.lastY = y;
  return { bpm };
}
