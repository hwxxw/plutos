import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const USD_RATE = 0.00075;

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    // body parse + auth 병렬
    const [body, { data: { user } }] = await Promise.all([
      request.json(),
      supabase.auth.getUser(),
    ]);

    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { name, short_name, tagline, description, origin_url, icon_url, category, theme_color, tiers } = body;

    if (!name || !short_name || !origin_url || !icon_url || !category) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }
    if (!Array.isArray(tiers) || tiers.length === 0) {
      return NextResponse.json({ error: 'at_least_one_tier_required' }, { status: 400 });
    }

    const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
    if (!userRow || (userRow.role !== 'developer' && userRow.role !== 'admin')) {
      return NextResponse.json({ error: 'not_a_developer' }, { status: 403 });
    }

    const service = createServiceClient();

    const { data: newApp, error: appErr } = await service.from('apps').insert({
      developer_id: user.id,
      name, short_name, tagline, description,
      origin_url, icon_url, category, theme_color,
      status: 'pending',
    }).select('id').single();

    if (appErr || !newApp) {
      console.error('[apps] create failed:', appErr);
      return NextResponse.json({ error: appErr?.message ?? 'create_failed' }, { status: 500 });
    }

    const tierRows = tiers.map((t: any) => ({
      app_id: newApp.id,
      tier: t.tier,
      price_krw: t.price_krw,
      price_usd: Number((t.price_krw * USD_RATE).toFixed(2)),
      max_seats: t.tier === 'business' ? (t.max_seats ?? 5) : 1,
      is_active: true,
    }));

    // 티어 insert + 이벤트 로그 병렬
    const [tierResult] = await Promise.all([
      service.from('app_tiers').insert(tierRows),
      service.from('platform_events').insert({
        actor_id: user.id,
        event_type: 'app_submitted',
        entity_type: 'app',
        entity_id: newApp.id,
      }),
    ]);

    if (tierResult.error) {
      await service.from('apps').delete().eq('id', newApp.id);
      console.error('[tiers] create failed:', tierResult.error);
      return NextResponse.json({ error: tierResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ app_id: newApp.id });
  } catch (err) {
    console.error('[new app] error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'server_error' }, { status: 500 });
  }
}
