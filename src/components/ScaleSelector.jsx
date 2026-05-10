import { ROOT_NOTES, SCALE_PRESETS } from '../utils/musicUtils';
import './ScaleSelector.css';

export default function ScaleSelector({ root, scaleType, onRootChange, onTypeChange }) {
  return (
    <div className="scale-selector-wrapper">
      <div className="scale-selector-section">
        <span className="scale-selector-label">Root Note</span>
        <div className="scale-root-grid">
          {ROOT_NOTES.map((note) => (
            <button
              key={note}
              type="button"
              className={`scale-btn${root === note ? ' scale-btn--active' : ''}`}
              onClick={() => onRootChange(note)}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div className="scale-selector-section">
        <span className="scale-selector-label">Scale Type</span>
        <div className="scale-type-grid">
          {SCALE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`scale-btn${scaleType === preset.value ? ' scale-btn--active' : ''}`}
              onClick={() => onTypeChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
