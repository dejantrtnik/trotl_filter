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
  startWith = "sunday",
  presets = [],
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
  const isControlled = typeof controlledValue !== "undefined";
  const normalizedControlledValue = isControlled ? (controlledValue ?? "") : undefined;

  // Refs to stabilize callbacks and prevent re-entrant URL updates
  const onChangeRef = useRef(onChange);
  const controlledValueRef = useRef(normalizedControlledValue);
  const isUpdatingFromComponentRef = useRef(false);
  const lastUrlValueRef = useRef(null);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { controlledValueRef.current = normalizedControlledValue; }, [normalizedControlledValue]);
  
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
  
  // Stable ref for toInputString to avoid effect re-runs
  const toInputStringRef = useRef(toInputString);
  useEffect(() => { toInputStringRef.current = toInputString; }, [toInputString]);

  // Initial value
  const [value, setValue] = useState(() => {
    if (isControlled) return normalizedControlledValue;
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

  // internal value for the time input.  Previously the <input> read
  // directly from `value` which meant that when the component was
  // controlled the field could never update until the parent passed a
  // new prop.  By keeping a separate `timeValue` that syncs from `value` but
  // is mutated as the user types we allow the time field to stay responsive
  // even in controlled scenarios.
  const [timeValue, setTimeValue] = useState(() => {
    if (value) {
      const d = new Date(value);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
    return timeStart || "";
  });

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
  // Guard updates so changing references (e.g. PREDEFINED array identity) doesn't force state
  useEffect(() => {
    if (selectedDate) {
      const newMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      // only update monthCursor when month/year actually differ
      setMonthCursor(prev => {
        if (!prev || prev.getFullYear() !== newMonth.getFullYear() || prev.getMonth() !== newMonth.getMonth()) {
          return newMonth;
        }
        return prev;
      });

      // Match predefined: set only when value actually changes
      const ts = selectedDate.getTime();
      let matched = false;
      for (let i = 0; i < PREDEFINED.length; i++) {
        const d = PREDEFINED[i].getDate();
        if (d.getTime() === ts) {
          setSelectedPredefined(prev => (prev !== String(i) ? String(i) : prev));
          matched = true;
          break;
        }
      }
      if (!matched) setSelectedPredefined(prev => (prev !== "" ? "" : prev));
    } else {
      setSelectedPredefined(prev => (prev !== "" ? "" : prev));
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
    if (ts && String(ts).length > 0 && !isNaN(Number(ts))) params.set(paramKey, String(ts));
    else params.delete(paramKey);
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    lastUrlValueRef.current = params.get(paramKey) || null;
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
      if (urlVal && urlVal !== lastUrlValueRef.current) {
        const str = toInputStringRef.current(urlVal);
        setValue(prev => prev !== str ? str : prev);
        if (onChangeRef.current && str !== controlledValueRef.current) onChangeRef.current(urlVal);
        lastUrlValueRef.current = urlVal;
      } else if (!urlVal && lastUrlValueRef.current !== null) {
        setValue("");
        if (onChangeRef.current) onChangeRef.current("");
        lastUrlValueRef.current = null;
      }
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    // Patch history methods only once globally
    if (!window.__historyPatched) {
      window.__historyPatched = true;
      const patchHistory = (type) => {
        const orig = window.history[type];
        window.history[type] = function () {
          const rv = orig.apply(this, arguments);
          window.dispatchEvent(new Event(type));
          return rv;
        };
      };
      patchHistory('pushState');
      patchHistory('replaceState');
    }
    window.addEventListener('pushState', syncFromUrl);
    window.addEventListener('replaceState', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('pushState', syncFromUrl);
      window.removeEventListener('replaceState', syncFromUrl);
    };
  }, [paramKey]);

  // Controlled value sync
  useEffect(() => {
    if (isControlled) {
      setValue((prev) => (prev !== normalizedControlledValue ? normalizedControlledValue : prev));
    }
  }, [isControlled, normalizedControlledValue]);

  // keep the timeValue in sync whenever the effective value or start time changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setTimeValue(`${hh}:${mm}`);
    } else {
      setTimeValue(timeStart || '');
    }
  }, [value, timeStart]);

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
    if (!isControlled) setValue(str);
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

  const handlePresetClick = (preset) => {
    if (!preset || !preset.type) return;
    const type = String(preset.type).toLowerCase();

    if (type === 'clear') {
      handleClear();
      return;
    }

    if (type === 'today') {
      const d = new Date();
      if (time && timeStart) {
        const [h, m] = (timeStart || "00:00").split(":");
        d.setHours(Number(h), Number(m), 0, 0);
      } else if (!time) {
        d.setHours(0, 0, 0, 0);
      }
      applySelection(d);
      return;
    }

    // base = selected date (if present) or now
    const base = selectedDate ? new Date(selectedDate) : new Date();
    const val = Number(preset.value || 0);

    if (type === 'days') {
      base.setDate(base.getDate() + val);
      if (!selectedDate && time && timeStart) {
        const [h, m] = (timeStart || "00:00").split(":");
        base.setHours(Number(h), Number(m), 0, 0);
      }
      applySelection(base);
      return;
    }

    if (type === 'months') {
      base.setMonth(base.getMonth() + val);
      if (!selectedDate && time && timeStart) {
        const [h, m] = (timeStart || "00:00").split(":");
        base.setHours(Number(h), Number(m), 0, 0);
      }
      applySelection(base);
      return;
    }

    if (type === 'years') {
      base.setFullYear(base.getFullYear() + val);
      if (!selectedDate && time && timeStart) {
        const [h, m] = (timeStart || "00:00").split(":");
        base.setHours(Number(h), Number(m), 0, 0);
      }
      applySelection(base);
      return;
    }
  };

  const handleDayClick = (day) => {
    applySelection(day);
  };

  const handleTimeChange = (e) => {
    const t = e.target.value; // HH:mm
    setTimeValue(t);
    // determine base date: prefer current value, fall back to now
    const baseDate = value ? new Date(value) : new Date();
    const [h, m] = t.split(":");
    baseDate.setHours(Number(h), Number(m), 0, 0);
    const str = toInputString(baseDate.getTime());
    // always update local `value` so the dropdown display keeps up
    if (!isControlled) {
      setValue(str);
    } else {
      setValue(str);
    }
    setUrlParam(str);
    onChange?.(str);
  };

  const handleClear = () => {
    if (!isControlled) setValue("");
    setUrlParam("");
    onChange?.("");
  };

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
                value={timeValue}
                onChange={handleTimeChange}
                className="basic-input"
                disabled={disabled}
                style={{ width: '100%', background: disabled ? '#f9fafb' : undefined, color: disabled ? '#9ca3af' : undefined }}
              />
            </div>
          )}

          {presets && presets.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {presets.map((p, i) => (
                <button
                  key={`preset_${i}`}
                  type="button"
                  onClick={() => !disabled && handlePresetClick(p)}
                  disabled={disabled}
                  className="basic-btn"
                  style={{
                    padding: '6px 10px',
                    fontSize: 12,
                    background: disabled ? '#f9fafb' : '#fff',
                    color: disabled ? '#9ca3af' : '#000',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  {p.label || p.type}
                </button>
              ))}
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