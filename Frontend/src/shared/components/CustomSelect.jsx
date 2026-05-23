import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

function CustomSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  disabled = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const normalizedOptions = useMemo(() => {
    return options.map((option) => {
      if (typeof option === "string") {
        return { label: option, value: option };
      }

      return {
        label: option.label ?? option.name ?? "",
        value: option.value ?? option._id ?? option.id ?? "",
      };
    });
  }, [options]);

  const selectedOption = normalizedOptions.find(
    (option) => String(option.value) === String(value)
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      return;
    }

    const selectedIndex = normalizedOptions.findIndex(
      (option) => String(option.value) === String(value)
    );

    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, normalizedOptions, value]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;

    const activeItem = listRef.current.querySelector(
      `[data-index="${highlightedIndex}"]`
    );

    activeItem?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  const emitChange = (nextValue) => {
    if (!onChange) return;

    onChange({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  const handleSelect = (optionValue) => {
    emitChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (!isOpen && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev < normalizedOptions.length - 1 ? prev + 1 : 0
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : normalizedOptions.length - 1
      );
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (highlightedIndex >= 0 && normalizedOptions[highlightedIndex]) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      }
    }
  };

  return (
    <div
      className={`custom-select ${disabled ? "is-disabled" : ""} ${className}`}
      ref={wrapperRef}
    >
      <button
        type="button"
        className={`custom-select__trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className={`custom-select__value ${!selectedOption ? "is-placeholder" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown size={18} className="custom-select__icon" />
      </button>

      {isOpen && (
        <div className="custom-select__dropdown">
          <ul className="custom-select__list" role="listbox" ref={listRef}>
            {normalizedOptions.length > 0 ? (
              normalizedOptions.map((option, index) => {
                const isSelected = String(option.value) === String(value);
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={`${option.value}-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    className={`custom-select__option ${
                      isSelected ? "is-selected" : ""
                    } ${isHighlighted ? "is-highlighted" : ""}`}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span>{option.label}</span>
                    {isSelected ? <Check size={16} /> : null}
                  </li>
                );
              })
            ) : (
              <li className="custom-select__empty">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CustomSelect;