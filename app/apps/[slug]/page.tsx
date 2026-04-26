import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TierSelector } from '@/components/TierSelector';
import { ReviewForm } from '@/components/ReviewForm';
import type { PublicApp, AppTier, TierName } from '@/lib/supabase/types';

export const revalidate = 30;

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

const TIER_ORDER_ARR = ['basic', 'plus', 'business'] as const;

const TIER_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  basic:    { label: 'Basic',    color: '#64748b', bg: '#0a0f14', border: '#1e2937' },
  plus:     { label: 'Plus',     color: '#6366f1', bg: '#0d0d1a', border: '#1e1e3a' },
  business: { label: 'Business', color: '#f59e0b', bg: '#1a1200', border: '#332200' },
};

interface ReviewRow {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  reviewer_tier: string | null;
  helpful_count: number;
  created_at: string;
}

function StarBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] w-3 text-right" style={{ color: C.sub }}>{star}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="#f59e0b"><polygon points="5,1 6.2,3.8 9.5,4.1 7.1,6.2 7.9,9.5 5,7.8 2.1,9.5 2.9,6.2 0.5,4.1 3.8,3.8"/></svg>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1a1018' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#f59e0b' }} />
      </div>
      <span className="text-[10px] w-7 text-right" style={{ color: C.muted }}>{pct}%</span>
    </div>
  );
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#f59e0b' : '#2a2020'}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </span>
  );
}

