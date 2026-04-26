'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  red:    '#cc1a1a',
  redDim: '#880000',
  text:   '#e8e8e8',
  sub:    '#888888',
  muted:  '#4a3535',
  cinzel: 'Cinzel, serif' as const,
  ibm:    "'IBM Plex Sans KR', sans-serif" as const,
};

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
  const [copied, setCopied] = useState(false);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: lic } = await supabase
      .from('licenses')
      .select('id, tier, max_seats, app_id, apps!inner(name, icon_url)')
      .eq('id', licenseId).eq('user_id', user.id).eq('status', 'active')
      .maybeSingle();

    if (lic) setLicense(lic as any);

    const { data: s } = await supabase
      .from('license_seats').select('*')
      .eq('license_id', licenseId).neq('status', 'removed')
      .order('invited_at', { ascending: false });

    setSeats((s || []) as Seat[]);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [licenseId]);

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

  function copyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: C.red, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!license) {
    return (
      <div className="max-w-md mx-auto py-16">
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>라이선스를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  if (license.tier !== 'business') {
    return (
      <div className="max-w-md mx-auto py-16">
        <div className="rounded-2xl p-8 text-center space-y-3" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="font-black" style={{ color: C.text, fontFamily: C.cinzel }}>Business 티어 전용</h2>
          <p className="text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>팀 공유는 Business 티어에서만 가능합니다.</p>
        </div>
      </div>
    );
  }

  const acceptedSeats = seats.filter((s) => s.status === 'accepted').length;
  const pendingSeats  = seats.filter((s) => s.status === 'pending').length;
  const remaining     = license.max_seats - 1 - acceptedSeats - pendingSeats;

  return (
    <div className="space-y-5 max-w-lg mx-auto py-6">
      <Link href="/my-apps" className="flex items-center gap-1 text-xs" style={{ color: C.muted }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        내 앱
      </Link>

      {/* 앱 헤더 */}
      <section className="rounded-2xl p-5" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3">
          {license.apps.icon_url
            ? <img src={license.apps.icon_url} alt="" className="w-12 h-12 rounded-xl object-cover" style={{ backgroundColor: '#1a0a0e' }} />
            : <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: '#1a0404', border: '1px solid #330000' }} />
          }
          <div className="flex-1 min-w-0">
            <h1 className="font-black truncate" style={{ color: C.text, fontFamily: C.cinzel }}>{license.apps.name}</h1>
            <p className="text-xs mt-0.5" style={{ color: C.muted, fontFamily: C.ibm }}>Business 팀 관리</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: '총 자리', value: `${license.max_seats}명`, bg: '#0d0a10', color: C.text },
            { label: '참여중', value: `${acceptedSeats + 1}명`, bg: '#0d1a0d', color: '#4ade80' },
            { label: '대기', value: `${pendingSeats}명`, bg: '#1a1400', color: '#ccaa00' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg p-2 text-center"
              style={{ backgroundColor: s.bg, border: `1px solid ${C.border}` }}>
              <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: C.muted, fontFamily: C.cinzel }}>{s.label}</div>
              <div className="font-black text-base" style={{ color: s.color, fontFamily: C.cinzel }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 초대 폼 */}
      {remaining > 0 && (
        <section className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="font-bold text-sm" style={{ color: C.text, fontFamily: C.cinzel }}>팀원 초대 ({remaining}자리 남음)</h2>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email" required value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="team@example.com"
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: C.text, fontFamily: C.ibm }}
            />
            <button type="submit" disabled={inviteLoading}
              className="px-4 py-2 rounded-lg text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: C.red, color: '#fff', fontFamily: C.cinzel }}>
              {inviteLoading ? '...' : '초대'}
            </button>
          </form>

          {message && (
            <div className="text-xs p-3 rounded-lg"
              style={{
                backgroundColor: message.type === 'ok' ? '#0d1a0d' : '#1a0404',
                color: message.type === 'ok' ? '#4ade80' : C.red,
                border: `1px solid ${message.type === 'ok' ? '#1a4a1a' : '#330000'}`,
                fontFamily: C.ibm,
              }}>
              {message.text}
            </div>
          )}

          {shareUrl && (
            <div className="rounded-lg p-3 flex items-center gap-2"
              style={{ backgroundColor: '#0d0a10', border: `1px solid ${C.border}` }}>
              <span className="text-[11px] break-all flex-1 font-mono" style={{ color: C.muted }}>{shareUrl}</span>
              <button onClick={copyLink}
                className="text-[11px] font-bold px-2 py-1 rounded flex-shrink-0"
                style={{ backgroundColor: copied ? '#0d1a0d' : '#1a0404', color: copied ? '#4ade80' : C.red, border: `1px solid ${copied ? '#1a4a1a' : '#330000'}` }}>
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* 참여자 목록 */}
      <section>
        <h2 className="font-bold text-sm mb-3" style={{ color: C.text, fontFamily: C.cinzel }}>참여자</h2>
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          {/* 본인 (구매자) */}
          <div className="flex justify-between items-center px-4 py-3"
            style={{ backgroundColor: C.card, borderBottom: seats.length > 0 ? '1px solid #1a1018' : 'none' }}>
            <span className="text-sm font-semibold" style={{ color: C.text, fontFamily: C.cinzel }}>본인 (구매자)</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded"
              style={{ backgroundColor: '#0d0a20', color: '#7788ff', border: '1px solid #222244' }}>
              Owner
            </span>
          </div>
          {seats.map((s, i) => (
            <div key={s.id} className="flex justify-between items-center px-4 py-3"
              style={{ backgroundColor: C.card, borderBottom: i < seats.length - 1 ? '1px solid #1a1018' : 'none' }}>
              <span className="text-sm truncate" style={{ color: C.sub, fontFamily: C.ibm }}>{s.invited_email}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ml-2"
                style={{
                  backgroundColor: s.status === 'accepted' ? '#0d1a0d' : '#1a1400',
                  color: s.status === 'accepted' ? '#4ade80' : '#ccaa00',
                  border: `1px solid ${s.status === 'accepted' ? '#1a4a1a' : '#332800'}`,
                }}>
                {s.status === 'accepted' ? '참여중' : '수락 대기'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
