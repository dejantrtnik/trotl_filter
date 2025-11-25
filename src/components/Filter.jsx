import React, { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import MultiSelectDropdown from "./MultiSelectDropdown";


import Modal from './Modal';

const Filters = ({ title, config = [], onChange, onAction, userRole = [], onExport, hideResetSearchButton, urSearchParams = false, extraSearchTerm }) => {

  // const { theme, internalSort, context } = useAuth();

  console.log(extraSearchTerm)
  // Simple translation stub: return mapped key or the key itself.
  const _translations = {
    showFilters: 'showFilters',
    hideFilters: 'hideFilters',
    resetSorting: 'resetSorting',
    resetSearching: 'resetSearching',
    role: 'role',
    confirmTitle: 'confirmTitle',
    confirm: 'confirm',
    cancel: 'cancel',
    confirmUnknown: 'confirmUnknown'
  };

  // t(key) returns the translation (here same as key). Calling t() with no args
  // returns an empty string to avoid accidentally rendering the translations object.
  const t = (key) => {
    if (typeof key === 'undefined' || key === null) return '';
    return _translations[key] ?? key;
  };
  const [sorting, setSorting] = useState(null)
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('filtersCollapsed');
    return stored === 'true';
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    label: '',
    key: '',
    onConfirm: null
  });

  useEffect(() => {
    localStorage.setItem('filtersCollapsed', collapsed);
  }, [collapsed]);

  // useEffect(() => {
  //   setSorting(internalSort)
  // }, [internalSort]);

  const handleReset = () => {
    config.forEach(item => {
      if (item.type !== 'button' && item.type !== 'icon') {
        onChange?.(item.key, item.defaultValue || '');
      }
    });
    localStorage.removeItem('adminFilters');
    window.history.replaceState({}, '', window.location.pathname);
  };


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const savedFilters = localStorage.getItem('adminFilters');
    const initial = savedFilters ? JSON.parse(savedFilters) : {};

    urlParams.forEach((value, key) => {
      if (key === 'roles') {
        initial[key] = urlParams.getAll('roles');
      } else {
        initial[key] = value;
      }
    });

    Object.entries(initial).forEach(([key, value]) => {
      onChange?.(key, value);
    });
  }, []);

  useEffect(() => {
    const savedFilters = localStorage.getItem('adminFilters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      Object.entries(parsed).forEach(([key, value]) => {
        onChange?.(key, value);
      });
    }
  }, []);

  useEffect(() => {
    const currentValues = {};
    config.forEach(item => {
      if (item.type !== 'button' && item.type !== 'icon') {
        currentValues[item.key] = item.value;
      }
    });
    localStorage.setItem('adminFilters', JSON.stringify(currentValues));
  }, [config]);

  const openConfirmModal = (label, key, actionFn) => {
    setModalState({
      isOpen: true,
      label,
      key,
      onConfirm: () => {
        actionFn(key);
        setModalState({ isOpen: false, label: '', key: '', onConfirm: null });
      }
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, label: '', key: '', onConfirm: null });
  };

  const sortingLocalStorage = localStorage.getItem("tableSort")

  // When urSearchParams is enabled, keep the URL search param `search`
  // in sync with the extraSearchTerm prop without reloading the page.
  useEffect(() => {
    if (!urSearchParams) return;
    try {
      const url = new URL(window.location.href);
      if (extraSearchTerm && String(extraSearchTerm).length > 0) {
        url.searchParams.set('search', String(extraSearchTerm));
      } else {
        url.searchParams.delete('search');
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // fallback: do nothing if URL constructor fails (very unlikely in browsers)
    }
  }, [urSearchParams, extraSearchTerm]);

  return (
    <>
      <div className="filters-wrapper">
        <div className="filters-header">
          <div className="filters-title">{title}</div>

          <button className="basic-button" onClick={() => setCollapsed(prev => !prev)}>
            {collapsed ? ' ' + t("showFilters") : ' ' + t("hideFilters")}
          </button>

          {sortingLocalStorage && (
            <button
              className="basic-button confirm"
              onClick={() => {
                setSorting(false);
                context("resetSortingTrigger", true);
                localStorage.removeItem("tableSort");
                window.dispatchEvent(new Event("storageUpdated"));
              }}
            >
              {t("resetSorting") + " " + (sorting || "")}
            </button>
          )}

          {!hideResetSearchButton && <button className="basic-button" onClick={handleReset}>
            {t("resetSearching")}
          </button>}
        </div>

        {!collapsed && (
          <div className="filters-container">
            {config.map((item, index) => {
              const tooltip = item.tooltip || '';
              const roleAllowed = !item.role || userRole.some(r => item.role.includes(r));
              if (!roleAllowed) return null;

              switch (item.type) {
                case 'group':
                  return (
                    <div key={index} className="button-group" title={item.label}>
                      {item.buttons.map((btn, i) => {
                        const actionFn = btn.onAction || onAction;
                        if (!actionFn) return null;

                        const handleClick = () => {
                          if (btn.confirm) {
                            openConfirmModal(btn.label, btn.key, actionFn);
                          } else {
                            actionFn(btn.key);
                          }
                        };

                        return (
                          <button
                            className="basic-button"
                            key={i}
                            onClick={handleClick}
                            title={btn.tooltip || btn.label}
                          >
                            {t(btn.label)}
                          </button>
                        );
                      })}
                    </div>
                  );

                case 'input':
                  return (
                    <div key={index} className="filter-input-wrapper" title={tooltip}>
                      <input
                        className="basic-input"
                        type="search"
                        placeholder={item.placeholder || ''}
                        value={item.value || ''}
                        onChange={e => onChange?.(item.key, e.target.value)}
                      />

                      {/*
                      {item.value && (
                        <span
                          className="input-clear"
                          onClick={() => onChange?.(item.key, '')}
                          title="Clear input"
                        >
                          ✖️
                        </span>
                      )}
                      */}
                    </div>
                  );

                case 'select':
                  return (
                    <select
                      key={index}
                      value={item.value || ''}
                      onChange={e => onChange?.(item.key, e.target.value)}
                      className="filter-select"
                      title={tooltip}
                    >
                      {item.options?.map((opt, i) => (
                        <option key={i} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );

                case 'multiselect':
                  return (
                    <div key={index} className="filter-multiselect" title={tooltip}>
                      <MultiSelectDropdown
                        label={item.label || t("role")}
                        selected={Array.isArray(item.value) ? item.value : item.value ? [item.value] : []}
                        onChange={(newValues) => {
                          onChange?.(item.key, item.isMulti ? newValues : newValues[0] || "");
                        }}
                        required={item.required}
                        isMulti={item.isMulti}
                        theme={theme}
                        fetchOptions={item.fetchOptions}
                        options={item.options}
                      />
                    </div>
                  );

                case 'date':
                  return (
                    <div key={index} className="filter-date" title={tooltip}>
                      <input
                        className="basic-input"
                        type={item.addTime ? 'datetime-local' : 'date'}
                        value={item.value || ''}
                        onChange={e => onChange?.(item.key, e.target.value)}
                      />
                      {item.value && (
                        <span
                          className="date-clear"
                          onClick={() => onChange?.(item.key, '')}
                          title="Clear date"
                        >
                          ✖️
                        </span>
                      )}
                    </div>
                  );

                case 'button':
                  return (
                    <button
                      style={item?.style}
                      className="basic-button"
                      key={index}
                      onClick={() => {
                        const actionFn = item.onAction || onAction;
                        if (!actionFn) return;
                        if (item.confirm) {
                          openConfirmModal(item.label, item.key, actionFn);
                        } else {
                          actionFn(item.key);
                        }
                      }}
                      title={tooltip}
                    >
                      {t(item.label)}
                    </button>
                  );

                case 'icon':
                  return (
                    <span
                      key={index}
                      className={`filter-icon ${item.className || ''}`}
                      style={item.style}
                      onClick={() => onAction?.(item.key)}
                      title={tooltip}
                    >
                      {item.icon}
                    </span>
                  );

                default:
                  return null;
              }
            })}
          </div>
        )}
      </div>

      {/* ✅ Modal confirmation */}
      <Modal
        isOpen={modalState.isOpen}
        title={t("confirmTitle") || "Confirm"}
        onCancel={closeModal}
        onConfirm={modalState.onConfirm}
        showCancel
        showConfirm
        confirmLabel={t("confirm") || "Confirm"}
        cancelLabel={t("cancel") || "Cancel"}
      >
        {t("confirmUnknown")} {modalState.label}?
      </Modal>
    </>
  );
};

export default Filters;
