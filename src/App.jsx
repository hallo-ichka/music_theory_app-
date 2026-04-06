import { useState, useRef, useMemo, useCallback } from 'react';
import NoteInput from './components/NoteInput';
import PianoKeyboard from './components/PianoKeyboard';
import ExportButton from './components/ExportButton';
import ColorPicker from './components/ColorPicker';
import { parseNoteInput, detectChord } from './utils/musicUtils';
import { Note } from 'tonal';
import './App.css';

export default function App() {
  const [noteInput, setNoteInput] = useState('');
  const [highlightColor, setHighlightColor] = useState('#d4a843');
  const svgRef = useRef(null);

  // Parse notes in real-time
  const { notes, midiValues, errors } = useMemo(
    () => parseNoteInput(noteInput),
    [noteInput]
  );

  // Detect chord
  const chordName = useMemo(() => detectChord(notes), [notes]);

  // Handle clicking a piano key
  const handleKeyClick = useCallback(
    (note) => {
      // If the note is already in the input, remove it
      const currentNotes = noteInput
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);

      const noteMidi = Note.midi(note);
      const existingIndex = currentNotes.findIndex(
        (n) => Note.midi(n) === noteMidi
      );

      if (existingIndex !== -1) {
        // Remove the note
        currentNotes.splice(existingIndex, 1);
      } else {
        // Add the note
        currentNotes.push(note);
      }

      setNoteInput(currentNotes.join(', '));
    },
    [noteInput]
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-logo-group">
            <svg className="app-logo" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="5" height="16" rx="1.5" fill="currentColor" opacity="0.2"/>
              <rect x="8" y="6" width="5" height="16" rx="1.5" fill="currentColor" opacity="0.3"/>
              <rect x="14" y="6" width="5" height="16" rx="1.5" fill="currentColor" opacity="0.2"/>
              <rect x="20" y="6" width="5" height="16" rx="1.5" fill="currentColor" opacity="0.3"/>
              <rect x="5.5" y="6" width="3" height="10" rx="1" fill="currentColor" opacity="0.6"/>
              <rect x="11.5" y="6" width="3" height="10" rx="1" fill="currentColor" opacity="0.6"/>
              <rect x="22.5" y="6" width="3" height="10" rx="1" fill="currentColor" opacity="0.6"/>
            </svg>
            <div>
              <h1 className="app-title">Chord Visualizer</h1>
              <p className="app-subtitle">Piano chord to image</p>
            </div>
          </div>
          <ColorPicker value={highlightColor} onChange={setHighlightColor} />
        </div>
      </header>

      <main className="app-main">
        <section className="input-section" aria-label="Note input">
          <NoteInput value={noteInput} onChange={setNoteInput} errors={errors} />
        </section>

        <section className="keyboard-section" aria-label="Piano keyboard visualization">
          <PianoKeyboard
            highlightedMidis={midiValues}
            highlightColor={highlightColor}
            chordName={chordName}
            onKeyClick={handleKeyClick}
            svgRef={svgRef}
          />
        </section>

        <section className="export-section" aria-label="Export controls">
          <ExportButton svgRef={svgRef} chordName={chordName} />
        </section>
      </main>

      <footer className="app-footer">
        <p>Click keys or type notes · Powered by <a href="https://github.com/tonaljs/tonal" target="_blank" rel="noopener noreferrer">Tonal.js</a></p>
      </footer>
    </div>
  );
}
