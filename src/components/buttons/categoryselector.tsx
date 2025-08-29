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
    <div style={{ display: "flex", justifyContent: "left" }}>
          <MultiSelect
      data={categoryItems}
      value={categoryValue}
      onChange={setCategoryValue}
      label=" "
      placeholder={t("Category")}
      
      maxDropdownHeight={160}
      comboboxProps={{ withinPortal: false, position: "right" }}
      styles={{
      input: { 
        backgroundColor: "#13141aff",
        borderRadius: "12px",
        width: "100%",
        paddingLeft: "0.75rem",
        marginLeft: "-12px",
        marginRight: "-39px",
        fontSize: "14px",
        letterSpacing: "0.5px",
        textAlign: "left",
        paddingRight: "58px"
      },
      }}
    searchable      
    clearable
    />
    </div>

  );
}
