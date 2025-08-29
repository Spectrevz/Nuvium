import { MultiSelect } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function getTranslatedCategories() {
  const { t } = useTranslation();
  const categoryItems = [
    { value: "documents", label: t("Documents") },
    { value: "images", label: t("Images") },
    { value: "audio", label: t("Audio") },
    { value: "video", label: t("Video") },
    { value: "code", label: t("Code") },
    { value: "archives", label: t("Archives") },
    { value: "others", label: t("Others") },
  ];
  return categoryItems;
}

export default function CategorySelector() {
  const [categoryValue, setCategoryValue] = useState<string[]>([]);
  const { t, i18n } = useTranslation();
  const categoryItems = getTranslatedCategories();

  return (
    <MultiSelect
      data={categoryItems}
      value={categoryValue}
      onChange={setCategoryValue}
      label=" "
      placeholder={t("Category")}

      maxDropdownHeight={160}
      comboboxProps={{ withinPortal: false, position: "right" }}
      styles={{
      input: { backgroundColor: "transparent" },
      }}
    searchable      
    clearable
    />
  );
}
