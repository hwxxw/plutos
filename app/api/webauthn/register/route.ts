import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { credentialId, rawId, clientDataJSON, attestationObject, appId } = await req.json();

    // 챌린지 검증
    const { data: challengeRow } = await supabase
      .from('webauthn_challenges')
      .select('challenge, expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!challengeRow || new Date(challengeRow.expires_at) < new Date()) {
      return NextResponse.json({ error: '챌린지가 만료됐습니다.' }, { status: 400 });
    }

    // clientDataJSON에서 challenge 확인
    const clientData = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf-8'));
    if (clientData.challenge !== challengeRow.challenge) {
      return NextResponse.json({ error: '챌린지 불일치' }, { status: 400 });
    }

    // 자격증명 저장
    // webauthn_credentials 테이블 필요:
    // CREATE TABLE webauthn_credentials (
    //   id uuid default gen_random_uuid() primary key,
    //   user_id uuid references auth.users(id),
    //   app_id uuid references apps(id),
    //   credential_id text unique not null,
    //   raw_id text not null,
    //   created_at timestamptz default now()
    // );
    await supabase.from('webauthn_credentials').insert({
      user_id: user.id,
      app_id: appId || null,
      credential_id: credentialId,
      raw_id: rawId,
    });

    // 챌린지 삭제
    await supabase.from('webauthn_challenges').delete().eq('user_id', user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: '등록 실패' }, { status: 500 });
  }
}
