'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const next = params.get('next') || '/';
      const errorParam = params.get('error');

      // 에러 파라미터가 있는 경우
      if (errorParam) {
        router.replace(`/login?error=${encodeURIComponent(errorParam)}`);
        return;
      }

      // PKCE code flow (OAuth, Magic Link)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('[auth/callback] exchange error:', error.message);
          router.replace('/login?error=auth_failed');
          return;
        }
        router.replace(next);
        return;
      }

      // Hash fragment flow (#access_token=...)
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // Supabase client auto-detects hash and sets session
        const { data, error } = await supabase.auth.getSession();
        if (!error && data.session) {
          router.replace(next);
          return;
        }
      }

      // 세션이 이미 있는지 확인
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(next);
        return;
      }

      router.replace('/login?error=auth_failed');
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto"
          style={{ borderColor: '#cc1a1a', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: '#888', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          로그인 처리 중...
        </p>
      </div>
    </div>
  );
}
