'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatKRW } from '@/lib/format';
import { TIER_INFO, TIER_ORDER, type TierName, type AppTier } from '@/lib/supabase/types';

interface Props {
  appId: string;
  appSlug: string;
  tiers: AppTier[];
  existingTier: TierName | null;  // 이미 구매한 경우
}

export function TierSelector({ appId, appSlug, tiers, existingTier }: Props) {
  const router = useRouter();
  // 기본값: 가장 저렴한 활성 티어, Plus 있으면 Plus 먼저
  const defaultTier = (() => {
    const byOrder = TIER_ORDER.find((t) => tiers.some((x) => x.tier === t && x.is_active));
    return (byOrder as TierName) || 'basic';
  })();

  const [selected, setSelected] = useState<TierName>(defaultTier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const selectedTier = tiers.find((t) => t.tier === selected);

  // 업그레이드 가능 여부
  const canUpgrade = (tier: TierName): boolean => {
    if (!existingTier) return true;
    const existingIdx = TIER_ORDER.indexOf(existingTier);
    const targetIdx = TIER_ORDER.indexOf(tier);
    return targetIdx > existingIdx;
  };

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?next=/apps/${appSlug}`);
          return;
        }
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
    return <div className="text-sm text-slate-500">티어가 설정되지 않았습니다.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-slate-700">어떤 버전을 쓰실래요?</div>

      <div className="space-y-2">
        {TIER_ORDER.map((tierName) => {
          const tier = tiers.find((t) => t.tier === tierName && t.is_active);
          if (!tier) return null;

          const info = TIER_INFO[tierName];
          const isSelected = selected === tierName;
          const isCurrent = existingTier === tierName;
          const canBuy = !existingTier || canUpgrade(tierName);
          const diff =
            existingTier && canBuy
              ? tier.price_krw - (tiers.find((t) => t.tier === existingTier)?.price_krw ?? 0)
              : null;

          return (
            <button
              key={tierName}
              type="button"
              disabled={!canBuy}
              onClick={() => canBuy && setSelected(tierName)}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition ${
                isSelected
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${!canBuy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                  <span className="font-bold">{info.label}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                      보유중
                    </span>
                  )}
                  {tier.tier === 'business' && (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      {tier.max_seats}명
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {diff !== null ? (
                    <>
                      <div className="text-xs text-slate-500 line-through">
                        {formatKRW(tier.price_krw)}
                      </div>
                      <div className="font-bold text-brand-600">
                        +{formatKRW(diff)}
                      </div>
                    </>
                  ) : (
                    <div className="font-bold">{formatKRW(tier.price_krw)}</div>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1 ml-4">{info.description}</div>
            </button>
          );
        })}
      </div>

      {/* 마케팅 동의 (신규 구매 시만) */}
      {!existingTier && (
        <label className="flex items-start gap-2 text-xs text-slate-600 px-1">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            개발자의 업데이트·마케팅 이메일 수신에 동의합니다 (선택, 언제든 해지 가능)
          </span>
        </label>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 rounded p-2">{error}</div>
      )}

      <button
        onClick={handleAction}
        disabled={loading || !selectedTier}
        className="w-full btn-primary text-base py-2.5"
      >
        {loading
          ? '이동 중...'
          : existingTier && canUpgrade(selected)
          ? `${TIER_INFO[selected].label}(으)로 업그레이드`
          : existingTier === selected
          ? '이미 보유중'
          : `${TIER_INFO[selected].label} 구매하기`}
      </button>
    </div>
  );
}
