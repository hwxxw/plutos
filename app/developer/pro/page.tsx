'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatKRW } from '@/lib/format';

const BENEFITS = [
  {
    icon: '💸',
    title: '수수료 20% → 5%',
    desc: '기본 20%에서 정기결제 시 5%로 즉시 인하. 판매액이 클수록 절감액이 극적으로 증가합니다.',
  },
  {
    icon: '⚡',
    title: '즉시 정산',
    desc: '3일 에스크로 유예 없이 판매 즉시 정산. 현금흐름을 완전히 통제하세요.',
  },
  {
    icon: '👥',
    title: '고객 CRM',
    desc: '마케팅 동의 고객 이메일 목록 제공 + CSV 내보내기. 리마케팅의 핵심 자산.',
  },
  {
    icon: '🔒',
    title: '실시간 JS 난독화',
    desc: '앱 소스코드 동적 난독화로 지적재산을 원천 보호. 복사 불가능한 방어막.',
  },
  {
    icon: '⭐',
    title: 'PRO 뱃지',
    desc: '앱 카드에 PRO 개발자 표시. 구매 전환율을 높이는 신뢰 시그널.',
  },
];

const SIMULATIONS = [
  { sales: 500000,   label: '월 판매 50만원' },
  { sales: 2000000,  label: '월 판매 200만원' },
  { sales: 5000000,  label: '월 판매 500만원' },
  { sales: 10000000, label: '월 판매 1,000만원' },
];

const C = {
  bg:      '#0d0d14',
  card:    '#120a0e',
  border:  '#2a1515',
  red:     '#cc1a1a',
  redDim:  '#660000',
  text:    '#e8e8e8',
  muted:   '#666666',
  dim:     '#3a2828',
  cinzel:  'Cinzel, serif',
  sans:    "'IBM Plex Sans KR', sans-serif",
};

export default function ProPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/developer/pro', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'already_pro') { router.push('/developer'); return; }
        if (data.error === 'not_configured') throw new Error('Pro 구독이 준비 중입니다. 잠시 후 다시 시도하세요.');
        throw new Error(data.error || '구독 시작 실패');
      }
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">

      {/* Back */}
      <Link href="/developer" className="text-[11px] tracking-widest uppercase transition-colors"
        style={{ color: C.redDim, fontFamily: C.cinzel }}
        onMouseEnter={e => ((e.target as HTMLElement).style.color = C.red)}
        onMouseLeave={e => ((e.target as HTMLElement).style.color = C.redDim)}>
        ← 대시보드
      </Link>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a0404 0%, #120a0e 100%)',
          border: `1px solid ${C.border}`,
          boxShadow: '0 0 60px rgba(74,4,4,0.25)',
        }}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #660000, #cc1a1a, #660000, transparent)' }} />

        <div className="text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: C.redDim, fontFamily: C.cinzel }}>
          Developer Subscription
        </div>

        <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full"
          style={{ backgroundColor: '#1a0404', border: `1px solid ${C.border}` }}>
          <span className="text-lg">⚡</span>
          <span className="text-sm font-bold tracking-widest" style={{ color: C.red, fontFamily: C.cinzel }}>PRO</span>
        </div>

        <div className="mt-4">
          <span className="text-5xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>
            ₩29,000
          </span>
          <span className="text-sm ml-2" style={{ color: C.muted }}> / 월</span>
        </div>
        <p className="text-xs mt-2" style={{ color: C.dim }}>언제든 해지 가능 · Stripe 안전 결제</p>

        {/* Fee comparison */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-black" style={{ color: C.muted, fontFamily: C.cinzel }}>20%</div>
            <div className="text-[10px] mt-1" style={{ color: C.dim }}>기본 수수료</div>
          </div>
          <div style={{ color: C.redDim, fontSize: 20 }}>→</div>
          <div className="text-center">
            <div className="text-2xl font-black" style={{ color: C.red, fontFamily: C.cinzel }}>5%</div>
            <div className="text-[10px] mt-1" style={{ color: C.muted }}>Pro 수수료</div>
          </div>
          <div className="px-3 py-1 rounded-lg text-sm font-bold"
            style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a3a1a', color: '#4ade80' }}>
            -15%p 절감
          </div>
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 26 }}
        className="rounded-2xl p-6 space-y-5"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.redDim, fontFamily: C.cinzel }}>
          Pro 혜택 5가지
        </div>
        {BENEFITS.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 300, damping: 28 }}
            className="flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
              style={{ backgroundColor: '#1a0404', border: `1px solid ${C.border}` }}>
              {b.icon}
            </div>
            <div>
              <div className="text-sm font-semibold mb-0.5" style={{ color: C.text }}>{b.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: C.muted }}>{b.desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue simulation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 26 }}
        className="rounded-2xl p-6"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="text-[10px] uppercase tracking-[0.25em] mb-4" style={{ color: C.redDim, fontFamily: C.cinzel }}>
          수수료 절감 시뮬레이션
        </div>
        <div className="space-y-3">
          {SIMULATIONS.map(({ sales, label }) => {
            const saved = sales * 0.15;
            const net = saved - 29000;
            return (
              <div key={sales} className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: '#1a1015' }}>
                <span className="text-sm" style={{ color: C.muted }}>{label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold" style={{ color: net > 0 ? '#4ade80' : C.muted }}>
                    +{formatKRW(net)} 추가 수익
                  </span>
                  <div className="text-[10px]" style={{ color: C.dim }}>
                    절감 {formatKRW(saved)} - 구독료 ₩29,000
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] mt-3" style={{ color: C.dim }}>* Pro 구독료 차감 후 기본요금 대비 순추가 수익</p>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#1a0404', border: '1px solid #660000', color: '#cc3333' }}>
          {error}
        </div>
      )}

      {/* CTA */}
      <motion.button
        onClick={handleSubscribe}
        disabled={loading}
        whileHover={loading ? {} : { scale: 1.02 }}
        whileTap={loading ? {} : { scale: 0.98 }}
        className="w-full py-4 rounded-2xl text-sm font-bold tracking-widest transition-all"
        style={{
          background: loading ? '#330000' : 'linear-gradient(135deg, #cc1a1a, #880000)',
          color: '#fff',
          fontFamily: C.cinzel,
          letterSpacing: '0.15em',
          boxShadow: loading ? 'none' : '0 0 32px rgba(136,0,0,0.4)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? '처리 중...' : 'PRO 시작하기 — 월 ₩29,000'}
      </motion.button>

      <p className="text-xs text-center pb-6" style={{ color: C.dim }}>
        구독 취소 시 남은 기간 동안 Pro 혜택 유지 · 부분 환불 없음
      </p>
    </div>
  );
}
