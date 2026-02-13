import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Simple, dependency-free ColorPicker
// Props: value (hex), onChange(hex), disabled, label, presetColors, allowCustom, size
export default function ColorPicker({
  value = '#1677ff',
  onChange,
  disabled = false,
  label = null,
  presetColors = ['#1677ff', '#ff4d4f', '#52c41a', '#faad14', '#722ed1', '#13c2c2', '#f5222d'],
  allowCustom = true,
  showHexInput = true,
  size = 'medium', // small | medium | large
  className = '',
  style = {}
}) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(value || '');
  const ref = useRef(null);

  useEffect(() => setInternal(value || ''), [value]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('mousedown', onDoc);
    return () => window.removeEventListener('mousedown', onDoc);
  }, []);

  const apply = (hex) => {
    setInternal(hex);
    onChange?.(hex);
  };

  const btnSize = size === 'small' ? 20 : size === 'large' ? 36 : 28;

  return (
    <div ref={ref} className={`color-picker ${className}`} style={{ display: 'inline-block', ...style }}>
      {label && <div style={{ marginBottom: 6, fontSize: 13 }}>{label}</div>}
      <button
        type="button"
        onClick={() => !disabled && setOpen(s => !s)}
        disabled={disabled}
        aria-label={label || 'Choose color'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 8px',
          borderRadius: 6,
          border: '1px solid #d9d9d9',
          background: '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <span style={{ width: btnSize, height: btnSize, borderRadius: 4, background: internal || '#fff', border: '1px solid #ccc' }} />
        <span style={{ fontSize: 13, color: disabled ? '#9ca3af' : '#000' }}>{internal || '—'}</span>
      </button>

      {open && (
        <div style={{ position: 'absolute', zIndex: 60, marginTop: 8, background: '#fff', border: '1px solid #e8e8e8', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', borderRadius: 6, padding: 12, minWidth: 220 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {presetColors.map((c) => (
              <button
                key={c}
                onClick={() => apply(c)}
                aria-label={c}
                style={{ width: 28, height: 28, borderRadius: 4, background: c, border: c.toLowerCase() === (internal || '').toLowerCase() ? '2px solid #00000033' : '1px solid #eee', cursor: 'pointer' }}
              />
            ))}
            {allowCustom && (
              <input
                type="color"
                value={internal || '#000000'}
                onChange={(e) => apply(e.target.value)}
                style={{ width: 36, height: 36, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                title="Custom color"
              />
            )}
          </div>
          {showHexInput && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={internal || ''}
                onChange={(e) => setInternal(e.target.value)}
                onBlur={(e) => { const v = e.target.value.trim(); if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)) apply(v); else setInternal(value || ''); }}
                placeholder="#rrggbb"
                disabled={disabled}
                style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #e5e7eb', width: 120 }}
              />
              <button onClick={() => { if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(internal)) apply(internal); }} disabled={disabled} className="basic-btn">Apply</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ColorPicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  presetColors: PropTypes.array,
  allowCustom: PropTypes.bool,
  showHexInput: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object
};
