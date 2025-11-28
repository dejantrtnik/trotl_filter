import React from "react";

export default function SearchInput({ pushUrlParamObj = null, ...props }) {
  // Helper to update the URL param
  const [value, setValue] = React.useState();
  const setUrlParam = (val) => {
    const key = pushUrlParamObj || "search";
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
    // onChange?.(newValue);
    setValue(newValue);
    setUrlParam(newValue);
  };

  const handleClear = () => {
    setValue("");
    setUrlParam("");
  };

  return (
    <div
      title={"tooltip"}
      style={{
        position: "relative",
        display: "inline-block",
        height: "34px",
        verticalAlign: "middle"
      }}
    >
      <input
        className="basic-input"
        value={value}
        style={{
          marginBottom: "10px",
          padding: "5px",
          width: "200px",
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
