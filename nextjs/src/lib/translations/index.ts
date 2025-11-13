"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { en, type Translation } from "./en";
import { km } from "./km";

type Language = "en" | "km"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translation
}

const translations = { en, km }

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const value = {
    language,
    setLanguage,
    t: translations[language],
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider")
  }
  return context
}
