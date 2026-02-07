import React, { useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import "./Upload.css";

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export default function Upload({ onChange, multiple = false, accept, acceptFiles, maxFiles = null, maxFileSize = null, customPreview = null, buttonLabel = "Browse...", className = "", style = {}, value = undefined, width, height }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);

  const handleFiles = useCallback((fileList, event = null) => {
    const incoming = Array.from(fileList || []);
    setFiles((prev) => {
      let arr = multiple ? [...prev, ...incoming] : incoming;
      if (maxFileSize) {
        arr = arr.filter((f) => f.size <= maxFileSize);
      }
      if (maxFiles && Number.isFinite(maxFiles)) {
        arr = arr.slice(0, maxFiles);
      }
      if (onChange) {
        // Call with (files, event) for consistency; provide single file when not multiple
        onChange(multiple ? arr : arr[0] || null, event || null);
      }
      return arr;
    });
  }, [onChange, multiple, maxFileSize, maxFiles]);

  // Determine which files to display: prefer `value` prop when provided (controlled),
  // otherwise use internal `files` state.
  const displayFiles = (() => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) return value;
      return [value];
    }
    return files;
  })();

  const onInputChange = (e) => {
    handleFiles(e.target.files, e);
  };

  const openFileDialog = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files, e);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  // Normalize numeric sizes to px strings
  const normalizeSize = (s) => (s === undefined || s === null ? undefined : typeof s === "number" ? `${s}px` : s);
  const normalizedWidth = normalizeSize(width);
  const normalizedHeight = normalizeSize(height);

  // Merge style and props, with explicit props taking precedence
  const appliedStyle = { ...style };
  if (normalizedWidth !== undefined) appliedStyle.width = normalizedWidth;
  if (normalizedHeight !== undefined) appliedStyle.height = normalizedHeight;

  return (
    <div className={`trotl-upload ${className}`} style={appliedStyle}>
      <input
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        onChange={onInputChange}
        multiple={multiple}
        accept={acceptFiles || accept}
      />

      <div
        className={`upload-dropzone ${dragOver ? "drag-over" : ""}`}
        onClick={openFileDialog}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") openFileDialog(); }}
      >
        <div className="upload-inner">
          <div className="upload-icon">⬆️</div>
          <div className="upload-text">Drag & drop files here or</div>
          <button type="button" className="upload-browse" onClick={(e) => { e.stopPropagation(); openFileDialog(); }}>{buttonLabel}</button>
        </div>
      </div>

      {displayFiles && displayFiles.length > 0 && (
        customPreview ? (
          // If customPreview is a component, render it with `files` prop
          React.createElement(customPreview, { files: displayFiles })
        ) : (
          <ul className="upload-list">
            {displayFiles.map((f, i) => (
              <li key={`${(f && f.name) || f || i}-${i}`} className="upload-item">
                <span className="upload-name">{(f && f.name) || String(f)}</span>
                <span className="upload-size">{(f && f.size) ? formatBytes(f.size) : ""}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

Upload.propTypes = {
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
  accept: PropTypes.string,
  acceptFiles: PropTypes.string,
  maxFiles: PropTypes.number,
  maxFileSize: PropTypes.number,
  customPreview: PropTypes.oneOfType([PropTypes.elementType, PropTypes.func, PropTypes.node]),
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
  buttonLabel: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
