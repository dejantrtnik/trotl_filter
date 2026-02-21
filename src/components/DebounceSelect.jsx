import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
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
  addItem = undefined,
  fetchAll = true,
  // external loading prop (won't clash with internal state named `loading`)
  loading: loadingProp = false,
  t
  , value
}) => {
  let translate
  if (t) {
    translate = t
  } else {
    translate = (key) => {
      const translations = {
      add: "Add",
      cancel: "Cancel",
      };
      return translations[key] || key;
    }
  }

  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const normalizeIncoming = (v) => {
    if (v === undefined || v === null) return isMulti ? [] : [];
    if (isMulti) {
      if (Array.isArray(v)) {
        return v.map(item => (item && typeof item === 'object' && ('value' in item || 'label' in item)) ? item : { value: item, label: String(item) });
      }
      // single primitive provided for multi -> wrap
      return [{ value: v, label: String(v) }];
    } else {
      if (Array.isArray(v)) {
        // take first
        const first = v[0];
        return first ? [{ value: first.value ?? first, label: first.label ?? String(first) }] : [];
      }
      return (v && typeof v === 'object') ? [{ value: v.value ?? v, label: v.label ?? String(v) }] : [{ value: v, label: String(v) }];
    }
  };

  const initialSel = value !== undefined ? normalizeIncoming(value) : (objValue !== undefined ? normalizeIncoming(objValue) : (isMulti ? [] : []));
  const [selectedItems, setSelectedItems] = useState(initialSel);

  // Sync to controlled `value` or legacy `objValue` when they change
  useEffect(() => {
    if (value !== undefined) {
      setSelectedItems(normalizeIncoming(value));
    } else if (objValue !== undefined) {
      setSelectedItems(normalizeIncoming(objValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, objValue]);

  // Auto-update selectedItems when URL param changes
  // useEffect(() => {
  //   if (!pushUrlParamObj) return;
  //   const syncFromUrl = () => {
  //     const params = new URLSearchParams(window.location.search);
  //     const urlVal = params.get(pushUrlParamObj);
  //     if (urlVal) {
  //       if (isMulti) {
  //         const urlValues = urlVal.split(",").filter(Boolean);
  //         // Only update if different
  //         if (JSON.stringify(urlValues) !== JSON.stringify(selectedItems.map(i => i.value))) {
  //           // We don't have labels, so just update values
  //           setSelectedItems(urlValues.map(v => ({ value: v, label: v })));
  //           onSelect?.(urlValues.map(v => ({ value: v, label: v })));
  //         }
  //       } else {
  //         if (!selectedItems[0] || selectedItems[0].value !== urlVal) {
  //           setSelectedItems([{ value: urlVal, label: urlVal }]);
  //           onSelect?.({ value: urlVal, label: urlVal });
  //         }
  //       }
  //     } else {
  //       if (selectedItems.length > 0) {
  //         setSelectedItems([]);
  //         onSelect?.(isMulti ? [] : null);
  //       }
  //     }
  //   };
  //   syncFromUrl();
  //   window.addEventListener("popstate", syncFromUrl);
  //   // Listen for pushState/replaceState (programmatic changes)
  //   const patchHistory = (type) => {
  //     const orig = window.history[type];
  //     window.history[type] = function() {
  //       const rv = orig.apply(this, arguments);
  //       window.dispatchEvent(new Event(type));
  //       return rv;
  //     };
  //   };
  //   patchHistory('pushState');
  //   patchHistory('replaceState');
  //   window.addEventListener('pushState', syncFromUrl);
  //   window.addEventListener('replaceState', syncFromUrl);
  //   return () => {
  //     window.removeEventListener("popstate", syncFromUrl);
  //     window.removeEventListener('pushState', syncFromUrl);
  //     window.removeEventListener('replaceState', syncFromUrl);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pushUrlParamObj, isMulti, selectedItems, onSelect]);

  const timeoutRef = useRef(null);

  const showSpinner = (loading || loadingProp) && !disabled;
  const showClear = (input || (!isMulti && selectedItems.length > 0)) && !disabled;

  useEffect(() => {
    if (!input) {
      setOptions([]);
      return;
    }

    setLoading(true);
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        // If fetchAll is true and input is '...', fetch all options
        // If fetchAll is false, '...' will be treated as regular search
        const query = (fetchAll && input === "...") ? "" : input;
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
  }, [input, fetchOptions, debounceDelay, fetchAll]);

  const setUrlParam = (value) => {
    const url = new URL(window.location);
    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(pushUrlParamObj);
    } else {
      url.searchParams.set(pushUrlParamObj, value);
    }
    window.history.replaceState({}, "", url);
  };

  const handleSelect = (value, labelValue, el) => {
    // console.log(el)
    if (isMulti) {
      const newItem = { ...el, value, label: labelValue };
      const updated = selectedItems.some(item => item.value === value)
        ? selectedItems
        : [...selectedItems, newItem];
      setSelectedItems(updated);
      onSelect(value, newItem);
      setInput("");
      if (pushUrlParamObj) {
        setUrlParam(updated.map(item => item.value).join(","));
      }
    } else {
      const single = { ...el, value, label: labelValue };
      setSelectedItems([single]);
      onSelect(value, single);
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

  // Check if input value exists in options
  const inputExists = input.trim() && options.some(opt =>
    String(opt.label).toLowerCase() === input.trim().toLowerCase() ||
    String(opt.value).toLowerCase() === input.trim().toLowerCase()
  );

  const handleAddNew = () => {
    if (!input.trim()) return;
    const newOption = { label: input.trim(), value: input.trim() };
    if (typeof addItem === 'function') {
      addItem(newOption);
    }
    handleSelect(newOption.value, newOption.label, newOption);
  };

  // Handle double-click to fetch all when fetchAll is false
  const handleDoubleClick = async () => {
    if (!fetchAll && !disabled) {
      setLoading(true);
      setOpen(true);
      try {
        const results = await fetchOptions("");
        setOptions(results);
      } catch (err) {
        console.error("Failed to fetch options", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
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
          // onFocus={() => setOpen(true)}
          onFocus={handleDoubleClick}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          // onDoubleClick={handleDoubleClick}
          disabled={disabled}
          style={style}
        />
        {/* Spinner on the right when loading (internal or prop), clear button shifted left */}
        {showSpinner && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: 6,
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

        {showClear && (
          <button
            type="button"
            aria-label="Clear"
            style={{
              position: 'absolute',
              right: showSpinner ? 30 : 6,
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
            <>
              {options.map((el) => {
                const { label, value } = el;
                return (
                  <div
                    key={value}
                    className="basic-input-dropdown-item"
                    onMouseDown={() => handleSelect(value, label, el)}
                  >
                    {translate(label)}
                  </div>
                );
              })}
              {input.trim() && !inputExists && typeof addItem === 'function' && (
                <div
                  className="basic-input-dropdown-item"
                  style={{ color: '#1677ff', fontWeight: 500 }}
                  onMouseDown={handleAddNew}
                >
                  + {translate("add")} "{input.trim()}"
                </div>
              )}
            </>
          ) : input.trim() && !loading && typeof addItem === 'function' ? (
            <div
              className="basic-input-dropdown-item"
              style={{ color: '#1677ff', fontWeight: 500 }}
              onMouseDown={handleAddNew}
            >
              + {translate("add")} "{input.trim()}"
            </div>
          ) : (
            <div className="no-results-dropdown-item">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebounceSelect;

DebounceSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string, PropTypes.number]),
  fetchOptions: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
  placeholder: PropTypes.string,
  debounceDelay: PropTypes.number,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  objValue: PropTypes.any,
  style: PropTypes.object,
  isMulti: PropTypes.bool,
  pushUrlParamObj: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  addItem: PropTypes.func,
  fetchAll: PropTypes.bool,
  loading: PropTypes.bool,
  t: PropTypes.func
};
