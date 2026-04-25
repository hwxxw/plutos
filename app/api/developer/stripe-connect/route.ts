import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL!));

  const service = createServiceClient();
  const { data: userRow } = await service
    .from('users')
    .select('stripe_connect_id')
    .eq('id', user.id)
    .maybeSingle();

  let accountId = userRow?.stripe_connect_id;

  // 계정이 없으면 생성
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'KR',
      email: user.email ?? undefined,
      capabilities: {
        transfers: { requested: true },
      },
    });
    accountId = account.id;
    await service.from('users').update({ stripe_connect_id: accountId }).eq('id', user.id);
  }

  // 온보딩 링크
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const link = await stripe.accountLinks.create({
    account: accountId,
    // 링크 만료 시 개발자 대시보드로 돌아가 버튼을 다시 누르게 함 (POST API 직접 접근 방지)
    refresh_url: `${siteUrl}/developer`,
    return_url: `${siteUrl}/developer?stripe=connected`,
    type: 'account_onboarding',
  });

  return NextResponse.redirect(link.url);
}
