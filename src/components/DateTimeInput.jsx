import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * DateTimeInput - a reusable input for date or datetime-local with URL param sync
 * Props:
 *   pushUrlParamObj: string | false - URL param key to sync value
 *   value: controlled value (optional)
 *   onChange: (val) => void (optional)
 *   time: boolean - if true, use datetime-local, else date
 *   timezone: string (optional, for future use)
 *   timeFormat: string (optional, for future use)
 *   dateFormat: string (optional, for future use)
 *   placeholder, required, disabled, className, style, min, max, ...rest
 */
export default function DateTimeInput({
  pushUrlParamObj = false,
  value: controlledValue,
  onChange,
  time = false,
  timeStart,
  timezone, // for future use
  timeFormat, // for future use
  dateFormat, // for future use
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
  // If controlled, use prop; else, manage local state
  const [value, setValue] = useState(() => {
    if (typeof controlledValue !== "undefined") return controlledValue;
    const toInputString = (ts) => {
      if (!ts) return "";
      const d = new Date(Number(ts));
      if (isNaN(d.getTime())) return "";
      if (time) {
        // yyyy-MM-ddTHH:mm
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
    if (!paramKey) {
      // If not URL controlled, use timeStart or now if time, else blank
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
    // If no value in URL, use timeStart or now if time
    let d = new Date();
    if (time && timeStart) {
      const [h, m] = timeStart.split(":");
      d.setHours(Number(h), Number(m), 0, 0);
    }
    return toInputString(d.getTime());
  });

  // Keep in sync with URL param on mount and popstate
  useEffect(() => {
    if (!paramKey || typeof controlledValue !== "undefined") return;
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
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlVal = params.get(paramKey) || "";
      setValue((prev) => (prev !== toInputString(urlVal) ? toInputString(urlVal) : prev));
      if (onChange && urlVal !== value) onChange(urlVal);
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

  // If controlled, update local value when prop changes (no effect needed, just use controlledValue)
  // Instead, derive value from controlledValue in render if provided

  // Update URL param
  const setUrlParam = useCallback((val) => {
    if (!paramKey) return;
    const params = new URLSearchParams(window.location.search);
    let ts = val;
    if (val && typeof val === "string" && !/^[0-9]+$/.test(val)) {
      // Convert input string to timestamp
      const d = new Date(val);
      ts = d.getTime();
    }
    if (ts && String(ts).length > 0 && !isNaN(Number(ts))) {
      params.set(paramKey, String(ts));
    } else {
      params.delete(paramKey);
    }
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);
  }, [paramKey]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    if (typeof controlledValue === "undefined") setValue(newVal);
    setUrlParam(newVal);
    onChange?.(newVal);
  };

  const handleClear = () => {
    if (typeof controlledValue === "undefined") setValue("");
    setUrlParam("");
    onChange?.("");
  };

  return (
    <div style={{ position: "relative", display: "inline-block", ...style }} className={className}>
      <input
        type={time ? "datetime-local" : "date"}
        className="basic-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        {...rest}
        style={{ paddingRight: value ? 24 : undefined, ...style }}
        data-timestart={timeStart || undefined}
        data-timezone={timezone || undefined}
        data-timeformat={timeFormat || undefined}
        data-dateformat={dateFormat || undefined}
      />
      {value && (
        <span
          onClick={handleClear}
          title="Clear date"
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
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  min: PropTypes.string,
  max: PropTypes.string,
};
