import { MultiSelect } from "@mantine/core";
import { useState } from "react";

const categoryItems = [
  { value: "spain", label: "Spain"},
  { value: "madrid", label: "Madrid"},
  { value: "barcelona", label: "Barcelona"},
  { value: "italy", label: "Italy"},
  { value: "rome", label: "Rome"},
  { value: "finland", label: "Finland"},
];

// Props para o componente que renderiza os valores selecionados
interface ColorDotValueProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export default function CategorySelector() {
  const [categoryValue, setCategoryValue] = useState<string[]>([]);

  return (
    <MultiSelect
      data={categoryItems}
      value={categoryValue}
      onChange={setCategoryValue}
      label=" "
      placeholder="Categories"

      maxDropdownHeight={160}
      comboboxProps={{ withinPortal: false }}
      styles={{
      input: { backgroundColor: "transparent" },

      }}
    searchable      
    clearable
    />
  );
}
