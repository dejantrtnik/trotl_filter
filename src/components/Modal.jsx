import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  title = 'Confirm',
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  showCancel = false,
  showConfirm = false,
  closeOnEscape = true,
  closeOnOutsideClick = true
}) => {
  const t = {}
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onCancel?.();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeOnEscape, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeOnOutsideClick ? onCancel : undefined}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <div className="modal-content">{children}</div>
        <div className="modal-actions">
          {showCancel && (
            <button className="basic-button cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          {showConfirm && <button className="basic-button confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>}
        </div>
      </div>
    </div>
  );
};

export default Modal;
