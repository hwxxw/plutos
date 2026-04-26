import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import type { TierName } from '@/lib/supabase/types';

const TIER_RANK: Record<TierName, number> = { basic: 1, plus: 2, business: 3 };

export async function POST(request: Request) {
  try {
    const { appId, tier } = await request.json() as { appId: string; tier: TierName };

    if (!appId || !tier) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // 기존 라이선스 + 앱 + 신규 티어 병렬 조회
    const [{ data: currentLicense }, { data: app }, { data: newTier }] = await Promise.all([
      supabase.from('licenses')
        .select('id, tier, amount_paid_krw, app_id')
        .eq('user_id', user.id).eq('app_id', appId).eq('status', 'active')
        .maybeSingle(),
      supabase.from('apps_public').select('id, name, slug, icon_url, developer_id').eq('id', appId).maybeSingle(),
      supabase.from('app_tiers').select('id, price_krw, max_seats')
        .eq('app_id', appId).eq('tier', tier).eq('is_active', true).maybeSingle(),
    ]);

    if (!currentLicense) return NextResponse.json({ error: 'no_existing_license' }, { status: 404 });
    if (!app) return NextResponse.json({ error: 'app_not_found' }, { status: 404 });
    if (!newTier) return NextResponse.json({ error: 'tier_not_available' }, { status: 404 });

    if (TIER_RANK[tier] <= TIER_RANK[currentLicense.tier as TierName]) {
      return NextResponse.json({ error: 'not_an_upgrade' }, { status: 400 });
    }

    // 현재 티어 가격 별도 조회
    const { data: currentTierData } = await supabase
      .from('app_tiers').select('price_krw')
      .eq('app_id', appId).eq('tier', currentLicense.tier).maybeSingle();

    const currentTierPrice = currentTierData?.price_krw ?? currentLicense.amount_paid_krw;
    const priceDiff = newTier.price_krw - currentTierPrice;

    if (priceDiff <= 0) return NextResponse.json({ error: 'no_upgrade_cost' }, { status: 400 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'krw',
          product_data: {
            name: `${app.name} — ${tierLabel} 업그레이드`,
            description: `${currentLicense.tier} → ${tier} 티어 업그레이드`,
            images: app.icon_url ? [app.icon_url] : undefined,
            metadata: { type: 'upgrade', app_id: app.id, from_tier: currentLicense.tier, to_tier: tier },
          },
          unit_amount: priceDiff,
        },
        quantity: 1,
      }],
      customer_email: user.email,
      metadata: {
        type: 'upgrade',
        app_id: app.id,
        user_id: user.id,
        developer_id: app.developer_id,
        from_tier: currentLicense.tier,
        to_tier: tier,
        new_tier_id: newTier.id,
        original_license_id: currentLicense.id,
        max_seats: String(newTier.max_seats),
      },
      success_url: `${siteUrl}/install/${app.id}?session_id={CHECKOUT_SESSION_ID}&upgrade=1`,
      cancel_url: `${siteUrl}/apps/${app.slug}`,
      locale: 'ko',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[upgrade] error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'server_error' }, { status: 500 });
  }
}
