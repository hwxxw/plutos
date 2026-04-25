import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ReferralsClient from './ReferralsClient';

export default async function ReferralsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: referrals }] = await Promise.all([
    supabase.from('users').select('referral_code, referred_by, point_balance, membership_tier').eq('id', user.id).maybeSingle(),
    supabase.from('referrals').select('id, code, referred_id, status, points_awarded, created_at, completed_at').eq('referrer_id', user.id).order('created_at', { ascending: false }),
  ]);

  const completedReferrals = (referrals || []).filter((r) => r.status === 'completed');
  const totalPointsEarned = completedReferrals.reduce((acc, r) => acc + (r.points_awarded || 0), 0);

  return (
    <ReferralsClient
      referralCode={profile?.referral_code || ''}
      referrals={referrals || []}
      totalPointsEarned={totalPointsEarned}
      pointBalance={profile?.point_balance || 0}
      hasReferrer={!!profile?.referred_by}
    />
  );
}
