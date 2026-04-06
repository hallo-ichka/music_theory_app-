import { Note, Chord } from 'tonal';

/**
 * Full chord symbol to human-readable name mapping
 */
const CHORD_TYPE_NAMES = {
  M: 'Major',
  m: 'Minor',
  '7': 'Dominant 7th',
  M7: 'Major 7th',
  m7: 'Minor 7th',
  dim: 'Diminished',
  dim7: 'Diminished 7th',
  aug: 'Augmented',
  sus2: 'Suspended 2nd',
  sus4: 'Suspended 4th',
  '6': 'Major 6th',
  m6: 'Minor 6th',
  '9': 'Dominant 9th',
  M9: 'Major 9th',
  m9: 'Minor 9th',
  add9: 'Add 9',
  '7sus4': 'Dominant 7th sus4',
  '7#9': 'Dominant 7th #9',
  '7b9': 'Dominant 7th b9',
  m7b5: 'Half-Diminished 7th',
  '5': 'Power Chord',
  '': 'Major',
};

/**
 * Parse a comma-separated note input string into validated notes
 */
export function parseNoteInput(input) {
  if (!input || !input.trim()) {
    return { notes: [], midiValues: [], errors: [] };
  }

  const tokens = input.split(',').map((t) => t.trim()).filter(Boolean);
  const notes = [];
  const midiValues = [];
  const errors = [];

  for (const token of tokens) {
    const midi = Note.midi(token);
    if (midi !== null && midi !== undefined) {
      notes.push(Note.simplify(token));
      midiValues.push(midi);
    } else {
      errors.push(`"${token}" is not a valid note`);
    }
  }

  return { notes, midiValues, errors };
}

/**
 * Detect chord from an array of note names.
 * Returns a human-readable chord name.
 */
export function detectChord(notes) {
  if (!notes || notes.length === 0) return '';
  if (notes.length === 1) return Note.pitchClass(notes[0]);

  // Strip octave info for detection
  const pitchClasses = notes.map((n) => Note.pitchClass(n));
  // Deduplicate
  const unique = [...new Set(pitchClasses)];

  if (unique.length < 2) return unique[0];

  const detected = Chord.detect(unique, { assumePerfectFifth: true });

  if (detected.length === 0) {
    return 'Unknown Chord';
  }

  // Parse the first detection into a human-readable name
  const symbol = detected[0];
  return formatChordName(symbol);
}

/**
 * Convert a Tonal chord symbol like "Cm7" into "C Minor 7th"
 */
function formatChordName(symbol) {
  // Try to use Chord.get to parse it
  const info = Chord.get(symbol);
  if (!info || info.empty) {
    return symbol; // fallback to raw symbol
  }

  const root = info.tonic || '';
  const quality = info.aliases?.[0] || info.type || '';

  // Look up in our name map
  const readableName = CHORD_TYPE_NAMES[quality];
  if (readableName) {
    return `${root} ${readableName}`;
  }

  // Fallback: use Tonal's type name
  if (info.type) {
    return `${root} ${info.type}`;
  }

  return symbol;
}

// Piano key layout constants
const WHITE_KEY_WIDTH = 40;
const WHITE_KEY_HEIGHT = 150;
const BLACK_KEY_WIDTH = 26;
const BLACK_KEY_HEIGHT = 90;
const KEY_GAP = 1;

// Note names for one octave (chromatic)
const CHROMATIC_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

const WHITE_NOTE_INDICES = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
const BLACK_NOTE_INDICES = [1, 3, 6, 8, 10]; // C# D# F# G# A#

// Black key offsets relative to white key positions (how far right from the previous white key)
const BLACK_KEY_OFFSETS = {
  1: 0,   // C# after C
  3: 1,   // D# after D
  6: 3,   // F# after F
  8: 4,   // G# after G
  10: 5,  // A# after A
};

/**
 * Generate the full keyboard layout for a range of octaves
 * Returns { whiteKeys: [...], blackKeys: [...], totalWidth, totalHeight }
 */
