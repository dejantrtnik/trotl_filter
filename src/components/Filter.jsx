import React, { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import MultiSelectDropdown from "./MultiSelectDropdown";


import Modal from './Modal';

const Filters = ({ title, config = [], onChange, onAction, userRole = [], onExport, hideResetSearchButton, urSearchParams = false, extraSearchTerm, theme = "light" }) => {

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

  // Clear MultiSelectDropdown values if extraSearchTerm is set (input search used)
  useEffect(() => {
    if (!extraSearchTerm || !urSearchParams) return;
    // Find all multiselect filters and clear them
    config.forEach(item => {
      if (item.type === 'multiselect' && item.value && item.value.length > 0) {
        onChange?.(item.key, item.isMulti ? [] : '');
      }
    });
  }, [extraSearchTerm, urSearchParams]);

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
                        onChange={e => {
                          // If input search is used, clear all multiselects
                          if (urSearchParams && e.target.value) {
                            config.forEach(f => {
                              if (f.type === 'multiselect' && f.value && f.value.length > 0) {
                                onChange?.(f.key, f.isMulti ? [] : '');
                              }
                            });
                          }
                          onChange?.(item.key, e.target.value);
                        }}
                      />
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
                          // If multiselect is used, clear all input search fields
                          if (urSearchParams && newValues && newValues.length > 0) {
                            config.forEach(f => {
                              if (f.type === 'input' && f.value && f.value.length > 0) {
                                onChange?.(f.key, '');
                              }
                            });
                          }
                          onChange?.(item.key, item.isMulti ? newValues : newValues[0] || "");
                          if (urSearchParams) {
                            try {
                              const url = new URL(window.location.href);
                              // Combine all selected values from all MultiSelectDropdowns
                              let allSelected = [];
                              config.forEach(f => {
                                if (f.type === 'multiselect' && f.value) {
                                  if (Array.isArray(f.value)) {
                                    allSelected = allSelected.concat(f.value);
                                  } else if (f.value) {
                                    allSelected.push(f.value);
                                  }
                                }
                              });
                              // Also include the just-changed value (in case state is not yet updated)
                              if (Array.isArray(newValues)) {
                                allSelected = allSelected.filter(v => v !== undefined && v !== null && v !== '');
                                newValues.forEach(v => {
                                  if (v && !allSelected.includes(v)) allSelected.push(v);
                                });
                              }
                              const joined = allSelected.join(",");
                              if (joined && joined.length > 0) {
                                url.searchParams.set('search', joined);
                              } else {
                                url.searchParams.delete('search');
                              }
                              window.history.replaceState({}, '', url.toString());
                            } catch (e) {
                              // ignore
                            }
                          }
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
