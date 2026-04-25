import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const USD_RATE = 0.00075; // KRW→USD 대략 환산 (1300원=$1 가정)

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name, short_name, tagline, description,
      origin_url, icon_url, category, theme_color,
      tiers,
    } = body;

    if (!name || !short_name || !origin_url || !icon_url || !category) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }
    if (!Array.isArray(tiers) || tiers.length === 0) {
      return NextResponse.json({ error: 'at_least_one_tier_required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // role 확인
    const { data: userRow } = await supabase
      .from('users').select('role').eq('id', user.id).maybeSingle();

    if (!userRow || (userRow.role !== 'developer' && userRow.role !== 'admin')) {
      return NextResponse.json({ error: 'not_a_developer' }, { status: 403 });
    }

    // service client로 트랜잭션 실행
    const service = createServiceClient();

    // 1) 앱 생성 (pending 상태)
    const { data: newApp, error: appErr } = await service
      .from('apps')
      .insert({
        developer_id: user.id,
        name, short_name, tagline, description,
        origin_url, icon_url, category, theme_color,
        status: 'pending',
      })
      .select('id')
      .single();

    if (appErr || !newApp) {
      console.error('[apps] create failed:', appErr);
      return NextResponse.json({ error: appErr?.message ?? 'create_failed' }, { status: 500 });
    }

    // 2) 티어 insert
    const tierRows = tiers.map((t: any) => ({
      app_id: newApp.id,
      tier: t.tier,
      price_krw: t.price_krw,
      price_usd: Number((t.price_krw * USD_RATE).toFixed(2)),
      max_seats: t.tier === 'business' ? (t.max_seats ?? 5) : 1,
      is_active: true,
    }));

    const { error: tierErr } = await service.from('app_tiers').insert(tierRows);
    if (tierErr) {
      // 롤백
      await service.from('apps').delete().eq('id', newApp.id);
      console.error('[tiers] create failed:', tierErr);
      return NextResponse.json({ error: tierErr.message }, { status: 500 });
    }

    // 3) platform_events
    await service.from('platform_events').insert({
      actor_id: user.id,
      event_type: 'app_submitted',
      entity_type: 'app',
      entity_id: newApp.id,
    });

    return NextResponse.json({ app_id: newApp.id });
  } catch (err) {
    console.error('[new app] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'server_error' },
      { status: 500 }
    );
  }
}
