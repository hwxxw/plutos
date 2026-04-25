'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang, LANGUAGES } from './LanguageProvider';

const spring = { type: 'spring' as const, stiffness: 320, damping: 32 };

export function NavDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang } = useLang();
  const pathname = usePathname();
  const currentLang = LANGUAGES.find(l => l.code === lang);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const UI = {
    ko: { about: '소개', tools: '개발 도구', settings: '설정', terms: '이용약관', privacy: '개인정보처리방침', language: '언어' },
    en: { about: 'About', tools: 'Dev Tools', settings: 'Settings', terms: 'Terms', privacy: 'Privacy', language: 'Language' },
    ja: { about: '概要', tools: '開発ツール', settings: '設定', terms: '利用規約', privacy: 'プライバシー', language: '言語' },
    zh: { about: '介绍', tools: '开发工具', settings: '设置', terms: '使用条款', privacy: '隐私政策', language: '语言' },
    es: { about: 'Acerca de', tools: 'Herramientas', settings: 'Ajustes', terms: 'Términos', privacy: 'Privacidad', language: 'Idioma' },
    fr: { about: 'À propos', tools: 'Outils Dev', settings: 'Paramètres', terms: 'CGU', privacy: 'Confidentialité', language: 'Langue' },
    de: { about: 'Über uns', tools: 'Dev Tools', settings: 'Einstellungen', terms: 'Nutzungsbedingungen', privacy: 'Datenschutz', language: 'Sprache' },
  };
  const t = UI[lang];

  const items = [
    { id: 'about',    icon: <IconInfo />,     label: t.about,    href: '/#about' },
    { id: 'tools',    icon: <IconTool />,     label: t.tools,    href: '/tools' },
    { id: 'settings', icon: <IconSettings />, label: t.settings, href: '/settings' },
    { id: 'terms',    icon: <IconScale />,    label: t.terms,    href: '/legal/terms' },
    { id: 'privacy',  icon: <IconScale />,    label: t.privacy,  href: '/legal/privacy' },
  ];

  const drawer = (
    <AnimatePresence>
      {open && (
        <>
          {/* 오버레이 */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 9998,
            }}
          />

          {/* 드로어 패널 */}
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={spring}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: 'min(300px, 82vw)',
              zIndex: 9999,
              display: 'flex', flexDirection: 'column',
              backgroundColor: '#0d0a10',
              borderRight: '1px solid #2a1515',
              boxShadow: '12px 0 48px rgba(0,0,0,0.8)',
            }}
          >
            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1e1218' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="PLUTOS" style={{ height: 28, width: 'auto' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, letterSpacing: '0.15em', color: '#f0ece4' }}>
                  PLUTOS
                </span>
              </div>
              <motion.button
                onClick={() => setOpen(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#160d12', color: '#554444', border: 'none', cursor: 'pointer' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            </div>

            {/* 언어 선택 */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e1218' }}>
              <button
                onClick={() => setLangOpen(v => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#160d12', border: '1px solid #2a1515', cursor: 'pointer' }}
              >
                <IconGlobe />
                <span style={{ flex: 1, textAlign: 'left', fontSize: 13, color: '#cccccc', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
                  {t.language}
                </span>
                <span style={{ fontSize: 18 }}>{currentLang?.flag}</span>
                <span style={{ fontSize: 11, color: '#cc1a1a', fontFamily: 'Cinzel, serif', fontWeight: 700 }}>{lang.toUpperCase()}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#554444" strokeWidth={2} style={{ width: 14, height: 14, transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ paddingTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {LANGUAGES.map(l => (
                        <button
                          key={l.code}
                          onClick={() => { setLang(l.code); setLangOpen(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                            backgroundColor: lang === l.code ? '#2a0808' : '#0d0a10',
                            border: `1px solid ${lang === l.code ? '#660000' : '#1a1015'}`,
                            color: lang === l.code ? '#e8e8e8' : '#664444',
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{l.flag}</span>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: lang === l.code ? '#e8e8e8' : '#888888' }}>{l.native}</div>
                          </div>
                          {lang === l.code && (
                            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#cc1a1a' }}>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 메뉴 */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.04 + idx * 0.045 }}
                >
                  {item.action ? (
                    <button
                      onClick={item.action}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#160d12')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span style={{ color: '#664444', flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#cccccc', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{item.label}</div>
                        {item.desc && <div style={{ fontSize: 10, color: '#554444', marginTop: 2, fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{item.desc}</div>}
                      </div>
                      {item.badge && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, border: '1px solid #3a1515', color: '#cc1a1a', backgroundColor: '#160d12', fontFamily: 'Cinzel, serif' }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={() => setOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', color: '#aaaaaa', textDecoration: 'none' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#160d12'; (e.currentTarget as HTMLElement).style.color = '#f0ece4'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#aaaaaa'; }}
                    >
                      <span style={{ color: '#664444', flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{item.label}</span>
                    </Link>
                  )}
                  {idx < items.length - 1 && (
                    <div style={{ margin: '0 20px', height: 1, backgroundColor: '#1a1018' }} />
                  )}
                </motion.div>
              ))}
            </nav>

            {/* 푸터 */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #1e1218' }}>
              <p style={{ fontSize: 10, color: '#2a2020', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
                © 2026 PLUTOS · All rights reserved.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* 햄버거 버튼 */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5, width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}
        aria-label="메뉴 열기"
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ display: 'block', height: 1.5, borderRadius: 2, backgroundColor: '#7a6060', width: i === 1 ? 14 : 20, transition: 'background-color 0.2s' }} />
        ))}
      </motion.button>

      {/* 포털로 body에 직접 렌더 → fixed 깨짐 없음 */}
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}

function IconGlobe() {
  return <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>;
}
function IconInfo() {
  return <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2}/></svg>;
}
function IconSettings() {
  return <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function IconScale() {
  return <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-6 9 6"/><path d="M3 9l4 7H3m18-7l-4 7h4"/><line x1="5" y1="20" x2="19" y2="20"/></svg>;
}
function IconTool() {
  return <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
}
