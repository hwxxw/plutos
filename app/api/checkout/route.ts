import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import type { TierName } from '@/lib/supabase/types';

export async function POST(request: Request) {
  try {
    const { appId, tier, marketingConsent } = await request.json() as {
      appId: string;
      tier: TierName;
      marketingConsent?: boolean;
    };

    if (!appId || !tier) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 });
    }

    if (!['basic', 'plus', 'business'].includes(tier)) {
      return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // 앱 정보
    const { data: app } = await supabase
      .from('apps_public')
      .select('*')
      .eq('id', appId)
      .maybeSingle();
    if (!app) return NextResponse.json({ error: 'app_not_found' }, { status: 404 });

    // 선택 티어 정보
    const { data: appTier } = await supabase
      .from('app_tiers')
      .select('*')
      .eq('app_id', appId)
      .eq('tier', tier)
      .eq('is_active', true)
      .maybeSingle();

    if (!appTier) {
      return NextResponse.json({ error: 'tier_not_available' }, { status: 404 });
    }

    // 중복 구매 방지
    const { data: existing } = await supabase
      .from('licenses')
      .select('id, tier')
      .eq('user_id', user.id)
      .eq('app_id', appId)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'already_purchased', tier: existing.tier },
        { status: 409 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: `${app.name} — ${tierLabel}`,
              description: app.tagline || undefined,
              images: app.icon_url ? [app.icon_url] : undefined,
              metadata: { app_id: app.id, tier, tier_id: appTier.id },
            },
            unit_amount: appTier.price_krw,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        app_id: app.id,
        user_id: user.id,
        developer_id: app.developer_id,
        tier,
        tier_id: appTier.id,
        max_seats: String(appTier.max_seats),
        marketing_consent: String(!!marketingConsent),
      },
      success_url: `${siteUrl}/install/${app.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/apps/${app.slug}`,
      locale: 'ko',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'server_error' },
      { status: 500 }
    );
  }
}
