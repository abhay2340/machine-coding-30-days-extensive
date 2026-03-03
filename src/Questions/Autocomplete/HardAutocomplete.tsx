import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
} from "react";

type Option = {
  label: string;
  value: number;
};

const dropdownOptions: Option[] = [
  { label: "Apple", value: 1 },
  { label: "Banana", value: 2 },
  { label: "Cherry", value: 3 },
  { label: "Date", value: 4 },
  { label: "Elderberry", value: 5 },
];

export default function Autocomplete() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const listboxId = "autocomplete-listbox";

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return dropdownOptions;

    return dropdownOptions.filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue]);

  // Close on outside click
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

  // Scroll active option
  useEffect(() => {
    if (highlightedIndex >= 0) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  const handleSelect = (label: string) => {
    setInputValue(label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredOptions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case "Enter":
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex].label);
        }
        break;

      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ width: 250, position: "relative" }}
    >
      <label htmlFor="autocomplete-input">Choose a fruit</label>

      <input
        id="autocomplete-input"
        type="text"
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
            <div
              style={{ padding: 8, color: "#888" }}
            >
              No results found
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
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