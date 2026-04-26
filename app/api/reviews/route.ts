import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    // body parse + auth 병렬
    const [{ appId, rating, title, content }, { data: { user } }] = await Promise.all([
      request.json() as Promise<{ appId: string; rating: number; title?: string; content?: string }>,
      supabase.auth.getUser(),
    ]);

    if (!appId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
    }
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const [licenseResult, existingResult] = await Promise.all([
      supabase.from('licenses').select('id, tier')
        .eq('user_id', user.id).eq('app_id', appId).eq('status', 'active').maybeSingle(),
      supabase.from('reviews').select('id')
        .eq('user_id', user.id).eq('app_id', appId).maybeSingle(),
    ]);

    if (!licenseResult.data) return NextResponse.json({ error: 'no_license' }, { status: 403 });
    if (existingResult.data) return NextResponse.json({ error: 'already_reviewed' }, { status: 409 });

    const { error: insertErr } = await supabase.from('reviews').insert({
      license_id: licenseResult.data.id,
      user_id: user.id,
      app_id: appId,
      rating: Math.round(rating),
      title: title?.trim() || null,
      content: content?.trim() || null,
      reviewer_tier: licenseResult.data.tier,
    });

    if (insertErr) throw insertErr;

    // 앱 평점 재계산 (best-effort)
    supabase.rpc('recalc_app_rating' as any, { p_app_id: appId })
      .then(() => {}).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[reviews] error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
