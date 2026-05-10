# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run lint      # ESLint (flat config, React + hooks rules)
npm run preview   # Preview production build locally
npm run deploy    # Build + deploy to GitHub Pages
```

No test runner is configured — testing is manual in the browser.

## Architecture

**Chord Visualizer** is a client-side React SPA (no backend) that converts note input (e.g., "C4, E4, G4") into interactive SVG piano keyboard visualizations with chord detection and PNG export.

### Data flow

```
NoteInput → App (state) → PianoKeyboard (SVG render)
                       → ExportButton (Canvas PNG export)
                       ← ColorPicker (highlight color)
```

1. User types notes → `App` parses via `musicUtils.parseNoteInput()` and detects chord via `musicUtils.detectChord()` (backed by the `tonal` library).
2. `PianoKeyboard` renders a 3-octave SVG (C3–C5) using `generateKeyboardLayout()`, highlighting matched keys.
3. `ExportButton` clones the SVG, inlines styles (CSS is lost during serialization), renders to Canvas at 2×/3×/4×, and saves as PNG.
4. A `svgRef` is threaded from `App` through both `PianoKeyboard` and `ExportButton` to avoid circular dependencies.

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | Root container — all shared state lives here |
| `src/utils/musicUtils.js` | All music theory logic (parsing, chord detection, keyboard layout) |
| `src/components/PianoKeyboard.jsx` | SVG rendering; keys are SVG `<rect>` elements |
| `src/components/ExportButton.jsx` | Canvas-based PNG export with resolution selection |
| `src/index.css` | Design system — CSS custom properties for colors, spacing, typography, easing |

### Styling

Design tokens live in `:root` in `src/index.css` — not Tailwind. Theme is "Dark Concert Hall" (dark surfaces, amber-gold accent). Base spacing unit is 8px. Fonts are Playfair Display (display) + DM Sans (body), loaded from Google Fonts in `index.html`.

### SVG export notes

`ExportButton.jsx` must manually inline computed styles onto the cloned SVG before serialization because `XMLSerializer` does not capture stylesheets. When modifying piano key rendering, verify the export path still captures the changes.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) auto-deploys `main` to GitHub Pages. Vite base path is set to `/music_theory_app-/` in `vite.config.js` (note the trailing hyphen — matches the actual GitHub Pages URL).
