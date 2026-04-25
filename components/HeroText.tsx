'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from './LanguageProvider';

const T = {
  ko: {
    eyebrow: 'AI-Powered Web Tool Market',
    title: 'PLUTOS',
    desc: '구독 없이 AI 생산성 웹툴을 소유하세요.\n원하는 티어로 구매하고 홈화면에 설치하세요.',
  },
  en: {
    eyebrow: 'AI-Powered Web Tool Market',
    title: 'PLUTOS',
    desc: 'Own AI-built productivity tools — no subscriptions.\nChoose your tier, buy once, install to your home screen.',
  },
};

export function HeroText() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lang}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
      >
        <div
          className="text-[11px] uppercase tracking-[0.3em] mb-4 font-semibold"
          style={{ color: '#993333', fontFamily: 'Cinzel, serif' }}
        >
          {t.eyebrow}
        </div>
        <h1
          className="text-6xl font-black leading-none tracking-tight"
          style={{ color: '#e8e8e8', fontFamily: 'Cinzel, serif' }}
        >
          {t.title}
        </h1>
        <p
          className="mt-4 text-sm max-w-md leading-relaxed whitespace-pre-line"
          style={{
            color: '#999999',
            fontFamily: "'IBM Plex Sans KR', sans-serif",
            fontWeight: 300,
          }}
        >
          {t.desc}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
