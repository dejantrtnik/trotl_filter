import React from "react";
import Select, { components } from "react-select";
import { useMemo, useState, useRef } from "react";

const MultiSelectDropdown = ({
  isMulti = false,
  options = [],
  selected = [],
  onChange,
  theme = "light",
  placeholder = "Select...",
  maxVisible = 1,
  required = false,
  closeMenuOnSelect = false
}) => {
  const containerRef = useRef(null);

  const selectedOptions = useMemo(() => {
    if (isMulti) {
      return options.filter((opt) => selected.includes(opt.value));
    } else {
      return options.find((opt) => opt.value === selected[0]) || null;
    }
  }, [selected, options, isMulti]);

  const handleChange = (selectedItems) => {
    if (isMulti) {
      const values = selectedItems ? selectedItems.map((item) => item.value) : [];
      onChange(values);
    } else {
      const value = selectedItems ? [selectedItems.value] : [];
      onChange(value);
    }
  };

  const MultiValue = (props) => {
    const { index, getValue } = props;
    const allSelected = getValue();
    const hiddenCount = allSelected.length - maxVisible;

    if (index < maxVisible) {
      return <components.MultiValue {...props} />;
    }

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
            padding: "0 6px",
            fontSize: "0.8em",
            alignSelf: "center",
            cursor: "default",
          }}
        >
          +{hiddenCount}
        </div>
      );
    }
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
        aria-required={required} // ✅ Accessibility hint
      />
      {showRequiredError && (
        <div className="error-text">This field is required.</div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
