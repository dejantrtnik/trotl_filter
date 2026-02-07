import React from "react";

/**
 * SearchInput Component
 * @param {string} pushUrlParamObj - URL parameter key (if null, URL params are not updated)
 * @param {string} height - Input height (e.g., "40px", "3rem")
 * @param {string|number} width - Input width (e.g., "200px" or 200)
 * @param {object} style - Custom inline styles
 */
export default function SearchInput({ pushUrlParamObj = null, height, width, style = {}, ...props }) {
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

  // Apply height to container if provided and style doesn't have height defined
  const containerStyle = {
    position: "relative",
    display: "inline-block",
    height: height || "34px",
    verticalAlign: "middle",
    ...style
  };

  return (
    <div
      title={"tooltip"}
      style={containerStyle}
    >
      <input
        className="basic-input"
        value={value}
        style={{
          marginBottom: "10px",
          padding: "5px",
          width: width !== undefined ? width : "200px",
          paddingRight: value ? "24px" : undefined,
          height: "100%",
          boxSizing: "border-box"
        }}
        onChange={handleChange}
        {...props}
      />
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
