import { useState, useRef, useEffect } from 'react';
import { CHORD_PRESETS } from '../utils/musicUtils';
import './NoteInput.css';

export default function NoteInput({ value, onChange, errors = [] }) {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Auto-focus the input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="note-input-wrapper">
      <div className={`note-input-field ${isFocused ? 'note-input-field--focused' : ''} ${errors.length > 0 ? 'note-input-field--error' : ''}`}>
        <label htmlFor="note-input" className="note-input-label">
          Enter Notes
        </label>
        <input
          ref={inputRef}
          id="note-input"
          type="text"
          className="note-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="C4, E4, G4"
          spellCheck={false}
          autoComplete="off"
          aria-describedby={errors.length > 0 ? 'note-input-errors' : 'note-input-hint'}
        />
        <span id="note-input-hint" className="note-input-hint">
          Comma-separated, e.g. C4, Eb4, G4
        </span>
      </div>

      {errors.length > 0 && (
        <div id="note-input-errors" className="note-input-errors" role="alert">
          {errors.map((err, i) => (
            <span key={i} className="note-input-error">{err}</span>
          ))}
        </div>
      )}

      <div className="presets-section">
        <span className="presets-label">Quick presets</span>
        <div className="presets-grid">
          {CHORD_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className="preset-btn"
              onClick={() => onChange(preset.notes)}
              title={preset.notes}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
