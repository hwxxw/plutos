'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // 로그인 필요 - 로그인 후 다시 이 페이지로
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
          setMessage('초대를 수락했습니다!');
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
      <div className="py-16 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm">초대 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <div
        className={`card text-center ${
          status === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="text-4xl mb-3">{status === 'success' ? '✅' : '❌'}</div>
        <h1 className="font-bold">
          {status === 'success' ? '초대 수락 완료' : '초대 수락 실패'}
        </h1>
        <p className="text-sm mt-2 text-slate-700">{message}</p>
        {status === 'success' && (
          <button
            onClick={() => router.push('/my-apps')}
            className="btn-primary mt-4"
          >
            내 앱으로 이동
          </button>
        )}
      </div>
    </div>
  );
}
