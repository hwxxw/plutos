import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatKRW } from '@/lib/format';

export default async function DeveloperDashboard({
  searchParams,
}: {
  searchParams: { pro?: string; stripe?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, is_pro, stripe_connect_enabled, display_name')
    .eq('id', user.id)
    .maybeSingle();

  if (!userProfile || (userProfile.role !== 'developer' && userProfile.role !== 'admin')) {
    return (
      <div className="card text-center py-10">
        <h2 className="font-bold">개발자 모드 활성화 필요</h2>
        <p className="text-sm text-slate-500 mt-2">
          앱을 등록하려면 개발자 계정으로 전환하세요.
        </p>
        <form action="/api/developer/activate" method="POST" className="mt-4">
          <button className="btn-primary">개발자로 시작하기</button>
        </form>
      </div>
    );
  }

  const { data: apps } = await supabase
    .from('apps')
    .select('id, name, slug, status, total_sales, total_revenue_krw, rating_avg, rating_count, icon_url')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false });

  const totalRevenue = (apps || []).reduce((sum, a) => sum + (a.total_revenue_krw || 0), 0);
  const totalSales = (apps || []).reduce((sum, a) => sum + (a.total_sales || 0), 0);
  const activeApps = (apps || []).filter((a) => a.status === 'active').length;

  const { data: recentLicenses } = await supabase
    .from('licenses')
    .select(`
      id, tier, amount_paid_krw, developer_payout, purchased_at,
      apps!inner(name, developer_id)
    `)
    .eq('apps.developer_id', user.id)
    .eq('status', 'active')
    .order('purchased_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-5">
      {searchParams.pro === 'activated' && (
        <div className="card bg-green-50 border-green-200">
          <p className="font-semibold text-green-800">⚡ Pro 구독이 활성화되었습니다!</p>
          <p className="text-xs text-green-700 mt-1">
            이제 15% 수수료, 즉시 정산, CRM 기능을 이용할 수 있습니다.
          </p>
        </div>
      )}
      {searchParams.stripe === 'connected' && (
        <div className="card bg-green-50 border-green-200">
          <p className="font-semibold text-green-800">✅ Stripe 계좌가 연결되었습니다!</p>
          <p className="text-xs text-green-700 mt-1">
            이제 판매 수익을 받을 수 있습니다.
          </p>
        </div>
      )}

      <section>
        <h1 className="text-xl font-bold">개발자 대시보드</h1>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="text-slate-500">{userProfile.display_name ?? user.email}</span>
          {userProfile.is_pro && (
            <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold">
              PRO (수수료 15%)
            </span>
          )}
          {!userProfile.stripe_connect_enabled && (
            <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">⚠ Stripe 미연결</span>
          )}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <div className="text-[10px] text-slate-500 font-semibold">누적 수익</div>
          <div className="font-bold text-brand-600">{formatKRW(totalRevenue)}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-[10px] text-slate-500 font-semibold">판매</div>
          <div className="font-bold">{totalSales.toLocaleString()}건</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-[10px] text-slate-500 font-semibold">활성 앱</div>
          <div className="font-bold">{activeApps}개</div>
        </div>
      </div>

      {!userProfile.is_pro && (
        <div className="card bg-brand-50 border-brand-200">
          <h3 className="font-semibold text-brand-800 text-sm">⚡ Pro로 업그레이드</h3>
          <p className="text-xs text-brand-700 mt-1">
            수수료 15%, 즉시 정산, CRM 고객 관리 — 월 ₩29,000
          </p>
          <Link href="/developer/pro" className="btn-primary text-xs mt-3 inline-flex">
            Pro 시작하기
          </Link>
        </div>
      )}

      {!userProfile.stripe_connect_enabled && (
        <div className="card bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-amber-800 text-sm">Stripe 계좌 연결이 필요해요</h3>
          <p className="text-xs text-amber-700 mt-1">
            판매 수익을 받으려면 Stripe Connect 계좌 연결이 필수입니다.
          </p>
          <form action="/api/developer/stripe-connect" method="POST" className="mt-3">
            <button className="btn-primary text-xs">Stripe 계좌 연결하기</button>
          </form>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">내 앱</h2>
          <div className="flex gap-2">
            <Link href="/developer/customers" className="text-xs text-brand-600 hover:underline">
              내 고객 →
            </Link>
            <Link href="/developer/new" className="btn-primary text-xs">+ 새 앱</Link>
          </div>
        </div>

        {(apps || []).length === 0 ? (
          <div className="card text-center py-8 text-slate-500 text-sm">
            아직 등록한 앱이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {apps!.map((app) => (
              <Link
                key={app.id}
                href={`/developer/apps/${app.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition"
              >
                <img src={app.icon_url} alt={app.name} className="w-10 h-10 rounded-lg bg-slate-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{app.name}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>판매 {app.total_sales}건</span>
                    <span>{formatKRW(app.total_revenue_krw)}</span>
                    {app.rating_count > 0 && (
                      <span>★ {Number(app.rating_avg).toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {(recentLicenses || []).length > 0 && (
        <section>
          <h2 className="font-semibold mb-3">최근 판매</h2>
          <div className="card divide-y divide-slate-100">
            {recentLicenses!.map((l: any) => (
              <div key={l.id} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center text-sm">
                <div>
                  <div className="font-semibold">{l.apps.name}</div>
                  <div className="text-xs text-slate-500">
                    {l.tier} · {new Date(l.purchased_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">+{formatKRW(l.developer_payout)}</div>
                  <div className="text-xs text-slate-400">{formatKRW(l.amount_paid_krw)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    suspended: 'bg-red-100 text-red-700',
    rejected: 'bg-slate-200 text-slate-600',
  };
  const labels: Record<string, string> = {
    active: '판매중', pending: '검토중', suspended: '정지', rejected: '반려',
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[status] ?? ''}`}>
      {labels[status] ?? status}
    </span>
  );
}
