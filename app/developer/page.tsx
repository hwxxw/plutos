import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatKRW } from '@/lib/format';

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
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="rounded-2xl p-10" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cc1a1a" strokeWidth={1.5} strokeLinecap="round">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h2 className="font-black text-xl mb-2" style={{ color: C.text, fontFamily: C.cinzel }}>개발자 모드 필요</h2>
          <p className="text-sm mb-6" style={{ color: C.sub, fontFamily: C.ibm }}>
            앱을 등록하려면 개발자 계정으로 전환하세요.
          </p>
          <Link href="/developer/register" className="btn-primary px-6 py-3 text-sm" style={{ fontFamily: C.cinzel }}>
            개발자로 시작하기 →
          </Link>
        </div>
      </div>
    );
  }

  const [{ data: apps }, { data: recentLicenses }] = await Promise.all([
    supabase
      .from('apps')
      .select('id, name, slug, status, total_sales, total_revenue_krw, rating_avg, rating_count, icon_url')
      .eq('developer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('licenses')
      .select('id, tier, amount_paid_krw, developer_payout, purchased_at, apps!inner(name, developer_id)')
      .eq('apps.developer_id', user.id)
      .eq('status', 'active')
      .order('purchased_at', { ascending: false })
      .limit(10),
  ]);

  const totalRevenue = (apps || []).reduce((sum, a) => sum + (a.total_revenue_krw || 0), 0);
  const totalSales = (apps || []).reduce((sum, a) => sum + (a.total_sales || 0), 0);
  const activeApps = (apps || []).filter((a) => a.status === 'active').length;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {searchParams.pro === 'activated' && (
        <div className="rounded-xl p-4" style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a4a1a' }}>
          <p className="font-semibold text-sm" style={{ color: '#4ade80', fontFamily: C.cinzel }}>Pro 구독이 활성화되었습니다</p>
          <p className="text-xs mt-1" style={{ color: '#22c55e', fontFamily: C.ibm }}>수수료 5%, 즉시 정산, CRM 기능을 이용할 수 있습니다.</p>
        </div>
      )}
      {searchParams.stripe === 'connected' && (
        <div className="rounded-xl p-4" style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a4a1a' }}>
          <p className="font-semibold text-sm" style={{ color: '#4ade80', fontFamily: C.cinzel }}>Stripe 계좌가 연결되었습니다</p>
          <p className="text-xs mt-1" style={{ color: '#22c55e', fontFamily: C.ibm }}>이제 판매 수익을 받을 수 있습니다.</p>
        </div>
      )}

      {/* 헤더 */}
      <section>
        <div className="text-[11px] uppercase tracking-[0.25em] mb-1" style={{ color: C.redDim, fontFamily: C.cinzel }}>Developer Dashboard</div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>
              {userProfile.display_name ?? user.email}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {userProfile.is_pro && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#1a0a0e', color: C.red, border: '1px solid #330000', fontFamily: C.cinzel }}>
                  PRO · 5%
                </span>
              )}
              {!userProfile.stripe_connect_enabled && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#1a1400', color: '#ccaa00', border: '1px solid #332800' }}>
                  Stripe 미연결
                </span>
              )}
            </div>
          </div>
          <Link href="/developer/new" className="btn-primary text-xs px-4 py-2" style={{ fontFamily: C.cinzel }}>
            + 새 앱 등록
          </Link>
        </div>
      </section>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '누적 수익', value: formatKRW(totalRevenue), highlight: true },
          { label: '총 판매',   value: `${totalSales.toLocaleString()}건` },
          { label: '활성 앱',   value: `${activeApps}개` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: C.cinzel }}>{s.label}</div>
            <div className="font-black text-lg" style={{ color: s.highlight ? C.red : C.text, fontFamily: C.cinzel }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 알림 배너들 */}
      {!userProfile.is_pro && (
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: '#120a0e', border: '1px solid #3a1515' }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: C.text, fontFamily: C.cinzel }}>Pro로 업그레이드</p>
            <p className="text-xs mt-0.5" style={{ color: C.sub, fontFamily: C.ibm }}>수수료 20% → 5% · 즉시 정산 · CRM — 월 ₩29,000</p>
          </div>
          <Link href="/developer/pro" className="btn-primary text-xs px-4 py-2 flex-shrink-0" style={{ fontFamily: C.cinzel }}>
            Pro 시작
          </Link>
        </div>
      )}

      {!userProfile.stripe_connect_enabled && (
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: '#12100a', border: '1px solid #3a2800' }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#ccaa00', fontFamily: C.cinzel }}>Stripe 계좌 연결 필요</p>
            <p className="text-xs mt-0.5" style={{ color: C.sub, fontFamily: C.ibm }}>판매 수익을 받으려면 Stripe Connect 연결이 필요합니다.</p>
          </div>
          <form action="/api/developer/stripe-connect" method="POST">
            <button className="btn-secondary text-xs px-4 py-2 flex-shrink-0" style={{ fontFamily: C.cinzel }}>계좌 연결</button>
          </form>
        </div>
      )}

      {/* 내 앱 목록 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm" style={{ color: C.text, fontFamily: C.cinzel }}>내 앱</h2>
          <Link href="/developer/customers" className="text-xs" style={{ color: C.redDim }}>고객 관리 →</Link>
        </div>

        {(apps || []).length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>아직 등록한 앱이 없습니다.</p>
            <Link href="/developer/new" className="btn-primary text-xs mt-4 inline-block px-6 py-2" style={{ fontFamily: C.cinzel }}>
              첫 앱 등록하기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {apps!.map((app) => (
              <Link key={app.id} href={`/developer/apps/${app.id}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-all"
                style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#660000'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
              >
                {app.icon_url
                  ? <img src={app.icon_url} alt={app.name} className="w-10 h-10 rounded-lg object-cover" style={{ backgroundColor: '#1a0a0e' }} />
                  : <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }} />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: C.text }}>{app.name}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: C.muted }}>
                    <span>판매 {app.total_sales}건</span>
                    <span>{formatKRW(app.total_revenue_krw)}</span>
                    {app.rating_count > 0 && <span>★ {Number(app.rating_avg).toFixed(1)}</span>}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a3535" strokeWidth={2} strokeLinecap="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 최근 판매 */}
      {(recentLicenses || []).length > 0 && (
        <section>
          <h2 className="font-bold text-sm mb-3" style={{ color: C.text, fontFamily: C.cinzel }}>최근 판매</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {(recentLicenses as any[]).map((l, i) => (
              <div key={l.id} className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: C.card, borderBottom: i < recentLicenses!.length - 1 ? `1px solid #1a1018` : 'none' }}>
                <div>
                  <div className="font-semibold text-sm" style={{ color: C.text }}>{l.apps?.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.muted, fontFamily: C.ibm }}>
                    {l.tier} · {new Date(l.purchased_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm" style={{ color: '#4ade80' }}>+{formatKRW(l.developer_payout)}</div>
                  <div className="text-xs" style={{ color: C.muted }}>{formatKRW(l.amount_paid_krw)}</div>
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
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:    { bg: '#0d1a0d', color: '#4ade80', label: '판매중' },
    pending:   { bg: '#1a1400', color: '#ccaa00', label: '심사중' },
    suspended: { bg: '#1a0404', color: '#cc1a1a', label: '정지' },
    rejected:  { bg: '#0d0d14', color: '#4a3535', label: '반려' },
  };
  const s = map[status] ?? { bg: '#0d0d14', color: '#888888', label: status };
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>
      {s.label}
    </span>
  );
}
