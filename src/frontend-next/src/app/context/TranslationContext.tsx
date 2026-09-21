'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type LocaleType = 'en' | 'hi' | 'hi-en' | 'ko';

interface TranslationContextType {
  locale: LocaleType;
  setLocale: (l: LocaleType) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslation must be used within TranslationProvider');
  return ctx;
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<LocaleType>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch(`/locales/${locale}.json`)
      .then(res => res.json())
      .then(data => setTranslations(data))
      .catch(err => console.error('Failed to load translations', err));
  }, [locale]);

  const t = useCallback((key: string): string => {
    if (!translations) return key;
    
    const parts = key.split('.');
    let current: any = translations;
    
    for (const part of parts) {
      if (current === undefined || current === null) return key;
      current = current[part];
    }
    
    return typeof current === 'string' ? current : key;
  }, [translations]);

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}
