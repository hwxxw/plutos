'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const C = {
  card:   '#120a0e',
  border: '#2a1515',
  red:    '#cc1a1a',
  text:   '#e8e8e8',
  sub:    '#888888',
  cinzel: 'Cinzel, serif' as const,
  ibm:    "'IBM Plex Sans KR', sans-serif" as const,
};

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cc1a1a" strokeWidth={2.5} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'error'>('error');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=/invite/${token}`);
        return;
      }
      try {
        const res = await fetch('/api/seats', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          if (data.error === 'email_mismatch') {
            setMessage(`이 초대는 ${data.expected} 계정으로 수락해야 합니다.`);
          } else if (data.error === 'invalid_or_expired') {
            setMessage('만료된 초대이거나 이미 수락된 초대입니다.');
          } else {
            setMessage(data.error || '수락 실패');
          }
        } else {
          setStatus('success');
          setMessage('초대를 수락했습니다.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : '오류 발생');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, router]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#cc1a1a', borderTopColor: 'transparent' }} />
        <p className="mt-4 text-sm" style={{ color: C.sub, fontFamily: C.ibm }}>초대 확인 중...</p>
      </div>
    );
  }

  const isSuccess = status === 'success';

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="rounded-2xl p-8 text-center space-y-4"
        style={{
          backgroundColor: C.card,
          border: `1px solid ${isSuccess ? '#1a4a1a' : C.border}`,
        }}>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: isSuccess ? '#0d1a0d' : '#1a0404', border: `1px solid ${isSuccess ? '#2a5a2a' : '#330000'}` }}>
            {isSuccess ? <CheckIcon /> : <CrossIcon />}
          </div>
        </div>
        <h1 className="font-black text-xl" style={{ color: C.text, fontFamily: C.cinzel }}>
          {isSuccess ? '초대 수락 완료' : '초대 수락 실패'}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: C.sub, fontFamily: C.ibm }}>{message}</p>
        {isSuccess && (
          <button onClick={() => router.push('/my-apps')}
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold"
            style={{ backgroundColor: '#0d1a0d', color: '#4ade80', border: '1px solid #1a4a1a', fontFamily: C.cinzel }}>
            내 앱으로 이동 →
          </button>
        )}
      </div>
    </div>
  );
}
