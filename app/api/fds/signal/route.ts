import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TtlCache } from '@/lib/cache';

// IP별 요청 수 제한: 분당 30회
const ipRateMap = new TtlCache<number>(60_000, 5_000);

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown');

    // Rate limit
    const count = (ipRateMap.get(ip) ?? 0) + 1;
    ipRateMap.set(ip, count);
    if (count > 30) return NextResponse.json({ flagged: false }, { status: 429 });

    // body parse + auth 병렬
    const supabase = createClient();
    const [body, { data: { user } }] = await Promise.all([
      req.json() as Promise<{
        hash: string; ua: string; screen: string; timezone: string;
        language: string; platform: string; memory: number; cores: number;
        canvasHash: string; context: string;
      }>,
      supabase.auth.getUser(),
    ]);

    const { hash, ua, screen, timezone, language, platform, memory, cores, canvasHash, context } = body;

    // checkout 컨텍스트에서만 사기 탐지 쿼리 실행
    let flagged = false;
    if (user && context === 'checkout') {
      const { data: dup } = await supabase
        .from('fraud_signals').select('user_id')
        .eq('fingerprint_hash', hash).neq('user_id', user.id).limit(1).maybeSingle();
      if (dup) flagged = true;
    }

    // best-effort 저장 (await 없음)
    supabase.from('fraud_signals').insert({
      user_id: user?.id ?? null,
      fingerprint_hash: hash,
      ip, ua, screen, timezone, language, platform,
      memory, cores, canvas_hash: canvasHash,
      context: context || 'unknown',
      flagged,
    }).then(() => {}).catch(() => {});

    return NextResponse.json({ flagged });
  } catch {
    return NextResponse.json({ flagged: false });
  }
}
