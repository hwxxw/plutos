import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SECRET = process.env.SESSION_TOKEN_SECRET || 'plutos-fallback-secret-change-in-prod';

// 키를 모듈 레벨에서 1회만 임포트 (요청마다 재생성 방지)
let _cachedKey: CryptoKey | null = null;
async function getKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey;
  _cachedKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return _cachedKey;
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Buffer.from(sig).toString('base64url');
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { appId } = await req.json().catch(() => ({}));

  const payload = JSON.stringify({
    userId: user.id,
    appId: appId || null,
    iat: Date.now(),
    exp: Date.now() + 3_600_000, // 1시간
  });

  const b64payload = Buffer.from(payload).toString('base64url');
  const signature = await sign(b64payload);
  const token = `${b64payload}.${signature}`;

  return NextResponse.json({ token, expiresAt: Date.now() + 3_600_000 });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false }, { status: 400 });

  const [b64payload, signature] = token.split('.');
  if (!b64payload || !signature) return NextResponse.json({ valid: false }, { status: 400 });

  try {
    const expected = await sign(b64payload);
    if (expected !== signature) return NextResponse.json({ valid: false }, { status: 401 });

    const payload = JSON.parse(Buffer.from(b64payload, 'base64url').toString('utf-8'));
    if (payload.exp < Date.now()) return NextResponse.json({ valid: false, reason: 'expired' }, { status: 401 });

    return NextResponse.json({ valid: true, userId: payload.userId, appId: payload.appId });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
