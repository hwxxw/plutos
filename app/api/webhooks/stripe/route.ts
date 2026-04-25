import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { stripe, calculatePlatformFee, calculateEscrowRelease } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'missing_signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckout(event.data.object as Stripe.Checkout.Session, supabase);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge, supabase);
        break;
      case 'customer.subscription.deleted':
        await handleProCanceled(event.data.object as Stripe.Subscription, supabase);
        break;
      case 'account.updated':
        await handleConnectAccountUpdated(event.data.object as Stripe.Account, supabase);
        break;
      default:
        console.log('[webhook] unhandled:', event.type);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook] handler error:', err);
    return NextResponse.json({ error: 'handler_failed' }, { status: 500 });
  }
}

async function handleCheckout(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createServiceClient>
) {
  const metadata = session.metadata || {};
  const type = metadata.type; // 'pro_subscription' | 'upgrade' | undefined(신규)

  // Pro 구독은 payment_intent가 없음 (subscription mode)
  if (type === 'pro_subscription') {
    await handleProSubscription(session, supabase);
    return;
  }

  const paymentIntentId = session.payment_intent as string;
  if (!paymentIntentId) return;

  // 중복 처리 방지
  const { data: existing } = await supabase
    .from('licenses')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();
  if (existing) {
    console.log('[webhook] license already exists:', paymentIntentId);
    return;
  }

  if (type === 'upgrade') {
    await handleUpgrade(session, paymentIntentId, supabase);
  } else {
    await handleNewPurchase(session, paymentIntentId, supabase);
  }
}

// ───────── Pro 구독 ─────────
async function handleProSubscription(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createServiceClient>
) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error('[webhook] pro subscription missing user_id');
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

  const { error } = await supabase
    .from('users')
    .update({
      is_pro: true,
      pro_subscription_id: subscriptionId,
      pro_expires_at: expiresAt,
    })
    .eq('id', userId);

  if (error) {
    console.error('[webhook] pro activation failed:', error);
    throw error;
  }

  await supabase.from('platform_events').insert({
    actor_id: userId,
    event_type: 'pro_activated',
    entity_type: 'user',
    entity_id: userId,
    metadata: { subscription_id: subscriptionId, expires_at: expiresAt },
  });
}

// ───────── Pro 구독 취소 ─────────
async function handleProCanceled(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createServiceClient>
) {
  await supabase
    .from('users')
    .update({
      is_pro: false,
      pro_subscription_id: null,
      pro_expires_at: null,
    })
    .eq('pro_subscription_id', subscription.id);
}

// ───────── Stripe Connect 계좌 확인 ─────────
async function handleConnectAccountUpdated(
  account: Stripe.Account,
  supabase: ReturnType<typeof createServiceClient>
) {
  const isEnabled = account.charges_enabled && account.payouts_enabled;
  if (!isEnabled) return;

  await supabase
    .from('users')
    .update({ stripe_connect_enabled: true })
    .eq('stripe_connect_id', account.id);
}

// ───────── 신규 구매 ─────────
async function handleNewPurchase(
  session: Stripe.Checkout.Session,
  paymentIntentId: string,
  supabase: ReturnType<typeof createServiceClient>
) {
  const m = session.metadata!;
  const { app_id, user_id, developer_id, tier, tier_id, max_seats, marketing_consent } = m;

  if (!app_id || !user_id || !developer_id || !tier || !tier_id) {
    console.error('[webhook] missing metadata:', session.id);
    return;
  }

  const amountKrw = session.amount_total || 0;

  const { data: developer } = await supabase
    .from('users').select('is_pro').eq('id', developer_id).maybeSingle();

  const isPro = developer?.is_pro === true;
  const { feeRate, platformFee, developerPayout } = calculatePlatformFee(amountKrw, isPro);
  const escrowRelease = calculateEscrowRelease(isPro);

  const consentGiven = marketing_consent === 'true';

  const { error } = await supabase.from('licenses').insert({
    user_id,
    app_id,
    tier,
    tier_id,
    max_seats: parseInt(max_seats || '1', 10),
    stripe_payment_intent_id: paymentIntentId,
    stripe_checkout_session_id: session.id,
    amount_paid_krw: amountKrw,
    platform_fee_rate: feeRate,
    platform_fee_amount: platformFee,
    developer_payout: developerPayout,
    escrow_release_at: escrowRelease.toISOString(),
    marketing_consent: consentGiven,
    marketing_consent_at: consentGiven ? new Date().toISOString() : null,
    status: 'active',
  });

  if (error) {
    console.error('[webhook] license insert failed:', error);
    throw error;
  }

  // 구매 시 마케팅 동의 = 글로벌 allow_dev_marketing도 활성화
  // (developer_customers 뷰가 두 값 모두 TRUE를 요구하므로)
  if (consentGiven) {
    await supabase
      .from('users')
      .update({ allow_dev_marketing: true })
      .eq('id', user_id);
  }

  await supabase.from('platform_events').insert({
    actor_id: user_id,
    event_type: 'license_purchased',
    entity_type: 'license',
    metadata: { app_id, tier, amount: amountKrw },
  });
}

