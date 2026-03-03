import { useEffect, useMemo, useState } from "react";
import "./styles.css";

const dropdownOptions = [
  { label: "first", value: 1 },
  { label: "seconds", value: 2 },
  { label: "third", value: 3 },
];

export default function BasicAutocomplete() {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [showDropdownList, setShowDropdownList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);


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
 

  const handleSelectOption = (option: string) => {
    setValue(option);
    setShowDropdownList(false);
    setHighlightedIndex(-1);
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