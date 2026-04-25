'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TIER_INFO, type TierName } from '@/lib/supabase/types';
import { formatKRW } from '@/lib/format';

type TierForm = {
  enabled: boolean;
  price_krw: number;
  max_seats: number;
};

const DEFAULT_TIERS: Record<TierName, TierForm> = {
  basic:    { enabled: true,  price_krw: 9900,   max_seats: 1 },
  plus:     { enabled: false, price_krw: 39900,  max_seats: 1 },
  business: { enabled: false, price_krw: 149000, max_seats: 5 },
};

const CATEGORIES = [
  { k: 'writing',    l: '글쓰기' },
  { k: 'data',       l: '데이터' },
  { k: 'automation', l: '자동화' },
  { k: 'design',     l: '디자인' },
  { k: 'learning',   l: '학습' },
  { k: 'business',   l: '비즈니스' },
  { k: 'marketing',  l: '마케팅' },
  { k: 'dev',        l: '개발' },
];

export default function NewAppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    short_name: '',
    tagline: '',
    description: '',
    origin_url: '',
    icon_url: '',
    category: 'writing',
    theme_color: '#6366f1',
  });
  const [tiers, setTiers] = useState<Record<TierName, TierForm>>(DEFAULT_TIERS);

  function updateTier(tier: TierName, patch: Partial<TierForm>) {
    setTiers((prev) => ({ ...prev, [tier]: { ...prev[tier], ...patch } }));
  }

  function validateForm(): string | null {
    if (form.name.length < 2) return '앱 이름은 최소 2자 이상이어야 합니다.';
    if (form.short_name.length < 2) return '짧은 이름을 입력하세요.';
    if (form.description.length < 20) return '설명은 20자 이상이어야 합니다.';
    if (!/^https?:\/\/.+/.test(form.origin_url)) return '원본 URL은 http/https로 시작해야 합니다.';
    if (!/^https?:\/\/.+/.test(form.icon_url)) return '아이콘 URL을 입력하세요.';

    const activeTiers = (Object.keys(tiers) as TierName[]).filter((t) => tiers[t].enabled);
    if (activeTiers.length === 0) return '최소 1개 티어를 활성화하세요.';

    for (const t of activeTiers) {
      const info = TIER_INFO[t];
      const price = tiers[t].price_krw;
      if (price < info.minPrice || price > info.maxPrice) {
        return `${info.label} 티어 가격은 ${formatKRW(info.minPrice)} ~ ${formatKRW(info.maxPrice)} 사이여야 합니다.`;
      }
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const activeTiers = (Object.keys(tiers) as TierName[])
        .filter((t) => tiers[t].enabled)
        .map((t) => ({
          tier: t,
          price_krw: tiers[t].price_krw,
          max_seats: tiers[t].max_seats,
        }));

      const res = await fetch('/api/developer/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tiers: activeTiers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '등록 실패');

      router.push(`/developer/apps/${data.app_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">새 앱 등록</h1>

      {error && (
        <div className="card bg-red-50 border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* 기본 정보 */}
      <section className="card space-y-3">
        <h2 className="font-semibold text-sm text-slate-700">기본 정보</h2>

        <div>
          <label className="block text-xs font-semibold mb-1">앱 이름</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="예: 문서 요약 AI"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">짧은 이름 (홈화면용)</label>
          <input
            required
            maxLength={20}
            value={form.short_name}
            onChange={(e) => setForm({ ...form, short_name: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="예: 문서요약"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">태그라인</label>
          <input
            maxLength={100}
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="한 줄 설명"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">상세 설명 (20자 이상)</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            원본 URL (비공개 저장)
          </label>
          <input
            required
            type="url"
            value={form.origin_url}
            onChange={(e) => setForm({ ...form, origin_url: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="https://my-app.example.com"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            외부에 절대 노출되지 않습니다. 프록시 서버만 접근.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">아이콘 URL (192×192 PNG)</label>
          <input
            required
            type="url"
            value={form.icon_url}
            onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">카테고리</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.k} value={c.k}>{c.l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">테마 색상</label>
            <input
              type="color"
              value={form.theme_color}
              onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
              className="w-full h-10 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* 티어 설정 */}
      <section className="card space-y-4">
        <h2 className="font-semibold text-sm text-slate-700">가격 티어 설정</h2>
        <p className="text-xs text-slate-500">
          최소 1개 이상 활성화. Plus 활성화 권장 (프리미엄 효과).
        </p>

        {(Object.keys(TIER_INFO) as TierName[]).map((t) => {
          const info = TIER_INFO[t];
          const seats = Array.isArray(info.seats) ? info.seats : [info.seats];
          return (
            <div
              key={t}
              className={`border-2 rounded-xl p-3 transition ${
                tiers[t].enabled
                  ? 'border-brand-200 bg-brand-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={tiers[t].enabled}
                  onChange={(e) => updateTier(t, { enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <span className="font-bold">{info.label}</span>
                <span className="text-xs text-slate-500">{info.description}</span>
              </div>

              {tiers[t].enabled && (
                <div className="ml-6 space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold mb-1">
                      가격 ({formatKRW(info.minPrice)} ~ {formatKRW(info.maxPrice)})
                    </label>
                    <input
                      type="number"
                      step="100"
                      min={info.minPrice}
                      max={info.maxPrice}
                      value={tiers[t].price_krw}
                      onChange={(e) =>
                        updateTier(t, { price_krw: parseInt(e.target.value || '0', 10) })
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                  </div>

                  {t === 'business' && (
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">
                        공유 인원 (Seat 수)
                      </label>
                      <select
                        value={tiers[t].max_seats}
                        onChange={(e) =>
                          updateTier(t, { max_seats: parseInt(e.target.value, 10) })
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                      >
                        {seats.map((s) => (
                          <option key={s} value={s}>{s}명</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3"
      >
        {loading ? '등록 중...' : '등록 (검토 대기)'}
      </button>
    </form>
  );
}
