import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

const dropdownOptions = [
  { label: "Apple", value: 1 },
  { label: "Banana", value: 2 },
  { label: "Cherry", value: 3 },
  { label: "Date", value: 4 },
  { label: "Elderberry", value: 5 },
  { label: "Fig", value: 6 },
  { label: "Grapes", value: 7 },
  { label: "Honeydew", value: 8 },
  { label: "Indian Fig", value: 9 },
  { label: "Jackfruit", value: 10 },
  { label: "Kiwi", value: 11 },
  { label: "Lemon", value: 12 },
  { label: "Mango", value: 13 },
  { label: "Nectarine", value: 14 },
  { label: "Orange", value: 15 },
  { label: "Papaya", value: 16 },
  { label: "Quince", value: 17 },
  { label: "Raspberry", value: 18 },
  { label: "Strawberry", value: 19 },
  { label: "Watermelon", value: 20 },
];

export default function MediumAutocomplete() {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [showDropdownList, setShowDropdownList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const optionRefs = useRef<HTMLParagraphElement[]|null>([]);

  // Debounce input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value]);

  // Filter list
  const dropdownList = useMemo(() => {
    if (!debouncedValue.trim()) return dropdownOptions;
    return dropdownOptions.filter((opt) =>
      opt.label.toLowerCase().includes(debouncedValue.toLowerCase())
    );
  }, [debouncedValue]);

 

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  const handleSelectOption = (option: string) => {
    setValue(option);
    setShowDropdownList(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownList.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < dropdownList.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : dropdownList.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectOption(dropdownList[highlightedIndex].label);
        }
        break;

      case "Escape":
        setShowDropdownList(false);
        break;
    }
  };

  return (
    <div
      style={{ position: "relative", width: "200px" }}
      tabIndex={0}
      onBlur={() => setShowDropdownList(false)}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setShowDropdownList(true);
        }}
        onFocus={() => setShowDropdownList(true)}
        onKeyDown={handleKeyDown}
        style={{ width: "100%", padding: "6px" }}
      />

      {showDropdownList && dropdownList.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid black",
            maxHeight: "150px",
            overflowY: "auto",
            background: "white",
            position: "absolute",
            width: "100%",
            zIndex: 10,
          }}
        >
          {dropdownList.map((option, index) => (
            <p
              key={option.value}
              ref={(el) => (optionRefs.current[index] = el)}
              onMouseDown={() => handleSelectOption(option.label)}
              style={{
                margin: 0,
                padding: "8px",
                cursor: "pointer",
                backgroundColor:
                  index === highlightedIndex ? "#e0e0e0" : "white",
              }}
            >
              {option.label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}