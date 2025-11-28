import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

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
  const [range, setRange] = useState(() => {
    if (controlledValue && Array.isArray(controlledValue)) return controlledValue;
    if (!paramKey) return [getDefault('start'), getDefault('end')];
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const urlVal = params.get(paramKey);
    if (urlVal && urlVal.includes('~')) {
      const [start, end] = urlVal.split('~');
      return [start, end];
    }
    return [getDefault('start'), getDefault('end')];
  });
  // Track selected predefined range
  const [selectedRange, setSelectedRange] = useState("");

  // Sync with URL param on mount and popstate
  useEffect(() => {
    if (!paramKey || (controlledValue && Array.isArray(controlledValue))) return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlVal = params.get(paramKey);
      if (urlVal && urlVal.includes('~')) {
        const [start, end] = urlVal.split('~');
        setRange((prev) => (prev[0] !== start || prev[1] !== end ? [start, end] : prev));
        if (onChange && (range[0] !== start || range[1] !== end)) onChange([start, end]);
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey, onChange]);

  // If controlled, update local value when prop changes
  useEffect(() => {
    if (controlledValue && Array.isArray(controlledValue)) setRange(controlledValue);
  }, [controlledValue]);

  // Update URL param
  const setUrlParam = useCallback((vals) => {
    if (!paramKey) return;
    const params = new URLSearchParams(window.location.search);
    if (vals[0] && vals[1]) {
      params.set(paramKey, `${vals[0]}~${vals[1]}`);
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

  return (
    <div style={{ position: "relative", display: "inline-flex", gap: 4, ...style }} className={className}>
      <select value={selectedRange} onChange={handlePredefinedChange} style={{ marginRight: 4 }}>
        <option value="">Custom...</option>
        {PREDEFINED_RANGES.map((r, i) => (
          <option value={i} key={r.label}>{r.label}</option>
        ))}
      </select>
      <input
        type={time ? "datetime-local" : "date"}
        className="basic-input"
        value={range[0]}
        onChange={handleChange('start')}
        placeholder={placeholder || "Start"}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        {...rest}
        style={{ paddingRight: range[0] ? 24 : undefined, ...style }}
        data-timestart={timeStart || undefined}
        data-timezone={timezone || undefined}
        data-timeformat={timeFormat || undefined}
        data-dateformat={dateFormat || undefined}
      />
      <span style={{ alignSelf: 'center', padding: '0 2px' }}>–</span>
      <input
        type={time ? "datetime-local" : "date"}
        className="basic-input"
        value={range[1]}
        onChange={handleChange('end')}
        placeholder={placeholder || "End"}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        {...rest}
        style={{ paddingRight: range[1] ? 24 : undefined, ...style }}
        data-timeend={timeEnd || undefined}
        data-timezone={timezone || undefined}
        data-timeformat={timeFormat || undefined}
        data-dateformat={dateFormat || undefined}
      />
      {(range[0] || range[1]) && (
        <span
          onClick={handleClear}
          title="Clear range"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: 14,
            color: "#000000ff",
            lineHeight: 1,
            zIndex: 2
          }}
        >
          ✖
        </span>
      )}
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