export function generateKeyboardLayout(startOctave = 3, endOctave = 4) {
  const whiteKeys = [];
  const blackKeys = [];
  let whiteKeyIndex = 0;

  for (let octave = startOctave; octave <= endOctave; octave++) {
    for (let i = 0; i < 12; i++) {
      const noteName = CHROMATIC_NOTES[i];
      const fullNote = `${noteName}${octave}`;
      const midi = Note.midi(fullNote);

      if (WHITE_NOTE_INDICES.includes(i)) {
        whiteKeys.push({
          note: fullNote,
          midi,
          isBlack: false,
          x: whiteKeyIndex * (WHITE_KEY_WIDTH + KEY_GAP),
          y: 0,
          width: WHITE_KEY_WIDTH,
          height: WHITE_KEY_HEIGHT,
          label: noteName,
        });
        whiteKeyIndex++;
      }
    }

    for (let i = 0; i < 12; i++) {
      if (BLACK_NOTE_INDICES.includes(i)) {
        const whiteOffset = BLACK_KEY_OFFSETS[i];
        // Count white keys before this octave
        const octaveWhiteStart = (octave - startOctave) * 7;
        const absoluteWhiteIndex = octaveWhiteStart + whiteOffset;

        const noteName = CHROMATIC_NOTES[i];
        const fullNote = `${noteName}${octave}`;
        const midi = Note.midi(fullNote);

        blackKeys.push({
          note: fullNote,
          midi,
          isBlack: true,
          x: absoluteWhiteIndex * (WHITE_KEY_WIDTH + KEY_GAP) + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2 + KEY_GAP / 2,
          y: 0,
          width: BLACK_KEY_WIDTH,
          height: BLACK_KEY_HEIGHT,
          label: noteName,
        });
      }
    }
  }

  // Add the final C of endOctave+1
  const finalNote = `C${endOctave + 1}`;
  const finalMidi = Note.midi(finalNote);
  whiteKeys.push({
    note: finalNote,
    midi: finalMidi,
    isBlack: false,
    x: whiteKeyIndex * (WHITE_KEY_WIDTH + KEY_GAP),
    y: 0,
    width: WHITE_KEY_WIDTH,
    height: WHITE_KEY_HEIGHT,
    label: 'C',
  });

  const totalWidth = (whiteKeyIndex + 1) * (WHITE_KEY_WIDTH + KEY_GAP) - KEY_GAP;
  const totalHeight = WHITE_KEY_HEIGHT;

  return { whiteKeys, blackKeys, totalWidth, totalHeight };
}

/**
 * Check if a given MIDI value is in the highlighted set
 */
export function isNoteHighlighted(midi, highlightedMidis) {
  return highlightedMidis.includes(midi);
}

/**
 * Get the enharmonic equivalent for display purposes
 */
export function getEnharmonicLabel(note) {
  const pc = Note.pitchClass(note);
  // Prefer flats for display in certain cases
  const enharmonic = Note.enharmonic(note);
  return pc || enharmonic || note;
}

/**
 * Common chord presets for quick-insert
 */
export const CHORD_PRESETS = [
  { label: 'C Major', notes: 'C4, E4, G4' },
  { label: 'C Minor', notes: 'C4, Eb4, G4' },
  { label: 'G Major', notes: 'G3, B3, D4' },
  { label: 'A Minor', notes: 'A3, C4, E4' },
  { label: 'F Major', notes: 'F3, A3, C4' },
  { label: 'D Minor', notes: 'D4, F4, A4' },
  { label: 'G7', notes: 'G3, B3, D4, F4' },
  { label: 'Cmaj7', notes: 'C4, E4, G4, B4' },
  { label: 'Am7', notes: 'A3, C4, E4, G4' },
  { label: 'Dm7', notes: 'D4, F4, A4, C5' },
  { label: 'Cdim', notes: 'C4, Eb4, Gb4' },
  { label: 'Caug', notes: 'C4, E4, G#4' },
];
