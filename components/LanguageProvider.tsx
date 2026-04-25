'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr' | 'de';

export const LANGUAGES: { code: Lang; label: string; flag: string; native: string }[] = [
  { code: 'ko', label: 'Korean',   flag: '🇰🇷', native: '한국어' },
  { code: 'en', label: 'English',  flag: '🇺🇸', native: 'English' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'zh', label: 'Chinese',  flag: '🇨🇳', native: '中文' },
  { code: 'es', label: 'Spanish',  flag: '🇪🇸', native: 'Español' },
  { code: 'fr', label: 'French',   flag: '🇫🇷', native: 'Français' },
  { code: 'de', label: 'German',   flag: '🇩🇪', native: 'Deutsch' },
];

type LangCtxType = { lang: Lang; setLang: (l: Lang) => void };

const LangCtx = createContext<LangCtxType>({ lang: 'ko', setLang: () => {} });

const VALID: Lang[] = ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de'];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');

  useEffect(() => {
    const stored = localStorage.getItem('plutos_lang') as Lang | null;
    if (stored && VALID.includes(stored)) {
      setLangState(stored);
      document.documentElement.setAttribute('data-lang', stored);
    }
  }, []);

  const setLang = (v: Lang) => {
    setLangState(v);
    localStorage.setItem('plutos_lang', v);
    document.documentElement.setAttribute('data-lang', v);
  };

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
