# Project: Chord-to-SVG Piano Visualizer

## Objective
Build a lightweight React-based web application that converts a string of musical notes (e.g., "C4, E4, G4") into a standardized, high-resolution SVG image of a piano keyboard. This is for use in academic presentations, requiring a clean, professional, and consistent visual style.

## Tech Stack (Recommended)
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Music Logic:** Tonal.js (for note-to-midi mapping and chord detection)
- **Rendering:** Native SVG (for crispness and easy export)
- **Export:** `html-to-image` or `canvg` for PNG downloads

## Core Features
1. **Note Input:** A text field where users can type notes (e.g., "C4, Eb4, G4").
2. **Chord Detection:** Use Tonal.js to automatically identify the chord name from the input notes.
3. **Dynamic Keyboard Rendering:**
   - Draw a 2-octave piano keyboard (C3 to C5) using SVG.
   - Map input notes to specific MIDI indices.
   - Highlight keys that match the input notes (e.g., change `fill` from white/black to a specific "brand" color like #3b82f6).
4. **Bottom Annotation:** - Below the keyboard, display the formal chord name (e.g., "C Minor") centered.
   - (Optional) Display the individual note names directly under the specific keys.
5. **Unified Export:** A button to "Export as PNG" at 2x or 3x resolution to ensure it looks sharp in a slide deck.

## UI/UX Requirements
- **Minimalist Aesthetic:** No "skeuomorphic" 3D buttons. Use flat, clean rectangles for keys.
- **Responsive Keyboard:** The SVG should maintain a consistent aspect ratio regardless of the number of octaves shown.
- **Real-time Updates:** The keyboard should update instantly as the user types.

## Logic Details
- **Key Mapping:**
  - White Keys: Width 40, Height 150.
  - Black Keys: Width 26, Height 90 (positioned between white keys).
- **Note Formatting:** Support both accidentals (Bb and A#).
- **Fallback:** If notes are entered that don't form a standard chord, still highlight the keys but display "Unknown Chord" in the annotation.