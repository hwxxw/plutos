'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

type Sale = {
  id: string;
  developer: string;
  amount: number;
  traditional_fee: number;
  plutos_fee: number;
  rebate: number;
  created_at: string;
};

const DEMO_DEVS = ['@kim_dev', '@park_ai', '@lee_studio', '@choi_lab', '@jung_apps', '@han_tech'];

function GaugeBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#0d0a10' }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

function fmt(n: number) {
  return `₩${Math.round(n).toLocaleString('ko-KR')}`;
}

export default function FeeTrackerPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalRebate, setTotalRebate] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Seed initial demo data
    const demoSales: Sale[] = Array.from({ length: 6 }, (_, i) => {
      const amount = Math.round((Math.random() * 200000 + 50000) / 1000) * 1000;
      const trad = amount * 0.30;
      const plut = amount * 0.05;
      return {
        id: `demo-${i}`,
        developer: DEMO_DEVS[i],
        amount,
        traditional_fee: trad,
        plutos_fee: plut,
        rebate: trad - plut,
        created_at: new Date(Date.now() - (6 - i) * 8000).toISOString(),
      };
    });
    setSales(demoSales);
    setTotalRebate(demoSales.reduce((s, x) => s + x.rebate, 0));
    setLiveCount(demoSales.length);

    // Try Supabase Realtime for real sales (best-effort)
    try {
      const ch = supabase.channel('fee-tracker-public')
        .on('broadcast', { event: 'new_sale' }, ({ payload }) => {
          const s = payload as Sale;
          setSales(prev => [s, ...prev].slice(0, 12));
          setTotalRebate(prev => prev + s.rebate);
          setLiveCount(prev => prev + 1);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') setConnected(true);
        });
      channelRef.current = ch;
    } catch (_) {}

    // Simulate live updates every 4s
    const interval = setInterval(() => {
      const amount = Math.round((Math.random() * 300000 + 30000) / 1000) * 1000;
      const trad = amount * 0.30;
      const plut = amount * 0.05;
      const newSale: Sale = {
        id: `sim-${Date.now()}`,
        developer: DEMO_DEVS[Math.floor(Math.random() * DEMO_DEVS.length)],
        amount,
        traditional_fee: trad,
        plutos_fee: plut,
        rebate: trad - plut,
        created_at: new Date().toISOString(),
      };
      setSales(prev => [newSale, ...prev].slice(0, 12));
      setTotalRebate(prev => prev + newSale.rebate);
      setLiveCount(prev => prev + 1);
    }, 4000);

    return () => {
      clearInterval(interval);
      channelRef.current?.unsubscribe();
    };
  }, []);

  const maxRebate = Math.max(...sales.map(s => s.rebate), 1);

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-2" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>
          Marketing Tool · 04
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#e8e8e8' }}>
          수수료 리베이트 트래커
        </h1>
        <p className="text-sm" style={{ color: '#666666', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          PLUTOS 개발자들이 기존 30% 수수료 대비 실시간으로 절감하는 금액을 추적합니다.
        </p>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#cc1a1a' }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
        <span className="text-xs" style={{ color: '#664444', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
          LIVE · {liveCount}건 처리됨
        </span>
        {connected && <span className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: '#0a1a0a', color: '#00aa44', border: '1px solid #003300' }}>Realtime Connected</span>}
      </div>

      {/* Total rebate counter */}
      <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(180,0,0,0.1), transparent)' }} />
        <div className="relative z-10">
          <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>총 절감액 (시뮬레이션)</div>
          <AnimatePresence mode="wait">
            <motion.div key={Math.round(totalRebate / 10000)}
              initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-5xl font-black" style={{ color: '#cc1a1a', fontFamily: 'Cinzel, serif' }}>
              {fmt(totalRebate)}
            </motion.div>
          </AnimatePresence>
          <div className="text-xs mt-2" style={{ color: '#554444', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
            30% 수수료 대비 PLUTOS(5%) 절감 합계
          </div>
        </div>
      </div>

      {/* Live feed */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>실시간 거래 피드</div>
        <AnimatePresence initial={false}>
          {sales.map((sale) => (
            <motion.div key={sale.id}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              layout
              className="rounded-xl p-4" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: '#1a0404', color: '#cc1a1a', border: '1px solid #3a1515' }}>
                    {sale.developer[1].toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#aaaaaa', fontFamily: 'Cinzel, serif' }}>{sale.developer}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold" style={{ color: '#cc1a1a' }}>+{fmt(sale.rebate)} 절감</div>
                  <div className="text-[10px]" style={{ color: '#443333' }}>판매 {fmt(sale.amount)}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 flex-shrink-0" style={{ color: '#443333' }}>기존 30%</span>
                  <GaugeBar value={sale.traditional_fee} max={maxRebate * 3} color="#443333" />
                  <span className="text-[10px] w-16 text-right flex-shrink-0" style={{ color: '#443333' }}>{fmt(sale.traditional_fee)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-20 flex-shrink-0" style={{ color: '#cc1a1a' }}>PLUTOS 5%</span>
                  <GaugeBar value={sale.plutos_fee} max={maxRebate * 3} color="#cc1a1a" />
                  <span className="text-[10px] w-16 text-right flex-shrink-0" style={{ color: '#cc1a1a' }}>{fmt(sale.plutos_fee)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-center">
        <a href="/developer/survey" className="btn-primary px-8 py-3 text-sm inline-block">
          나도 절감 시작하기 →
        </a>
      </div>
    </div>
  );
}
