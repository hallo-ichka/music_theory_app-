import { Note, Chord, Scale, Interval } from 'tonal';

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

export const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const SCALE_PRESETS = [
  { label: 'Major',            value: 'major' },
  { label: 'Minor',            value: 'minor' },
  { label: 'Dorian',           value: 'dorian' },
  { label: 'Phrygian',         value: 'phrygian' },
  { label: 'Lydian',           value: 'lydian' },
  { label: 'Mixolydian',       value: 'mixolydian' },
  { label: 'Harmonic Minor',   value: 'harmonic minor' },
  { label: 'Pentatonic Major', value: 'major pentatonic' },
  { label: 'Pentatonic Minor', value: 'minor pentatonic' },
  { label: 'Blues',            value: 'blues' },
];

// Returns MIDI numbers for one octave of the scale, anchored at root3.
// Anchoring at octave 3 guarantees all notes fall within C3–C5 for any root.
export function getScaleNotes(root, scaleType) {
  const scale = Scale.get(`${root} ${scaleType}`);
  if (!scale.notes.length) return [];
  const rootMidi = Note.midi(`${root}3`);
  if (rootMidi === null) return [];
  const midis = [];
  for (const pc of scale.notes) {
    for (let octave = 2; octave <= 5; octave++) {
      const midi = Note.midi(`${pc}${octave}`);
      if (midi !== null && midi >= rootMidi && midi < rootMidi + 12) {
        midis.push(midi);
        break;
      }
    }
  }
  return midis.sort((a, b) => a - b);
}

export const THEORY_INTERVALS = [
  { label: 'Minor 2nd',   symbol: 'b2', interval: '2m' },
  { label: 'Major 2nd',   symbol: '2',  interval: '2M' },
  { label: 'Minor 3rd',   symbol: 'b3', interval: '3m' },
  { label: 'Major 3rd',   symbol: '3',  interval: '3M' },
  { label: 'Perfect 4th', symbol: '4',  interval: '4P' },
  { label: 'Tritone',     symbol: '#4', interval: '4A' },
  { label: 'Perfect 5th', symbol: '5',  interval: '5P' },
  { label: 'Minor 6th',   symbol: 'b6', interval: '6m' },
  { label: 'Major 6th',   symbol: '6',  interval: '6M' },
  { label: 'Minor 7th',   symbol: 'b7', interval: '7m' },
  { label: 'Major 7th',   symbol: '7',  interval: '7M' },
  { label: 'Octave',      symbol: '8',  interval: '8P' },
];

export const THEORY_SCALE_PRESETS = [
  { label: 'Major (Ionian)',     value: 'major' },
  { label: 'Dorian',             value: 'dorian' },
  { label: 'Phrygian',           value: 'phrygian' },
  { label: 'Lydian',             value: 'lydian' },
  { label: 'Mixolydian',         value: 'mixolydian' },
  { label: 'Natural Minor',      value: 'minor' },
  { label: 'Locrian',            value: 'locrian' },
  { label: 'Harmonic Minor',     value: 'harmonic minor' },
  { label: 'Melodic Minor',      value: 'melodic minor' },
  { label: 'Major Pentatonic',   value: 'major pentatonic' },
  { label: 'Minor Pentatonic',   value: 'minor pentatonic' },
  { label: 'Blues',              value: 'blues' },
  { label: 'Whole Tone',         value: 'whole tone' },
  { label: 'Diminished (HW)',    value: 'diminished' },
  { label: 'Hungarian Minor',    value: 'hungarian minor' },
  { label: 'Phrygian Dominant',  value: 'phrygian dominant' },
];

export function getIntervalTarget(root, intervalName) {
  const KEYBOARD_MAX = 72; // C5
  let octave = 4;
  let rootNote = `${root}${octave}`;
  let targetNote = Note.transpose(rootNote, intervalName);
  let targetMidi = Note.midi(targetNote);
  if (targetMidi !== null && targetMidi > KEYBOARD_MAX) {
    octave = 3;
    rootNote = `${root}${octave}`;
    targetNote = Note.transpose(rootNote, intervalName);
    targetMidi = Note.midi(targetNote);
  }
  const rootMidi = Note.midi(rootNote);
  return { rootMidi, targetMidi, targetNote, semitones: Interval.semitones(intervalName) };
}

export function getScaleDegrees(root, scaleType) {
  const scale = Scale.get(`${root} ${scaleType}`);
  if (!scale.notes.length) return [];
  const rootMidi = Note.midi(`${root}3`);
  if (rootMidi === null) return [];
  const result = [];
  scale.notes.forEach((pc, i) => {
    for (let octave = 2; octave <= 5; octave++) {
      const midi = Note.midi(`${pc}${octave}`);
      if (midi !== null && midi >= rootMidi && midi < rootMidi + 12) {
        result.push({ midi, degree: i + 1, degreeLabel: String(i + 1) });
        break;
      }
    }
  });
  return result.sort((a, b) => a.midi - b.midi);
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
