import { useMemo, useCallback } from 'react';
import { generateKeyboardLayout, isNoteHighlighted } from '../utils/musicUtils';
import './PianoKeyboard.css';

const ANNOTATION_HEIGHT = 52;
const PADDING_X = 16;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 8;
const NOTE_LABEL_HEIGHT = 28;

export default function PianoKeyboard({
  highlightedMidis = [],
  highlightColor = '#d4a843',
  chordName = '',
  showNoteLabels = true,
  onKeyClick,
  svgRef,
  keyOverrides = null,
}) {
  const layout = useMemo(() => generateKeyboardLayout(3, 4), []);
  const { whiteKeys, blackKeys, totalWidth, totalHeight } = layout;

  const viewBoxWidth = totalWidth + PADDING_X * 2;
  const viewBoxHeight = totalHeight + PADDING_TOP + PADDING_BOTTOM + NOTE_LABEL_HEIGHT + ANNOTATION_HEIGHT;

  const handleKeyClick = useCallback(
    (note) => {
      if (onKeyClick) onKeyClick(note);
    },
    [onKeyClick]
  );

  // Filter IDs
  const glowFilterId = 'key-glow';

  return (
    <div className="piano-keyboard-container">
      <svg
        ref={svgRef}
        className="piano-keyboard-svg"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={chordName ? `Piano keyboard showing ${chordName}` : 'Piano keyboard'}
      >
        <defs>
          {/* Glow filter for highlighted keys */}
          <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feFlood floodColor={highlightColor} floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Glow filter for interval (teal) keys */}
          <filter id="key-glow-interval" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feFlood floodColor="#3db8b0" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Subtle shadow for white keys */}
          <filter id="key-shadow" x="-2%" y="-2%" width="104%" height="108%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>

        <g transform={`translate(${PADDING_X}, ${PADDING_TOP})`}>
          {/* White keys */}
          {whiteKeys.map((key) => {
            const override = keyOverrides?.get(key.midi);
            const highlighted = override != null || isNoteHighlighted(key.midi, highlightedMidis);
            const fillColor = override ? override.color : (highlighted ? highlightColor : '');
            const glowId = override?.color === '#3db8b0' ? 'key-glow-interval' : glowFilterId;
            const labelText = override ? override.label : key.note;
            const labelColor = override ? override.color : highlightColor;
            return (
              <g key={key.note} className="piano-key-group">
                <rect
                  x={key.x}
                  y={key.y}
                  width={key.width}
                  height={key.height}
                  rx={3}
                  className={`piano-key piano-key--white ${highlighted ? 'piano-key--highlighted' : ''}`}
                  filter={highlighted ? `url(#${glowId})` : 'url(#key-shadow)'}
                  onClick={() => handleKeyClick(key.note)}
                  onKeyDown={(e) => e.key === 'Enter' && handleKeyClick(key.note)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${key.note}${highlighted ? ' (highlighted)' : ''}`}
                  style={{ cursor: 'pointer', fill: fillColor }}
                />
                {highlighted && (
                  <circle
                    cx={key.x + key.width / 2}
                    cy={key.height - 18}
                    r={5}
                    fill="#ffffff"
                    opacity={0.9}
                    className="key-dot"
                    pointerEvents="none"
                  />
                )}
                {highlighted && showNoteLabels && (
                  <text
                    x={key.x + key.width / 2}
                    y={key.height + 20}
                    className="piano-key-label"
                    textAnchor="middle"
                    fill={labelColor}
                    fontSize="11"
                    fontFamily="'DM Sans', sans-serif"
                    fontWeight="600"
                  >
                    {labelText}
                  </text>
                )}
              </g>
            );
          })}

          {/* Black keys (rendered after white keys so they appear on top) */}
          {blackKeys.map((key) => {
            const override = keyOverrides?.get(key.midi);
            const highlighted = override != null || isNoteHighlighted(key.midi, highlightedMidis);
            const fillColor = override ? override.color : (highlighted ? highlightColor : '');
            const glowId = override?.color === '#3db8b0' ? 'key-glow-interval' : glowFilterId;
            const labelText = override ? override.label : key.note;
            const labelColor = override ? override.color : highlightColor;
            return (
              <g key={key.note} className="piano-key-group">
                <rect
                  x={key.x}
                  y={key.y}
                  width={key.width}
                  height={key.height}
                  rx={2}
                  className={`piano-key piano-key--black ${highlighted ? 'piano-key--highlighted' : ''}`}
                  filter={highlighted ? `url(#${glowId})` : undefined}
                  onClick={() => handleKeyClick(key.note)}
                  onKeyDown={(e) => e.key === 'Enter' && handleKeyClick(key.note)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${key.note}${highlighted ? ' (highlighted)' : ''}`}
                  style={{ cursor: 'pointer', fill: fillColor }}
                />
                {highlighted && (
                  <circle
                    cx={key.x + key.width / 2}
                    cy={key.height - 14}
                    r={4}
                    fill="#ffffff"
                    opacity={0.9}
                    className="key-dot"
                    pointerEvents="none"
                  />
                )}
                {highlighted && showNoteLabels && (
                  <text
                    x={key.x + key.width / 2}
                    y={totalHeight + 20}
                    className="piano-key-label piano-key-label--black"
                    textAnchor="middle"
                    fill={labelColor}
                    fontSize="10"
                    fontFamily="'DM Sans', sans-serif"
                    fontWeight="600"
                  >
                    {labelText}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Chord annotation */}
        {chordName && (
          <text
            x={viewBoxWidth / 2}
            y={PADDING_TOP + totalHeight + NOTE_LABEL_HEIGHT + ANNOTATION_HEIGHT - 10}
            className="chord-annotation"
            textAnchor="middle"
            fontFamily="'Playfair Display', Georgia, serif"
            fontSize="22"
            fontWeight="600"
            fill="#f0ece4"
            letterSpacing="0.5"
          >
            {chordName}
          </text>
        )}
      </svg>
    </div>
  );
}
