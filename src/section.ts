import type { NormalizedLandmarkList } from './tracking';

// Rudimentary section inference by x position of pointing index fingertip
export function inferSectionGesture(hand: NormalizedLandmarkList, sections: string[]): string | null {
  if (!hand || hand.length < 21) return null;
  
  // Assume index fingertip is landmark 8 (MediaPipe standard)
  const indexTip = hand[8];
  if (!indexTip) return null;
  
  // Mirror x coordinate for natural interaction
  const mirroredX = 1 - indexTip.x;
  const idx = Math.min(sections.length - 1, Math.max(0, Math.floor(mirroredX * sections.length)));
  return sections[idx];
}
