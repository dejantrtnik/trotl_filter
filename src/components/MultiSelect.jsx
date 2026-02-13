import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

export default function MultiSelect({
  isMulti = false,
  options = [],
  selected = [],
  onChange,
  placeholder = 'Select...',
  allowClear = false,
  disabled = false,
  addItem,
  pushUrlParamObj = false,
  loading = false,
  controlStyle = {},
  className = ''
}) {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [maxVisible, setMaxVisible] = useState(3);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const calc = () => {
      const w = containerRef.current.offsetWidth || 200;
      const avg = 90;
      setMaxVisible(Math.max(1, Math.floor((w - 40) / avg)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // URL sync helpers
  const setUrlParam = (value) => {
    if (!pushUrlParamObj) return;
    const url = new URL(window.location);
    if (!value || (Array.isArray(value) && value.length === 0)) url.searchParams.delete(pushUrlParamObj);
    else url.searchParams.set(pushUrlParamObj, Array.isArray(value) ? value.join(',') : value);
    window.history.replaceState({}, '', url);
  };

  useEffect(() => {
    if (!pushUrlParamObj || !options || options.length === 0) return;
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      const val = params.get(pushUrlParamObj);
      if (!val) return;
      if (isMulti) {
        const arr = val.split(',').filter(Boolean);
        if (JSON.stringify(arr) !== JSON.stringify(selected)) onChange?.(arr);
      } else {
        if (!selected || selected[0] !== val) onChange?.([val]);
      }
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, [pushUrlParamObj, options, isMulti, selected, onChange]);

  const selectedOptions = useMemo(() => {
    if (isMulti) return options.filter(o => (selected || []).includes(o.value));
    return options.find(o => o.value === (selected && selected[0])) || null;
  }, [options, selected, isMulti]);

  const inputExists = useMemo(() => {
    return options.some(opt => String(opt.label).toLowerCase() === inputValue.trim().toLowerCase());
  }, [inputValue, options]);

  const menuOptions = useMemo(() => {
    if (inputValue && !inputExists && typeof addItem === 'function') {
      return [...options, { label: `+ Add "${inputValue.trim()}"`, value: '__add_new__', __isAddNew: true }];
    }
    return options;
  }, [options, inputValue, inputExists, addItem]);

  // Labels for items hidden behind the "overflow" indicator
  const hiddenLabels = useMemo(() => {
    if (!isMulti) return "";
    const arr = (selectedOptions || []).slice(maxVisible).map(s => s.label);
    return arr.join(', ');
  }, [isMulti, selectedOptions, maxVisible]);

  const toggleValue = (val) => {
    if (disabled) return;
    if (isMulti) {
      const prev = Array.isArray(selected) ? [...selected] : [];
      const idx = prev.findIndex(x => String(x) === String(val));
      if (idx === -1) prev.push(val);
      else prev.splice(idx, 1);
      onChange?.(prev);
      if (pushUrlParamObj) setUrlParam(prev);
    } else {
      const out = [val];
      onChange?.(out);
      if (pushUrlParamObj) setUrlParam(val);
      setOpen(false);
    }
  };

  const handleAddNew = () => {
    if (disabled) return;
    const label = inputValue.trim();
    if (!label) return;
    const exists = options.some(opt => String(opt.value).toLowerCase() === label.toLowerCase() || String(opt.label).toLowerCase() === label.toLowerCase());
    if (exists) { setInputValue(''); return; }
    const newOpt = { label, value: label };
    if (typeof addItem === 'function') addItem(newOpt);
    if (isMulti) {
      const next = [...(selected || []), newOpt.value];
      onChange?.(next);
      if (pushUrlParamObj) setUrlParam(next);
    } else {
      onChange?.([newOpt.value]);
      if (pushUrlParamObj) setUrlParam(newOpt.value);
      setOpen(false);
    }
    setInputValue('');
  };

  const clearSelection = () => {
    if (disabled) return;
    onChange?.([]);
    if (pushUrlParamObj) setUrlParam([]);
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', ...controlStyle, ...(disabled ? { background: '#f5f5f5', opacity: 0.9 } : {}) }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && setOpen(s => !s)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !disabled) setOpen(s => !s); }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          minHeight: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 8px',
          border: (disabled ? '1px solid #eee' : (isFocused && (isMulti ? (selected || []).length > 0 : (selected && selected[0] != null)) ) ? '1px solid transparent' : '1px solid #ccc'),
          borderRadius: 2,
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? '#f5f5f5' : '#fff',
          outline: 'none',
          ...controlStyle
        }}
      >
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap', flex: 1, overflow: 'hidden', minWidth: 0 }}>
          {isMulti ? (
            (selectedOptions || []).slice(0, maxVisible).map(s => (
              <div key={s.value} onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#e6f4ff', borderRadius: 2, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200, minWidth: 0 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{s.label}</span>
                <button
                  aria-label={`Remove ${s.label}`}
                  onClick={(e) => { e.stopPropagation(); if (!disabled) toggleValue(s.value); }}
                  style={{ border: 'none', background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer', padding: 0, margin: 0, fontSize: 12 }}
                >
                  ✖
                </button>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 14, color: selectedOptions ? '#000' : '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedOptions ? selectedOptions.label : placeholder}</div>
          )}
          {isMulti && (selectedOptions || []).length > maxVisible && (
            <div title={hiddenLabels} style={{ fontSize: 13, color: '#666', cursor: 'default', flex: '0 0 auto', paddingLeft: 4 }}>…</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {allowClear && (selected && selected.length > 0) && (
            <span onClick={(e) => { e.stopPropagation(); clearSelection(); }} disabled={disabled} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>✖</span>
          )}
          {loading && !disabled && (
            <div style={{ width: 16, height: 16, borderRadius: 2, border: '2px solid #ccc', borderTopColor: '#444', animation: 'spin 0.9s linear infinite' }} />
          )}
        </div>
      </div>

      {open && (
        <div style={{ position: 'absolute', zIndex: 50, marginTop: 6, width: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxHeight: 260, overflow: 'auto' }}>
          <div style={{ padding: 8, borderBottom: '1px solid #f1f1f1' }}>
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && inputValue && typeof addItem === 'function') { handleAddNew(); } }}
              placeholder="Type to search..."
              disabled={disabled}
              style={{ padding: '6px 8px', borderRadius: 2, border: '1px solid #ffffff' }}
            />
          </div>
          <div>
            {menuOptions.filter(opt => String(opt.label).toLowerCase().includes(inputValue.trim().toLowerCase())).map(opt => (
              <div key={opt.value}
                onClick={(e) => { e.stopPropagation(); if (opt.__isAddNew) { handleAddNew(); } else { toggleValue(opt.value); } }}
                style={{ padding: '8px 12px', cursor: disabled ? 'not-allowed' : 'pointer', background: (isMulti ? (selected || []).includes(opt.value) : (selected && selected[0] === opt.value)) ? '#eef6ff' : '#fff' }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

MultiSelect.propTypes = {
  isMulti: PropTypes.bool,
  options: PropTypes.array,
  selected: PropTypes.array,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  allowClear: PropTypes.bool,
  disabled: PropTypes.bool,
  addItem: PropTypes.func,
  pushUrlParamObj: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  loading: PropTypes.bool,
  controlStyle: PropTypes.object,
  className: PropTypes.string,
};
