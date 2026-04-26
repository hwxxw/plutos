import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();

  // body parse + auth 병렬
  const [{ code }, { data: { user } }] = await Promise.all([
    req.json() as Promise<{ code: string }>,
    supabase.auth.getUser(),
  ]);

  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!code) return NextResponse.json({ error: 'missing_code' }, { status: 400 });

  const normalizedCode = code.toUpperCase().trim();

  // 본인 프로필 + 추천인 조회 병렬
  const [{ data: profile }, { data: referrer }] = await Promise.all([
    supabase.from('users').select('id,referred_by').eq('id', user.id).maybeSingle(),
    supabase.from('users').select('id').eq('referral_code', normalizedCode).maybeSingle(),
  ]);

  if (profile?.referred_by) return NextResponse.json({ error: 'already_referred' }, { status: 409 });
  if (!referrer) return NextResponse.json({ error: 'invalid_code' }, { status: 404 });
  if (referrer.id === user.id) return NextResponse.json({ error: 'self_referral' }, { status: 400 });

  const service = createServiceClient();

  // 기존 referral 레코드 조회 + 사용자 referred_by 업데이트 병렬
  const { data: existingReferral } = await supabase
    .from('referrals').select('id')
    .eq('code', normalizedCode).eq('referred_id', user.id).maybeSingle();

  if (!existingReferral) {
    // pending 레코드 있는지 확인 후 upsert
    const { data: pending } = await supabase
      .from('referrals').select('id')
      .eq('code', normalizedCode).eq('referrer_id', referrer.id).is('referred_id', null).maybeSingle();

    await Promise.all([
      pending
        ? service.from('referrals').update({ referred_id: user.id }).eq('id', pending.id)
        : service.from('referrals').insert({ code: normalizedCode, referrer_id: referrer.id, referred_id: user.id, status: 'pending' }),
      service.from('users').update({ referred_by: referrer.id }).eq('id', user.id),
    ]);
  } else {
    await service.from('users').update({ referred_by: referrer.id }).eq('id', user.id);
  }

  return NextResponse.json({ ok: true, referrer_code: normalizedCode });
}
