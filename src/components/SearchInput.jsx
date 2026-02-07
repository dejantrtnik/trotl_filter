import React from "react";

/**
 * SearchInput Component
 * @param {string} pushUrlParamObj - URL parameter key (if null, URL params are not updated)
 * @param {string} height - Input height (e.g., "40px", "3rem")
 * @param {string|number} width - Input width (e.g., "200px" or 200)
 * @param {boolean} textArea - When true, render a textarea instead of an input
 * @param {string|number} minWidth - Minimum width to constrain resizing
 * @param {string|number} maxWidth - Maximum width to constrain resizing
 * @param {object} style - Custom inline styles
 */
export default function SearchInput({ pushUrlParamObj = null, height, width, minWidth, maxWidth, textArea = false, style = {}, ...props }) {
  const key = pushUrlParamObj || "search";
  const [value, setValue] = React.useState("");

  // On mount, read the URL param and set value
  React.useEffect(() => {
    if (pushUrlParamObj === null) return;
    
    const params = new URLSearchParams(window.location.search);
    const urlValue = params.get(key) || "";
    setValue(urlValue);

    // Listen for popstate (browser navigation)
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setValue(params.get(key) || "");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [key, pushUrlParamObj]);

  const setUrlParam = (val) => {
    if (pushUrlParamObj === null) return;
    
    const params = new URLSearchParams(window.location.search);
    if (val && val.length > 0) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState({}, "", newUrl);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    setUrlParam(newValue);
  };

  const handleClear = () => {
    setValue("");
    setUrlParam("");
  };

  // Normalize numeric sizes to px strings
  const normalizeSize = (s) => (s === undefined || s === null ? undefined : typeof s === "number" ? `${s}px` : s);

  const normalizedWidth = normalizeSize(width);
  const normalizedHeight = normalizeSize(height);
  const normalizedMinWidth = normalizeSize(minWidth);
  const normalizedMaxWidth = normalizeSize(maxWidth);

  // Apply height/width to container if provided and style doesn't have height defined
  const containerStyle = {
    position: "relative",
    display: "inline-block",
    height: normalizedHeight || (textArea ? undefined : "34px"),
    verticalAlign: "middle",
    // If width is a percentage (e.g. "100%"), apply it to the container
    width: normalizedWidth && String(normalizedWidth).trim().endsWith("%") ? normalizedWidth : undefined,
    ...style
  };

  return (
    <div
      title={"tooltip"}
      style={containerStyle}
    >
      {!textArea ? (
        <input
          className="basic-input"
          value={value}
          style={{
              marginBottom: "10px",
              padding: "5px",
              // If width was a percentage, make input fill the container; otherwise use the normalized width or default
              width: normalizedWidth && String(normalizedWidth).trim().endsWith("%") ? "100%" : (normalizedWidth || "200px"),
              minWidth: normalizedMinWidth,
              maxWidth: normalizedMaxWidth,
              paddingRight: value ? "24px" : undefined,
              height: "100%",
              boxSizing: "border-box"
            }}
          onChange={handleChange}
          {...props}
        />
      ) : (
        <textarea
          className="basic-input"
          value={value}
          style={{
              marginBottom: "10px",
              padding: "5px",
              // If width was a percentage, make textarea fill the container; otherwise use the normalized width or default
              width: normalizedWidth && String(normalizedWidth).trim().endsWith("%") ? "100%" : (normalizedWidth || "200px"),
              minWidth: normalizedMinWidth,
              maxWidth: normalizedMaxWidth,
              paddingRight: value ? "24px" : undefined,
              boxSizing: "border-box",
              resize: "both",
              minHeight: normalizedHeight || "80px",
              height: normalizedHeight ? "100%" : undefined
            }}
          onChange={handleChange}
          {...props}
        />
      )}
      {value && (
        <span
          onClick={handleClear}
          title="Clear search"
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: "14px",
            color: "#000000ff",
            lineHeight: "1"
          }}
        >
          ✖
        </span>
      )}
    </div>
  );
}
