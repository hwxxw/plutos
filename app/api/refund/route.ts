import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  // body parse + auth 병렬
  const [{ license_id, reason }, { data: { user } }] = await Promise.all([
    req.json() as Promise<{ license_id: string; reason?: string }>,
    supabase.auth.getUser(),
  ]);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!license_id) return NextResponse.json({ error: 'missing_license_id' }, { status: 400 });

  const { data: license } = await supabase
    .from('licenses')
    .select('id, user_id, app_id, purchased_at, status, stripe_payment_intent_id, total_usage_seconds, amount_paid_krw, refund_requested_at')
    .eq('id', license_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!license) return NextResponse.json({ error: 'license_not_found' }, { status: 404 });
  if (license.refund_requested_at) return NextResponse.json({ error: 'refund_already_requested' }, { status: 409 });

  const purchasedAt = new Date(license.purchased_at);
  const diffDays = (Date.now() - purchasedAt.getTime()) / 86_400_000;
  if (diffDays > 7) return NextResponse.json({ error: 'refund_window_expired' }, { status: 400 });

  const usageSeconds = license.total_usage_seconds || 0;
  if (usageSeconds >= 3600) return NextResponse.json({ error: 'usage_limit_exceeded' }, { status: 400 });

  if (license.stripe_payment_intent_id) {
    try {
      await stripe.refunds.create({ payment_intent: license.stripe_payment_intent_id });
    } catch (err: any) {
      return NextResponse.json({ error: 'stripe_refund_failed', detail: err.message }, { status: 500 });
    }
  }

  const service = createServiceClient();
  const now = new Date().toISOString();

  await service.from('licenses').update({
    status: 'refunded',
    refund_requested_at: now,
    refund_reason: reason || null,
  }).eq('id', license_id);

  service.from('platform_events').insert({
    actor_id: user.id,
    event_type: 'license_refunded',
    entity_type: 'license',
    entity_id: license_id,
    metadata: { reason: reason || null, amount_krw: license.amount_paid_krw },
  }).then(() => {}).catch(() => {});

  return NextResponse.json({ ok: true });
}
