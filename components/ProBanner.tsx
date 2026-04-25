'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const PERKS = [
  { icon: '💸', label: '수수료 5%' },
  { icon: '⚡', label: '즉시 정산' },
  { icon: '👥', label: '고객 CRM' },
  { icon: '🔒', label: 'JS 난독화' },
  { icon: '⭐', label: 'PRO 뱃지' },
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
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #660000, #cc1a1a, #660000, transparent)' }} />

        <div className="px-6 py-7 flex flex-col sm:flex-row items-center gap-6">

          {/* Left — copy */}
          <div className="flex-1 text-center sm:text-left">
            <div className="text-[10px] uppercase tracking-[0.3em] mb-2"
              style={{ color: '#660000', fontFamily: 'Cinzel, serif' }}>
              Developer Subscription
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <span className="text-lg">⚡</span>
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

            {/* Perks row */}
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {PERKS.map(p => (
                <span
                  key={p.label}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full"
                  style={{ backgroundColor: '#160d12', border: '1px solid #2a1515', color: '#664444' }}
                >
                  {p.icon} {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — CTA */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="text-2xl font-black" style={{ color: '#e8e8e8', fontFamily: 'Cinzel, serif' }}>
              ₩29,000
              <span className="text-sm font-normal ml-1" style={{ color: '#554444' }}>/월</span>
            </div>
            <Link
              href="/developer/pro"
              className="px-8 py-3 rounded-xl text-sm font-bold tracking-widest transition-all block"
              style={{
                background: 'linear-gradient(135deg, #cc1a1a, #880000)',
                color: '#fff',
                fontFamily: 'Cinzel, serif',
                letterSpacing: '0.12em',
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

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #4a0404, transparent)' }} />
      </motion.div>
    </div>
  );
}
