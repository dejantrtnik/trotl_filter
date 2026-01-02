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
  addItem = undefined,
  style = {},
  allowClear = false,
  disabled = false,
  // external loading prop
  loading: loadingProp = false,
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
          const matchedValues = urlValues
            .map(v => {
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
    window.addEventListener("popstate", readFromUrl);
    // Listen for pushState/replaceState (programmatic changes)
    const patchHistory = (type) => {
      const orig = window.history[type];
      window.history[type] = function() {
        const rv = orig.apply(this, arguments);
        window.dispatchEvent(new Event(type));
        return rv;
      };
    };
    patchHistory('pushState');
    patchHistory('replaceState');
    window.addEventListener('pushState', readFromUrl);
    window.addEventListener('replaceState', readFromUrl);
    return () => {
      window.removeEventListener("popstate", readFromUrl);
      window.removeEventListener('pushState', readFromUrl);
      window.removeEventListener('replaceState', readFromUrl);
    };
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

  // For custom input: track input value and show add button as inline option
  const [inputValue, setInputValue] = useState("");
  const inputExists = useMemo(() => {
    return options.some(opt => String(opt.label).toLowerCase() === inputValue.trim().toLowerCase());
  }, [inputValue, options]);

  // Add special option for +Add if inputValue is non-empty and not in options
  const menuOptions = useMemo(() => {
    if (inputValue && !inputExists && typeof addItem === 'function') {
      return [
        ...options,
        { label: `+ Add "${inputValue.trim()}"`, value: '__add_new__', __isAddNew: true }
      ];
    }
    return options;
  }, [options, inputValue, inputExists, addItem]);

  const handleAddNew = () => {
    if (disabled) return;
    if (!inputValue.trim()) return;
    const newLabel = inputValue.trim();
    // Prevent duplicate by value or label (case-insensitive)
    const exists = options.some(opt =>
      String(opt.value).toLowerCase() === newLabel.toLowerCase() ||
      String(opt.label).toLowerCase() === newLabel.toLowerCase()
    );
    if (exists) {
      setInputValue("");
      return;
    }
    const newOption = { label: newLabel, value: newLabel };
    if (typeof addItem === 'function') {
      addItem(newOption);
      // return;
    }
    if (isMulti) {
      onChange([...(selected || []), newOption.value]);
      if (pushUrlParamObj) setUrlParam([...(selected || []), newOption.value].join(","));
    } else {
      onChange([newOption.value]);
      if (pushUrlParamObj) setUrlParam(newOption.value);
    }
    setInputValue("");
  };

  // Custom Option to handle +Add
  const Option = (props) => {
    if (props.data.__isAddNew) {
      return (
        <div
          {...props.innerProps}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            color: '#1677ff',
            fontWeight: 500,
            background: props.isFocused ? '#e6f4ff' : '#fff',
          }}
          onMouseDown={e => {
            e.preventDefault();
            handleAddNew();
            props.selectOption(props.data);
          }}
        >
          {props.data.label}
        </div>
      );
    }
    return <components.Option {...props} />;
  };

  const handleChange = (selectedItems) => {
    if (disabled) return;
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
      paddingRight: showSpinner ? 36 : base.paddingRight,
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

  const showSpinner = loadingProp && !disabled;

  const showRequiredError = required && (!selected || selected.length === 0);
  return (
    <div
      style={{ width: "100%", position: 'relative', ...style, ...(disabled ? { opacity: 0.6 } : {}) }}
      ref={containerRef}
      className={showRequiredError ? "select-required-error" : ""}
      aria-disabled={disabled}
    >
      <Select
        isMulti={isMulti}
        isClearable={allowClear}
        isDisabled={disabled}
        options={menuOptions}
        value={selectedOptions}
        onChange={(val, action) => {
          if (disabled) return;
          // If user selects the +Add option, handle it
          if (action && action.action === 'select-option' && val && val.length && val[val.length-1]?.__isAddNew) {
            handleAddNew();
            return;
          }
          handleChange(val);
        }}
        placeholder={placeholder}
        styles={selectStyle}
        components={{ MultiValue, Option }}
        menuPortalTarget={document.body}
        closeMenuOnSelect={closeMenuOnSelect}
        aria-required={required}
        inputValue={inputValue}
        onInputChange={(val, action) => {
          if (disabled) return;
          if (action.action === "input-change") setInputValue(val);
        }}
      />
      {showSpinner && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <g>
              <circle cx="25" cy="25" r="20" stroke="#888" strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray="31.4 31.4" />
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite" />
            </g>
          </svg>
        </div>
      )}
      {showRequiredError && (
        <div className="error-text">This field is required.</div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
