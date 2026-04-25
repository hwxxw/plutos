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
  { key: 'writing',    ko: '글쓰기',   en: 'Writing',    ja: '執筆',       zh: '写作',    es: 'Escritura',  fr: 'Écriture',   de: 'Schreiben' },
  { key: 'data',       ko: '데이터',   en: 'Data',       ja: 'データ',      zh: '数据',    es: 'Datos',      fr: 'Données',    de: 'Daten' },
  { key: 'automation', ko: '자동화',   en: 'Automation', ja: '自動化',      zh: '自动化',  es: 'Automatización', fr: 'Automatisation', de: 'Automatisierung' },
  { key: 'design',     ko: '디자인',   en: 'Design',     ja: 'デザイン',    zh: '设计',    es: 'Diseño',     fr: 'Design',     de: 'Design' },
  { key: 'learning',   ko: '학습',     en: 'Learning',   ja: '学習',        zh: '学习',    es: 'Aprendizaje', fr: 'Apprentissage', de: 'Lernen' },
  { key: 'business',   ko: '비즈니스', en: 'Business',   ja: 'ビジネス',    zh: '商业',    es: 'Negocios',   fr: 'Affaires',   de: 'Geschäft' },
  { key: 'marketing',  ko: '마케팅',   en: 'Marketing',  ja: 'マーケティング', zh: '营销',  es: 'Marketing',  fr: 'Marketing',  de: 'Marketing' },
  { key: 'dev',        ko: '개발',     en: 'Dev',        ja: '開発',        zh: '开发',    es: 'Desarrollo', fr: 'Dev',        de: 'Entwicklung' },
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
  ja: {
    searchPlaceholder: 'アプリを検索...',
    all: '全て',
    resultLabel: (n: number) => `結果 · ${n}`,
    allLabel: (n: number) => `全て · ${n}`,
    catLabel: (en: string, n: number) => `${en} · ${n}`,
    noResults: '検索結果がありません',
    noApps: 'アプリが登録されていません',
    searching: 'SEARCHING',
    searchingDesc: 'AIが関連アプリを分析中です',
    resetBtn: '全て ×',
    devCTA: '開発者登録してアプリを公開しよう →',
    ctaTitle: 'AIウェブツールを販売しよう',
    ctaDesc: '無料で登録して収益をすぐに受け取れます。',
    ctaBtn: '無料で始める →',
  },
  zh: {
    searchPlaceholder: '搜索应用...',
    all: '全部',
    resultLabel: (n: number) => `结果 · ${n}`,
    allLabel: (n: number) => `全部 · ${n}`,
    catLabel: (en: string, n: number) => `${en} · ${n}`,
    noResults: '没有搜索结果',
    noApps: '暂无应用',
    searching: 'SEARCHING',
    searchingDesc: 'AI正在分析相关应用',
    resetBtn: '全部 ×',
    devCTA: '注册成为开发者，在这里发布您的应用 →',
    ctaTitle: '销售您的AI网络工具',
    ctaDesc: '免费注册，直接获得销售收益。',
    ctaBtn: '免费开始 →',
  },
  es: {
    searchPlaceholder: 'Buscar apps...',
    all: 'Todo',
    resultLabel: (n: number) => `Resultados · ${n}`,
    allLabel: (n: number) => `Todo · ${n}`,
    catLabel: (en: string, n: number) => `${en} · ${n}`,
    noResults: 'Sin resultados',
    noApps: 'No hay apps registradas',
    searching: 'BUSCANDO',
    searchingDesc: 'La IA analiza las apps relevantes',
    resetBtn: 'Todo ×',
    devCTA: 'Regístrate como desarrollador para publicar tu app →',
    ctaTitle: 'Vende Tu Herramienta Web con IA',
    ctaDesc: 'Regístrate gratis y recibe tus ingresos directamente.',
    ctaBtn: 'Empezar Gratis →',
  },
  fr: {
    searchPlaceholder: 'Rechercher des apps...',
    all: 'Tout',
    resultLabel: (n: number) => `Résultats · ${n}`,
    allLabel: (n: number) => `Tout · ${n}`,
    catLabel: (en: string, n: number) => `${en} · ${n}`,
    noResults: 'Aucun résultat',
    noApps: 'Aucune app enregistrée',
    searching: 'RECHERCHE',
    searchingDesc: 'L\'IA analyse les apps pertinentes',
    resetBtn: 'Tout ×',
    devCTA: 'Inscrivez-vous en tant que développeur pour publier votre app →',
    ctaTitle: 'Vendez Votre Outil Web IA',
    ctaDesc: 'Inscrivez-vous gratuitement et recevez vos revenus directement.',
    ctaBtn: 'Commencer Gratuitement →',
  },
  de: {
    searchPlaceholder: 'Apps suchen...',
    all: 'Alle',
    resultLabel: (n: number) => `Ergebnisse · ${n}`,
    allLabel: (n: number) => `Alle · ${n}`,
    catLabel: (en: string, n: number) => `${en} · ${n}`,
    noResults: 'Keine Ergebnisse',
    noApps: 'Keine Apps registriert',
    searching: 'SUCHEN',
    searchingDesc: 'KI analysiert relevante Apps',
    resetBtn: 'Alle ×',
    devCTA: 'Als Entwickler registrieren und App veröffentlichen →',
    ctaTitle: 'Verkaufen Sie Ihr KI-Web-Tool',
    ctaDesc: 'Kostenlos registrieren und Einnahmen direkt erhalten.',
    ctaBtn: 'Kostenlos Starten →',
  },
};

type Props = { apps: PublicApp[] };

export function HomepageClient({ apps }: Props) {
  const { lang } = useLang();
  const t = UI[lang] ?? UI.en;
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
                  {(c as any)[lang] ?? c.en}
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
                    ? t.catLabel((selectedCatInfo as any)[lang] ?? selectedCatInfo.en, displayedApps.length)
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
