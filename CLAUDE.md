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

**Node.js requirement:** Vite requires Node.js 20.19+ or 22.12+. If `npm run dev` fails with a `styleText` or native binding error, upgrade Node (e.g. `nvm install 22 && nvm use 22`) then reinstall: `rm -rf node_modules package-lock.json && npm install`.

## Architecture

**Chord Visualizer** is a client-side React SPA (no backend) that converts note input (e.g., "C4, E4, G4") into interactive SVG piano keyboard visualizations with chord detection, scale exploration, music theory education, and PNG export.

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

### UI controls

The controls bar (`.controls-bar` in `App.css`) sits at the top of `<main>` and holds two distinct control types side by side:

- **Mode selector** (`.mode-toggle`) — mutually exclusive segmented buttons: Chords / Scales / Theory. Controls the `mode` state (`'chord' | 'scale' | 'theory'`).
- **Labels toggle** (`.label-toggle`) — an independent pill switch on the right. Controls the `showLabels` boolean, which gates per-key note labels and the chord/scale name annotation in `PianoKeyboard`. These are intentionally separate controls — do not merge them back into the same group.

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | Root container — all shared state lives here |
| `src/utils/musicUtils.js` | All music theory logic (parsing, chord/scale detection, keyboard layout, interval/degree helpers) |
| `src/components/PianoKeyboard.jsx` | SVG rendering; keys are SVG `<rect>` elements |
| `src/components/ExportButton.jsx` | Canvas-based PNG export with resolution selection |
| `src/components/TheorySelector.jsx` | Input UI for Theory mode (sub-mode tabs, root grid, interval/scale grids) |
| `src/index.css` | Design system — CSS custom properties for colors, spacing, typography, easing |

### Styling

Design tokens live in `:root` in `src/index.css` — not Tailwind. Theme is "Dark Concert Hall" (dark surfaces, amber-gold accent). Base spacing unit is 8px. Fonts are Playfair Display (display) + DM Sans (body), loaded from Google Fonts in `index.html`.

### Theory mode

Theory mode (`mode === 'theory'`) has two sub-modes controlled by `theorySubMode`:

- **Intervals** (`'intervals'`) — root anchored at octave 4 (falls back to octave 3 if the interval target exceeds C5). Root key highlighted in the user's chosen `highlightColor` with label `"R"`; interval target highlighted in fixed teal `#3db8b0` with the interval symbol (e.g., `"5"`, `"b3"`). The `key-glow-interval` SVG filter in `PianoKeyboard` handles the teal glow.
- **Scale Patterns** (`'scale-patterns'`) — all scale degree keys highlighted in `highlightColor`; each key's label shows its degree number (`"1"`–`"7"`) when Labels are on. Uses a curated 16-type list (`THEORY_SCALE_PRESETS`) that goes beyond the 10-type `SCALE_PRESETS` used in Scales mode.

Per-key color and label overrides are passed from `App` to `PianoKeyboard` via the `keyOverrides` prop — a `Map<midi, { color, label }>`. When `keyOverrides` is non-null it takes precedence over `highlightedMidis`/`highlightColor`. When null (Chord and Scale modes), `PianoKeyboard` behaves exactly as before.

Relevant exports from `musicUtils.js`: `THEORY_INTERVALS`, `THEORY_SCALE_PRESETS`, `getIntervalTarget(root, intervalName)`, `getScaleDegrees(root, scaleType)`.

### SVG export notes

`ExportButton.jsx` must manually inline computed styles onto the cloned SVG before serialization because `XMLSerializer` does not capture stylesheets. When modifying piano key rendering, verify the export path still captures the changes.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) auto-deploys `main` to GitHub Pages. Vite base path is set to `/music_theory_app-/` in `vite.config.js` (note the trailing hyphen — matches the actual GitHub Pages URL).
