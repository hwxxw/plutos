import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatKRW } from '@/lib/format';
import { TIER_INFO, type TierName } from '@/lib/supabase/types';

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

export default async function DeveloperAppDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: app }, { data: tiers }, { data: sales }] = await Promise.all([
    supabase.from('apps').select('*').eq('id', params.id).eq('developer_id', user.id).maybeSingle(),
    supabase.from('app_tiers').select('*').eq('app_id', params.id).order('price_krw'),
    supabase.from('licenses').select('tier, amount_paid_krw, developer_payout, purchased_at')
      .eq('app_id', params.id).eq('status', 'active').order('purchased_at', { ascending: false }).limit(30),
  ]);

  if (!app) notFound();

  const tierSales: Record<string, { count: number; revenue: number }> = {};
  (sales || []).forEach((s) => {
    if (!tierSales[s.tier]) tierSales[s.tier] = { count: 0, revenue: 0 };
    tierSales[s.tier].count++;
    tierSales[s.tier].revenue += s.developer_payout;
  });

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Link href="/developer" className="flex items-center gap-1 text-xs" style={{ color: C.muted }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        대시보드
      </Link>

      {/* 앱 헤더 */}
      <section className="rounded-2xl p-5 flex items-center gap-4" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        {app.icon_url
          ? <img src={app.icon_url} alt={app.name} className="w-16 h-16 rounded-2xl object-cover" style={{ backgroundColor: '#1a0a0e' }} />
          : <div className="w-16 h-16 rounded-2xl" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }} />
        }
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-xl truncate" style={{ color: C.text, fontFamily: C.cinzel }}>{app.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={app.status} />
            {app.slug && <span className="text-xs" style={{ color: C.muted }}>/{app.slug}</span>}
          </div>
          {app.status === 'pending' && (
            <p className="text-xs mt-2" style={{ color: '#ccaa00', fontFamily: C.ibm }}>
              관리자 심사 중입니다. 통과 후 마켓에 노출됩니다.
            </p>
          )}
          {app.status === 'rejected' && (
            <p className="text-xs mt-2" style={{ color: C.red, fontFamily: C.ibm }}>
              반려되었습니다. 내용을 수정 후 다시 신청하세요.
            </p>
          )}
        </div>
        {app.status === 'active' && (
          <Link href={`/apps/${app.slug}`} className="btn-secondary text-xs px-4 py-2 flex-shrink-0" style={{ fontFamily: C.cinzel }}>
            공개 페이지 →
          </Link>
        )}
      </section>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: C.cinzel }}>총 판매</div>
          <div className="font-black text-2xl" style={{ color: C.text, fontFamily: C.cinzel }}>{app.total_sales}건</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: C.cinzel }}>누적 수익</div>
          <div className="font-black text-2xl" style={{ color: C.red, fontFamily: C.cinzel }}>{formatKRW(app.total_revenue_krw)}</div>
        </div>
      </div>

      {/* 티어별 성과 */}
      <section>
        <h2 className="font-bold text-sm mb-3" style={{ color: C.text, fontFamily: C.cinzel }}>티어별 성과</h2>
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          {(tiers || []).map((t, i) => {
            const info = TIER_INFO[t.tier as TierName];
            const stats = tierSales[t.tier] || { count: 0, revenue: 0 };
            return (
              <div key={t.id} className="flex items-center justify-between px-5 py-3"
                style={{ backgroundColor: C.card, borderBottom: i < (tiers?.length ?? 0) - 1 ? '1px solid #1a1018' : 'none' }}>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                  <span className="font-semibold text-sm" style={{ color: C.text, fontFamily: C.cinzel }}>{info.label}</span>
                  <span className="text-xs" style={{ color: C.muted }}>{formatKRW(t.price_krw)}</span>
                  {!t.is_active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#0d0d14', color: C.muted, border: '1px solid #1a1018' }}>비활성</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-black text-sm" style={{ color: '#4ade80' }}>{formatKRW(stats.revenue)}</div>
                  <div className="text-xs" style={{ color: C.muted }}>{stats.count}건</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 최근 판매 */}
      <section>
        <h2 className="font-bold text-sm mb-3" style={{ color: C.text, fontFamily: C.cinzel }}>최근 판매</h2>
        {(sales || []).length === 0 ? (
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-sm" style={{ color: C.sub }}>판매 이력 없음</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {sales!.slice(0, 10).map((s, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: C.card, borderBottom: i < Math.min(sales!.length, 10) - 1 ? '1px solid #1a1018' : 'none' }}>
                <div>
                  <span className="font-semibold text-sm capitalize" style={{ color: C.text }}>{s.tier}</span>
                  <span className="text-xs ml-2" style={{ color: C.muted }}>{new Date(s.purchased_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <span className="font-black text-sm" style={{ color: '#4ade80' }}>+{formatKRW(s.developer_payout)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:    { bg: '#0d1a0d', color: '#4ade80', label: '판매중' },
    pending:   { bg: '#1a1400', color: '#ccaa00', label: '심사중' },
    suspended: { bg: '#1a0404', color: '#cc1a1a', label: '정지' },
    rejected:  { bg: '#0d0d14', color: '#4a3535', label: '반려' },
  };
  const s = map[status] ?? { bg: '#0d0d14', color: '#888888', label: status };
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>
      {s.label}
    </span>
  );
}
