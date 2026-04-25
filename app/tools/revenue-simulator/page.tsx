'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RevenueSimulatorPage() {
  const [monthly, setMonthly] = useState(5000000);
  const [unit, setUnit] = useState<'krw' | 'usd'>('krw');

  const usdRate = 1350;
  const raw = unit === 'krw' ? monthly : monthly * usdRate;

  const platforms = [
    { name: 'App Store / Play Store', fee: 0.30, color: '#554444', note: '공식 기본 수수료' },
    { name: 'PLUTOS 기본',            fee: 0.20, color: '#996633', note: '정기결제 없음', highlight: false },
    { name: 'PLUTOS 정기결제',        fee: 0.05, color: '#cc1a1a', note: '최저 수수료 플랜', highlight: true },
  ];

  const fmt = (n: number) =>
    unit === 'krw'
      ? `₩${Math.round(n).toLocaleString('ko-KR')}`
      : `$${(n / usdRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  const maxNet = raw * (1 - 0.05);

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-2" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>
          Marketing Tool · 01
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#e8e8e8' }}>
          수익 역전 시뮬레이터
        </h1>
        <p className="text-sm" style={{ color: '#666666', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          월 매출을 입력하면 플랫폼별 순수익을 실시간으로 비교합니다.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
        <div className="flex gap-3">
          {(['krw', 'usd'] as const).map((u) => (
            <button key={u} onClick={() => setUnit(u)}
              className="px-4 py-1.5 rounded text-xs font-semibold transition-all"
              style={{
                backgroundColor: unit === u ? '#cc1a1a' : '#1a0a0e',
                color: unit === u ? '#fff' : '#664444',
                border: `1px solid ${unit === u ? '#cc1a1a' : '#2a1515'}`,
              }}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
            월 매출 ({unit === 'krw' ? '원' : 'USD'})
          </label>
          <input
            type="number"
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full rounded-lg px-4 py-3 text-sm outline-none"
            style={{
              backgroundColor: '#0d0a10',
              border: '1px solid #3a1515',
              color: '#e8e8e8',
              fontFamily: "'IBM Plex Sans KR', sans-serif",
            }}
            min={0}
            step={unit === 'krw' ? 100000 : 100}
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            {(unit === 'krw'
              ? [500000, 1000000, 5000000, 10000000, 50000000]
              : [500, 1000, 5000, 10000, 50000]
            ).map((v) => (
              <button key={v} onClick={() => setMonthly(v)}
                className="text-[10px] px-2 py-1 rounded"
                style={{ backgroundColor: '#160d12', color: '#554444', border: '1px solid #2a1515' }}
              >
                {unit === 'krw' ? `${(v / 10000).toFixed(0)}만` : `$${v.toLocaleString()}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {platforms.map((p, i) => {
          const net = raw * (1 - p.fee);
          const barPct = (net / maxNet) * 100;
          const saved = net - raw * (1 - 0.30);
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                backgroundColor: p.highlight ? '#1a0404' : '#120a0e',
                border: `1px solid ${p.highlight ? '#660000' : '#2a1515'}`,
                boxShadow: p.highlight ? '0 0 30px rgba(180,0,0,0.15)' : 'none',
              }}
            >
              {p.highlight && (
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, #cc1a1a, transparent)' }} />
              )}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: p.highlight ? '#f0ece4' : '#888888', fontFamily: 'Cinzel, serif' }}>
                    {p.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: '#4a3535' }}>수수료 {(p.fee * 100).toFixed(0)}%</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#0d0a10', color: '#443333', border: '1px solid #1a1018' }}>{p.note}</span>
                  </div>
                </div>
                <div className="text-right">
                  <AnimatePresence mode="wait">
                    <motion.div key={`${net}-${unit}`}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-lg font-black" style={{ color: p.color, fontFamily: 'Cinzel, serif' }}>
                      {fmt(net)}
                    </motion.div>
                  </AnimatePresence>
                  {saved > 0 && (
                    <div className="text-[10px]" style={{ color: p.highlight ? '#880000' : '#553333' }}>
                      +{fmt(saved)} 절감
                    </div>
                  )}
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#0d0a10' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + i * 0.08 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Annual projection */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#0d0a10', border: '1px solid #2a1515' }}>
        <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
          연간 절감액 비교 (vs App Store 30%)
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-[10px] mb-2" style={{ color: '#554444', fontFamily: 'Cinzel, serif' }}>PLUTOS 기본 (20%)</div>
            <AnimatePresence mode="wait">
              <motion.div key={`${raw}-${unit}-basic`}
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="text-2xl font-black" style={{ color: '#996633', fontFamily: 'Cinzel, serif' }}>
                +{fmt((raw * 0.10) * 12)}
              </motion.div>
            </AnimatePresence>
            <div className="text-[10px] mt-1" style={{ color: '#443333' }}>연간 절감 (10%p)</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] mb-2" style={{ color: '#cc1a1a', fontFamily: 'Cinzel, serif' }}>PLUTOS 정기결제 (5%)</div>
            <AnimatePresence mode="wait">
              <motion.div key={`${raw}-${unit}-sub`}
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="text-2xl font-black" style={{ color: '#cc1a1a', fontFamily: 'Cinzel, serif' }}>
                +{fmt((raw * 0.25) * 12)}
              </motion.div>
            </AnimatePresence>
            <div className="text-[10px] mt-1" style={{ color: '#664444' }}>연간 절감 (25%p)</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <a href="/developer/survey" className="btn-primary px-8 py-3 text-sm inline-block">
          지금 무료로 등록하기 →
        </a>
      </div>
    </div>
  );
}
