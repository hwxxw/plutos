import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { randomBytes } from 'node:crypto';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 초대 생성
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const [body, { data: { user } }] = await Promise.all([
      request.json() as Promise<{ licenseId: string; email: string }>,
      supabase.auth.getUser(),
    ]);

    const { licenseId, email } = body;
    if (!licenseId || !email) return NextResponse.json({ error: 'missing_params' }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    if (user.email === email) return NextResponse.json({ error: 'cannot_invite_self' }, { status: 400 });

    const service = createServiceClient();

    // 라이선스 확인 + 시트 사용량 병렬
    const [{ data: license }, { count: usedCount }] = await Promise.all([
      supabase.from('licenses').select('id,tier,max_seats')
        .eq('id', licenseId).eq('user_id', user.id).eq('status', 'active').maybeSingle(),
      service.from('license_seats').select('*', { count: 'exact', head: true })
        .eq('license_id', licenseId).neq('status', 'removed'),
    ]);

    if (!license) return NextResponse.json({ error: 'license_not_found' }, { status: 404 });
    if (license.tier !== 'business') return NextResponse.json({ error: 'only_business_tier' }, { status: 400 });

    const available = license.max_seats - 1 - (usedCount ?? 0);
    if (available <= 0) return NextResponse.json({ error: 'seat_limit_reached' }, { status: 409 });

    const token = randomBytes(24).toString('hex');
    const { error } = await service.from('license_seats').insert({
      license_id: licenseId,
      invited_email: email,
      invite_token: token,
      status: 'pending',
    });

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'already_invited' }, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/invite/${token}`;
    return NextResponse.json({ inviteUrl });
  } catch (err) {
    console.error('[seats] invite error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// 초대 수락
export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const [{ token }, { data: { user } }] = await Promise.all([
      request.json() as Promise<{ token: string }>,
      supabase.auth.getUser(),
    ]);

    if (!token) return NextResponse.json({ error: 'missing_token' }, { status: 400 });
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const service = createServiceClient();
    const { data: seat } = await service.from('license_seats').select('*')
      .eq('invite_token', token).eq('status', 'pending').maybeSingle();

    if (!seat) return NextResponse.json({ error: 'invalid_or_expired' }, { status: 404 });
    if (user.email !== seat.invited_email) {
      return NextResponse.json({ error: 'email_mismatch', expected: seat.invited_email }, { status: 403 });
    }

    const { error } = await service.from('license_seats').update({
      user_id: user.id,
      accepted_at: new Date().toISOString(),
      status: 'accepted',
    }).eq('id', seat.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, license_id: seat.license_id });
  } catch (err) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
