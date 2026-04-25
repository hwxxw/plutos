'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'ko' | 'en';
type LangCtxType = { lang: Lang; setLang: (l: Lang) => void };

const LangCtx = createContext<LangCtxType>({ lang: 'ko', setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');

  useEffect(() => {
    const stored = localStorage.getItem('plutos_lang') as Lang | null;
    if (stored === 'en' || stored === 'ko') {
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
