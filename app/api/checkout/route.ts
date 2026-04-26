import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import type { TierName } from '@/lib/supabase/types';

const TIER_DISCOUNT: Record<string, number> = {
  bronze: 0, silver: 0.03, gold: 0.05, platinum: 0.10,
};
const VALID_TIERS = new Set(['basic', 'plus', 'business']);

export async function POST(request: Request) {
  try {
    // body parse + auth 병렬
    const supabase = createClient();
    const [body, { data: { user } }] = await Promise.all([
      request.json() as Promise<{ appId: string; tier: TierName; marketingConsent?: boolean; usePoints?: number }>,
      supabase.auth.getUser(),
    ]);

    const { appId, tier, marketingConsent, usePoints } = body;

    if (!appId || !tier) return NextResponse.json({ error: 'missing_params' }, { status: 400 });
    if (!VALID_TIERS.has(tier)) return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // app + tier + profile + existing license 4가지 병렬
    const [{ data: app }, { data: appTier }, { data: profile }, { data: existing }] = await Promise.all([
      supabase.from('apps_public').select('id,name,slug,tagline,icon_url,developer_id').eq('id', appId).maybeSingle(),
      supabase.from('app_tiers').select('id,price_krw,max_seats').eq('app_id', appId).eq('tier', tier).eq('is_active', true).maybeSingle(),
      supabase.from('users').select('point_balance,membership_tier').eq('id', user.id).maybeSingle(),
      supabase.from('licenses').select('id,tier').eq('user_id', user.id).eq('app_id', appId).eq('status', 'active').maybeSingle(),
    ]);

    if (!app) return NextResponse.json({ error: 'app_not_found' }, { status: 404 });
    if (!appTier) return NextResponse.json({ error: 'tier_not_available' }, { status: 404 });
    if (existing) return NextResponse.json({ error: 'already_purchased', tier: existing.tier }, { status: 409 });

    const membershipTier = profile?.membership_tier || 'bronze';
    const discountRate = TIER_DISCOUNT[membershipTier] ?? 0;
    const basePrice = appTier.price_krw;
    const afterDiscount = Math.round(basePrice * (1 - discountRate));

    const pointBalance = profile?.point_balance || 0;
    const pointsToUse = Math.min(usePoints || 0, pointBalance, Math.floor(afterDiscount * 0.2));
    const finalPrice = Math.max(0, afterDiscount - pointsToUse);

    if (finalPrice < 100) return NextResponse.json({ error: 'price_too_low' }, { status: 400 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

    const descParts = [
      app.tagline,
      discountRate > 0 ? `멤버십 ${Math.round(discountRate * 100)}% 할인 적용` : null,
      pointsToUse > 0 ? `포인트 ${pointsToUse.toLocaleString()}P 사용` : null,
    ].filter(Boolean);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'krw',
          product_data: {
            name: `${app.name} — ${tierLabel}`,
            description: descParts.length ? descParts.join(' · ') : undefined,
            images: app.icon_url ? [app.icon_url] : undefined,
            metadata: { app_id: app.id, tier, tier_id: appTier.id },
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      }],
      customer_email: user.email,
      metadata: {
        app_id: app.id,
        user_id: user.id,
        developer_id: app.developer_id,
        tier,
        tier_id: appTier.id,
        max_seats: String(appTier.max_seats),
        marketing_consent: String(!!marketingConsent),
        points_used: String(pointsToUse),
        original_price_krw: String(basePrice),
        membership_tier: membershipTier,
      },
      success_url: `${siteUrl}/install/${app.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/apps/${app.slug}`,
      locale: 'ko',
    });

    return NextResponse.json({ url: session.url, finalPrice, discountRate, pointsToUse, membershipTier });
  } catch (err) {
    console.error('[checkout] error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'server_error' }, { status: 500 });
  }
}
