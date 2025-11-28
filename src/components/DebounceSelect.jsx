import React, { useState, useEffect, useRef } from "react";
// import "src/style/DebounceSelect.css";

const DebounceSelect = ({
  label,
  fetchOptions,
  onSelect,
  placeholder = "Type to search...",
  debounceDelay = 300,
  required = false,
  disabled = false,
  objValue,
  style,
  isMulti = false,
  pushUrlParamObj = false,
}) => {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState(
    isMulti ? objValue ?? [] : objValue ? [objValue] : []
  );

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!input) {
      setOptions([]);
      return;
    }

    setLoading(true);
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        // If input is '...', fetch all options
        const query = input === "..." ? "" : input;
        const results = await fetchOptions(query);
        setOptions(results);
      } catch (err) {
        console.error("Failed to fetch options", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, debounceDelay);

    return () => clearTimeout(timeoutRef.current);
  }, [input, fetchOptions, debounceDelay]);

  const setUrlParam = (value) => {
    const url = new URL(window.location);
    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(pushUrlParamObj);
    } else {
      url.searchParams.set(pushUrlParamObj, value);
    }
    window.history.replaceState({}, "", url);
  };

  const handleSelect = (value, labelValue) => {
    if (isMulti) {
      const newItem = { value, label: labelValue };
      const updated = selectedItems.some(item => item.value === value)
        ? selectedItems
        : [...selectedItems, newItem];
      setSelectedItems(updated);
      onSelect(updated);
      setInput("");
      if (pushUrlParamObj) {
        setUrlParam(updated.map(item => item.value).join(","));
      }
    } else {
      const single = { value, label: labelValue };
      setSelectedItems([single]);
      onSelect(single);
      setInput(labelValue);
      if (pushUrlParamObj) {
        setUrlParam(value);
      }
    }
    setOpen(false);
  };

  const removeItem = (value) => {
    const updated = selectedItems.filter(item => item.value !== value);
    setSelectedItems(updated);
    onSelect(updated);
    if (pushUrlParamObj) {
      setUrlParam(updated.length ? updated.map(item => item.value).join(",") : "");
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {label && <label>{label}{required && ' *'}</label>}

      {isMulti && (
        <div className="multi-selected-tags">
          {selectedItems.map(({ label, value }) => (
            <span key={value} className="tag">
              {label}
              <button type="button" onClick={() => removeItem(value)}>×</button>
            </span>
          ))}
        </div>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          className="basic-input"
          type="text"
          value={
            isMulti
              ? input
              : open
                ? input
                : selectedItems.length > 0
                  ? selectedItems[0].label
                  : input
          }
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          disabled={disabled}
          style={style}
        />
        {(input || (!isMulti && selectedItems.length > 0)) && !disabled && (
          <button
            type="button"
            aria-label="Clear"
            style={{
              position: 'absolute',
              right: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2em',
              color: '#888',
              padding: 0,
              lineHeight: 1,
            }}
            onMouseDown={e => {
              e.preventDefault();
              setInput("");
              if (isMulti) {
                // Do not clear selectedItems for multi
              } else {
                setSelectedItems([]);
                onSelect(null);
                if (pushUrlParamObj) setUrlParam("");
              }
            }}
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="basic-input-dropdown-menu">
          {loading ? (
            <div className="loading-dropdown-item">Loading...</div>
          ) : options?.length > 0 ? (
            options.map(({ label, value }) => (
              <div
                key={value}
                className="basic-input-dropdown-item"
                onMouseDown={() => handleSelect(value, label)}
              >
                {label}
              </div>
            ))
          ) : (
            <div className="no-results-dropdown-item">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebounceSelect;
