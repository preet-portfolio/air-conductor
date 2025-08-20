# Air Conductor

A web app that lets you conduct a virtual orchestra in mid-air. Hand tracking drives musical tempo (BPM), dynamics (volume), and section emphasis.

## Core Features (MVP)
- Real-time hand tracking (MediaPipe Hands via @mediapipe/tasks-vision or TF.js)
- Gesture to tempo mapping (vertical baton cycles -> BPM)
- Gesture to dynamics (hand height / openness -> volume)
- Section emphasis: point / pinch toward a section to highlight (strings, brass, winds, percussion)
- Gesture-based melodic control (pinch + horizontal position -> quantized scale pitch, vertical fingertip velocity -> note velocity)
- Audio synthesis & mixing (Tone.js for quick prototyping)

## Gesture Semantics (Simplified Two-Hand Model)
| Gesture / Motion | Mapping |
|------------------|---------|
| Left hand vertical conducting arc | Tempo (BPM) |
| Left palm height | Master volume |
| Left index finger raised above palm + horizontal position | Strings melodic pitch (C major 2 octaves) |
| Right index finger raised above palm + horizontal position | Active section melodic pitch (default Brass) |
| Right hand horizontal pointing | Section selection (Strings / Brass / Winds / Percussion) |
| Any downward thumb flick (either hand) | Drum hit (faster = accent) |
| No hands detected | All notes released |

## Stack
- Vite + TypeScript
- MediaPipe Hands (WASM) OR TF.js handpose fallback
- Tone.js for sound engine (later swap with sampled orchestra)
- Simple ML smoothing filters (EMA / Kalman placeholder)

## Dev Scripts
```bash
npm install
npm run dev
```

## Roadmap
1. MVP single hand tempo & volume
2. Add second-hand for section control
3. Add smoothing & robustness
4. Visual HUD
5. Export performance as MIDI

## License
MIT
