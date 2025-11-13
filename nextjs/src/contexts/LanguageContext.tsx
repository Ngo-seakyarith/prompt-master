"use client"

import { createContext, useContext, useState } from "react";

export type Language = "en" | "km";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize from localStorage on mount
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("app-language") as Language;
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "km")) {
        return savedLanguage;
      }
    }
    return "en";
  });

  // Update document language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("app-language", newLanguage);
    document.documentElement.lang = newLanguage;
  };

  // Determine if language is right-to-left (RTL)
  const isRTL = language === "km"; // Khmer is written left-to-right, but we may need this for future languages

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
