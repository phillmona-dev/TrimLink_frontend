"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/button";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const next = i18n.language.startsWith("am") ? "en" : "am";

  return (
    <Button variant="outline" size="icon" onClick={() => void i18n.changeLanguage(next)}>
      <Languages className="h-4 w-4" />
    </Button>
  );
}
