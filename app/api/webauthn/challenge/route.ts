import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 랜덤 32바이트 챌린지 생성
  const challenge = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');

  // 챌린지를 DB에 임시 저장 (60초 유효)
  await supabase.from('webauthn_challenges').upsert({
    user_id: user.id,
    challenge,
    expires_at: new Date(Date.now() + 60_000).toISOString(),
  });

  return NextResponse.json({
    challenge,
    rpId: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost',
    rpName: 'PLUTOS',
    userId: Buffer.from(user.id).toString('base64url'),
    userName: user.email,
  });
}
