import { useState, useCallback } from 'react';
import './ExportButton.css';

export default function ExportButton({ svgRef, chordName }) {
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(3);

  const handleExport = useCallback(async () => {
    const svgElement = svgRef?.current;
    if (!svgElement) return;

    setIsExporting(true);

    try {
      // Clone the SVG for export
      const clone = svgElement.cloneNode(true);

      // Override text fill for export (use dark text on white bg)
      const annotation = clone.querySelector('.chord-annotation');
      if (annotation) {
        annotation.setAttribute('fill', '#1a1a1a');
        annotation.style.opacity = '1';
        annotation.style.animation = 'none';
      }

      // Inline styles for keys because CSS variables are lost in SVG-to-image serialization
      const whiteKeys = clone.querySelectorAll('.piano-key--white');
      whiteKeys.forEach((key) => {
        if (!key.classList.contains('piano-key--highlighted')) {
          key.style.fill = '#f5f3ed';
        }
        key.style.stroke = '#c8c4bc';
        key.style.strokeWidth = '0.5';
      });

      const blackKeys = clone.querySelectorAll('.piano-key--black');
      blackKeys.forEach((key) => {
        if (!key.classList.contains('piano-key--highlighted')) {
          key.style.fill = '#1e1e1e';
        }
        key.style.stroke = '#0a0a0a';
        key.style.strokeWidth = '0.5';
      });

      // Fix label visibility for export
      const labels = clone.querySelectorAll('.piano-key-label');
      labels.forEach((label) => {
        const currentFill = label.getAttribute('fill');
        // Darken the label color for white background
        label.setAttribute('fill', '#555555');
        label.style.opacity = '1';
        label.style.animation = 'none';
      });

      // Get viewBox dimensions
      const viewBox = svgElement.getAttribute('viewBox').split(' ').map(Number);
      const svgWidth = viewBox[2];
      const svgHeight = viewBox[3];

      // Serialize SVG
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = svgWidth * scale;
      canvas.height = svgHeight * scale;
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load SVG as image
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        // Trigger download
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${(chordName || 'chord').replace(/\s+/g, '_').toLowerCase()}_${scale}x.png`;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExporting(false);
      };

      img.onerror = () => {
        console.error('Failed to load SVG for export');
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      img.src = url;
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
    }
  }, [svgRef, scale, chordName]);

  return (
    <div className="export-controls">
      <div className="export-scale-selector">
        <label htmlFor="export-scale" className="export-scale-label">Resolution</label>
        <div className="export-scale-options">
          {[2, 3, 4].map((s) => (
            <button
              key={s}
              type="button"
              className={`export-scale-btn ${scale === s ? 'export-scale-btn--active' : ''}`}
              onClick={() => setScale(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <button
        id="export-png-btn"
        type="button"
        className={`export-btn ${isExporting ? 'export-btn--loading' : ''}`}
        onClick={handleExport}
        disabled={isExporting}
      >
        <svg className="export-btn-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M3 15.5V17a1 1 0 001 1h12a1 1 0 001-1v-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {isExporting ? 'Exporting…' : 'Export as PNG'}
      </button>
    </div>
  );
}
