'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLang, type Lang } from './LanguageProvider';

const T: Record<Lang, { eyebrow: string; title: string; desc: string }> = {
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
  ja: {
    eyebrow: 'AI搭載 Webツールマーケット',
    title: 'PLUTOS',
    desc: 'サブスクなしでAI生産性ツールを所有しよう。\n好きなティアで購入し、ホーム画面にインストール。',
  },
  zh: {
    eyebrow: 'AI驱动的网络工具市场',
    title: 'PLUTOS',
    desc: '无需订阅，直接拥有AI生产力工具。\n选择您的级别，一次购买，安装到主屏幕。',
  },
  es: {
    eyebrow: 'Mercado de Herramientas Web con IA',
    title: 'PLUTOS',
    desc: 'Posee herramientas de productividad AI sin suscripciones.\nElige tu nivel, compra una vez, instala en tu pantalla.',
  },
  fr: {
    eyebrow: 'Marché d\'Outils Web Alimentés par IA',
    title: 'PLUTOS',
    desc: 'Possédez des outils de productivité IA sans abonnement.\nChoisissez votre niveau, achetez une fois, installez sur l\'écran.',
  },
  de: {
    eyebrow: 'KI-gestützter Web-Tool-Markt',
    title: 'PLUTOS',
    desc: 'Besitzen Sie KI-Produktivitätstools ohne Abonnement.\nWählen Sie Ihre Stufe, einmal kaufen, auf dem Startbildschirm installieren.',
  },
};

export function HeroText() {
  const { lang } = useLang();
  const t = T[lang] ?? T.en;

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
