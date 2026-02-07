import React from "react";

/**
 * SearchInput Component
 * @param {string} pushUrlParamObj - URL parameter key (if null, URL params are not updated)
 * @param {string} height - Input height (e.g., "40px", "3rem")
 * @param {string|number} width - Input width (e.g., "200px" or 200)
 * @param {boolean} textArea - When true, render a textarea instead of an input
 * @param {object} style - Custom inline styles
 */
export default function SearchInput({ pushUrlParamObj = null, height, width, textArea = false, style = {}, ...props }) {
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

  // Apply height to container if provided and style doesn't have height defined
  const containerStyle = {
    position: "relative",
    display: "inline-block",
    height: normalizeSize(height) || (textArea ? undefined : "34px"),
    verticalAlign: "middle",
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
            width: normalizeSize(width) || "200px",
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
            width: normalizeSize(width) || "200px",
            paddingRight: value ? "24px" : undefined,
            boxSizing: "border-box",
            resize: "vertical",
            minHeight: normalizeSize(height) || "80px",
            height: normalizeSize(height) ? "100%" : undefined
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
