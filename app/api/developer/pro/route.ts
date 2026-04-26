import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: userRow } = await supabase
      .from('users').select('role,is_pro').eq('id', user.id).maybeSingle();

    if (!userRow || (userRow.role !== 'developer' && userRow.role !== 'admin')) {
      return NextResponse.json({ error: 'not_a_developer' }, { status: 403 });
    }
    if (userRow.is_pro) return NextResponse.json({ error: 'already_pro' }, { status: 409 });

    const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!proPriceId) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: proPriceId, quantity: 1 }],
      customer_email: user.email ?? undefined,
      metadata: { type: 'pro_subscription', user_id: user.id },
      success_url: `${siteUrl}/developer?pro=activated`,
      cancel_url: `${siteUrl}/developer/pro`,
      locale: 'ko',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[pro] error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'server_error' }, { status: 500 });
  }
}
