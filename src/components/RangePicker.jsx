import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import CalendarRangePicker from "./CalendarRangePicker.jsx";

/**
 * RangePicker - a reusable date or datetime-local range picker with URL param sync
 * Props:
 *   pushUrlParamObj: string | false - URL param key to sync value (will store as start~end)
 *   value: [start, end] controlled value (optional)
 *   onChange: ([start, end]) => void (optional)
 *   time: boolean - if true, use datetime-local, else date
 *   timeStart: string (for default start time, e.g. "00:00")
 *   timeEnd: string (for default end time, e.g. "23:59")
 *   timezone, timeFormat, dateFormat, placeholder, required, disabled, className, style, min, max, ...rest
 */
// Helper to get date string in yyyy-MM-dd or yyyy-MM-ddTHH:mm
function formatDate(date, time = false) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  if (time) {
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

const PREDEFINED_RANGES = [
  {
    label: 'Today',
    getRange: (time) => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return [formatDate(start, time), formatDate(end, time)];
    }
  },
  {
    label: 'This week',
    getRange: (time) => {
      const now = new Date();
      const day = now.getDay() || 7;
      const start = new Date(now);
      start.setDate(now.getDate() - day + 1);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);
      return [formatDate(start, time), formatDate(end, time)];
    }
  },
  {
    label: 'Last 7 days',
    getRange: (time) => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0,0,0,0);
      return [formatDate(start, time), formatDate(end, time)];
    }
  },
  {
    label: 'This month',
    getRange: (time) => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return [formatDate(start, time), formatDate(end, time)];
    }
  },
  {
    label: 'Last 30 days',
    getRange: (time) => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(end.getDate() - 29);
      start.setHours(0,0,0,0);
      return [formatDate(start, time), formatDate(end, time)];
    }
  },
];

