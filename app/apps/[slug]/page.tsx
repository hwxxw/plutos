import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TierSelector } from '@/components/TierSelector';
import type { PublicApp, AppTier, TierName } from '@/lib/supabase/types';

export const revalidate = 30;

export default async function AppDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: app } = await supabase
    .from('apps_public')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle<PublicApp>();

  if (!app) notFound();

  // 티어 목록
  const { data: tiersData } = await supabase
    .from('app_tiers')
    .select('*')
    .eq('app_id', app.id)
    .eq('is_active', true)
    .order('price_krw');

  const tiers = (tiersData || []) as AppTier[];

  // 현재 사용자의 구매 정보
  const { data: { user } } = await supabase.auth.getUser();
  let existingTier: TierName | null = null;
  if (user) {
    const { data: license } = await supabase
      .from('licenses')
      .select('tier')
      .eq('user_id', user.id)
      .eq('app_id', app.id)
      .eq('status', 'active')
      .maybeSingle();
    if (license?.tier) existingTier = license.tier;
  }

  const screenshots: string[] = Array.isArray(app.screenshots)
    ? (app.screenshots as string[])
    : [];

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-brand-600">
        ← 목록으로
      </Link>

      <section className="card">
        <div className="flex items-start gap-4">
          <img
            src={app.icon_url}
            alt={app.name}
            className="w-20 h-20 rounded-2xl object-cover bg-slate-100"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{app.name}</h1>
              {app.developer_is_pro && (
                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                  PRO 개발자
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{app.developer_name}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              {app.rating_count > 0 ? (
                <span>★ {app.rating_avg.toFixed(1)} · {app.rating_count}개 리뷰</span>
              ) : (
                <span>리뷰 없음</span>
              )}
              <span>판매 {app.total_sales.toLocaleString()}건</span>
            </div>
          </div>
        </div>

        {existingTier ? (
          <div className="mt-4 space-y-3">
            <Link
              href={`/install/${app.id}`}
              className="btn-primary w-full justify-center"
            >
              설치하기 ({existingTier} 보유중)
            </Link>
            {tiers.some((t) => t.tier !== existingTier && t.price_krw > (tiers.find(x => x.tier === existingTier)?.price_krw ?? 0)) && (
              <details className="bg-slate-50 rounded-xl p-3 text-sm">
                <summary className="cursor-pointer font-semibold">
                  더 상위 티어로 업그레이드
                </summary>
                <div className="mt-3">
                  <TierSelector
                    appId={app.id}
                    appSlug={app.slug}
                    tiers={tiers}
                    existingTier={existingTier}
                  />
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <TierSelector
              appId={app.id}
              appSlug={app.slug}
              tiers={tiers}
              existingTier={null}
            />
          </div>
        )}
      </section>

      {screenshots.length > 0 && (
        <section className="-mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {screenshots.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`screenshot ${i + 1}`}
                className="h-64 rounded-xl border border-slate-200 flex-shrink-0"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h2 className="font-semibold mb-2">소개</h2>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {app.description}
        </p>
      </section>

      <section className="card text-xs text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>카테고리</span>
          <span>{app.category}</span>
        </div>
        <div className="flex justify-between">
          <span>최초 등록</span>
          <span>{new Date(app.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
      </section>
    </div>
  );
}
