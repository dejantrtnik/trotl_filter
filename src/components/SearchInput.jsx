import React from "react";


export default function SearchInput({ pushUrlParamObj = null, ...props }) {
  const key = pushUrlParamObj || "search";
  const [value, setValue] = React.useState("");

  // On mount, read the URL param and set value
  React.useEffect(() => {
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
  }, [key]);

  const setUrlParam = (val) => {
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
