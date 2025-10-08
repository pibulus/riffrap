# 🔧 TINKER.md - RiffRap Quick Reference

*For when you haven't touched this in 6 months and need to change something NOW*

**ADHD MODE**: Jump to [QUICK WINS](#-quick-wins---80-of-what-youll-change) or [WHEN SHIT BREAKS](#-when-shit-breaks---top-3-fixes)

---

## 🚀 START HERE - RUN THE DAMN THING

### Dev Mode
```bash
# STACK: SVELTEKIT + VITE + TAILWIND + DAISYUI
npm run dev
# Opens: http://localhost:5173 (default Vite port)
```

### Production Build
```bash
npm run build
npm run preview
```

### Health Check
```bash
npm run lint        # Check code quality
npm run format      # Auto-format code
npm run lighthouse  # Performance audit
```

### Dev Scripts
```bash
npm run list        # List dev script commands
npm run generate    # Generate code/components
npm run parse-prd   # Parse PRD documents
```

---

## 📁 FILE MAP - WHERE SHIT LIVES

```
riffrap/
├── src/
│   ├── routes/
│   │   ├── +page.svelte         # Homepage/main view
│   │   └── +layout.svelte       # App wrapper/layout
│   ├── lib/
│   │   ├── components/          # Reusable Svelte components
│   │   └── styles/              # Global CSS, Tailwind
│   └── app.html                 # HTML template
├── static/                      # Images, manifest, etc.
├── scripts/                     # Dev scripts (dev.js)
├── docs/                        # Documentation
└── tailwind.config.js          # Tailwind + DaisyUI config
```

### The Files You'll Actually Touch:
1. **src/routes/+page.svelte** - Main app page
2. **src/lib/components/ghost/** - Ghost character with SVG animations
3. **src/lib/components/mainPage/audio-transcript/** - Recording + transcription UI
   - AudioToText.svelte - Main container
   - RecordButtonWithTimer.svelte - Recording control
   - AudioVisualizer.svelte - Real-time visualization
4. **src/lib/components/mainPage/lyrics-collection/** - Organize/edit/export transcripts
5. **src/lib/services/audio/audioService.js** - Microphone + recording (iOS-specific handling)
6. **src/lib/services/transcription/transcriptionService.js** - Gemini API transcription
7. **src/lib/services/** - errorHandler, eventBridge, loggerService, storageUtils
8. **tailwind.config.js** - Colors and DaisyUI themes
9. **scripts/dev.js** - Dev automation scripts

---

## 🎯 QUICK WINS - 80% OF WHAT YOU'LL CHANGE

### 1. Change the Main Text/Copy
```
File: src/routes/+page.svelte
Look for: <h1> and <p> tags with app title/description
What: Main page copy, headers, button labels
```

### 2. Change Colors/Theme
```
File: tailwind.config.js
Look for: theme: { extend: { colors: {...} } }
Current: Using DaisyUI + Tailwind plugins
Options: Add custom colors or use DaisyUI themes
DaisyUI docs: https://daisyui.com/docs/themes/
```

### 3. Change App Name/Title
```
File: src/app.html
Look for: <title>RiffRap</title>
Change: Your new app name

Also check: package.json (name field)
And: static/manifest.json (for PWA if exists)
```

---

## 🔧 COMMON TWEAKS

### Add a New Page/Route
```bash
# SvelteKit routing:
Create: src/routes/newpage/+page.svelte
Visit: http://localhost:5173/newpage

# With layout:
Create: src/routes/newpage/+layout.svelte
```

### Change Port
```bash
# Vite default is 5173
# To change, add to package.json dev script:
"dev": "vite dev --port 3000"
```

### Use Dev Scripts
```bash
# Scripts are in scripts/dev.js
npm run list       # See available commands
npm run generate   # Generate boilerplate
npm run parse-prd  # Parse PRD docs
```

### Add/Remove DaisyUI Component
```bash
# DaisyUI is already installed
# Use components directly in Svelte files:
<button class="btn btn-primary">Click Me</button>

# See all components:
https://daisyui.com/components/
```

---

## 💥 WHEN SHIT BREAKS - TOP 3 FIXES

### 1. Port Already in Use
```bash
# Find what's using port 5173:
lsof -i :5173

# Kill it:
kill -9 PID_NUMBER

# Or change port (see "Change Port" above)
```

### 2. Dependencies Fucked
```bash
# Nuclear option:
rm -rf node_modules package-lock.json
npm install

# Try again:
npm run dev
```

### 3. Build Fails
```bash
# Clean everything:
rm -rf dist .svelte-kit node_modules

# Reinstall:
npm install

# Try build:
npm run build
```

---

## 🚦 DEPLOYMENT - SHIP IT

### One-Liner Deploy (Vercel)
```bash
# Install Vercel CLI:
npm i -g vercel

# Deploy:
vercel --prod
```

### Manual Deploy Steps
1. Build it: `npm run build`
2. Test it: `npm run preview`
3. Audit: `npm run lighthouse`
4. Push it: `git push origin main`
5. Deploy: Vercel auto-deploys from GitHub (if connected)

**Note**: Using @sveltejs/adapter-vercel (see package.json)

---

## 📝 NOTES FOR FUTURE PABLO

- **Purpose**: Voice transcription for lyrics collection/organization
- **Architecture**: Service-oriented (audio, transcription, error, event, logger, storage)
- **State management**: Svelte stores + unidirectional data flow
- **Ghost component**: SVG with reactive theming + state animations
- **Audio service**: Platform-specific (iOS vs other) + state machine for recording
- **Transcription**: Gemini API (@google/generative-ai)
- **Infrastructure**:
  - errorHandler.js - Custom error classes
  - eventBridge.js - Cross-component communication
  - loggerService.js - Structured logging
  - storageUtils.js - localStorage with encryption support
- **Dev scripts**: scripts/dev.js (list, generate, parse-prd)
- **Lighthouse**: Performance auditing built-in
- **DaisyUI**: UI component library
- **Tailwind plugins**: Forms, typography, container queries
- **Svelte 5**: Using latest (check for runes syntax)
- **Vercel adapter**: Production-ready

### Pablo's Project Quirks:
- Voice-to-lyrics workflow (not general transcription)
- Ghost character provides visual feedback for app states
- iOS-specific audio handling in audioService.js
- Lyrics collection component for organizing snippets
- Event bridge pattern for cross-component communication
- Structured logging system (not just console.log)
- localStorage encryption support built-in

---

## 🎸 TLDR - COPY PASTE ZONE

```bash
# Start working
npm run dev

# Use dev scripts
npm run list

# Ship it
npm run build
npm run lighthouse
vercel --prod

# When broken
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Quick paths:**
- Main page: `src/routes/+page.svelte`
- Components: `src/lib/components/`
- Colors: `tailwind.config.js`
- Dev scripts: `scripts/dev.js`

---

*Generated for RiffRap 🎸*
