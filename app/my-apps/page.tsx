import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TIER_INFO, type TierName } from '@/lib/supabase/types';

export default async function MyAppsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: licenses } = await supabase
    .from('licenses')
    .select(`
      id, tier, purchased_at, status,
      apps!inner(id, name, slug, icon_url, status)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('purchased_at', { ascending: false });

  const { data: seats } = await supabase
    .from('license_seats')
    .select(`
      id, accepted_at,
      licenses!inner(
        id, tier, app_id,
        apps!inner(id, name, slug, icon_url, status)
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false });

  const ownedApps = (licenses || []).map((l: any) => ({
    source: 'owned' as const,
    licenseId: l.id,
    tier: l.tier as TierName,
    date: l.purchased_at,
    app: l.apps,
  }));

  const sharedApps = (seats || []).map((s: any) => ({
    source: 'shared' as const,
    licenseId: s.licenses.id,
    tier: s.licenses.tier as TierName,
    date: s.accepted_at,
    app: s.licenses.apps,
  }));

  const allApps = [...ownedApps, ...sharedApps];

  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-xl font-bold">내 앱</h1>
        <p className="text-xs text-slate-500 mt-1">
          구매했거나 공유받은 앱을 언제든 다시 설치할 수 있습니다.
        </p>
      </section>

      {allApps.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          <p>아직 구매한 앱이 없습니다.</p>
          <Link href="/" className="btn-primary mt-4 inline-flex">앱 둘러보기</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {allApps.map((item) => (
            <div key={item.licenseId} className="card hover:shadow-md transition flex items-center gap-3">
              <Link href={`/install/${item.app.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                <img
                  src={item.app.icon_url}
                  alt={item.app.name}
                  className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate group-hover:text-brand-600">
                      {item.app.name}
                    </span>
                    {item.source === 'shared' && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        공유됨
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: TIER_INFO[item.tier].color }}
                    />
                    <span className="text-xs" style={{ color: TIER_INFO[item.tier].color }}>
                      {TIER_INFO[item.tier].label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.tier === 'business' && item.source === 'owned' && (
                  <Link
                    href={`/my-apps/team/${item.licenseId}`}
                    className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg hover:bg-amber-100"
                  >
                    팀 관리
                  </Link>
                )}
                <Link href={`/install/${item.app.id}`} className="text-brand-600 text-sm font-semibold">
                  설치 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
