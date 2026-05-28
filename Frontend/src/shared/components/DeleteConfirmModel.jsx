import { useEffect, useMemo, useRef, useState } from "react";

function DeleteConfirmModal({
  open,
  entity,
  item,
  loading = false,
  onClose,
  onConfirm,
  title,
  description,
  warning,
  confirmLabel,
  cancelLabel,
  confirmKeyword,
  requireTypedConfirm,
}) {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef(null);
  const cancelButtonRef = useRef(null);

  const config = useMemo(() => {
    const itemName =
      item?.name ||
      item?.fullName ||
      item?.title ||
      item?.label ||
      "this item";

    const isDepartment = entity === "department";
    const isBatch = entity === "batch";
    const isSection = entity === "section";
    const isStudent = entity === "student";
    const isLabSession = entity === "lab-session"
    const isAttendence = entity === "attendence"
    
    const needsTypedConfirm =
      typeof requireTypedConfirm === "boolean"
        ? requireTypedConfirm
        : isDepartment || isBatch || isSection || isStudent || isLabSession;

    return {
      itemName,
      title:
        title ||
        (isDepartment
          ? "Delete Department"
          : isBatch
          ? "Delete Batch"
          : isSection
          ? "Delete Section"
          : isStudent
          ? "Delete Student"
          : isLabSession
          ? "Delete Lab Session"
          : isAttendence
          ? "Delete Attendence"
          : "Delete Item"),
      description:
        description || `You are about to delete ${itemName}.`,
      warning:
        warning ||
        (isDepartment
          ? "Deleting this department will also delete all batches and sections inside it."
          : isBatch
          ? "Deleting this batch will also delete all sections inside it."
          : isSection
          ? "This action will permanently delete this section only."
          : isStudent
          ? "This action will permanently delete this student record."
          : isLabSession
          ? "Deleting this lab session will also delete all attendance records linked to it."
          : isAttendence
          ? "This action will permanently remove this attendance entry."
          : "This action cannot be undone."),
      confirmLabel:
        confirmLabel ||
        (isDepartment
          ? "Delete Department"
          : isBatch
          ? "Delete Batch"
          : isSection
          ? "Delete Section"
          : isStudent
          ? "Delete Student"
          : isLabSession
          ? "Delete Lab Session"
          : isAttendence
          ? "Delete Attendence"
          : "Delete Item"),
      cancelLabel:
        cancelLabel ||
        (isDepartment
          ? "Keep Department"
          : isBatch
          ? "Keep Batch"
          : isSection
          ? "Keep Section"
          : isStudent
          ? "Keep Student"
          : isLabSession
          ? "Keep Lab Session"
          : isAttendence
          ? "Keep Attendence"
          : "Cancel"),
      requireTypedConfirm: needsTypedConfirm,
      confirmKeyword: confirmKeyword || itemName,
    };
  }, [
    entity,
    item,
    title,
    description,
    warning,
    confirmLabel,
    cancelLabel,
    confirmKeyword,
    requireTypedConfirm,
  ]);

  useEffect(() => {
    if (!open) {
      setConfirmText("");
      return;
    }

    const previousActiveElement = document.activeElement;

    const timer = setTimeout(() => {
      if (config.requireTypedConfirm) {
        inputRef.current?.focus();
      } else {
        cancelButtonRef.current?.focus();
      }
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [open, onClose, loading, config.requireTypedConfirm]);

  if (!open || !item) return null;

  const normalizedInput = confirmText.trim();
  const normalizedKeyword = (config.confirmKeyword || "").trim();

  const canConfirm = config.requireTypedConfirm
    ? normalizedInput === normalizedKeyword
    : true;

  return (
    <div className="modal-backdrop" onClick={!loading ? onClose : undefined}>
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

        <div className="delete-modal__content">
          <h2 id="delete-modal-title" className="delete-modal__title">
            {config.title}
          </h2>

          <p id="delete-modal-description" className="delete-modal__text">
            {config.description}
          </p>

          <p className="delete-modal__warning">{config.warning}</p>

          {config.requireTypedConfirm && (
            <div className="form-group">
              <label htmlFor="delete-confirm-input" className="form-label">
                Type <strong>{config.confirmKeyword}</strong> to continue
              </label>

              <input
                ref={inputRef}
                id="delete-confirm-input"
                type="text"
                className="form-input"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type ${config.confirmKeyword}`}
                autoComplete="off"
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="delete-modal__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="secondary-btn"
            onClick={onClose}
            disabled={loading}
          >
            {config.cancelLabel}
          </button>

          <button
            type="button"
            className="danger-btn"
            onClick={onConfirm}
            disabled={!canConfirm || loading}
          >
            {loading ? "Deleting..." : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;