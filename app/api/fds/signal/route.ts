import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { hash, ua, screen, timezone, language, platform, memory, cores, canvasHash, context } = body;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown';

    // 동일 지문으로 다른 계정 결제 시도 여부 확인
    let flagged = false;
    if (user && context === 'checkout') {
      const { data: existing } = await supabase
        .from('fraud_signals')
        .select('user_id')
        .eq('fingerprint_hash', hash)
        .neq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (existing) flagged = true;
    }

    // 신호 저장 (best-effort)
    // CREATE TABLE fraud_signals (
    //   id uuid default gen_random_uuid() primary key,
    //   user_id uuid references auth.users(id),
    //   fingerprint_hash text not null,
    //   ip text,
    //   ua text, screen text, timezone text, language text,
    //   platform text, memory int, cores int, canvas_hash text,
    //   context text,
    //   flagged boolean default false,
    //   created_at timestamptz default now()
    // );
    await supabase.from('fraud_signals').insert({
      user_id: user?.id ?? null,
      fingerprint_hash: hash,
      ip,
      ua, screen, timezone, language, platform,
      memory, cores,
      canvas_hash: canvasHash,
      context: context || 'unknown',
      flagged,
    }).catch(() => {});

    return NextResponse.json({ flagged });
  } catch {
    return NextResponse.json({ flagged: false });
  }
}
