import React, { useState, useCallback, useEffect } from "react";

/*
Reusable IconInput component
Props:
  icon: ReactNode or string to render
  title: tooltip text
  ariaLabel: accessible label (falls back to title or stringified icon)
  onClick: callback fired after internal URL logic (receives event & active state)
  size: number (px) for square hit area
  disabled: boolean
  className, style: customization
  pushUrlParamObj: string | false -> if provided, component will write to that URL param
  pushValue: value written to param when activated (default '1')
  toggle: boolean -> if true acts like a toggle, else just sets param
  multiUrlList: boolean -> if true treats param as comma-separated list; clicking toggles pushValue in list
  activeColor: color when active
  inactiveColor: color when inactive
*/

export default function IconInput({
  icon,
  title,
  ariaLabel,
  onClick,
  size = 32,
  disabled = false,
  className = "",
  style = {},
  pushUrlParamObj = false,
  pushValue = "1",
  toggle = true,
  multiUrlList = false,
  activeColor = "#1d4ed8",
  inactiveColor = "#555",
  onAction = null,
}) {
  const paramKey = pushUrlParamObj || null;
  const [active, setActive] = useState(() => {
    if (!paramKey) return false;
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const raw = params.get(paramKey);
    if (!raw) return false;
    if (multiUrlList) {
      const arr = raw.split(',').filter(Boolean);
      return arr.includes(String(pushValue));
    }
    return raw === String(pushValue);
  });

  // Auto-update active state when URL param changes
  useEffect(() => {
    if (!paramKey) return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get(paramKey);
      let nextActive = false;
      if (raw) {
        if (multiUrlList) {
          const arr = raw.split(',').filter(Boolean);
          nextActive = arr.includes(String(pushValue));
        } else {
          nextActive = raw === String(pushValue);
        }
      }
      setActive(nextActive);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
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
    window.addEventListener('pushState', syncFromUrl);
    window.addEventListener('replaceState', syncFromUrl);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener('pushState', syncFromUrl);
      window.removeEventListener('replaceState', syncFromUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey, multiUrlList, pushValue]);

  // (Removed effect-based initialization; using lazy useState instead to satisfy lint rule.)

  const updateUrl = useCallback((nextActive) => {
    if (!paramKey) return;
    const params = new URLSearchParams(window.location.search);
    const current = params.get(paramKey);
    if (multiUrlList) {
      let list = current ? current.split(",").filter(Boolean) : [];
      const idx = list.indexOf(String(pushValue));
      if (nextActive) {
        if (idx === -1) list.push(String(pushValue));
      } else {
        if (idx !== -1) list.splice(idx, 1);
      }
      if (list.length === 0) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, list.join(","));
      }
    } else {
      if (nextActive) {
        params.set(paramKey, String(pushValue));
      } else {
        if (toggle) {
          params.delete(paramKey);
        } else {
          // If not toggle, leave value as-is (or could clear)
          params.delete(paramKey);
        }
      }
    }
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);
  }, [paramKey, multiUrlList, pushValue, toggle]);

  const handleActivate = (e) => {
    if (disabled) return;
    let nextActive = active;
    if (toggle || multiUrlList) {
      nextActive = !active;
    } else {
      nextActive = true; // one-shot set
    }
    setActive(nextActive);
    updateUrl(nextActive);
    onClick?.(e, nextActive);
  };

  const handleKey = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate(e);
    }
  };

  const label = ariaLabel || title || (typeof icon === "string" ? icon : "icon button");
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    fontSize: Math.floor(size * 0.6),
    lineHeight: 1,
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: active ? "#e0f2fe" : "#f5f5f5",
    color: active ? activeColor : inactiveColor,
    transition: "background 120ms, color 120ms, box-shadow 120ms",
    boxShadow: active ? "0 0 0 2px rgba(29,78,216,0.3)" : "none",
    ...style,
  };

  return (
    <span
      role="button"
      aria-label={label}
      aria-pressed={toggle || multiUrlList ? active : undefined}
      tabIndex={disabled ? -1 : 0}
      title={title}
      onClick={onAction}
      onKeyDown={handleKey}
      className={`icon-input ${className}`.trim()}
      style={baseStyle}
      data-active={active ? "true" : "false"}
    >
      {icon}
    </span>
  );
}
