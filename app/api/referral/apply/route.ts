import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { code } = await req.json() as { code: string };
  if (!code) return NextResponse.json({ error: 'missing_code' }, { status: 400 });

  const { data: profile } = await supabase
    .from('users')
    .select('id, referred_by, referral_code')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.referred_by) return NextResponse.json({ error: 'already_referred' }, { status: 409 });

  const normalizedCode = code.toUpperCase().trim();

  const { data: referrer } = await supabase
    .from('users')
    .select('id, referral_code')
    .eq('referral_code', normalizedCode)
    .maybeSingle();

  if (!referrer) return NextResponse.json({ error: 'invalid_code' }, { status: 404 });
  if (referrer.id === user.id) return NextResponse.json({ error: 'self_referral' }, { status: 400 });

  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('id')
    .eq('code', normalizedCode)
    .eq('referred_id', user.id)
    .maybeSingle();

  const service = createServiceClient();

  if (!existingReferral) {
    const { data: pendingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('code', normalizedCode)
      .eq('referrer_id', referrer.id)
      .is('referred_id', null)
      .maybeSingle();

    if (pendingReferral) {
      await service.from('referrals').update({ referred_id: user.id }).eq('id', pendingReferral.id);
    } else {
      await service.from('referrals').insert({
        code: normalizedCode,
        referrer_id: referrer.id,
        referred_id: user.id,
        status: 'pending',
      });
    }
  }

  await service.from('users').update({ referred_by: referrer.id }).eq('id', user.id);

  return NextResponse.json({ ok: true, referrer_code: normalizedCode });
}
