# Contributing to Air Conductor

Thank you for your interest in contributing to Air Conductor! This project aims to be a **clean, focused gesture-controlled music creation tool**.

## 🎯 Project Philosophy

Air Conductor follows these principles:
- **Simplicity over complexity** - Focus on core functionality
- **Performance first** - Optimize for real-time interaction
- **Clean code** - Maintainable, readable, well-documented code
- **User experience** - Intuitive, responsive interface

## 🛠️ Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/preet-portfolio/air-conductor.git
   cd air-conductor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run linting**
   ```bash
   npm run lint
   ```

## 📋 Code Standards

### TypeScript
- Use TypeScript for all new code
- Prefer explicit types over `any`
- Use interfaces for data structures
- Follow existing naming conventions

### Code Style
- Use ESLint configuration provided
- Prefer functional programming patterns
- Keep functions small and focused
- Add JSDoc comments for public APIs

### Performance
- Minimize heavy computations in main animation loop
- Use `requestAnimationFrame` for animations
- Debounce/throttle expensive operations
- Profile performance changes

## 🎵 Architecture

The project has a clean, modular structure:

```
src/
├── main.ts              # Main application logic
├── tracking.ts          # Hand tracking with MediaPipe
├── gestures.ts          # Gesture recognition system
├── music.ts             # Music synthesis with Tone.js
└── simple-particles.ts  # Lightweight particle effects
```

### Key Components
- **Hand Tracking**: MediaPipe-based hand detection
- **Music Engine**: Tone.js synthesizers and effects
- **Gesture Recognition**: Finger position → instrument mapping
- **Visual Effects**: Simple, performant particle system

## 📝 Contributing Guidelines

### Before You Start
1. Check existing issues and pull requests
2. Discuss major changes in issues first
3. Follow the existing code style
4. Test your changes thoroughly

### Pull Request Process
1. Create a feature branch from `main`
2. Make focused, atomic commits
3. Write clear commit messages
4. Test your changes
5. Update documentation if needed
6. Submit pull request with clear description

### Commit Message Format
```
🎵 Add new feature for gesture recognition

- Implement improved finger detection
- Add velocity sensitivity
- Update tests
```

Use emojis:
- 🎵 New features
- 🐛 Bug fixes  
- 🧹 Cleanup/refactoring
- 📚 Documentation
- ⚡ Performance improvements
- 🎨 UI/UX changes

## 🚫 What We Don't Want

To keep Air Conductor focused, we **avoid**:
- ❌ Complex WebGL2/WebGPU systems
- ❌ AI/ML features that add complexity
- ❌ Voice recognition systems  
- ❌ Over-engineered abstractions
- ❌ Dependencies that impact bundle size significantly
- ❌ Features that hurt performance

## 🎯 Good Contribution Ideas

We welcome contributions that:
- ✅ Improve hand tracking accuracy
- ✅ Add new musical scales/progressions
- ✅ Enhance visual feedback
- ✅ Optimize performance
- ✅ Improve accessibility
- ✅ Fix bugs
- ✅ Improve documentation
- ✅ Add tests

## 🐛 Bug Reports

When reporting bugs:
1. Use the issue template
2. Include browser/device information
3. Describe steps to reproduce
4. Include expected vs actual behavior
5. Add screenshots/recordings if helpful

## 🔧 Technical Details

### Dependencies
- **Core**: TypeScript, Vite
- **Audio**: Tone.js for synthesis
- **Vision**: MediaPipe for hand tracking
- **UI**: Pure CSS (no frameworks)

### Browser Support
- Chrome/Edge 80+
- Firefox 75+
- Safari 14+

### Performance Targets
- 60 FPS animation loop
- < 50ms audio latency
- < 2MB bundle size

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

Be respectful, inclusive, and constructive in all interactions. Focus on the code and the project goals.

---

Thank you for helping make Air Conductor better! 🎶