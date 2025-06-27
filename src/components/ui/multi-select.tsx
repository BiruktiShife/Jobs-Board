import React from "react";
import Select from "react-select";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const handleChange = (selectedOptions: any) => {
    const values = selectedOptions
      ? selectedOptions.map((option: any) => option.value)
      : [];
    onChange(values);
  };

  return (
    <Select
      isMulti
      options={options}
      value={options.filter((option) => selected.includes(option.value))}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      classNamePrefix="react-select"
      menuPlacement="top"
      styles={{
        control: (base) => ({
          ...base,
          borderColor: "#d1d5db",
          "&:hover": { borderColor: "#10b981" },
          boxShadow: "none",
          "&:focus-within": {
            borderColor: "#10b981",
            boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
          },
          minHeight: "40px",
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected
            ? "#d1fae5"
            : isFocused
              ? "#f0fdf4"
              : "white",
          color: "black",
          padding: "8px 12px",
          cursor: "pointer",
          "&:active": { backgroundColor: "#d1fae5" },
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "white",
          maxHeight: "150px",
          overflowY: "auto",
          border: "none",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          borderRadius: "4px",
          zIndex: 9999,
          marginBottom: "4px",
          marginTop: 0,
          bottom: "100%",
          top: "auto",
        }),
        menuList: (base) => ({
          ...base,
          maxHeight: "150px",
          overflowY: "auto",
          padding: "4px 0",
          "::-webkit-scrollbar": {
            width: "0px",
            background: "transparent",
          },
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
        }),
      }}
    />
  );
}
