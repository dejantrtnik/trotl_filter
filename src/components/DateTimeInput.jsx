import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import PropTypes from "prop-types";

/**
 * DateTimeInput (redesigned) - matches RangePicker visual style with dropdown panel.
 * Features:
 *  - Single date (and optional time) selection via custom calendar popup
 *  - URL param sync (stores timestamp) same as RangePicker
 *  - Dynamic dropdown positioning (prevents overflow like RangePicker)
 *  - Clear & OK footer actions
 */
export default function DateTimeInput({
  t,
  pushUrlParamObj = false,
  value: controlledValue,
  onChange,
  time = false,
  timeStart,
  timezone,
  timeFormat,
  dateFormat,
  placeholder = "Select date",
  disabled = false,
  className = "",
  style = {},
  predefinedRanges = ["today", "yesterday"],
  presets = [
    { label: "Clear", type: "clear" },
    { label: "Today", type: "today" },
    { label: "+1 Week", type: "days", value: 7 },
    { label: "+10 Days", type: "days", value: 10 },
    { label: "+1 Month", type: "months", value: 1 },
    { label: "+1 Year", type: "years", value: 1 }
  ],
  startWith = "sunday",
  ...rest
}) {
  let translate
  if (t) {
    translate = t
  } else {
    translate = (key) => {
      const translations = {
        clear: "Clear",
        ok: "OK",
        today: "Today"
      };
      return translations[key] || key;
    }
  }

  const paramKey = pushUrlParamObj || null;
  const onChangeRef = useRef(onChange);
  const controlledValueRef = useRef(controlledValue);
  const lastUrlValueRef = useRef(null);
  const isUpdatingFromComponentRef = useRef(false);
  const historyPatchedRef = useRef(false);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    controlledValueRef.current = controlledValue;
  }, [controlledValue]);

  // Helper: convert timestamp (number|string) to internal input string
  const toInputString = useCallback((ts) => {
    if (!ts) return "";
    const d = new Date(Number(ts));
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    if (time) {
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
    return `${yyyy}-${mm}-${dd}`;
  }, [time]);

  // Initial value
  const [value, setValue] = useState(() => {
    if (typeof controlledValue !== "undefined") return controlledValue;
    if (!paramKey) {
      let d = new Date();
      if (time && timeStart) {
        const [h, m] = timeStart.split(":");
        d.setHours(Number(h), Number(m), 0, 0);
      }
      return toInputString(d.getTime());
    }
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const urlVal = params.get(paramKey);
    if (urlVal) return toInputString(urlVal);
    let d = new Date();
    if (time && timeStart) {
      const [h, m] = timeStart.split(":");
      d.setHours(Number(h), Number(m), 0, 0);
    }
    return toInputString(d.getTime());
  });
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Dropdown state & positioning
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: "110%" });

  // Predefined single-date shortcuts
  const normalizeLabel = (lbl) => String(lbl).toLowerCase();
  const createPredefinedItem = useCallback((item) => {
    if (typeof item === 'number') {
      // number => N days ago
      return {
        key: `daysago_${item}`,
        label: `-${item}d`,
        getDate: () => {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() - item);
          return d;
        }
      };
    }
    const str = normalizeLabel(item);
    if (str === 'today') {
      return {
        key: 'today',
        label: 'Today',
        getDate: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
      };
    }
    if (str === 'yesterday') {
      return {
        key: 'yesterday',
        label: 'Yesterday',
        getDate: () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 1); return d; }
      };
    }
    if (str === 'lastweek') {
      return {
        key: 'lastweek',
        label: 'Last week (Mon)',
        getDate: () => { // Monday of previous week
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          const day = d.getDay(); // 0 Sun..6 Sat
          const mondayOffset = day === 0 ? -6 : 1 - day; // days to monday this week
          d.setDate(d.getDate() + mondayOffset - 7); // previous week's Monday
          return d;
        }
      };
    }
    if (str === 'lastmonth') {
      return {
        key: 'lastmonth',
        label: 'First day last month',
        getDate: () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setMonth(d.getMonth() - 1, 1); return d; }
      };
    }
    if (str === 'thismonth') {
      return {
        key: 'thismonth',
        label: 'First day this month',
        getDate: () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(1); return d; }
      };
    }
    if (str === 'lastyear') {
      return {
        key: 'lastyear',
        label: 'Jan 1 last year',
        getDate: () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setFullYear(d.getFullYear() - 1, 0, 1); return d; }
      };
    }
    return {
      key: str,
      label: item,
      getDate: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
    };
  }, []);
  const PREDEFINED = useMemo(() => predefinedRanges.map(createPredefinedItem), [predefinedRanges, createPredefinedItem]);
  const [selectedPredefined, setSelectedPredefined] = useState("");
  

  useEffect(() => {
    if (open && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const newPosition = { left: '0', top: '110%' };
      if (rect.right > viewportWidth - 10) newPosition.right = 0, delete newPosition.left; // align right
      if (rect.bottom > viewportHeight - 10) newPosition.top = 'auto', newPosition.bottom = '110%';
      setDropdownPosition(newPosition);
    }
  }, [open]);

  // Calendar month state (always show month of selected value; allow navigation)
  const selectedDate = useMemo(() => (value ? new Date(value) : null), [value]);
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = selectedDate || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  });
  // Keep monthCursor in sync when selected date changes externally
  useEffect(() => {
    if (selectedDate) {
      setMonthCursor(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
    // Match predefined
    if (selectedDate) {
      const ts = selectedDate.getTime();
      for (let i = 0; i < PREDEFINED.length; i++) {
        const d = PREDEFINED[i].getDate();
        if (d.getTime() === ts) { setSelectedPredefined(String(i)); return; }
      }
      setSelectedPredefined("");
    } else {
      setSelectedPredefined("");
    }
  }, [value, selectedDate, PREDEFINED]);

  // Build calendar days (6 weeks grid)
  const buildDays = () => {
    const startOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    let dayOfWeek = startOfMonth.getDay(); // 0 Sun ... 6 Sat
    // Adjust for Monday start
    if (startWith === "monday") {
      dayOfWeek = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    }
    // We start at the first day of the week containing the 1st
    const firstGridDate = new Date(startOfMonth);
    firstGridDate.setDate(startOfMonth.getDate() - dayOfWeek);
    const days = [];
    for (let i = 0; i < 42; i++) { // 6 weeks
      const d = new Date(firstGridDate);
      d.setDate(firstGridDate.getDate() + i);
      days.push(d);
    }
    return days;
  };
  const days = buildDays();

  // Update URL param
  const setUrlParam = useCallback((val) => {
    if (!paramKey) return;
    isUpdatingFromComponentRef.current = true;
    const params = new URLSearchParams(window.location.search);
    let ts = val;
    if (val && typeof val === "string" && !/^[0-9]+$/.test(val)) {
      const d = new Date(val);
      ts = d.getTime();
    }
    const nextVal = (ts && String(ts).length > 0 && !isNaN(Number(ts))) ? String(ts) : "";
    lastUrlValueRef.current = nextVal;
    if (nextVal) params.set(paramKey, nextVal);
    else params.delete(paramKey);
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);
    setTimeout(() => { isUpdatingFromComponentRef.current = false; }, 0);
  }, [paramKey]);

  // Sync from URL
  useEffect(() => {
    if (!paramKey || typeof controlledValueRef.current !== 'undefined') return;
    const syncFromUrl = () => {
      if (isUpdatingFromComponentRef.current) return;
      const params = new URLSearchParams(window.location.search);
      const urlVal = params.get(paramKey);
      if (urlVal) {
        if (lastUrlValueRef.current === urlVal && valueRef.current === toInputString(urlVal)) return;
        const str = toInputString(urlVal);
        if (str !== valueRef.current) {
          setValue(prev => prev !== str ? str : prev);
          if (onChangeRef.current && str !== controlledValueRef.current) onChangeRef.current(urlVal);
        }
      }
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    
    // Only patch history methods once globally
    if (!historyPatchedRef.current) {
      const origPushState = window.history.pushState;
      const origReplaceState = window.history.replaceState;
      window.history.pushState = function () {
        const rv = origPushState.apply(this, arguments);
        window.dispatchEvent(new Event('pushState'));
        return rv;
      };
      window.history.replaceState = function () {
        const rv = origReplaceState.apply(this, arguments);
        window.dispatchEvent(new Event('replaceState'));
        return rv;
      };
      historyPatchedRef.current = true;
    }
    
    window.addEventListener('pushState', syncFromUrl);
    window.addEventListener('replaceState', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('pushState', syncFromUrl);
      window.removeEventListener('replaceState', syncFromUrl);
    };
  }, [paramKey, toInputString]);

  // Controlled value sync
  useEffect(() => {
    if (typeof controlledValue !== 'undefined') setValue(controlledValue);
  }, [controlledValue]);

  // Formatting display (similar to RangePicker)
  const formatDisplay = () => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const actualDateFormat = dateFormat || (time ? "YYYY-MM-DD" : "DD-MM-YYYY");
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    let dateStr = actualDateFormat
      .replace('YYYY', yyyy)
      .replace('MM', mm)
      .replace('DD', dd);
    if (time) {
      const actualTimeFormat = timeFormat || 'HH:mm';
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const timeStr = actualTimeFormat
        .replace('HH', hh)
        .replace('mm', min);
      return `${dateStr} ${timeStr}`;
    }
    return dateStr;
  };

  const applySelection = (d) => {
    const dt = new Date(d);
    if (time && timeStart && !value) { // apply timeStart if initial selection
      const [h, m] = timeStart.split(":");
      dt.setHours(Number(h), Number(m), 0, 0);
    }
    const str = toInputString(dt.getTime());
    if (typeof controlledValue === 'undefined') setValue(str);
    setUrlParam(str);
    onChange?.(str);
  };

  const handlePredefinedClick = (idx) => {
    const item = PREDEFINED[idx];
    const d = item.getDate();
    if (time && timeStart) {
      const [h, m] = (timeStart || "00:00").split(":");
      d.setHours(Number(h), Number(m), 0, 0);
    }
    applySelection(d);
    setSelectedPredefined(String(idx));
  };

  const handleDayClick = (day) => {
    applySelection(day);
  };

  const handleTimeChange = (e) => {
    const t = e.target.value; // HH:mm
    if (!value) return;
    const d = new Date(value);
    const [h, m] = t.split(":");
    d.setHours(Number(h), Number(m), 0, 0);
    const str = toInputString(d.getTime());
    if (typeof controlledValue === 'undefined') setValue(str);
    setUrlParam(str);
    onChange?.(str);
  };

  const handleClear = () => {
    if (typeof controlledValue === 'undefined') setValue("");
    setUrlParam("");
    onChange?.("");
  };

  // Presets (custom actions like clear, today, +N days/months/years)
  const handlePresetClick = useCallback((p) => {
    if (!p || disabled) return;
    const type = String(p.type || '').toLowerCase();
    if (type === 'clear') {
      handleClear();
      return;
    }
    let d = new Date();
    if (type === 'today') {
      d = new Date();
      d.setHours(0,0,0,0);
    } else if (type === 'days') {
      const v = Number(p.value) || 0;
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() + v);
    } else if (type === 'months') {
      const v = Number(p.value) || 0;
      d.setHours(0,0,0,0);
      d.setMonth(d.getMonth() + v);
    } else if (type === 'years') {
      const v = Number(p.value) || 0;
      d.setHours(0,0,0,0);
      d.setFullYear(d.getFullYear() + v);
    } else {
      // unknown type: ignore
      return;
    }
    if (time && timeStart) {
      const [h, m] = (timeStart || '00:00').split(':');
      d.setHours(Number(h), Number(m), 0, 0);
    }
    applySelection(d);
  }, [disabled, time, timeStart, applySelection, handleClear]);

  // Outside click close
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!e.target.closest('.datetime-input-dropdown')) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className={`datetime-input-wrapper ${className}`} style={{ position: 'relative', display: 'inline-block', ...style }} {...rest}>
      <div
        className="basic-input"
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '6px 8px',
          minWidth: 180,
          userSelect: 'none',
          position: 'relative',
          background: disabled ? '#f3f4f6' : undefined,
          color: disabled ? '#9ca3af' : undefined
        }}
        data-timestart={timeStart || undefined}
        data-timezone={timezone || undefined}
        data-timeformat={timeFormat || undefined}
        data-dateformat={dateFormat || undefined}
      >
        {formatDisplay() || placeholder}
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); if (!disabled) handleClear(); }}
            title="Clear date"
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer', color: disabled ? '#9ca3af' : undefined }}
          >✖</span>
        )}
      </div>
      {open && (
        <div
          ref={dropdownRef}
          className="datetime-input-dropdown range-picker-dropdown" // reuse class for styling consistency
          style={{
            position: 'absolute',
            zIndex: 50,
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: 12,
            width: 320,
            ...dropdownPosition
          }}
        >
          {/* Quick buttons */}
          {PREDEFINED.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {PREDEFINED.map((p, i) => {
                const active = selectedPredefined === String(i);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => !disabled && handlePredefinedClick(i)}
                    disabled={disabled}
                    className="basic-btn"
                    style={{
                      padding: '4px 8px',
                      fontSize: 12,
                      background: disabled ? (active ? '#f3f4f6' : '#f9fafb') : (active ? '#1677ff' : '#fff'),
                      color: disabled ? '#9ca3af' : (active ? '#fff' : '#000'),
                      border: disabled ? '1px solid #e5e7eb' : (active ? '1px solid #1677ff' : '1px solid #d9d9d9'),
                      cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                  >{p.label}</button>
                );
              })}
            </div>
          )}
          {/* Preset buttons (clear, today, +N) */}
          {Array.isArray(presets) && presets.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {presets.map((ps, idx) => (
                <button
                  key={`preset_${idx}`}
                  type="button"
                  onClick={() => handlePresetClick(ps)}
                  disabled={disabled}
                  className="basic-btn"
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    background: disabled ? '#f9fafb' : '#fff',
                    color: disabled ? '#9ca3af' : '#000',
                    border: disabled ? '1px solid #e5e7eb' : '1px solid #d9d9d9',
                    cursor: disabled ? 'not-allowed' : 'pointer'
                  }}
                >{ps.label}</button>
              ))}
            </div>
          )}
          {/* Month navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <button type="button" className="basic-btn" onClick={() => !disabled && setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))} disabled={disabled} style={{ cursor: disabled ? 'not-allowed' : undefined }}>‹</button>
            <div style={{ fontWeight: 600 }}>{monthCursor.toLocaleString(undefined, { month: 'long' })} {monthCursor.getFullYear()}</div>
            <button type="button" className="basic-btn" onClick={() => !disabled && setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))} disabled={disabled} style={{ cursor: disabled ? 'not-allowed' : undefined }}>›</button>
          </div>
          {/* Week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
            {(startWith === "monday"
              ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
              : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
            ).map(d => <div key={d} style={{ textAlign: 'center' }}>{d}</div>)}
          </div>
          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {days.map(d => {
              const isCurrentMonth = d.getMonth() === monthCursor.getMonth();
              const isSelected = selectedDate && d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth() && d.getDate() === selectedDate.getDate();
              const isToday = (() => { const t = new Date(); return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && t.getDate() === d.getDate(); })();
              return (
                <div
                  key={d.toISOString()}
                  onClick={() => !disabled && handleDayClick(d)}
                  style={{
                    textAlign: 'center',
                    padding: '6px 0',
                    cursor: disabled ? 'default' : 'pointer',
                    fontSize: 12,
                    borderRadius: 4,
                    background: isSelected ? (disabled ? '#c7ddff' : '#1677ff') : isToday ? '#e6f4ff' : 'transparent',
                    color: disabled ? '#9ca3af' : (isSelected ? '#fff' : isCurrentMonth ? '#000' : '#aaa'),
                    border: isSelected ? '1px solid #1677ff' : '1px solid transparent'
                  }}
                >{d.getDate()}</div>
              );
            })}
          </div>
          {/* Time input */}
          {time && (
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4, color: disabled ? '#9ca3af' : undefined }}>Time:</label>
              <input
                type="time"
                value={(() => { if (!value) return ''; const d = new Date(value); const hh = String(d.getHours()).padStart(2, '0'); const mm = String(d.getMinutes()).padStart(2, '0'); return `${hh}:${mm}`; })()}
                onChange={handleTimeChange}
                className="basic-input"
                disabled={disabled}
                style={{ width: '100%', background: disabled ? '#f9fafb' : undefined, color: disabled ? '#9ca3af' : undefined }}
              />
            </div>
          )}
          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...buttonClearStyle, border: disabled ? '1px solid #e5e7eb' : buttonClearStyle.border, background: disabled ? '#f9fafb' : buttonClearStyle.background, cursor: disabled ? 'not-allowed' : buttonClearStyle.cursor }} type="button" className="basic-btn" onClick={() => { if (!disabled) handleClear(); }} disabled={disabled}>{translate("clear")}</button>
              <button style={{ ...buttonStyle, background: disabled ? '#93c5fd' : buttonStyle.background, cursor: disabled ? 'not-allowed' : buttonStyle.cursor }} type="button" className="basic-btn" onClick={() => { if (!disabled) setOpen(false); }} disabled={disabled}>{translate("ok")}</button>
            </div>
            <button style={{ ...buttonStyle, background: disabled ? '#93c5fd' : buttonStyle.background, cursor: disabled ? 'not-allowed' : buttonStyle.cursor }} type="button" className="basic-btn" onClick={() => { if (!disabled) handlePredefinedClick(PREDEFINED.findIndex(p => p.key === 'today')); }} disabled={disabled}>{translate("today")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

DateTimeInput.propTypes = {
  pushUrlParamObj: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  value: PropTypes.string,
  onChange: PropTypes.func,
  time: PropTypes.bool,
  timeStart: PropTypes.string,
  timezone: PropTypes.string,
  timeFormat: PropTypes.string,
  dateFormat: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  predefinedRanges: PropTypes.array,
  presets: PropTypes.array,
};

const buttonStyle = {
  padding: '6px 16px',
  border: 'none',
  background: '#1d4ed8',
  color: '#fff',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500
};

const buttonClearStyle = {
  // marginRight: 8,
  padding: '6px 16px',
  border: '1px solid #d1d5db',
  background: '#fff',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13
}