// ───────── 업그레이드 ─────────
async function handleUpgrade(
  session: Stripe.Checkout.Session,
  paymentIntentId: string,
  supabase: ReturnType<typeof createServiceClient>
) {
  const m = session.metadata!;
  const {
    app_id, user_id, developer_id,
    from_tier, to_tier, new_tier_id,
    original_license_id, max_seats,
  } = m;

  // 기존 라이선스를 'upgraded' 상태로
  const { data: originalLicense } = await supabase
    .from('licenses')
    .select('*')
    .eq('id', original_license_id)
    .maybeSingle();

  if (!originalLicense) {
    console.error('[webhook] original license not found:', original_license_id);
    return;
  }

  const priceDiff = session.amount_total || 0;

  const { data: developer } = await supabase
    .from('users').select('is_pro').eq('id', developer_id).maybeSingle();
  const isPro = developer?.is_pro === true;
  const { feeRate, platformFee, developerPayout } = calculatePlatformFee(priceDiff, isPro);
  const escrowRelease = calculateEscrowRelease(isPro);

  // 트랜잭션처럼: 기존 → upgraded, 신규 라이선스 생성, 업그레이드 테이블 기록
  // (Supabase는 클라이언트에서 트랜잭션 불가능해서 순차 실행. 실패 시 수동 정리)

  // 1) 기존 라이선스 상태 변경
  await supabase
    .from('licenses')
    .update({ status: 'upgraded' })
    .eq('id', original_license_id);

  // 2) 새 라이선스
  const { data: newLicense, error: insErr } = await supabase
    .from('licenses')
    .insert({
      user_id,
      app_id,
      tier: to_tier,
      tier_id: new_tier_id,
      max_seats: parseInt(max_seats || '1', 10),
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
      amount_paid_krw: originalLicense.amount_paid_krw + priceDiff,
      platform_fee_rate: feeRate,
      platform_fee_amount: platformFee,
      developer_payout: developerPayout,
      escrow_release_at: escrowRelease.toISOString(),
      marketing_consent: originalLicense.marketing_consent,
      marketing_consent_at: originalLicense.marketing_consent_at,
      status: 'active',
      upgraded_from_license_id: original_license_id,
    })
    .select('id')
    .single();

  if (insErr || !newLicense) {
    // 롤백
    await supabase.from('licenses').update({ status: 'active' }).eq('id', original_license_id);
    throw insErr;
  }

  // 3) upgrade 기록
  await supabase.from('license_upgrades').insert({
    original_license_id,
    new_license_id: newLicense.id,
    from_tier,
    to_tier,
    price_diff_krw: priceDiff,
    stripe_payment_intent_id: paymentIntentId,
  });

  await supabase.from('platform_events').insert({
    actor_id: user_id,
    event_type: 'license_upgraded',
    entity_type: 'license',
    entity_id: newLicense.id,
    metadata: { app_id, from_tier, to_tier, price_diff: priceDiff },
  });
}

// ───────── 환불 ─────────
async function handleRefund(
  charge: Stripe.Charge,
  supabase: ReturnType<typeof createServiceClient>
) {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  const { error } = await supabase
    .from('licenses')
    .update({
      status: 'refunded',
      refund_reason: 'stripe_refund',
    })
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (error) console.error('[webhook] refund update failed:', error);
}
