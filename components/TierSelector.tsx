'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatKRW } from '@/lib/format';
import { TIER_INFO, TIER_ORDER, type TierName, type AppTier } from '@/lib/supabase/types';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  red:    '#cc1a1a',
  redDim: '#880000',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  input:  '#0d0a10',
  cinzel: 'Cinzel, serif' as const,
  ibm:    "'IBM Plex Sans KR', sans-serif" as const,
};

const TIER_DISCOUNT: Record<string, number> = {
  bronze:   0,
  silver:   0.03,
  gold:     0.05,
  platinum: 0.10,
};

interface Props {
  appId: string;
  appSlug: string;
  tiers: AppTier[];
  existingTier: TierName | null;
  pointBalance?: number;
  membershipTier?: string;
}

export function TierSelector({ appId, appSlug, tiers, existingTier, pointBalance = 0, membershipTier = 'bronze' }: Props) {
  const router = useRouter();

  const defaultTier = (() => {
    const byOrder = TIER_ORDER.find((t) => tiers.some((x) => x.tier === t && x.is_active));
    return (byOrder as TierName) || 'basic';
  })();

  const [selected, setSelected] = useState<TierName>(existingTier && TIER_ORDER.indexOf(existingTier as any) < TIER_ORDER.length - 1
    ? TIER_ORDER[TIER_ORDER.indexOf(existingTier as any) + 1] as TierName
    : defaultTier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [usePoints, setUsePoints] = useState(0);

  const selectedTier = tiers.find((t) => t.tier === selected);
  const discountRate = TIER_DISCOUNT[membershipTier] ?? 0;
  const basePrice = selectedTier?.price_krw ?? 0;
  const afterDiscount = Math.round(basePrice * (1 - discountRate));
  const maxPoints = Math.floor(afterDiscount * 0.2);
  const usablePoints = Math.min(usePoints, pointBalance, maxPoints);
  const finalPrice = Math.max(0, afterDiscount - usablePoints);

  function canUpgrade(tier: TierName): boolean {
    if (!existingTier) return true;
    return TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(existingTier);
  }

  async function handleAction() {
    setLoading(true);
    setError(null);
    try {
      const isUpgrade = existingTier && canUpgrade(selected);
      const endpoint = isUpgrade ? '/api/upgrade' : '/api/checkout';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          tier: selected,
          marketingConsent: !existingTier ? marketingConsent : undefined,
          usePoints: !existingTier ? usablePoints : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { router.push(`/login?next=/apps/${appSlug}`); return; }
        throw new Error(data.error || '결제 세션 생성 실패');
      }
      if (data.url) window.location.href = data.url;
      else throw new Error('결제 URL을 받지 못했습니다');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      setLoading(false);
    }
  }

  if (tiers.length === 0) {
    return <div className="text-sm" style={{ color: C.sub }}>티어가 설정되지 않았습니다.</div>;
  }

  const isAlreadyOwned = existingTier === selected;
  const canBuySelected = !existingTier || canUpgrade(selected);

  return (
    <div className="space-y-3">
      <div className="text-[11px] uppercase tracking-widest" style={{ color: C.muted, fontFamily: C.cinzel }}>
        티어 선택
      </div>

      <div className="space-y-2">
        {TIER_ORDER.map((tierName) => {
          const tier = tiers.find((t) => t.tier === tierName && t.is_active);
          if (!tier) return null;

          const info = TIER_INFO[tierName];
          const isSelected = selected === tierName;
          const isCurrent = existingTier === tierName;
          const canBuy = !existingTier || canUpgrade(tierName);
          const priceDiff = existingTier && canBuy
            ? tier.price_krw - (tiers.find((t) => t.tier === existingTier)?.price_krw ?? 0)
            : null;
          const discountedPrice = Math.round(tier.price_krw * (1 - discountRate));

          return (
            <button
              key={tierName}
              type="button"
              disabled={!canBuy}
              onClick={() => canBuy && setSelected(tierName)}
              className="w-full text-left rounded-xl px-4 py-3 transition-all"
              style={{
                backgroundColor: isSelected ? '#1a0404' : '#0d0a10',
                border: `1px solid ${isSelected ? '#660000' : '#2a1515'}`,
                opacity: canBuy ? 1 : 0.4,
                cursor: canBuy ? 'pointer' : 'not-allowed',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                  <span className="font-bold text-sm" style={{ color: C.text, fontFamily: C.cinzel }}>{info.label}</span>
                  {isCurrent && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#0d1a0d', color: '#4ade80', border: '1px solid #1a4a1a' }}>
                      보유중
                    </span>
                  )}
                  {tier.tier === 'business' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#1a1400', color: '#ccaa00', border: '1px solid #332800' }}>
                      {tier.max_seats}석
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {priceDiff !== null ? (
                    <>
                      <div className="text-[11px] line-through" style={{ color: C.muted }}>{formatKRW(tier.price_krw)}</div>
                      <div className="font-black text-sm" style={{ color: C.red }}>+{formatKRW(priceDiff)}</div>
                    </>
                  ) : (
                    <>
                      {discountRate > 0 && (
                        <div className="text-[10px] line-through" style={{ color: C.muted }}>{formatKRW(tier.price_krw)}</div>
                      )}
                      <div className="font-black text-sm" style={{ color: C.text }}>{formatKRW(discountedPrice)}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="text-xs mt-1 ml-[18px]" style={{ color: C.sub, fontFamily: C.ibm }}>{info.description}</div>
            </button>
          );
        })}
      </div>

      {/* 멤버십 할인 표시 */}
      {!existingTier && discountRate > 0 && selectedTier && (
        <div className="rounded-lg px-3 py-2 text-xs flex items-center justify-between"
          style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a4a1a' }}>
          <span style={{ color: '#4ade80', fontFamily: C.ibm }}>멤버십 할인 {Math.round(discountRate * 100)}% 적용</span>
          <span style={{ color: '#4ade80', fontFamily: C.cinzel }}>-{formatKRW(basePrice - afterDiscount)}</span>
        </div>
      )}

      {/* 포인트 사용 (신규 구매 시) */}
      {!existingTier && pointBalance > 0 && selectedTier && (
        <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: '#0d0a10', border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: C.sub, fontFamily: C.ibm }}>포인트 사용 (최대 {formatKRW(maxPoints)})</span>
            <span style={{ color: C.muted, fontFamily: C.ibm }}>보유 {pointBalance.toLocaleString()}P</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={Math.min(pointBalance, maxPoints)}
              step={100}
              value={usePoints}
              onChange={(e) => setUsePoints(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: C.red }}
            />
            <span className="text-xs font-black w-16 text-right" style={{ color: C.red, fontFamily: C.cinzel }}>
              {usePoints.toLocaleString()}P
            </span>
          </div>
          {usePoints > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: C.muted }}>포인트 적용 후</span>
              <span className="font-black" style={{ color: C.text, fontFamily: C.cinzel }}>{formatKRW(finalPrice)}</span>
            </div>
          )}
        </div>
      )}

      {/* 마케팅 동의 */}
      {!existingTier && (
        <label className="flex items-start gap-2 text-xs px-1 cursor-pointer" style={{ color: C.sub, fontFamily: C.ibm }}>
          <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5" style={{ accentColor: C.red }} />
          <span>개발자의 업데이트·마케팅 이메일 수신에 동의합니다 (선택, 언제든 해지 가능)</span>
        </label>
      )}

      {error && (
        <div className="text-xs rounded-lg p-3" style={{ backgroundColor: '#1a0404', color: C.red, border: '1px solid #330000', fontFamily: C.ibm }}>
          {error}
        </div>
      )}

      <button
        onClick={handleAction}
        disabled={loading || !selectedTier || isAlreadyOwned}
        className="w-full py-3 rounded-xl text-sm font-black transition-all"
        style={{
          backgroundColor: isAlreadyOwned ? '#0d0a10' : C.red,
          color: isAlreadyOwned ? C.muted : '#fff',
          border: `1px solid ${isAlreadyOwned ? C.border : '#880000'}`,
          fontFamily: C.cinzel,
          opacity: (loading || !selectedTier || isAlreadyOwned) ? 0.5 : 1,
        }}
      >
        {loading ? '이동 중...'
          : isAlreadyOwned ? '이미 보유중'
          : existingTier && canUpgrade(selected) ? `${TIER_INFO[selected].label}(으)로 업그레이드`
          : `${TIER_INFO[selected].label} 구매하기 — ${formatKRW(finalPrice)}`
        }
      </button>
    </div>
  );
}
