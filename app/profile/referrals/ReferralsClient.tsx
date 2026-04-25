'use client';

import { useState } from 'react';
import Link from 'next/link';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  red:    '#cc1a1a',
  redDim: '#880000',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  cinzel: 'Cinzel, serif' as const,
  ibm:    "'IBM Plex Sans KR', sans-serif" as const,
};

type Referral = {
  id: string;
  code: string;
  referred_id: string | null;
  status: string;
  points_awarded: number;
  created_at: string;
  completed_at: string | null;
};

export default function ReferralsClient({
  referralCode,
  referrals,
  totalPointsEarned,
  pointBalance,
  hasReferrer,
}: {
  referralCode: string;
  referrals: Referral[];
  totalPointsEarned: number;
  pointBalance: number;
  hasReferrer: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyDone, setApplyDone] = useState(hasReferrer);
  const [applyError, setApplyError] = useState('');

  function copy() {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function applyReferral() {
    if (!applyCode.trim()) return;
    setApplyLoading(true);
    setApplyError('');
    try {
      const res = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: applyCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs: Record<string, string> = {
          already_referred: '이미 추천 코드를 사용했습니다.',
          invalid_code: '유효하지 않은 코드입니다.',
          self_referral: '본인의 코드는 사용할 수 없습니다.',
        };
        setApplyError(msgs[data.error] || '오류가 발생했습니다.');
        return;
      }
      setApplyDone(true);
    } catch {
      setApplyError('네트워크 오류가 발생했습니다.');
    } finally {
      setApplyLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/my-apps" className="text-xs" style={{ color: C.muted }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </Link>
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em]" style={{ color: C.redDim, fontFamily: C.cinzel }}>친구 추천</div>
          <h1 className="text-2xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>Referrals</h1>
        </div>
      </div>

      {/* 내 추천 코드 */}
      <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="text-[10px] uppercase tracking-widest" style={{ color: C.muted, fontFamily: C.cinzel }}>내 추천 코드</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl px-4 py-3 font-black text-lg tracking-widest"
            style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: C.red, fontFamily: C.cinzel }}>
            {referralCode || '—'}
          </div>
          <button onClick={copy}
            className="px-4 py-3 rounded-xl text-xs font-bold transition-all flex-shrink-0"
            style={{ backgroundColor: copied ? '#0d1a0d' : '#1a0404', color: copied ? '#4ade80' : C.red, border: `1px solid ${copied ? '#1a4a1a' : '#330000'}` }}>
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
        <p className="text-xs" style={{ color: C.sub, fontFamily: C.ibm }}>
          친구가 이 코드로 첫 구매를 완료하면 <strong style={{ color: C.text }}>2,000P</strong>를 받습니다.
          친구도 <strong style={{ color: C.text }}>1,000P</strong> 보너스를 받습니다.
        </p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '완료된 추천', value: `${referrals.filter(r => r.status === 'completed').length}명` },
          { label: '대기 중', value: `${referrals.filter(r => r.status === 'pending').length}명` },
          { label: '획득 포인트', value: `${totalPointsEarned.toLocaleString()}P` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: C.cinzel }}>{s.label}</div>
            <div className="font-black text-base" style={{ color: C.text, fontFamily: C.cinzel }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 친구 코드 입력 */}
      {!applyDone ? (
        <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: C.muted, fontFamily: C.cinzel }}>추천 코드 입력</div>
          <p className="text-xs" style={{ color: C.sub, fontFamily: C.ibm }}>
            친구의 추천 코드를 입력하고 첫 구매 시 1,000P를 받으세요.
          </p>
          <div className="flex gap-2">
            <input
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              placeholder="PLT-XXXXXX"
              maxLength={10}
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none tracking-widest"
              style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: C.text, fontFamily: C.cinzel }}
            />
            <button onClick={applyReferral} disabled={applyLoading || !applyCode}
              className="px-4 py-2 rounded-lg text-xs font-bold"
              style={{ backgroundColor: '#0d1a0d', color: '#4ade80', border: '1px solid #1a4a1a', opacity: applyCode ? 1 : 0.5 }}>
              {applyLoading ? '처리 중...' : '적용'}
            </button>
          </div>
          {applyError && <p className="text-xs" style={{ color: C.red }}>{applyError}</p>}
        </div>
      ) : (
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a4a1a' }}>
          <p className="text-sm font-bold" style={{ color: '#4ade80', fontFamily: C.cinzel }}>추천 코드가 적용되었습니다</p>
          <p className="text-xs mt-1" style={{ color: C.sub, fontFamily: C.ibm }}>첫 구매 완료 시 1,000P 지급</p>
        </div>
      )}

      {/* 추천 내역 */}
      {referrals.length > 0 && (
        <section>
          <h2 className="font-bold text-sm mb-3" style={{ color: C.text, fontFamily: C.cinzel }}>추천 내역</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {referrals.map((r, i) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: C.card, borderBottom: i < referrals.length - 1 ? '1px solid #1a1018' : 'none' }}>
                <div>
                  <div className="text-xs font-semibold" style={{ color: C.text, fontFamily: C.cinzel }}>
                    {r.referred_id ? '가입 완료' : '대기 중'}
                  </div>
                  <div className="text-[11px]" style={{ color: C.muted }}>
                    {new Date(r.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === 'completed' && (
                    <span className="font-black text-sm" style={{ color: '#4ade80' }}>+{r.points_awarded.toLocaleString()}P</span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: r.status === 'completed' ? '#0d1a0d' : '#1a1400',
                      color: r.status === 'completed' ? '#4ade80' : '#ccaa00',
                      border: `1px solid ${r.status === 'completed' ? '#1a4a1a' : '#332800'}`,
                    }}>
                    {r.status === 'completed' ? '완료' : '대기'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
