'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppCard } from './AppCard';
import { SearchBar } from './SearchBar';
import { useLang } from './LanguageProvider';
import type { PublicApp } from '@/lib/supabase/types';

/* ── Abstract geometric SVG icons ─────────────────────────────── */
const ICONS: Record<string, React.ReactNode> = {
  writing: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <line x1="3" y1="17" x2="17" y2="3" />
      <line x1="3" y1="10" x2="10" y2="3" />
      <line x1="10" y1="17" x2="17" y2="10" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <rect x="2"  y="13" width="4" height="6" rx="0.5" />
      <rect x="8"  y="8"  width="4" height="11" rx="0.5" />
      <rect x="14" y="3"  width="4" height="16" rx="0.5" />
    </svg>
  ),
  automation: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M10 3 A7 7 0 1 1 3.5 13" />
      <polyline points="2.5,9 3.5,13 7.5,11.5" />
    </svg>
  ),
  design: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="2" width="9" height="9" />
      <rect x="9" y="9" width="9" height="9" />
    </svg>
  ),
  learning: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
      <polygon points="10,2 18,18 2,18" />
    </svg>
  ),
  business: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <rect x="2"  y="2"  width="7" height="7" rx="0.5" />
      <rect x="11" y="2"  width="7" height="7" rx="0.5" />
      <rect x="2"  y="11" width="7" height="7" rx="0.5" />
      <rect x="11" y="11" width="7" height="7" rx="0.5" />
    </svg>
  ),
  marketing: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <line x1="10" y1="2"  x2="10" y2="5.5" />
      <line x1="10" y1="14.5" x2="10" y2="18" />
      <line x1="2"  y1="10" x2="5.5" y2="10" />
      <line x1="14.5" y1="10" x2="18" y2="10" />
      <line x1="4.5" y1="4.5" x2="6.9" y2="6.9" />
      <line x1="13.1" y1="13.1" x2="15.5" y2="15.5" />
      <line x1="15.5" y1="4.5" x2="13.1" y2="6.9" />
      <line x1="6.9" y1="13.1" x2="4.5" y2="15.5" />
    </svg>
  ),
  dev: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,5 1,10 6,15" />
      <polyline points="14,5 19,10 14,15" />
    </svg>
  ),
};

const CATEGORIES = [
  { key: 'writing',    label: '글쓰기',   en: 'Writing' },
  { key: 'data',       label: '데이터',   en: 'Data' },
  { key: 'automation', label: '자동화',   en: 'Automation' },
  { key: 'design',     label: '디자인',   en: 'Design' },
  { key: 'learning',   label: '학습',     en: 'Learning' },
  { key: 'business',   label: '비즈니스', en: 'Business' },
  { key: 'marketing',  label: '마케팅',   en: 'Marketing' },
  { key: 'dev',        label: '개발',     en: 'Dev' },
];

const spring = { type: 'spring' as const, stiffness: 420, damping: 22 };

/* variant 세트 — 부모 hover 상태가 자식으로 자동 전파
   아이콘 색은 클릭(active)시에만 채워짐, hover는 확대만 */
const catBtn = {
  rest:  { scale: 1,    y: 0,  backgroundColor: '#160d12', borderColor: '#3a1818', boxShadow: '0 0 0px rgba(136,0,0,0)' },
  hover: { scale: 1.1,  y: -3, backgroundColor: '#1a1015', borderColor: '#551111', boxShadow: '0 8px 24px rgba(40,0,0,0.35)' },
  tap:   { scale: 0.91, y: 0 },
};
const catIcon = {
  rest:  { color: '#554444' },
  hover: { color: '#886666' },   // hover: 살짝 밝아지되 빨간색 X
};
const catLabel = {
  rest:  { color: '#888888' },
  hover: { color: '#cccccc' },
};
const catCount = {
  rest:  { color: '#443333' },
  hover: { color: '#776666' },
};

