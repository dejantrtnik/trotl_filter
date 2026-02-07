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
  float = null,
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

  // If `float` prop is provided, compute fixed positioning styles.
  let floatClass = "";
  const floatStyle = {};
  if (float) {
    floatClass = "button--float";
    // Accept boolean true (use bottom-right default) or object
    const cfg = (typeof float === "object") ? float : { position: "bottom-right" };

    // Default spacing if not provided
    const gap = cfg.gap || cfg.offset || 16;

    // If explicit top/left/right/bottom provided, use them.
    if (cfg.top !== undefined) floatStyle.top = cfg.top;
    if (cfg.left !== undefined) floatStyle.left = cfg.left;
    if (cfg.right !== undefined) floatStyle.right = cfg.right;
    if (cfg.bottom !== undefined) floatStyle.bottom = cfg.bottom;

    // If position string is provided, map to offsets unless explicit coords set
    if (cfg.position && !(cfg.top || cfg.left || cfg.right || cfg.bottom)) {
      const pos = String(cfg.position).toLowerCase();
      // Accept common typo 'botton' as 'bottom'
      const posNormalized = pos.replace(/botton/g, 'bottom');

      // If user requested an edge position like 'bottom-left', place at exact edge (0px)
      if (posNormalized.includes("bottom") && posNormalized.includes("left")) {
        floatStyle.bottom = '0px';
        floatStyle.left = '0px';
      } else if (posNormalized.includes("bottom") && posNormalized.includes("right")) {
        floatStyle.bottom = '0px';
        floatStyle.right = '0px';
      } else if (posNormalized.includes("top") && posNormalized.includes("left")) {
        floatStyle.top = '0px';
        floatStyle.left = '0px';
      } else if (posNormalized.includes("top") && posNormalized.includes("right")) {
        floatStyle.top = '0px';
        floatStyle.right = '0px';
      } else {
        // fallback: apply gap offsets
        if (posNormalized.includes("bottom")) floatStyle.bottom = typeof gap === "number" ? `${gap}px` : gap;
        if (posNormalized.includes("top")) floatStyle.top = typeof gap === "number" ? `${gap}px` : gap;
        if (posNormalized.includes("left")) floatStyle.left = typeof gap === "number" ? `${gap}px` : gap;
        if (posNormalized.includes("right")) floatStyle.right = typeof gap === "number" ? `${gap}px` : gap;
      }

      // center handling (horizontal or vertical centering)
      if (posNormalized.startsWith("center-")) {
        const parts = posNormalized.split("-");
        const dir = parts[1];
        if (dir === "bottom" || dir === "top") {
          floatStyle.left = "50%";
          floatStyle.transform = (floatStyle.transform ? floatStyle.transform + " " : "") + "translateX(-50%)";
        }
        if (dir === "left" || dir === "right") {
          floatStyle.top = "50%";
          floatStyle.transform = (floatStyle.transform ? floatStyle.transform + " " : "") + "translateY(-50%)";
        }
      }
    }
  }

  return (
    <button
      className={`button ${getButtonClass()} ${className} ${floatClass}`}
      onClick={onClick}
      disabled={disabled}
      style={{ ...buttonStyle, ...floatStyle }}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
