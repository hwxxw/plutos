import { NextResponse, NextRequest } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL!));

  const formData = await req.formData().catch(() => null);
  const displayName = formData?.get('display_name')?.toString().trim() || null;

  const service = createServiceClient();
  await service
    .from('users')
    .update({
      role: 'developer',
      ...(displayName ? { display_name: displayName } : {}),
    })
    .eq('id', user.id);

  return NextResponse.redirect(new URL('/developer', process.env.NEXT_PUBLIC_SITE_URL!));
}
