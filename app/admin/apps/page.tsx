import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminAppsClient from './AdminAppsClient';

export default async function AdminAppsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') redirect('/');

  const [{ data: pendingApps }, { data: recentApps }] = await Promise.all([
    supabase
      .from('apps')
      .select('id, name, tagline, description, origin_url, icon_url, category, status, created_at, developer_id')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('apps')
      .select('id, name, icon_url, status, created_at')
      .in('status', ['active', 'rejected'])
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  // 개발자 이름 별도 조회
  const developerIds = [...new Set((pendingApps || []).map((a) => a.developer_id).filter(Boolean))];
  let developerMap: Record<string, string> = {};
  if (developerIds.length > 0) {
    const { data: devs } = await supabase
      .from('users')
      .select('id, display_name')
      .in('id', developerIds);
    (devs || []).forEach((d) => { developerMap[d.id] = d.display_name || d.id; });
  }

  const enriched = (pendingApps || []).map((a) => ({
    ...a,
    developer_name: developerMap[a.developer_id] || '알 수 없음',
  }));

  return <AdminAppsClient pendingApps={enriched} recentApps={recentApps || []} />;
}
