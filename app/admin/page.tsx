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

export const revalidate = 60;

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') redirect('/');

  const [
    { count: totalUsers },
    { count: totalApps },
    { count: pendingApps },
    { count: totalLicenses },
    { data: revenueData },
    { data: recentEvents },
    { data: flaggedCount },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('apps').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('apps').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('licenses').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('licenses').select('amount_paid_krw').eq('status', 'active'),
    supabase.from('platform_events').select('id, event_type, entity_type, entity_id, created_at, actor_id')
      .order('created_at', { ascending: false }).limit(12),
    supabase.from('fraud_signals').select('id', { count: 'exact', head: true }).eq('flagged', true),
  ]);

  const totalRevenue = (revenueData || []).reduce((acc: number, r: any) => acc + (r.amount_paid_krw || 0), 0);

  const stats = [
    { label: '전체 유저',     value: totalUsers?.toLocaleString() ?? '—',       color: C.text },
    { label: '활성 앱',       value: totalApps?.toLocaleString() ?? '—',        color: '#4ade80' },
    { label: '심사 대기',     value: pendingApps?.toLocaleString() ?? '—',      color: '#ccaa00', href: '/admin/apps' },
    { label: '활성 라이선스', value: totalLicenses?.toLocaleString() ?? '—',    color: C.text },
    { label: '총 거래액',     value: formatKRW(totalRevenue),                    color: C.red },
    { label: 'FDS 경고',      value: (flaggedCount as any)?.toLocaleString() ?? '—', color: '#cc1a1a' },
  ];

  const EVENT_LABELS: Record<string, { label: string; color: string }> = {
    app_approved:      { label: '앱 승인',      color: '#4ade80' },
    app_rejected:      { label: '앱 반려',      color: C.red },
    license_purchased: { label: '구매',         color: '#4ade80' },
    license_refunded:  { label: '환불',         color: C.red },
    license_upgraded:  { label: '업그레이드',  color: '#ccaa00' },
    pro_activated:     { label: 'Pro 활성화',   color: '#a8d8ea' },
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] mb-1" style={{ color: C.redDim, fontFamily: C.cinzel }}>
            Admin · Dashboard
          </div>
          <h1 className="text-3xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>관리자</h1>
        </div>
        <Link href="/admin/apps"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
          style={{ backgroundColor: '#1a0404', color: C.red, border: '1px solid #330000', fontFamily: C.cinzel }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          앱 심사
          {(pendingApps ?? 0) > 0 && (
            <span className="ml-1 font-black" style={{ color: '#ccaa00' }}>{pendingApps}</span>
          )}
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label}
            className={`rounded-xl p-4 text-center ${s.href ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
            onClick={s.href ? () => { window.location.href = s.href!; } : undefined}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: C.cinzel }}>{s.label}</div>
            <div className="font-black text-2xl" style={{ color: s.color, fontFamily: C.cinzel }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 빠른 링크 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '앱 심사',    href: '/admin/apps',    icon: 'M9 11l3 3L22 4' },
          { label: 'FDS 현황',  href: '/admin/fds',     icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
          { label: '유저 관리', href: '/admin/users',   icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
          { label: '이벤트 로그', href: '/admin/events', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
        ].map((link) => (
          <Link key={link.label} href={link.href}
            className="rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth={1.5} strokeLinecap="round">
                <path d={link.icon}/>
              </svg>
            </div>
            <span className="text-[11px] font-bold" style={{ color: C.sub, fontFamily: C.cinzel }}>{link.label}</span>
          </Link>
        ))}
      </div>

      {/* 최근 이벤트 */}
      <section>
        <h2 className="font-bold text-sm mb-3" style={{ color: C.text, fontFamily: C.cinzel }}>최근 플랫폼 이벤트</h2>
        {(recentEvents || []).length === 0 ? (
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-sm" style={{ color: C.sub }}>이벤트 없음</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {(recentEvents || []).map((ev: any, i: number) => {
              const evInfo = EVENT_LABELS[ev.event_type] || { label: ev.event_type, color: C.sub };
              return (
                <div key={ev.id} className="flex items-center justify-between px-4 py-3"
                  style={{ backgroundColor: C.card, borderBottom: i < (recentEvents?.length ?? 0) - 1 ? '1px solid #1a1018' : 'none' }}>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: evInfo.color }} />
                    <div>
                      <span className="text-xs font-semibold" style={{ color: evInfo.color, fontFamily: C.cinzel }}>{evInfo.label}</span>
                      <span className="text-xs ml-2" style={{ color: C.muted }}>{ev.entity_type}</span>
                    </div>
                  </div>
                  <div className="text-[11px]" style={{ color: C.muted }}>
                    {new Date(ev.created_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