export default async function AppDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const [{ data: app }, { data: { user } }] = await Promise.all([
    supabase.from('apps_public').select('*').eq('slug', params.slug).maybeSingle<PublicApp>(),
    supabase.auth.getUser(),
  ]);

  if (!app) notFound();

  const [tiersResult, licenseResult, profileResult, reviewsResult, myReviewResult] = await Promise.all([
    supabase.from('app_tiers').select('*').eq('app_id', app.id).eq('is_active', true).order('price_krw'),
    user
      ? supabase.from('licenses').select('tier').eq('user_id', user.id).eq('app_id', app.id).eq('status', 'active').maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from('users').select('point_balance, membership_tier').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('reviews').select(
      'id, rating, title, content, reviewer_tier, helpful_count, created_at'
    ).eq('app_id', app.id).eq('is_hidden', false).order('created_at', { ascending: false }).limit(30),
    user
      ? supabase.from('reviews').select('id').eq('user_id', user.id).eq('app_id', app.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const tiers = (tiersResult.data || []) as AppTier[];
  const existingTier  = (licenseResult as any)?.data?.tier as TierName | null ?? null;
  const pointBalance: number = (profileResult as any)?.data?.point_balance ?? 0;
  const membershipTier: string = (profileResult as any)?.data?.membership_tier ?? 'bronze';
  const reviews = (reviewsResult.data || []) as ReviewRow[];
  const hasReviewed = !!(myReviewResult as any)?.data;

  const screenshots: string[] = Array.isArray(app.screenshots) ? (app.screenshots as string[]) : [];

  const MEMBERSHIP_DISCOUNT: Record<string, number> = { bronze: 0, silver: 3, gold: 5, platinum: 10 };
  const discountPct = MEMBERSHIP_DISCOUNT[membershipTier] ?? 0;

  // 별점 분포 계산
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : app.rating_avg;

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-6">
      {/* 뒤로 */}
      <Link href="/" className="flex items-center gap-1 text-xs" style={{ color: C.muted }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        목록으로
      </Link>

      {/* 앱 헤더 카드 */}
      <section className="rounded-2xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-start gap-4">
          {app.icon_url
            ? <img src={app.icon_url} alt={app.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" style={{ backgroundColor: '#1a0a0e' }} />
            : <div className="w-20 h-20 rounded-2xl flex-shrink-0" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }} />
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black" style={{ color: C.text, fontFamily: C.cinzel }}>{app.name}</h1>
              {app.developer_is_pro && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: '#0d0a20', color: '#7788ff', border: '1px solid #222244' }}>
                  PRO
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: C.sub, fontFamily: C.ibm }}>{app.developer_name}</p>
            <div className="flex items-center gap-2 mt-2">
              {reviewCount > 0 ? (
                <>
                  <StarDisplay rating={avgRating} size={13} />
                  <span className="text-xs" style={{ color: C.muted, fontFamily: C.ibm }}>
                    {avgRating.toFixed(1)} · {reviewCount}개 리뷰
                  </span>
                </>
              ) : (
                <span className="text-xs" style={{ color: C.muted }}>리뷰 없음</span>
              )}
              <span className="text-xs" style={{ color: C.muted, fontFamily: C.ibm }}>· 판매 {app.total_sales.toLocaleString()}건</span>
            </div>

            {discountPct > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded"
                style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a4a1a' }}>
                <span className="text-[10px] font-black" style={{ color: '#4ade80' }}>멤버십 {discountPct}% 할인 적용 중</span>
              </div>
            )}
          </div>
        </div>

        {/* 구매/업그레이드 섹션 */}
        <div className="mt-5">
          {existingTier ? (
            <div className="space-y-3">
              <Link href={`/install/${app.id}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black"
                style={{ backgroundColor: C.red, color: '#fff', fontFamily: C.cinzel }}>
                설치하기
                <span className="text-[10px] opacity-70">({existingTier} 보유중)</span>
              </Link>
              {tiers.some((t) => TIER_ORDER_ARR.indexOf(t.tier as any) > TIER_ORDER_ARR.indexOf(existingTier as any)) && (
                <details className="rounded-xl overflow-hidden" style={{ backgroundColor: '#0d0a10', border: `1px solid ${C.border}` }}>
                  <summary className="px-4 py-3 cursor-pointer text-sm font-bold" style={{ color: C.sub, fontFamily: C.cinzel }}>
                    더 상위 티어로 업그레이드 →
                  </summary>
                  <div className="px-4 pb-4">
                    <TierSelector
                      appId={app.id}
                      appSlug={app.slug}
                      tiers={tiers}
                      existingTier={existingTier}
                      pointBalance={pointBalance}
                      membershipTier={membershipTier}
                    />
                  </div>
                </details>
              )}
            </div>
          ) : (
            <TierSelector
              appId={app.id}
              appSlug={app.slug}
              tiers={tiers}
              existingTier={null}
              pointBalance={pointBalance}
              membershipTier={membershipTier}
            />
          )}
        </div>
      </section>

      {/* 스크린샷 */}
      {screenshots.length > 0 && (
        <section className="-mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {screenshots.map((url, i) => (
              <img key={i} src={url} alt={`screenshot ${i + 1}`}
                className="h-56 rounded-xl flex-shrink-0"
                style={{ border: `1px solid ${C.border}` }}
                loading="lazy" />
            ))}
          </div>
        </section>
      )}

      {/* 소개 */}
      <section className="rounded-2xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <h2 className="font-bold text-sm mb-3" style={{ color: C.text, fontFamily: C.cinzel }}>소개</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.sub, fontFamily: C.ibm }}>
          {app.description}
        </p>
      </section>

      {/* 앱 정보 */}
      <section className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        {[
          ['카테고리', app.category],
          ['최초 등록', new Date(app.created_at).toLocaleDateString('ko-KR')],
          ['판매', `${app.total_sales.toLocaleString()}건`],
        ].map(([label, value], i, arr) => (
          <div key={label} className="flex justify-between items-center px-5 py-3"
            style={{ backgroundColor: C.card, borderBottom: i < arr.length - 1 ? '1px solid #1a1018' : 'none' }}>
            <span className="text-xs" style={{ color: C.muted, fontFamily: C.cinzel }}>{label}</span>
            <span className="text-xs font-semibold" style={{ color: C.sub, fontFamily: C.ibm }}>{value}</span>
          </div>
        ))}
      </section>

      {/* 리뷰 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base" style={{ color: C.text, fontFamily: C.cinzel }}>
            리뷰
            {reviewCount > 0 && (
              <span className="ml-2 text-sm font-normal" style={{ color: C.muted }}>({reviewCount})</span>
            )}
          </h2>
        </div>

        {/* 별점 요약 */}
        {reviewCount > 0 && (
          <div className="rounded-2xl p-5 flex items-center gap-6" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            {/* 평균 점수 */}
            <div className="text-center flex-shrink-0">
              <div className="text-5xl font-black leading-none" style={{ color: C.text, fontFamily: C.cinzel }}>
                {avgRating.toFixed(1)}
              </div>
              <StarDisplay rating={avgRating} size={12} />
              <div className="text-[10px] mt-1" style={{ color: C.muted, fontFamily: C.ibm }}>{reviewCount}개 리뷰</div>
            </div>
            {/* 분포 바 */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((s) => (
                <StarBar key={s} star={s} count={reviews.filter((r) => r.rating === s).length} total={reviewCount} />
              ))}
            </div>
          </div>
        )}

        {/* 리뷰 작성 (구매자 + 미작성) */}
        {existingTier && !hasReviewed && (
          <ReviewForm appId={app.id} />
        )}

        {/* 이미 작성한 경우 */}
        {existingTier && hasReviewed && (
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a4a1a' }}>
            <span className="text-sm font-bold" style={{ color: '#4ade80', fontFamily: C.cinzel }}>내 리뷰가 등록되어 있습니다</span>
          </div>
        )}

        {/* 리뷰 없음 */}
        {reviewCount === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: '#1a0a0e', border: `1px solid ${C.border}` }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={1.5} strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>아직 리뷰가 없습니다.</p>
            {existingTier && !hasReviewed && (
              <p className="text-xs mt-1" style={{ color: C.muted, fontFamily: C.ibm }}>첫 번째 리뷰를 작성해보세요!</p>
            )}
          </div>
        )}

        {/* 리뷰 목록 */}
        {reviewCount > 0 && (
          <div className="space-y-3">
            {reviews.map((review) => {
              const badge = review.reviewer_tier ? TIER_BADGE[review.reviewer_tier] : null;
              return (
                <div key={review.id} className="rounded-2xl p-4 space-y-2"
                  style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
                  {/* 상단: 별점 + 티어 + 날짜 */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={review.rating} size={13} />
                      <span className="text-xs font-semibold" style={{ color: C.sub, fontFamily: C.ibm }}>
                        구매자
                      </span>
                      {badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                          style={{ color: badge.color, backgroundColor: badge.bg, border: `1px solid ${badge.border}` }}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px]" style={{ color: C.muted, fontFamily: C.ibm }}>
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>

                  {/* 제목 */}
                  {review.title && (
                    <div className="text-sm font-bold" style={{ color: C.text, fontFamily: C.cinzel }}>
                      {review.title}
                    </div>
                  )}

                  {/* 내용 */}
                  {review.content && (
                    <p className="text-sm leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm }}>
                      {review.content}
                    </p>
                  )}

                  {/* 도움됐어요 */}
                  {review.helpful_count > 0 && (
                    <div className="text-[10px]" style={{ color: C.muted, fontFamily: C.ibm }}>
                      {review.helpful_count}명에게 도움이 됐습니다
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
