import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TIER_INFO, type TierName } from '@/lib/supabase/types';
import MyAppsClient from './MyAppsClient';

export default async function MyAppsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: licenses }, { data: seats }, { data: profile }] = await Promise.all([
    supabase
      .from('licenses')
      .select('id, tier, purchased_at, status, total_usage_seconds, apps!inner(id, name, slug, icon_url, status)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('purchased_at', { ascending: false }),
    supabase
      .from('license_seats')
      .select('id, accepted_at, licenses!inner(id, tier, app_id, apps!inner(id, name, slug, icon_url, status))')
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false }),
    supabase
      .from('users')
      .select('point_balance, membership_tier')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  const ownedItems = (licenses || []).map((l: any) => ({
    source: 'owned' as const,
    licenseId: l.id,
    tier: l.tier as TierName,
    date: l.purchased_at,
    purchasedAt: l.purchased_at,
    usageSeconds: l.total_usage_seconds || 0,
    app: l.apps,
  }));

  const sharedItems = (seats || []).map((s: any) => ({
    source: 'shared' as const,
    licenseId: s.licenses.id,
    tier: s.licenses.tier as TierName,
    date: s.accepted_at,
    purchasedAt: s.accepted_at,
    usageSeconds: 0,
    app: s.licenses.apps,
  }));

  return (
    <MyAppsClient
      items={[...ownedItems, ...sharedItems]}
      pointBalance={profile?.point_balance || 0}
      membershipTier={profile?.membership_tier || 'bronze'}
    />
  );
}
