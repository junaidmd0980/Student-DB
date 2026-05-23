import { useEffect, useMemo, useRef, useState } from "react";

function DeleteConfirmModal({
  open,
  entity,
  item,
  loading,
  onClose,
  onConfirm,
}) {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef(null);

  const config = useMemo(() => {
    const isDepartment = entity === "department";
    const isBatch = entity === "batch";
    const requiresTypedConfirm = isDepartment || isBatch;

    return {
      title: isDepartment
        ? "Delete Department"
        : isBatch
        ? "Delete Batch"
        : "Delete Section",
      warning: isDepartment
        ? "Deleting this department will also delete all batches and sections inside it."
        : isBatch
        ? "Deleting this batch will also delete all sections inside it."
        : "This action will permanently delete this section only.",
      buttonLabel: isDepartment
        ? "Delete Department"
        : isBatch
        ? "Delete Batch"
        : "Delete Section",
      keepLabel: isDepartment
        ? "Keep Department"
        : isBatch
        ? "Keep Batch"
        : "Keep Section",
      requiresTypedConfirm,
    };
  }, [entity]);

  useEffect(() => {
    if (!open) {
      setConfirmText("");
      return;
    }

    const previousActive = document.activeElement;
    const timeout = setTimeout(() => {
      if (config.requiresTypedConfirm) {
        inputRef.current?.focus();
      }
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", handleKeyDown);
      previousActive?.focus?.();
    };
  }, [open, onClose, config.requiresTypedConfirm]);

  if (!open || !item) return null;

  const canConfirm = config.requiresTypedConfirm
    ? confirmText.trim() === item.name
    : true;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="delete-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-modal__icon" aria-hidden="true">
          !
        </div>

        <h2 id="delete-modal-title" className="delete-modal__title">
          {config.title}
        </h2>

        <p id="delete-modal-description" className="delete-modal__text">
          You are about to delete <strong>{item.name}</strong>.
        </p>

        <p className="delete-modal__warning">{config.warning}</p>

        {config.requiresTypedConfirm && (
          <div className="form-group">
            <label htmlFor="deleteConfirmInput">
              Type <strong>{item.name}</strong> to continue
            </label>
            <input
              ref={inputRef}
              id="deleteConfirmInput"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type ${item.name}`}
            />
          </div>
        )}

        <div className="delete-modal__actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
          >
            {config.keepLabel}
          </button>

          <button
            type="button"
            className="danger-btn"
            onClick={onConfirm}
            disabled={!canConfirm || loading}
          >
            {loading ? "Deleting..." : config.buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;