'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TIER_INFO, type TierName } from '@/lib/supabase/types';

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

const REFUND_REASONS = [
  '기대와 다릅니다',
  '기능이 작동하지 않습니다',
  '실수로 구매했습니다',
  '다른 앱을 구매하고 싶습니다',
  '기타',
];

type AppItem = {
  source: 'owned' | 'shared';
  licenseId: string;
  tier: TierName;
  date: string;
  purchasedAt: string;
  usageSeconds: number;
  app: { id: string; name: string; slug: string; icon_url?: string; status: string };
};

function isRefundEligible(purchasedAt: string, usageSeconds: number): { ok: boolean; reason?: string } {
  const diffDays = (Date.now() - new Date(purchasedAt).getTime()) / 86_400_000;
  if (diffDays > 7) return { ok: false, reason: '7일 환불 기간이 지났습니다' };
  if (usageSeconds >= 3600) return { ok: false, reason: '사용 시간 1시간 초과' };
  return { ok: true };
}

export default function MyAppsClient({
  items,
  pointBalance,
  membershipTier,
}: {
  items: AppItem[];
  pointBalance: number;
  membershipTier: string;
}) {
  const [apps, setApps] = useState(items);
  const [refundTarget, setRefundTarget] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState(REFUND_REASONS[0]);
  const [loading, setLoading] = useState<string | null>(null);

  const TIER_BADGE: Record<string, { label: string; color: string }> = {
    bronze:   { label: 'Bronze', color: '#cd7f32' },
    silver:   { label: 'Silver', color: '#b0b8c1' },
    gold:     { label: 'Gold',   color: '#ccaa00' },
    platinum: { label: 'Platinum', color: '#a8d8ea' },
  };

  async function requestRefund(licenseId: string) {
    setLoading(licenseId);
    try {
      const res = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_id: licenseId, reason: refundReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg: Record<string, string> = {
          refund_window_expired: '환불 기간(7일)이 지났습니다.',
          usage_limit_exceeded: '사용 시간이 1시간을 초과해 환불이 불가합니다.',
          refund_already_requested: '이미 환불이 신청되었습니다.',
          stripe_refund_failed: 'Stripe 환불 처리 중 오류가 발생했습니다.',
        };
        alert(msg[data.error] || '환불 처리 중 오류가 발생했습니다.');
        return;
      }
      setApps((prev) => prev.filter((a) => a.licenseId !== licenseId));
      setRefundTarget(null);
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(null);
    }
  }

  const tierInfo = TIER_BADGE[membershipTier] || TIER_BADGE.bronze;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] mb-1" style={{ color: C.redDim, fontFamily: C.cinzel }}>
            My Library
          </div>
          <h1 className="text-2xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>내 앱</h1>
          <p className="text-xs mt-1" style={{ color: C.sub, fontFamily: C.ibm }}>
            구매했거나 공유받은 앱을 언제든 다시 설치할 수 있습니다.
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: C.muted, fontFamily: C.cinzel }}>멤버십</div>
          <div className="font-black text-base" style={{ color: tierInfo.color, fontFamily: C.cinzel }}>
            {tierInfo.label}
          </div>
          <div className="text-xs" style={{ color: C.sub, fontFamily: C.ibm }}>
            {pointBalance.toLocaleString()}P
          </div>
        </div>
      </div>

      {/* 앱 목록 */}
      {apps.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }} />
          <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>아직 구매한 앱이 없습니다.</p>
          <Link href="/" className="inline-block mt-4 text-xs font-bold px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#1a0404', color: C.red, border: '1px solid #330000', fontFamily: C.cinzel }}>
            앱 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((item) => {
            const eligibility = item.source === 'owned' ? isRefundEligible(item.purchasedAt, item.usageSeconds) : null;
            const isRefunding = refundTarget === item.licenseId;
            const tierColor = TIER_INFO[item.tier]?.color ?? '#888';

            return (
              <div key={item.licenseId} className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                {/* 앱 행 */}
                <div className="flex items-center gap-3 p-4">
                  <Link href={`/install/${item.app.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    {item.app.icon_url
                      ? <img src={item.app.icon_url} alt={item.app.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" style={{ backgroundColor: '#1a0a0e' }} />
                      : <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }} />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm truncate" style={{ color: C.text, fontFamily: C.cinzel }}>
                          {item.app.name}
                        </span>
                        {item.source === 'shared' && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ backgroundColor: '#0d0a20', color: '#7788ff', border: '1px solid #222244' }}>
                            공유됨
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierColor }} />
                        <span className="text-xs" style={{ color: tierColor }}>{TIER_INFO[item.tier]?.label}</span>
                        <span className="text-xs" style={{ color: C.muted }}>
                          {new Date(item.date).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.tier === 'business' && item.source === 'owned' && (
                      <Link href={`/my-apps/team/${item.licenseId}`}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg"
                        style={{ backgroundColor: '#1a1400', color: '#ccaa00', border: '1px solid #332800' }}>
                        팀 관리
                      </Link>
                    )}
                    <Link href={`/install/${item.app.id}`}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: '#0d1a0d', color: '#4ade80', border: '1px solid #1a4a1a' }}>
                      설치 →
                    </Link>
                    {item.source === 'owned' && (
                      <button
                        onClick={() => setRefundTarget(isRefunding ? null : item.licenseId)}
                        title={eligibility?.ok ? '환불 신청' : eligibility?.reason}
                        className="text-[11px] font-bold px-2 py-1.5 rounded-lg transition-opacity"
                        style={{
                          backgroundColor: eligibility?.ok ? '#1a0404' : '#0d0a10',
                          color: eligibility?.ok ? C.red : C.muted,
                          border: `1px solid ${eligibility?.ok ? '#330000' : '#1a1018'}`,
                          opacity: eligibility?.ok ? 1 : 0.4,
                          cursor: eligibility?.ok ? 'pointer' : 'not-allowed',
                        }}
                        disabled={!eligibility?.ok}>
                        환불
                      </button>
                    )}
                  </div>
                </div>

                {/* 환불 패널 */}
                {isRefunding && (
                  <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid #1a1018' }}>
                    <p className="text-[11px] pt-3" style={{ color: C.sub, fontFamily: C.ibm }}>
                      환불 후 라이선스가 즉시 취소됩니다. 사유를 선택해 주세요.
                    </p>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                      style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: C.text, fontFamily: C.ibm }}>
                      {REFUND_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => requestRefund(item.licenseId)}
                        disabled={loading === item.licenseId}
                        className="flex-1 py-2 rounded-lg text-xs font-bold"
                        style={{ backgroundColor: '#330000', color: C.red, border: '1px solid #660000' }}>
                        {loading === item.licenseId ? '처리 중...' : '환불 확정'}
                      </button>
                      <button
                        onClick={() => setRefundTarget(null)}
                        className="px-4 py-2 rounded-lg text-xs"
                        style={{ backgroundColor: '#0d0a10', color: C.muted, border: `1px solid ${C.border}` }}>
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 포인트 / 추천 링크 */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/profile/points"
          className="rounded-xl p-4 text-center hover:opacity-90 transition-opacity"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: C.cinzel }}>포인트</div>
          <div className="font-black text-xl" style={{ color: C.text, fontFamily: C.cinzel }}>{pointBalance.toLocaleString()}P</div>
        </Link>
        <Link href="/profile/referrals"
          className="rounded-xl p-4 text-center hover:opacity-90 transition-opacity"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: C.cinzel }}>친구 추천</div>
          <div className="font-black text-sm" style={{ color: C.red, fontFamily: C.cinzel }}>코드 확인 →</div>
        </Link>
      </div>
    </div>
  );
}
