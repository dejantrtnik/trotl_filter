import React, { useMemo, useRef, useEffect, useState } from "react";
import Select, { components } from "react-select";

const MultiSelectDropdown = ({
  isMulti = false,
  options = [],
  selected = [],
  onChange,
  theme = "light",
  placeholder = "Select...",
  required = false,
  closeMenuOnSelect = false,
  pushUrlParamObj = false, // pushUrlParamObj={"ids"}
}) => {
  const containerRef = useRef(null);
  const [maxVisible, setMaxVisible] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth || 200;
    // Estimate average tag width (adjust as needed for your style)
    const avgTagWidth = 90; // px, tweak for your font/size
    const calculated = Math.max(1, Math.floor((containerWidth - 40) / avgTagWidth));
    setMaxVisible(calculated);
    // Optionally, recalculate on window resize:
    const handleResize = () => {
      const w = containerRef.current.offsetWidth || 200;
      setMaxVisible(Math.max(1, Math.floor((w - 40) / avgTagWidth)));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // On mount, read from URL param if present and set values by matching with options
  useEffect(() => {
    if (!pushUrlParamObj || !options || options.length === 0) return;
    
    const readFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlVal = params.get(pushUrlParamObj);
      
      if (urlVal) {
        if (isMulti) {
          const urlValues = urlVal.split(",").filter(Boolean);
          // Match URL values with options to get the full values array
          const matchedValues = urlValues
            .map(v => {
              // Try to match by converting both to strings for comparison
              const found = options.find(opt => String(opt.value) === String(v));
              return found ? found.value : null;
            })
            .filter(v => v !== null);
          
          if (matchedValues.length > 0 && JSON.stringify(matchedValues) !== JSON.stringify(selected)) {
            onChange?.(matchedValues);
          }
        } else {
          const found = options.find(opt => String(opt.value) === String(urlVal));
          if (found && (!selected || selected[0] !== found.value)) {
            onChange?.([found.value]);
          }
        }
      }
    };

    readFromUrl();

    // Listen for popstate (browser navigation)
    const onPopState = () => readFromUrl();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pushUrlParamObj, isMulti, options, selected, onChange]);

  const selectedOptions = useMemo(() => {
    if (isMulti) {
      return options.filter((opt) => selected.includes(opt.value));
    } else {
      return options.find((opt) => opt.value === selected[0]) || null;
    }
  }, [selected, options, isMulti]);

  const setUrlParam = (value) => {
    if (!pushUrlParamObj) return;
    const url = new URL(window.location);
    if (!value) {
      url.searchParams.delete(pushUrlParamObj);
    } else {
      url.searchParams.set(pushUrlParamObj, value);
    }
    window.history.replaceState({}, "", url);
  };

  const handleChange = (selectedItems) => {
    if (isMulti) {
      const values = selectedItems ? selectedItems.map((item) => item.value) : [];
      onChange(values);
      if (pushUrlParamObj) {
        setUrlParam(values.length ? values.join(",") : "");
      }
    } else {
      const value = selectedItems ? [selectedItems.value] : [];
      onChange(value);
      if (pushUrlParamObj) {
        setUrlParam(value.length ? value[0] : "");
      }
    }
  };

  const MultiValue = (props) => {
    const { index, getValue } = props;
    const allSelected = getValue();
    const hiddenCount = allSelected.length - maxVisible;

    // Only render visible tags
    if (index < maxVisible) {
      return <components.MultiValue {...props} />;
    }

    // Only render +N for the first hidden slot
    if (index === maxVisible && hiddenCount > 0) {
      const hiddenLabels = allSelected.slice(maxVisible).map((opt) => opt.label).join(", ");
      return (
        <div
          className="multi-value-extra"
          title={hiddenLabels}
          style={{
            backgroundColor: theme === "dark" ? "#333" : "#e0e0e0",
            color: theme === "dark" ? "#eee" : "#333",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: "0.85em",
            display: "inline-flex",
            alignItems: "center",
            marginLeft: 4,
            cursor: "default",
          }}
        >
          +{hiddenCount}
        </div>
      );
    }

    // Don't render anything for other hidden tags
    return null;
  };

  const selectStyle = {
    control: (base) => ({
      ...base,
      maxHeight: 34,
      minHeight: 34,
      height: "auto",
      backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
      borderColor: theme === "dark" ? "#555" : "#ccc",
      color: theme === "dark" ? "#eee" : "#333",
      boxShadow: "none",
      borderRadius: 2,
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
      border: `1px solid ${theme === "dark" ? "#555" : "#ccc"}`,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? theme === "dark"
          ? "#333"
          : "#eee"
        : theme === "dark"
        ? "#1e1e1e"
        : "#fff",
      color: theme === "dark" ? "#eee" : "#333",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: theme === "dark" ? "#eee" : "#333",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: theme === "dark" ? "#333" : "#e0e0e0",
      borderRadius: 2,
      padding: "0 2px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: theme === "dark" ? "#eee" : "#333",
      fontSize: "0.85em",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: theme === "dark" ? "#aaa" : "#555",
      ":hover": {
        backgroundColor: theme === "dark" ? "#444" : "#ccc",
        color: "#000",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: theme === "dark" ? "#aaa" : "#666",
    }),
    input: (base) => ({
      ...base,
      color: theme === "dark" ? "#eee" : "#333",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 999999 }),
    valueContainer: (base) => ({
      ...base,
      flexWrap: "nowrap",
      overflow: "hidden",
    }),
  };

  const showRequiredError = required && (!selected || selected.length === 0);
  return (
    <div
      style={{ width: "100%" }}
      ref={containerRef}
      className={showRequiredError ? "select-required-error" : ""}
    >
      <Select
        isMulti={isMulti}
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        styles={selectStyle}
        components={{ MultiValue }}
        menuPortalTarget={document.body}
        closeMenuOnSelect={closeMenuOnSelect}
        aria-required={required}
      />
      {showRequiredError && (
        <div className="error-text">This field is required.</div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