export default function RangePicker({
  pushUrlParamObj = false,
  value: controlledValue,
  onChange,
  time = false,
  timeStart,
  timeEnd,
  timezone,
  timeFormat,
  dateFormat,
  placeholder = "",
  required = false,
  disabled = false,
  className = "",
  style = {},
  min,
  max,
  ...rest
}) {
  const paramKey = pushUrlParamObj || null;
  // Helper to format default value
  const getDefault = (which) => {
    if (time) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      if (which === 'start' && timeStart) return `${yyyy}-${mm}-${dd}T${timeStart}`;
      if (which === 'end' && timeEnd) return `${yyyy}-${mm}-${dd}T${timeEnd}`;
      // fallback to now
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
    return "";
  };
  // Initial state
  const toInputString = (ts) => {
    if (!ts) return "";
    const d = new Date(Number(ts));
    if (isNaN(d.getTime())) return "";
    if (time) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } else {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  };
  const [range, setRange] = useState(() => {
    if (controlledValue && Array.isArray(controlledValue)) return controlledValue;
    if (!paramKey) return [getDefault('start'), getDefault('end')];
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const urlVal = params.get(paramKey);
    if (urlVal && urlVal.includes('~')) {
      const [start, end] = urlVal.split('~');
      return [toInputString(start), toInputString(end)];
    }
    return [getDefault('start'), getDefault('end')];
  });
  // Track selected predefined range
  const [selectedRange, setSelectedRange] = useState("");

  // Helper to check if a range matches a predefined range
  const findMatchingPredefined = (start, end) => {
    for (let i = 0; i < PREDEFINED_RANGES.length; ++i) {
      const [pStart, pEnd] = PREDEFINED_RANGES[i].getRange(time);
      // Compare as timestamps for precision
      if (new Date(pStart).getTime() === new Date(start).getTime() && new Date(pEnd).getTime() === new Date(end).getTime()) {
        return String(i);
      }
    }
    return "";
  };

  // Sync with URL param on mount and popstate
  useEffect(() => {
    if (!paramKey || (controlledValue && Array.isArray(controlledValue))) return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlVal = params.get(paramKey);
      if (urlVal && urlVal.includes('~')) {
        const [start, end] = urlVal.split('~');
        setRange((prev) => (prev[0] !== toInputString(start) || prev[1] !== toInputString(end) ? [toInputString(start), toInputString(end)] : prev));
        if (onChange && (range[0] !== toInputString(start) || range[1] !== toInputString(end))) onChange([start, end]);
        // Set dropdown if matches predefined
        const matchIdx = findMatchingPredefined(Number(start), Number(end));
        setSelectedRange(matchIdx);
      } else {
        setSelectedRange("");
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    // Listen for pushState/replaceState (programmatic changes)
    const patchHistory = (type) => {
      const orig = window.history[type];
      window.history[type] = function() {
        const rv = orig.apply(this, arguments);
        window.dispatchEvent(new Event(type));
        return rv;
      };
    };
    patchHistory('pushState');
    patchHistory('replaceState');
    window.addEventListener('pushState', syncFromUrl);
    window.addEventListener('replaceState', syncFromUrl);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener('pushState', syncFromUrl);
      window.removeEventListener('replaceState', syncFromUrl);
    };
  }, [paramKey, onChange]);

  // If controlled, update local value when prop changes
  useEffect(() => {
    if (controlledValue && Array.isArray(controlledValue)) setRange(controlledValue);
  }, [controlledValue]);

  // Update URL param
  const setUrlParam = useCallback((vals) => {
    if (!paramKey) return;
    const params = new URLSearchParams(window.location.search);
    // Convert input strings to timestamps
    const toTs = (v) => {
      if (!v) return "";
      if (/^[0-9]+$/.test(v)) return v;
      const d = new Date(v);
      return d.getTime();
    };
    if (vals[0] && vals[1]) {
      params.set(paramKey, `${toTs(vals[0])}~${toTs(vals[1])}`);
    } else {
      params.delete(paramKey);
    }
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);
  }, [paramKey]);

  const handleChange = (which) => (e) => {
    const newVal = e.target.value;
    const newRange = which === 'start' ? [newVal, range[1]] : [range[0], newVal];
    if (!controlledValue) setRange(newRange);
    setUrlParam(newRange);
    setSelectedRange("");
    onChange?.(newRange);
  };

  // Handle predefined range select
  const handlePredefinedChange = (e) => {
    const idx = e.target.value;
    if (idx === "") return;
    const { getRange } = PREDEFINED_RANGES[idx];
    const newRange = getRange(time);
    if (!controlledValue) setRange(newRange);
    setUrlParam(newRange);
    setSelectedRange(idx);
    onChange?.(newRange);
  };

  const handleClear = () => {
    if (!controlledValue) setRange(["", ""]);
    setUrlParam(["", ""]);
    onChange?.(["", ""]);
  };

  // Show/hide dropdown for range selection
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Format range for display
  const formatDisplay = () => {
    if (!range[0] && !range[1]) return { start: "", end: "" };
    const fmt = (v) => {
      if (!v) return "";
      const d = new Date(v);
      if (isNaN(d.getTime())) return "";
      if (time) {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      } else {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      }
    };
    return { start: fmt(range[0]), end: fmt(range[1]) };
  };
  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e) => {
      if (!e.target.closest('.range-picker-dropdown')) setDropdownOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [dropdownOpen]);

  return (
    <div style={{ position: "relative", display: "inline-flex", gap: 4, ...style }} className={className}>
      <select value={selectedRange} onChange={handlePredefinedChange} style={{ marginRight: 4, height: 34, minHeight: 34 }}>
        <option value="">Custom...</option>
        {PREDEFINED_RANGES.map((r, i) => (
          <option value={i} key={r.label}>{r.label}</option>
        ))}
      </select>
      <div style={{ position: "relative", flex: 1 }}>
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{ 
            cursor: "pointer", 
            background: dropdownOpen ? "#f0f8ff" : "#fff", 
            height: 34, 
            minHeight: 34, 
            width: '100%',
            border: '1px solid #ccc',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px 0 8px',
            position: 'relative',
            fontSize: 14
          }}
        >
          <span style={{ color: formatDisplay().start ? '#333' : '#999', flex: 1 }}>
            {formatDisplay().start || 'Start date'}
          </span>
          <span style={{ padding: '0 8px', color: '#999' }}>→</span>
          <span style={{ color: formatDisplay().end ? '#333' : '#999', flex: 1 }}>
            {formatDisplay().end || 'End date'}
          </span>
          <span style={{ 
            position: 'absolute', 
            right: 8, 
            top: '50%', 
            transform: 'translateY(-50%)',
            fontSize: 16,
            color: '#666'
          }}>
            📅
          </span>
        </div>
        {dropdownOpen && (
          <div className="range-picker-dropdown" style={{
            position: "absolute",
            top: "110%",
            left: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: 12,
            zIndex: 1000,
            minWidth: 260
          }}>
            <CalendarRangePicker
              startDate={range[0] ? new Date(range[0]) : null}
              endDate={range[1] ? new Date(range[1]) : null}
              onChange={(start, end) => {
                const toStr = (d) => {
                  if (!d) return "";
                  if (time) {
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    const hh = String(d.getHours()).padStart(2, '0');
                    const min = String(d.getMinutes()).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
                  } else {
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}`;
                  }
                };
                const newRange = [toStr(start), toStr(end)];
                if (!controlledValue) setRange(newRange);
                setUrlParam(newRange);
                setSelectedRange("");
                onChange?.(newRange);
              }}
              time={time}
              timeStart={timeStart}
              timeEnd={timeEnd}
            />
            <div style={{ marginTop: 12, textAlign: 'right', borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
              <button 
                type="button" 
                onClick={handleClear}
                style={{ 
                  marginRight: 8, 
                  padding: '6px 16px', 
                  border: '1px solid #d1d5db', 
                  background: '#fff', 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Clear
              </button>
              <button 
                type="button" 
                onClick={() => setDropdownOpen(false)}
                style={{ 
                  padding: '6px 16px', 
                  border: 'none', 
                  background: '#1d4ed8', 
                  color: '#fff', 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

RangePicker.propTypes = {
  pushUrlParamObj: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  time: PropTypes.bool,
  timeStart: PropTypes.string,
  timeEnd: PropTypes.string,
  timezone: PropTypes.string,
  timeFormat: PropTypes.string,
  dateFormat: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  min: PropTypes.string,
  max: PropTypes.string,
};
