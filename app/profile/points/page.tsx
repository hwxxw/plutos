import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  red:    '#cc1a1a',
  redDim: '#880000',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  cinzel: 'Cinzel, serif',
  ibm:    "'IBM Plex Sans KR', sans-serif",
};

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  referral_earn:  { label: '추천인 보상',      color: '#4ade80' },
  referral_bonus: { label: '첫구매 보너스',    color: '#4ade80' },
  purchase_earn:  { label: '구매 적립',        color: '#4ade80' },
  checkout_use:   { label: '포인트 사용',      color: '#cc1a1a' },
  admin:          { label: '관리자 지급',      color: '#ccaa00' },
};

export default async function PointsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: history }] = await Promise.all([
    supabase.from('users').select('point_balance, membership_tier, total_spent_krw').eq('id', user.id).maybeSingle(),
    supabase.from('user_points').select('id, amount, type, description, balance_after, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
  ]);

  const balance = profile?.point_balance || 0;
  const membershipTier = profile?.membership_tier || 'bronze';
  const totalSpent = profile?.total_spent_krw || 0;

  const TIER_INFO: Record<string, { label: string; color: string; next?: string; nextAt?: number }> = {
    bronze:   { label: 'Bronze',   color: '#cd7f32', next: 'Silver',   nextAt: 50000 },
    silver:   { label: 'Silver',   color: '#b0b8c1', next: 'Gold',     nextAt: 200000 },
    gold:     { label: 'Gold',     color: '#ccaa00', next: 'Platinum', nextAt: 500000 },
    platinum: { label: 'Platinum', color: '#a8d8ea' },
  };

  const tier = TIER_INFO[membershipTier] || TIER_INFO.bronze;
  const progressPct = tier.nextAt ? Math.min(100, Math.round((totalSpent / tier.nextAt) * 100)) : 100;

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
          <div className="text-[11px] uppercase tracking-[0.25em]" style={{ color: C.redDim, fontFamily: C.cinzel }}>My Wallet</div>
          <h1 className="text-2xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>포인트</h1>
        </div>
      </div>

      {/* 잔액 카드 */}
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div>
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: C.cinzel }}>현재 잔액</div>
          <div className="font-black text-4xl" style={{ color: C.text, fontFamily: C.cinzel }}>
            {balance.toLocaleString()}<span className="text-lg ml-1" style={{ color: C.sub }}>P</span>
          </div>
          <div className="text-xs mt-1" style={{ color: C.sub, fontFamily: C.ibm }}>
            1P = 1원 • 결제 시 최대 20% 사용 가능
          </div>
        </div>

        {/* 멤버십 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold" style={{ color: tier.color, fontFamily: C.cinzel }}>{tier.label}</span>
            {tier.next && (
              <span style={{ color: C.muted, fontFamily: C.ibm }}>
                {(tier.nextAt! - totalSpent).toLocaleString()}원 더 쓰면 {tier.next}
              </span>
            )}
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1a1018' }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: tier.color }} />
          </div>
          <div className="text-[11px]" style={{ color: C.muted, fontFamily: C.ibm }}>
            누적 결제: {totalSpent.toLocaleString()}원
            {tier.nextAt && ` / ${tier.nextAt.toLocaleString()}원`}
          </div>
        </div>
      </div>

      {/* 멤버십 혜택 */}
      <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: C.muted, fontFamily: C.cinzel }}>멤버십 할인</div>
        {[
          { tier: 'Bronze', discount: '0%', color: '#cd7f32' },
          { tier: 'Silver', discount: '3%', color: '#b0b8c1' },
          { tier: 'Gold',   discount: '5%', color: '#ccaa00' },
          { tier: 'Platinum', discount: '10%', color: '#a8d8ea' },
        ].map((t) => (
          <div key={t.tier} className="flex items-center justify-between px-3 py-2 rounded-lg"
            style={{ backgroundColor: membershipTier === t.tier.toLowerCase() ? '#0d0a10' : 'transparent', border: membershipTier === t.tier.toLowerCase() ? '1px solid #2a1515' : '1px solid transparent' }}>
            <span className="text-xs font-bold" style={{ color: t.color, fontFamily: C.cinzel }}>{t.tier}</span>
            <span className="text-xs font-black" style={{ color: C.text }}>{t.discount} 할인</span>
          </div>
        ))}
      </div>

      {/* 거래 내역 */}
      <section>
        <h2 className="font-bold text-sm mb-3" style={{ color: C.text, fontFamily: C.cinzel }}>거래 내역</h2>
        {(history || []).length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>거래 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {(history || []).map((h: any, i: number) => {
              const typeInfo = TYPE_LABEL[h.type] || { label: h.type, color: C.sub };
              const isPositive = h.amount > 0;
              return (
                <div key={h.id} className="flex items-center justify-between px-4 py-3"
                  style={{ backgroundColor: C.card, borderBottom: i < (history?.length ?? 0) - 1 ? '1px solid #1a1018' : 'none' }}>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: typeInfo.color, fontFamily: C.cinzel }}>
                      {typeInfo.label}
                    </div>
                    {h.description && (
                      <div className="text-[11px] mt-0.5" style={{ color: C.muted, fontFamily: C.ibm }}>{h.description}</div>
                    )}
                    <div className="text-[11px]" style={{ color: C.muted }}>
                      {new Date(h.created_at).toLocaleDateString('ko-KR')} · 잔액 {h.balance_after.toLocaleString()}P
                    </div>
                  </div>
                  <div className="font-black text-base" style={{ color: isPositive ? '#4ade80' : C.red }}>
                    {isPositive ? '+' : ''}{h.amount.toLocaleString()}P
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
