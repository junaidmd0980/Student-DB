import { useEffect, useRef, useState } from "react";

function EntityCardMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="entity-card-menu" ref={menuRef}>
      <button
        type="button"
        className="entity-card-menu__trigger"
        aria-label="Open actions"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        ⋮
      </button>

      {open && (
        <div className="entity-card-menu__dropdown">
          <button
            type="button"
            className="entity-card-menu__item"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
          >
            Edit
          </button>

          <button
            type="button"
            className="entity-card-menu__item entity-card-menu__item--danger"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default EntityCardMenu;