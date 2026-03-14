import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
} from "react";

/**
 * Option type definition.
 * Keep this explicit so component can be extended to generic later.
 */
type Option = {
  label: string;
  value: number;
};

/**
 * Static dataset kept outside component
 * so it is not recreated on every render.
 */
const dropdownOptions: Option[] = [
  { label: "Apple", value: 1 },
  { label: "Banana", value: 2 },
  { label: "Cherry", value: 3 },
  { label: "Date", value: 4 },
  { label: "Elderberry", value: 5 },
];

export default function Autocomplete() {
  /**
   * Container ref used for:
   * - Outside click detection
   */
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Array of refs for options.
   * Used to scroll highlighted option into view.
   */
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  /**
   * Controlled input value
   */
  const [inputValue, setInputValue] = useState("");

  /**
   * Controls dropdown visibility
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Tracks currently highlighted option (keyboard navigation)
   * -1 means nothing is selected
   */
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  /**
   * ID for ARIA linking between input and listbox
   */
  const listboxId = "autocomplete-listbox";

  /**
   * Memoized filtered options
   * Prevents unnecessary recalculations on re-render.
   */
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return dropdownOptions;

    return dropdownOptions.filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue]);

  /**
   * Close dropdown when clicking outside component.
   * This avoids fragile onBlur hacks.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Automatically scroll highlighted option into view
   * Improves keyboard navigation UX.
   */
  useEffect(() => {
    if (highlightedIndex >= 0) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  /**
   * Handles selecting an option.
   * Resets highlight and closes dropdown.
   */
  const handleSelect = (label: string) => {
    setInputValue(label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  /**
   * Keyboard navigation handler
   *
   * Supports:
   * - ArrowDown
   * - ArrowUp
   * - Enter
   * - Escape
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredOptions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);

        // Move highlight down (wrap to start)
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();

        // Move highlight up (wrap to end)
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case "Enter":
        // Select currently highlighted option
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex].label);
        }
        break;

      case "Escape":
        // Close dropdown
        setIsOpen(false);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ width: 250, position: "relative" }}
    >
      {/* 
        Proper label association for accessibility.
        Screen readers will announce this label.
      */}
      <label htmlFor="autocomplete-input">Choose a fruit</label>

      <input
        id="autocomplete-input"
        type="text"

        /**
         * ARIA Combobox Pattern
         */
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          highlightedIndex >= 0
            ? `option-${highlightedIndex}`
            : undefined
        }

        value={inputValue}

        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}

        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}

        style={{
          width: "100%",
          padding: "8px",
          boxSizing: "border-box",
        }}
      />

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          style={{
            position: "absolute",
            width: "100%",
            border: "1px solid #ccc",
            background: "white",
            maxHeight: 180,
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          {filteredOptions.length === 0 ? (
            /**
             * Empty state when no matches found
             */
            <div style={{ padding: 8, color: "#888" }}>
              No results found
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                /**
                 * Each option needs:
                 * - unique id (for aria-activedescendant)
                 * - role="option"
                 * - aria-selected
                 */
                id={`option-${index}`}
                key={option.value}
                ref={(el) => (optionRefs.current[index] = el)}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseDown={() => handleSelect(option.label)}
                style={{
                  padding: 8,
                  cursor: "pointer",
                  background:
                    index === highlightedIndex
                      ? "#e6f0ff"
                      : "white",
                }}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}