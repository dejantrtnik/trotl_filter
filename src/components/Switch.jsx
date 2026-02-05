import React from "react";
import "./Switch.css";

/**
 * Switch Component
 * @param {boolean} checked - Whether the switch is checked
 * @param {function} onChange - Change handler (receives boolean value)
 * @param {boolean} disabled - Whether switch is disabled
 * @param {object} style - Custom inline styles
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional label text
 * @param {string} size - Switch size: "small", "medium", "large"
 */
const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  style = {},
  className = "",
  label,
  size = "medium",
  ...rest
}) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "switch-small";
      case "large":
        return "switch-large";
      default:
        return "switch-medium";
    }
  };

  return (
    <div className={`switch-container ${className}`} style={style}>
      <label className={`switch ${getSizeClass()} ${disabled ? "switch-disabled" : ""}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
          {...rest}
        />
        <span className={`slider ${checked ? "checked" : ""}`}></span>
      </label>
      {label && <span className="switch-label">{label}</span>}
    </div>
  );
};

export default Switch;
