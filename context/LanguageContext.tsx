import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['ar'];
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const savedLang = localStorage.getItem('tourloop_lang') as Language;
  const [language, setLanguageState] = useState<Language>(savedLang || 'ar');

  const setLanguage = (lang: Language) => {
      setLanguageState(lang);
      localStorage.setItem('tourloop_lang', lang);
  };

  useEffect(() => {
    const dir = translations[language].dir;
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
    dir: translations[language].dir as 'rtl' | 'ltr'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};