import { useLanguage } from "@/contexts/LanguageContext";
import enTranslations from "@/translations/en";
import kmTranslations from "@/translations/km";

type TranslationKey = keyof typeof enTranslations;
type NestedTranslationKey = string;

const translations = {
  en: enTranslations,
  km: kmTranslations,
};

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): string | undefined {
  // Robust null/undefined check
  if (path === null || path === undefined || typeof path !== 'string' || path.trim() === '') {
    return undefined;
  }
  
  try {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  } catch (error) {
    console.warn(`Error getting nested value for path "${path}":`, error);
    return undefined;
  }
}

// Helper function to interpolate variables in translation strings
function interpolate(template: string, variables: Record<string, string | number> = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: NestedTranslationKey, variables?: Record<string, string | number>): string => {
    // Handle null, undefined, or empty keys
    if (key === null || key === undefined || typeof key !== 'string' || key.trim() === '') {
      console.warn(`Invalid translation key provided: ${key}`);
      return String(key || '');
    }

    const currentTranslations = translations[language];
    
    // Try to get the translation from current language
    let translation = getNestedValue(currentTranslations, key);
    
    // Fallback to English if translation not found
    if (translation === undefined && language !== 'en') {
      translation = getNestedValue(translations.en, key);
    }
    
    // Final fallback to the key itself if no translation found
    if (translation === undefined) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    // Interpolate variables if provided
    if (variables) {
      return interpolate(translation, variables);
    }
    
    return translation;
  };

  return { t, language };
}

export type { TranslationKey, NestedTranslationKey };