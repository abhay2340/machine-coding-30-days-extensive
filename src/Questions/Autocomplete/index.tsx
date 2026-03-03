import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

const dropdownOptions = [
  { label: "first", value: 1 },
  { label: "seconds", value: 2 },
  { label: "thirdsssa", value: 3 },  { label: "first", value: 1 },
  { label: "secondss", value: 2 },
  { label: "thirds", value: 3 },  { label: "first", value: 1 },
  { label: "seconds", value: 2 },
  { label: "thirdsss", value: 3 },
];

export default function Autocomplete() {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [showDropdownList, setShowDropdownList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const optionRefs = useRef<(HTMLParagraphElement | null)[]>([]);

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