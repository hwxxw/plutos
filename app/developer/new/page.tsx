'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TIER_INFO, type TierName } from '@/lib/supabase/types';
import { formatKRW } from '@/lib/format';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  borderA:'#660000',
  red:    '#cc1a1a',
  redDim: '#880000',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  input:  '#0d0a10',
  inputBorder: '#3a1515',
  cinzel: 'Cinzel, serif' as const,
  ibm:    "'IBM Plex Sans KR', sans-serif" as const,
};

type TierForm = { enabled: boolean; price_krw: number; max_seats: number };

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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: C.cinzel }}>
      {children}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg px-4 py-3 text-sm outline-none"
      style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}`, color: C.text, ...props.style }}
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none"
      style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}`, color: C.text, ...props.style }}
    />
  );
}

function Select({ ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg px-4 py-3 text-sm outline-none"
      style={{ backgroundColor: C.input, border: `1px solid ${C.inputBorder}`, color: C.text, ...props.style }}
    />
  );
}

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
    theme_color: '#cc1a1a',
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
    if (err) { setError(err); return; }
    setLoading(true);
    setError(null);

    try {
      const activeTiers = (Object.keys(tiers) as TierName[])
        .filter((t) => tiers[t].enabled)
        .map((t) => ({ tier: t, price_krw: tiers[t].price_krw, max_seats: tiers[t].max_seats }));

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
    <div className="max-w-lg mx-auto py-10 space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-2" style={{ color: C.redDim, fontFamily: C.cinzel }}>
          Developer · New App
        </div>
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: C.cinzel, color: C.text }}>새 앱 등록</h1>
        <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>
          등록 후 관리자 심사를 거쳐 마켓에 게시됩니다.
        </p>
      </div>

      {error && (
        <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#1a0404', border: '1px solid #660000', color: '#cc3333', fontFamily: C.ibm }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <section className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="text-[11px] uppercase tracking-widest" style={{ color: C.muted, fontFamily: C.cinzel }}>기본 정보</div>

          <div>
            <Label>앱 이름 *</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 문서 요약 AI" />
          </div>

          <div>
            <Label>짧은 이름 (홈화면용) *</Label>
            <Input required maxLength={20} value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} placeholder="예: 문서요약" />
          </div>

          <div>
            <Label>태그라인</Label>
            <Input maxLength={100} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="한 줄 설명" />
          </div>

          <div>
            <Label>상세 설명 (20자 이상) *</Label>
            <Textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <Label>원본 URL (비공개 저장) *</Label>
            <Input required type="url" value={form.origin_url} onChange={(e) => setForm({ ...form, origin_url: e.target.value })} placeholder="https://my-app.example.com" />
            <p className="text-[10px] mt-1" style={{ color: C.muted }}>외부에 절대 노출되지 않습니다. 프록시 서버만 접근합니다.</p>
          </div>

          <div>
            <Label>아이콘 URL (192×192 PNG) *</Label>
            <Input required type="url" value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>카테고리</Label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c.k} value={c.k} style={{ backgroundColor: '#0d0a10' }}>{c.l}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>테마 색상</Label>
              <div className="flex gap-2">
                <input type="color" value={form.theme_color} onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
                  className="h-12 w-12 rounded-lg cursor-pointer border-0 p-1"
                  style={{ backgroundColor: '#0d0a10', border: `1px solid ${C.inputBorder}` }} />
                <Input value={form.theme_color} onChange={(e) => setForm({ ...form, theme_color: e.target.value })} />
              </div>
            </div>
          </div>
        </section>

        {/* 티어 설정 */}
        <section className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div>
            <div className="text-[11px] uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: C.cinzel }}>가격 티어 설정</div>
            <p className="text-xs" style={{ color: C.sub, fontFamily: C.ibm }}>최소 1개 이상 활성화. Plus 활성화 권장.</p>
          </div>

          {(Object.keys(TIER_INFO) as TierName[]).map((t) => {
            const info = TIER_INFO[t];
            const seats = Array.isArray(info.seats) ? info.seats : [info.seats];
            const isOn = tiers[t].enabled;
            return (
              <div key={t} className="rounded-xl p-4 transition-all"
                style={{
                  backgroundColor: isOn ? '#1a0404' : '#0d0a10',
                  border: `1px solid ${isOn ? C.borderA : C.border}`,
                }}>
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" checked={isOn} onChange={(e) => updateTier(t, { enabled: e.target.checked })}
                    className="w-4 h-4" style={{ accentColor: C.red }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
                  <span className="font-semibold text-sm" style={{ color: C.text, fontFamily: C.cinzel }}>{info.label}</span>
                  <span className="text-xs" style={{ color: C.sub }}>{info.description}</span>
                </div>

                {isOn && (
                  <div className="ml-7 space-y-3 mt-3">
                    <div>
                      <Label>가격 ({formatKRW(info.minPrice)} ~ {formatKRW(info.maxPrice)})</Label>
                      <Input type="number" step="100" min={info.minPrice} max={info.maxPrice}
                        value={tiers[t].price_krw}
                        onChange={(e) => updateTier(t, { price_krw: parseInt(e.target.value || '0', 10) })} />
                    </div>
                    {t === 'business' && (
                      <div>
                        <Label>공유 인원 (Seat 수)</Label>
                        <Select value={tiers[t].max_seats}
                          onChange={(e) => updateTier(t, { max_seats: parseInt(e.target.value, 10) })}>
                          {seats.map((s) => (
                            <option key={s} value={s} style={{ backgroundColor: '#0d0a10' }}>{s}명</option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
          style={{
            backgroundColor: loading ? '#330000' : C.red,
            color: '#fff',
            fontFamily: C.cinzel,
            letterSpacing: '0.1em',
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? '등록 중...' : '심사 신청하기 →'}
        </button>

        <p className="text-center text-xs" style={{ color: C.muted }}>
          등록 후 관리자 심사 → 승인 시 마켓 노출
        </p>
      </form>
    </div>
  );
}
