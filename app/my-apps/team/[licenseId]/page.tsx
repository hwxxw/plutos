'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Seat {
  id: string;
  invited_email: string;
  status: 'pending' | 'accepted' | 'removed';
  invited_at: string;
  accepted_at: string | null;
  invite_token: string | null;
}

interface License {
  id: string;
  tier: string;
  max_seats: number;
  app_id: string;
  apps: { name: string; icon_url: string };
}

export default function TeamManagePage() {
  const params = useParams();
  const licenseId = params.licenseId as string;

  const [license, setLicense] = useState<License | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: lic } = await supabase
      .from('licenses')
      .select(`
        id, tier, max_seats, app_id,
        apps!inner(name, icon_url)
      `)
      .eq('id', licenseId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (lic) setLicense(lic as any);

    const { data: s } = await supabase
      .from('license_seats')
      .select('*')
      .eq('license_id', licenseId)
      .neq('status', 'removed')
      .order('invited_at', { ascending: false });

    setSeats((s || []) as Seat[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [licenseId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    setMessage(null);
    setShareUrl(null);

    try {
      const res = await fetch('/api/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseId, email: inviteEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msgs: Record<string, string> = {
          seat_limit_reached: '더 이상 초대할 수 없습니다 (정원 초과).',
          already_invited: '이미 초대한 이메일입니다.',
          cannot_invite_self: '본인은 초대할 수 없습니다.',
          invalid_email: '이메일 형식이 올바르지 않습니다.',
          only_business_tier: 'Business 티어만 팀 초대가 가능합니다.',
        };
        throw new Error(msgs[data.error] ?? data.error ?? '초대 실패');
      }

      setShareUrl(data.inviteUrl);
      setInviteEmail('');
      setMessage({ type: 'ok', text: '초대 링크가 생성되었습니다. 아래 링크를 팀원에게 전달하세요.' });
      await loadData();
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : '오류' });
    } finally {
      setInviteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!license) {
    return <div className="card text-center py-10">라이선스를 찾을 수 없습니다.</div>;
  }

  if (license.tier !== 'business') {
    return (
      <div className="card text-center py-10">
        <h2 className="font-bold">Business 티어 전용</h2>
        <p className="text-xs text-slate-500 mt-2">
          팀 공유는 Business 티어에서만 가능합니다.
        </p>
      </div>
    );
  }

  const acceptedSeats = seats.filter((s) => s.status === 'accepted').length;
  const pendingSeats = seats.filter((s) => s.status === 'pending').length;
  const remaining = license.max_seats - 1 - acceptedSeats - pendingSeats;
  // -1은 구매자 본인 자리

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <Link href="/my-apps" className="text-xs text-slate-500">← 내 앱</Link>

      <section className="card">
        <div className="flex items-center gap-3">
          <img src={license.apps.icon_url} alt="" className="w-12 h-12 rounded-xl" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{license.apps.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Business 팀 관리</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="text-[10px] text-slate-500">총 자리</div>
            <div className="font-bold">{license.max_seats}명</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <div className="text-[10px] text-green-600">참여중</div>
            <div className="font-bold text-green-700">{acceptedSeats + 1}명</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2">
            <div className="text-[10px] text-amber-600">대기</div>
            <div className="font-bold text-amber-700">{pendingSeats}명</div>
          </div>
        </div>
      </section>

      {/* 초대 폼 */}
      {remaining > 0 && (
        <section className="card">
          <h2 className="font-semibold text-sm mb-3">팀원 초대 ({remaining}자리 남음)</h2>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="team@example.com"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={inviteLoading}
              className="btn-primary text-sm whitespace-nowrap"
            >
              {inviteLoading ? '...' : '초대'}
            </button>
          </form>

          {message && (
            <div
              className={`mt-3 text-xs p-2 rounded ${
                message.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {shareUrl && (
            <div className="mt-2 bg-slate-50 rounded p-2 text-[11px] break-all font-mono">
              {shareUrl}
            </div>
          )}
        </section>
      )}

      {/* 참여자 목록 */}
      <section>
        <h2 className="font-semibold text-sm mb-3">참여자</h2>
        <div className="card divide-y divide-slate-100">
          <div className="py-2 first:pt-0 flex justify-between items-center text-sm">
            <span>
              <strong>본인 (구매자)</strong>
            </span>
            <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold">
              Owner
            </span>
          </div>
          {seats.map((s) => (
            <div key={s.id} className="py-2 last:pb-0 flex justify-between items-center text-sm">
              <span className="truncate">{s.invited_email}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  s.status === 'accepted'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {s.status === 'accepted' ? '참여중' : '수락 대기'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