const UI = {
  ko: {
    searchPlaceholder: '앱 검색...',
    all: '전체',
    resultLabel: (n: number) => `결과 · ${n}`,
    allLabel: (n: number) => `All · ${n}`,
    catLabel: (en: string, n: number) => `${en} · ${n}`,
    noResults: '검색 결과가 없습니다',
    noApps: '등록된 앱이 없습니다',
    searching: 'SEARCHING',
    searchingDesc: 'AI가 관련 앱을 분석하고 있습니다',
    resetBtn: '전체 ×',
    devCTA: '개발자로 등록하면 여기에 앱을 올릴 수 있습니다 →',
    ctaTitle: '당신의 AI 웹툴을 판매하세요',
    ctaDesc: '무료로 등록하고 판매 수익을 바로 받아가세요.',
    ctaBtn: '무료로 시작하기 →',
  },
  en: {
    searchPlaceholder: 'Search apps...',
    all: 'All',
    resultLabel: (n: number) => `Results · ${n}`,
    allLabel: (n: number) => `All · ${n}`,
    catLabel: (en: string, n: number) => `${en} · ${n}`,
    noResults: 'No results found',
    noApps: 'No apps listed yet',
    searching: 'SEARCHING',
    searchingDesc: 'AI is analyzing relevant apps',
    resetBtn: 'All ×',
    devCTA: 'Register as a developer to list your app here →',
    ctaTitle: 'Sell Your AI Web Tool',
    ctaDesc: 'Register for free and receive your revenue directly.',
    ctaBtn: 'Get Started Free →',
  },
};

type Props = { apps: PublicApp[] };

