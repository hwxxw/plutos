import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { credentialId, appId } = await req.json();

    // 저장된 자격증명 확인
    const query = supabase
      .from('webauthn_credentials')
      .select('id')
      .eq('user_id', user.id)
      .eq('credential_id', credentialId);

    if (appId) query.eq('app_id', appId);

    const { data } = await query.maybeSingle();
    if (!data) return NextResponse.json({ verified: false }, { status: 401 });

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ error: '검증 실패' }, { status: 500 });
  }
}
