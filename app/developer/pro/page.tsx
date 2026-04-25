'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatKRW } from '@/lib/format';

const BENEFITS = [
  { icon: '💸', title: '수수료 5%p 절감', desc: '거래당 20% → 15%로 절감 (즉시 적용)' },
  { icon: '⚡', title: '즉시 정산', desc: '3일 에스크로 유예 없이 판매 즉시 지급' },
  { icon: '👥', title: '고객 CRM', desc: '마케팅 동의 고객 이메일 목록 + CSV 내보내기' },
  { icon: '🔒', title: '실시간 JS 난독화', desc: '앱 소스코드 동적 난독화로 지적재산 보호' },
  { icon: '⭐', title: 'PRO 뱃지', desc: '앱 카드에 PRO 개발자 표시 — 신뢰도 향상' },
];

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
        if (data.error === 'already_pro') {
          router.push('/developer');
          return;
        }
        if (data.error === 'not_configured') {
          throw new Error('Pro 구독이 아직 준비 중입니다. 잠시 후 다시 시도하세요.');
        }
        throw new Error(data.error || '구독 시작 실패');
      }
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Link href="/developer" className="text-xs text-slate-500 hover:text-brand-600">
        ← 대시보드
      </Link>

      <section className="card text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 rounded-2xl mb-4">
          <span className="text-3xl">⚡</span>
        </div>
        <h1 className="text-2xl font-bold">Pro 개발자</h1>
        <p className="text-slate-500 mt-1">
          <span className="text-3xl font-bold text-slate-900">₩29,000</span>
          <span className="text-sm"> / 월</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">언제든 해지 가능 · Stripe 안전 결제</p>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Pro 혜택 5가지</h2>
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">{b.icon}</span>
            <div>
              <div className="font-semibold text-sm">{b.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">{b.desc}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="card bg-brand-50 border-brand-200">
        <h3 className="font-semibold text-brand-800 text-sm">수수료 절감 시뮬레이션</h3>
        <div className="mt-3 space-y-2 text-sm">
          {[
            { sales: 500000, label: '월 판매 50만원' },
            { sales: 2000000, label: '월 판매 200만원' },
            { sales: 5000000, label: '월 판매 500만원' },
          ].map(({ sales, label }) => {
            const saved = sales * 0.05;
            return (
              <div key={sales} className="flex justify-between">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold text-brand-700">
                  +{formatKRW(saved - 29000)} 추가 수익
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-brand-600 mt-2">* Pro 구독료 ₩29,000 차감 후 순이익</p>
      </section>

      {error && (
        <div className="card bg-red-50 border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full btn-primary py-3 text-base"
      >
        {loading ? '처리 중...' : 'Pro 시작하기 — 월 ₩29,000'}
      </button>

      <p className="text-xs text-slate-400 text-center pb-4">
        구독 취소 시 남은 기간 동안 Pro 혜택 유지 · 부분 환불 없음
      </p>
    </div>
  );
}
