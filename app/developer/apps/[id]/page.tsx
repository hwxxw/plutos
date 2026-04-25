import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatKRW } from '@/lib/format';
import { TIER_INFO, type TierName } from '@/lib/supabase/types';

export default async function DeveloperAppDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: app } = await supabase
    .from('apps')
    .select('*')
    .eq('id', params.id)
    .eq('developer_id', user.id)
    .maybeSingle();

  if (!app) notFound();

  const { data: tiers } = await supabase
    .from('app_tiers')
    .select('*')
    .eq('app_id', app.id)
    .order('price_krw');

  const { data: sales } = await supabase
    .from('licenses')
    .select('tier, amount_paid_krw, developer_payout, purchased_at')
    .eq('app_id', app.id)
    .eq('status', 'active')
    .order('purchased_at', { ascending: false })
    .limit(30);

  // 티어별 판매 집계
  const tierSales: Record<string, { count: number; revenue: number }> = {};
  (sales || []).forEach((s) => {
    if (!tierSales[s.tier]) tierSales[s.tier] = { count: 0, revenue: 0 };
    tierSales[s.tier].count++;
    tierSales[s.tier].revenue += s.developer_payout;
  });

  return (
    <div className="space-y-5">
      <Link href="/developer" className="text-xs text-slate-500 hover:text-brand-600">
        ← 대시보드
      </Link>

      <section className="card">
        <div className="flex items-center gap-3">
          <img src={app.icon_url} alt={app.name} className="w-16 h-16 rounded-2xl bg-slate-100" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">{app.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <StatusBadge status={app.status} />
              <span className="text-slate-500">/{app.slug}</span>
            </div>
          </div>
          {app.status === 'active' && (
            <Link href={`/apps/${app.slug}`} className="btn-secondary text-xs">공개페이지 →</Link>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <div className="card p-3 text-center">
          <div className="text-[10px] text-slate-500 font-semibold">판매</div>
          <div className="font-bold">{app.total_sales}건</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-[10px] text-slate-500 font-semibold">수익</div>
          <div className="font-bold text-brand-600">{formatKRW(app.total_revenue_krw)}</div>
        </div>
      </div>

      <section>
        <h2 className="font-semibold mb-2">티어별 성과</h2>
        <div className="card divide-y divide-slate-100">
          {(tiers || []).map((t) => {
            const info = TIER_INFO[t.tier as TierName];
            const stats = tierSales[t.tier] || { count: 0, revenue: 0 };
            return (
              <div key={t.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
                    <span className="font-semibold text-sm">{info.label}</span>
                    <span className="text-xs text-slate-500">{formatKRW(t.price_krw)}</span>
                    {!t.is_active && (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                        비활성
                      </span>
                    )}
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-brand-600">{formatKRW(stats.revenue)}</div>
                    <div className="text-slate-400">{stats.count}건</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">최근 판매</h2>
        {(sales || []).length === 0 ? (
          <div className="card text-center text-slate-500 text-sm py-4">판매 이력 없음</div>
        ) : (
          <div className="card divide-y divide-slate-100">
            {sales!.slice(0, 10).map((s, i) => (
              <div key={i} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                <span>
                  <span className="font-semibold">{s.tier}</span> · {new Date(s.purchased_at).toLocaleDateString('ko-KR')}
                </span>
                <span className="font-bold text-green-600">+{formatKRW(s.developer_payout)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    active:    { bg: 'bg-green-100',  text: 'text-green-700',  label: '판매중' },
    pending:   { bg: 'bg-amber-100',  text: 'text-amber-700',  label: '검토중' },
    suspended: { bg: 'bg-red-100',    text: 'text-red-700',    label: '정지' },
    rejected:  { bg: 'bg-slate-200',  text: 'text-slate-600',  label: '반려' },
  };
  const s = map[status] ?? { bg: 'bg-slate-100', text: 'text-slate-500', label: status };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>;
}
