import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // body parse + role check 병렬
  const [{ action, reject_reason }, { data: profile }] = await Promise.all([
    req.json() as Promise<{ action: 'approve' | 'reject'; reject_reason?: string }>,
    supabase.from('users').select('role').eq('id', user.id).maybeSingle(),
  ]);

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
  }

  const service = createServiceClient();
  const newStatus = action === 'approve' ? 'active' : 'rejected';

  // DB 업데이트 + 이벤트 로그 병렬
  const [{ error }] = await Promise.all([
    service.from('apps').update({
      status: newStatus,
      ...(action === 'reject' && reject_reason ? { reject_reason } : {}),
    }).eq('id', params.id),
    service.from('platform_events').insert({
      actor_id: user.id,
      event_type: action === 'approve' ? 'app_approved' : 'app_rejected',
      entity_type: 'app',
      entity_id: params.id,
      metadata: { reject_reason: reject_reason || null },
    }),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: newStatus });
}
