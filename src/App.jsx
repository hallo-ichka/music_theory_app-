import { useState, useRef, useMemo, useCallback } from 'react';
import NoteInput from './components/NoteInput';
import PianoKeyboard from './components/PianoKeyboard';
import ExportButton from './components/ExportButton';
import ColorPicker from './components/ColorPicker';
import ScaleSelector from './components/ScaleSelector';
import { parseNoteInput, detectChord, getScaleNotes, SCALE_PRESETS } from './utils/musicUtils';
import { Note } from 'tonal';
import './App.css';

export default function App() {
  const [noteInput, setNoteInput] = useState('');
  const [highlightColor, setHighlightColor] = useState('#d4a843');
  const [mode, setMode] = useState('chord');
  const [scaleRoot, setScaleRoot] = useState('C');
  const [scaleType, setScaleType] = useState('major');
  const [showLabels, setShowLabels] = useState(true);
  const svgRef = useRef(null);

  const { notes, midiValues, errors } = useMemo(
    () => parseNoteInput(noteInput),
    [noteInput]
  );

  const chordName = useMemo(() => detectChord(notes), [notes]);

  const scaleMidis = useMemo(
    () => mode === 'scale' ? getScaleNotes(scaleRoot, scaleType) : [],
    [mode, scaleRoot, scaleType]
  );

  const scaleLabel = useMemo(() => {
    const preset = SCALE_PRESETS.find((p) => p.value === scaleType);
    return `${scaleRoot} ${preset?.label ?? scaleType} Scale`;
  }, [scaleRoot, scaleType]);

  const handleKeyClick = useCallback(
    (note) => {
      const currentNotes = noteInput
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);

      const noteMidi = Note.midi(note);
      const existingIndex = currentNotes.findIndex(
        (n) => Note.midi(n) === noteMidi
      );

      if (existingIndex !== -1) {
        currentNotes.splice(existingIndex, 1);
      } else {
        currentNotes.push(note);
      }

      setNoteInput(currentNotes.join(', '));
    },
    [noteInput]
  );

  const activeHighlights = mode === 'chord' ? midiValues : scaleMidis;
  const activeLabel = mode === 'chord' ? chordName : scaleLabel;

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
              <p className="app-subtitle">Piano chord &amp; scale to image</p>
            </div>
          </div>
          <ColorPicker value={highlightColor} onChange={setHighlightColor} />
        </div>
      </header>

      <main className="app-main">
        <div className="mode-toggle" role="group" aria-label="Visualization mode">
          <button
            type="button"
            className={`mode-btn${mode === 'chord' ? ' mode-btn--active' : ''}`}
            onClick={() => setMode('chord')}
          >
            Chords
          </button>
          <button
            type="button"
            className={`mode-btn${mode === 'scale' ? ' mode-btn--active' : ''}`}
            onClick={() => setMode('scale')}
          >
            Scales
          </button>
          <button
            type="button"
            className={`mode-btn${showLabels ? ' mode-btn--active' : ''}`}
            onClick={() => setShowLabels((v) => !v)}
            aria-pressed={showLabels}
          >
            Labels
          </button>
        </div>

        <section className="input-section" aria-label="Note input">
          {mode === 'chord'
            ? <NoteInput value={noteInput} onChange={setNoteInput} errors={errors} />
            : <ScaleSelector root={scaleRoot} scaleType={scaleType} onRootChange={setScaleRoot} onTypeChange={setScaleType} />
          }
        </section>

        <section className="keyboard-section" aria-label="Piano keyboard visualization">
          <PianoKeyboard
            highlightedMidis={activeHighlights}
            highlightColor={highlightColor}
            chordName={showLabels ? activeLabel : ''}
            showNoteLabels={showLabels}
            onKeyClick={mode === 'chord' ? handleKeyClick : undefined}
            svgRef={svgRef}
          />
        </section>

        <section className="export-section" aria-label="Export controls">
          <ExportButton svgRef={svgRef} chordName={activeLabel} />
        </section>
      </main>

      <footer className="app-footer">
        {mode === 'chord'
          ? <p>Click keys or type notes · Powered by <a href="https://github.com/tonaljs/tonal" target="_blank" rel="noopener noreferrer">Tonal.js</a></p>
          : <p>Select a root and scale type · Powered by <a href="https://github.com/tonaljs/tonal" target="_blank" rel="noopener noreferrer">Tonal.js</a></p>
        }
      </footer>
    </div>
  );
}