export function HomepageClient({ apps }: Props) {
  const { lang } = useLang();
  const t = UI[lang];
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PublicApp[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const displayedApps = useMemo(() => {
    if (searchResults !== null) return searchResults;
    if (!selectedCat) return apps;
    return apps.filter((a: any) => a.category === selectedCat);
  }, [apps, selectedCat, searchResults]);

  const handleCatClick = useCallback((key: string) => {
    setSearchResults(null);
    setSelectedCat((p) => (p === key ? null : key));
  }, []);

  const selectedCatInfo = CATEGORIES.find((c) => c.key === selectedCat);

  return (
    <div className="space-y-10">

      {/* Search */}
      <SearchBar
        onResults={setSearchResults}
        onSearching={setIsSearching}
        onClear={() => setSearchResults(null)}
      />

      {/* Category section */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #660000, transparent)' }} />
          <span
            className="text-[11px] uppercase tracking-[0.25em] font-semibold flex-shrink-0"
            style={{ color: '#993333', fontFamily: 'Cinzel, serif' }}
          >
            Categories
          </span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #660000)' }} />
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {CATEGORIES.map((c, i) => {
            const active = selectedCat === c.key;
            const count = apps.filter((a: any) => a.category === c.key).length;

            return (
              <motion.button
                key={c.key}
                onClick={() => handleCatClick(c.key)}
                /* 등장 애니메이션 */
                initial={{ opacity: 0, y: 16 }}
                animate={active
                  ? { opacity: 1, y: 0, scale: 1, backgroundColor: '#2a0808', borderColor: '#990000', boxShadow: '0 0 28px rgba(153,0,0,0.5)' }
                  : { opacity: 1, y: 0 }
                }
                /* hover/tap variants — 자식 요소에 자동 전파 (active가 아닐 때만) */
                variants={active ? undefined : catBtn}
                initial={active ? undefined : 'rest'}
                whileHover={active ? { scale: 1.05, y: -2 } : 'hover'}
                whileTap={active ? { scale: 0.94 } : 'tap'}
                transition={spring}
                style={{
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: active ? '#990000' : '#3a1818',
                  backgroundColor: active ? '#2a0808' : '#160d12',
                }}
                className="flex flex-col items-center gap-2.5 py-5 rounded-xl relative overflow-hidden"
              >
                {/* 클릭(active) 시에만 아이콘 색 채워짐 */}
                <motion.span
                  className="w-5 h-5 block"
                  variants={active ? undefined : catIcon}
                  style={{ color: active ? '#ff3333' : undefined }}
                >
                  {ICONS[c.key]}
                </motion.span>

                <motion.span
                  className="text-xs font-medium leading-none"
                  variants={active ? undefined : catLabel}
                  style={{
                    color: active ? '#ffffff' : undefined,
                    fontFamily: "'IBM Plex Sans KR', sans-serif",
                    letterSpacing: '0.01em',
                  }}
                >
                  {lang === 'en' ? c.en : c.label}
                </motion.span>

                {/* count */}
                {count > 0 && (
                  <motion.span
                    className="text-[9px] leading-none"
                    variants={active ? undefined : catCount}
                    style={{ color: active ? '#cc3333' : undefined }}
                  >
                    {count}
                  </motion.span>
                )}

                {/* active 글로우 오버레이 */}
                {active && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 100%, rgba(153,0,0,0.18), transparent)' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Apps grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCat ?? '__all__'}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.16 }}
              className="flex items-center gap-3"
            >
              <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: '#880000' }} />
              <span
                className="text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: '#993333', fontFamily: 'Cinzel, serif' }}
              >
                {searchResults !== null
                  ? t.resultLabel(searchResults.length)
                  : selectedCatInfo
                    ? t.catLabel(selectedCatInfo.en, displayedApps.length)
                    : t.allLabel(apps.length)}
              </span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {selectedCat && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedCat(null)}
                className="text-[11px] px-3 py-1 rounded border"
                style={{
                  color: '#aaaaaa',
                  borderColor: '#3a1818',
                  backgroundColor: '#160d12',
                  fontFamily: "'IBM Plex Sans KR', sans-serif",
                }}
              >
                {t.resetBtn}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="flex flex-col items-center justify-center py-20 gap-8"
          >
            {/* 큰 로딩 스피너 */}
            <div className="relative w-20 h-20">
              {/* 바깥 링 */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid #330000' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
              />
              {/* 중간 링 — 반대 방향 */}
              <motion.div
                className="absolute inset-2 rounded-full"
                style={{ border: '1.5px solid #660000', borderTopColor: 'transparent', borderRightColor: 'transparent' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 1.6, ease: 'linear', repeat: Infinity }}
              />
              {/* 안쪽 글로우 점 */}
              <motion.div
                className="absolute inset-0 m-auto w-3 h-3 rounded-full"
                style={{ backgroundColor: '#cc1a1a' }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
              />
              {/* 회전하는 아크 (빨간 강조선) */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid transparent', borderTopColor: '#cc1a1a', borderRightColor: '#660000' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
              />
            </div>

            {/* 텍스트 */}
            <div className="text-center space-y-1.5">
              <motion.p
                className="text-sm font-medium"
                style={{ color: '#cccccc', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {t.searching}
              </motion.p>
              <p
                className="text-xs"
                style={{ color: '#666666', fontFamily: "'IBM Plex Sans KR', sans-serif", fontWeight: 300 }}
              >
                {t.searchingDesc}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {!isSearching && displayedApps.map((app: PublicApp) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.91, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.91, y: -8 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              >
                <AppCard app={app} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {!isSearching && displayedApps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-14 text-sm"
            style={{ color: '#666666', fontFamily: "'IBM Plex Sans KR', sans-serif" }}
          >
            {searchResults !== null ? t.noResults : t.noApps}
          </motion.div>
        )}
      </section>

      {/* Developer CTA */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ type: 'spring', stiffness: 180, damping: 28 }}
        className="rounded-2xl p-10 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a0404 0%, #0d0d14 70%)',
          border: '1px solid #3a1818',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(102,0,0,0.18), transparent)' }}
        />
        <div className="relative z-10">
          <div
            className="text-[10px] uppercase tracking-[0.3em] mb-4"
            style={{ color: '#993333', fontFamily: 'Cinzel, serif' }}
          >
            Developer Program
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#e8e8e8', fontFamily: 'Cinzel, serif' }}>
            {t.ctaTitle}
          </h2>
          <p
            className="text-sm mb-6 max-w-sm mx-auto leading-relaxed"
            style={{ color: '#888888', fontFamily: "'IBM Plex Sans KR', sans-serif", fontWeight: 300 }}
          >
            {t.ctaDesc}
          </p>
          <a href="/developer/survey" className="btn-primary px-7 py-3 text-sm">
            {t.ctaBtn}
          </a>
        </div>
      </motion.section>
    </div>
  );
}
