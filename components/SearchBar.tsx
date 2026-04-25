'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PublicApp } from '@/lib/supabase/types';
import { useLang } from './LanguageProvider';

const PLACEHOLDER: Record<string, string> = {
  ko: '앱 검색 — "이메일 자동화", "데이터 분석" 등 자유롭게',
  en: 'Search apps — "email automation", "data analysis" and more',
  ja: 'アプリ検索 — "メール自動化"、"データ分析" など自由に',
  zh: '搜索应用 — "邮件自动化"、"数据分析" 等',
  es: 'Buscar apps — "automatización de email", "análisis de datos"...',
  fr: 'Rechercher des apps — "automatisation email", "analyse données"...',
  de: 'Apps suchen — "E-Mail-Automatisierung", "Datenanalyse" u.v.m.',
};

type Props = {
  onResults: (results: PublicApp[] | null) => void;
  onSearching: (b: boolean) => void;
  onClear: () => void;
};

export function SearchBar({ onResults, onSearching, onClear }: Props) {
  const { lang } = useLang();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [pending, setPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) { onResults(null); onSearching(false); return; }
      onSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        onResults(data.apps || []);
      } catch {
        onResults([]);
      } finally {
        onSearching(false);
      }
    },
    [onResults, onSearching]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setPending(false); onClear(); return; }
    setPending(true);
    timerRef.current = setTimeout(() => { setPending(false); search(val); }, 480);
  };

  const handleClear = () => { setQuery(''); setPending(false); onClear(); };

  return (
    <motion.div
      animate={{
        boxShadow: focused
          ? '0 0 0 1px #660000, 0 0 24px rgba(102,0,0,0.25)'
          : '0 0 0 1px #2a1515',
      }}
      transition={{ duration: 0.2 }}
      className="relative rounded-xl overflow-hidden"
      style={{ backgroundColor: '#120a0e' }}
    >
      <div className="flex items-center px-5 py-3.5 gap-4">
        {/* Search icon */}
        <motion.div
          animate={{ color: focused ? '#cc1a1a' : '#3a2828' }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </motion.div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={PLACEHOLDER[lang] ?? PLACEHOLDER.en}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{
            color: '#f0ece4',
            fontFamily: "'IBM Plex Sans KR', 'Space Grotesk', sans-serif",
            fontWeight: 300,
          }}
        />

        {/* Clear button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={handleClear}
              className="flex-shrink-0 transition-colors"
              style={{ color: '#3a2828' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#f0ece4')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#3a2828')}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* pending mini spinner */}
        <AnimatePresence>
          {pending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="flex-shrink-0 w-4 h-4 rounded-full border border-t-transparent"
              style={{ borderColor: '#660000', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }}
            />
          )}
        </AnimatePresence>

        {/* AI badge */}
        <motion.div
          animate={{ opacity: focused ? 1 : 0.4 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-[9px] font-semibold tracking-widest px-2 py-0.5 rounded-sm border"
          style={{
            color: '#660000',
            borderColor: '#2a1515',
            backgroundColor: '#0d0d14',
            fontFamily: 'Cinzel, serif',
          }}
        >
          AI
        </motion.div>
      </div>

      {/* Focus bottom line */}
      <motion.div
        initial={false}
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 right-0 h-px origin-left"
        style={{ background: 'linear-gradient(90deg, transparent, #660000, #cc1a1a, #660000, transparent)' }}
      />
    </motion.div>
  );
}
