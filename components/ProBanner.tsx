'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const PERKS = [
  { icon: <IcoCoin />,    label: '수수료 5%' },
  { icon: <IcoFlash />,   label: '즉시 정산' },
  { icon: <IcoPeople />,  label: '고객 CRM' },
  { icon: <IcoShield />,  label: 'JS 난독화' },
  { icon: <IcoBadge />,   label: 'PRO 뱃지' },
];

export function ProBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a0404 0%, #0d0d14 50%, #1a0404 100%)',
          border: '1px solid #3a1515',
          boxShadow: '0 0 60px rgba(74,4,4,0.2)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #660000, #cc1a1a, #660000, transparent)' }} />

        <div className="px-6 py-7 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 text-center sm:text-left">
            <div className="text-[10px] uppercase tracking-[0.3em] mb-2"
              style={{ color: '#660000', fontFamily: 'Cinzel, serif' }}>
              Developer Subscription
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <IcoFlash size={18} color="#cc1a1a" />
              <h3 className="text-xl font-black tracking-widest"
                style={{ color: '#cc1a1a', fontFamily: 'Cinzel, serif' }}>
                PRO 개발자
              </h3>
            </div>
            <p className="text-sm" style={{ color: '#888888' }}>
              수수료 <span style={{ color: '#888' }}>20%</span>
              <span style={{ color: '#cc1a1a', fontWeight: 700 }}> → 5%</span>로 즉시 인하.
              월 ₩29,000으로 수익을 극대화하세요.
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {PERKS.map(p => (
                <span key={p.label} className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#160d12', border: '1px solid #2a1515', color: '#664444' }}>
                  <span style={{ color: '#554444', display: 'flex' }}>{p.icon}</span>
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="text-2xl font-black" style={{ color: '#e8e8e8', fontFamily: 'Cinzel, serif' }}>
              ₩29,000<span className="text-sm font-normal ml-1" style={{ color: '#554444' }}>/월</span>
            </div>
            <Link href="/developer/pro"
              className="px-8 py-3 rounded-xl text-sm font-bold tracking-widest transition-all block"
              style={{
                background: 'linear-gradient(135deg, #cc1a1a, #880000)',
                color: '#fff', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em',
                boxShadow: '0 0 24px rgba(136,0,0,0.4)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 36px rgba(204,26,26,0.5)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(136,0,0,0.4)')}
            >
              PRO 시작하기 →
            </Link>
            <span className="text-[10px]" style={{ color: '#3a2828' }}>언제든 해지 가능</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #4a0404, transparent)' }} />
      </motion.div>
    </div>
  );
}

function IcoCoin({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5C9.5 8.4 10.6 8 12 8s2.5.4 2.5 1.5-1.1 2-2.5 2-2.5.9-2.5 2S10.4 16 12 16s2.5-.4 2.5-1.5" />
    </svg>
  );
}
function IcoFlash({ size = 14, color }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IcoPeople({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IcoShield({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IcoBadge({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}
