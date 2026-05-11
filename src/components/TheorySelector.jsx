import { ROOT_NOTES, THEORY_INTERVALS, THEORY_SCALE_PRESETS } from '../utils/musicUtils';
import './TheorySelector.css';

export default function TheorySelector({
  subMode,
  onSubModeChange,
  root,
  onRootChange,
  interval,
  onIntervalChange,
  scaleType,
  onScaleTypeChange,
}) {
  return (
    <div className="theory-selector-wrapper">
      <div className="theory-submode-tabs">
        <button
          type="button"
          className={`scale-btn${subMode === 'intervals' ? ' scale-btn--active' : ''}`}
          onClick={() => onSubModeChange('intervals')}
        >
          Intervals
        </button>
        <button
          type="button"
          className={`scale-btn${subMode === 'scale-patterns' ? ' scale-btn--active' : ''}`}
          onClick={() => onSubModeChange('scale-patterns')}
        >
          Scale Patterns
        </button>
      </div>

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

      {subMode === 'intervals' ? (
        <div className="scale-selector-section">
          <span className="scale-selector-label">Interval</span>
          <div className="theory-interval-grid">
            {THEORY_INTERVALS.map((item) => (
              <button
                key={item.interval}
                type="button"
                className={`scale-btn theory-interval-btn${interval === item.interval ? ' scale-btn--active' : ''}`}
                onClick={() => onIntervalChange(item.interval)}
              >
                <span className="theory-interval-name">{item.label}</span>
                <span className="theory-interval-symbol">{item.symbol}</span>
              </button>
            ))}
          </div>
          <div className="theory-legend">
            <span className="theory-legend-item">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#d4a843"/></svg>
              Root
            </span>
            <span className="theory-legend-item">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#3db8b0"/></svg>
              Interval note
            </span>
          </div>
        </div>
      ) : (
        <div className="scale-selector-section">
          <span className="scale-selector-label">Scale Type</span>
          <div className="scale-type-grid">
            {THEORY_SCALE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`scale-btn${scaleType === preset.value ? ' scale-btn--active' : ''}`}
                onClick={() => onScaleTypeChange(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
