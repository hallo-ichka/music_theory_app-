import { useState, useRef, useCallback, useEffect } from 'react';
import './ColorPicker.css';

const PRESET_COLORS = [
  { label: 'Amber Gold', value: '#d4a843' },
  { label: 'Royal Blue', value: '#4a86e8' },
  { label: 'Coral', value: '#e07455' },
  { label: 'Emerald', value: '#4caf7d' },
  { label: 'Lavender', value: '#9c7bc4' },
  { label: 'Rose', value: '#d45d79' },
  { label: 'Cyan', value: '#3db8b0' },
  { label: 'Peach', value: '#e8a87c' },
];

export default function ColorPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="color-picker" ref={panelRef}>
      <button
        type="button"
        className="color-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Choose highlight color"
        title="Highlight color"
      >
        <span
          className="color-picker-swatch"
          style={{ backgroundColor: value }}
        />
        <svg className="color-picker-chevron" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="color-picker-dropdown">
          <span className="color-picker-dropdown-label">Highlight Color</span>
          <div className="color-picker-presets">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`color-picker-preset ${value === color.value ? 'color-picker-preset--active' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => { onChange(color.value); setIsOpen(false); }}
                title={color.label}
                aria-label={color.label}
              />
            ))}
          </div>
          <div className="color-picker-custom">
            <label htmlFor="custom-color" className="color-picker-custom-label">Custom</label>
            <input
              id="custom-color"
              type="color"
              className="color-picker-native"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
