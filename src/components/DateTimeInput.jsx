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
    if (!paramKey) return "";
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    return params.get(paramKey) || "";
  });

  // Keep in sync with URL param on mount and popstate
  useEffect(() => {
    if (!paramKey || typeof controlledValue !== "undefined") return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlVal = params.get(paramKey) || "";
      setValue((prev) => (prev !== urlVal ? urlVal : prev));
      if (onChange && urlVal !== value) onChange(urlVal);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey, onChange]);

  // If controlled, update local value when prop changes (no effect needed, just use controlledValue)
  // Instead, derive value from controlledValue in render if provided

  // Update URL param
  const setUrlParam = useCallback((val) => {
    if (!paramKey) return;
    const params = new URLSearchParams(window.location.search);
    if (val && val.length > 0) {
      params.set(paramKey, val);
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
