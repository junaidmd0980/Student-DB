import { useEffect, useMemo, useRef } from "react";

function EntityFormModal({
  open,
  mode,
  entity,
  value,
  contextLabel,
  onChange,
  onClose,
  onSubmit,
  loading,
}) {
  const inputRef = useRef(null);
  const closeButtonRef = useRef(null);

  const config = useMemo(() => {
    const map = {
      department: {
        title: mode === "edit" ? "Edit Department" : "Create Department",
        label: "Department Name",
        placeholder: "Enter department name",
        submitLabel: mode === "edit" ? "Save Department" : "Create Department",
      },
      batch: {
        title: mode === "edit" ? "Edit Batch" : "Create Batch",
        label: "Batch Name",
        placeholder: "Enter batch name",
        submitLabel: mode === "edit" ? "Save Batch" : "Create Batch",
      },
      section: {
        title: mode === "edit" ? "Edit Section" : "Create Section",
        label: "Section Name",
        placeholder: "Enter section name",
        submitLabel: mode === "edit" ? "Save Section" : "Create Section",
      },
    };

    return map[entity] || {};
  }, [entity, mode]);

  useEffect(() => {
    if (!open) return;

    const previousActive = document.activeElement;
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
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
  }, [open, onClose]);

  if (!open) return null;

  const isDisabled = !value?.trim() || loading;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="entity-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-modal-title"
        aria-describedby="entity-modal-description"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="entity-modal__header">
          <div>
            <h2 id="entity-modal-title" className="entity-modal__title">
              {config.title}
            </h2>
            <p id="entity-modal-description" className="entity-modal__description">
              {contextLabel || "Add a name and save your changes."}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="entity-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isDisabled) onSubmit();
          }}
        >
          <div className="form-group">
            <label htmlFor="entityName">{config.label}</label>
            <input
              ref={inputRef}
              id="entityName"
              type="text"
              value={value}
              placeholder={config.placeholder}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>

          <div className="entity-modal__actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={isDisabled}
            >
              {loading ? "Saving..." : config.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EntityFormModal;