import React from "react";
import "./Button.css";

/**
 * Button Component
 * @param {string} type - Button type: "ok", "cancel", "delete", or custom (null)
 * @param {function} onClick - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {boolean} disabled - Whether button is disabled
 * @param {object} style - Custom inline styles
 * @param {string} className - Additional CSS classes
 * @param {string} height - Button height (e.g., "40px", "3rem")
 */
const Button = ({
  type = null,
  onClick,
  children,
  disabled = false,
  style = {},
  className = "",
  height,
  ...rest
}) => {
  // Determine button class based on type
  const getButtonClass = () => {
    switch (type) {
      case "ok":
        return "btn-ok";
      case "cancel":
        return "btn-cancel";
      case "delete":
        return "btn-delete";
      default:
        return "btn-custom";
    }
  };

  // Apply height if provided and style doesn't have height defined
  const buttonStyle = {
    ...(height && !style.height ? { height } : {}),
    ...style
  };

  return (
    <button
      className={`button ${getButtonClass()} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
