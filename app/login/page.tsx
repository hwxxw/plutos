'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { MotionBtn } from '@/components/MotionBtn';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  function getCallbackUrl() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next') || '/';
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getCallbackUrl() },
    });
    setLoading(false);
    if (error) setMessage({ type: 'err', text: error.message });
    else setSent(true);
  }

  async function handleOAuth(provider: 'google' | 'apple' | 'github' | 'kakao') {
    setLoadingProvider(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getCallbackUrl() },
    });
    if (error) {
      setLoadingProvider(null);
      setMessage({ type: 'err', text: error.message });
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <img src="/logo.png" alt="PLUTOS" className="h-9 w-auto" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }} />
            <span className="text-xl font-bold tracking-widest text-white" style={{ fontFamily: 'Cinzel, serif' }}>
              PLUTOS
            </span>
          </Link>
          <h1 className="text-lg font-semibold text-white">계속하려면 로그인하세요</h1>
          <p className="text-xs text-zinc-500 mt-1">가입과 로그인이 동시에 처리됩니다</p>
        </div>

        {sent ? (
          <div className="card text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-900/40 border border-brand-700 flex items-center justify-center mx-auto text-2xl">
              ✉
            </div>
            <div className="font-semibold text-white">이메일을 확인하세요</div>
            <div className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-zinc-200">{email}</span>로 로그인 링크를 보냈습니다.
              <br />링크를 클릭하면 자동으로 로그인됩니다.
            </div>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-2"
            >
              다른 이메일로 시도하기
            </button>
          </div>
        ) : (
          <div className="card space-y-3">

            {/* Google */}
            <OAuthBtn
              onClick={() => handleOAuth('google')}
              disabled={!!loadingProvider}
              loading={loadingProvider === 'google'}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                  <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.777l-4.04 3.096C3.196 21.299 7.265 24 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                  <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                  <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
                </svg>
              }
              label="Google 계정으로 로그인"
              bg="#fff"
              textColor="#111"
              border="#e0e0e0"
            />

            {/* Apple */}
            <OAuthBtn
              onClick={() => handleOAuth('apple')}
              disabled={!!loadingProvider}
              loading={loadingProvider === 'apple'}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              }
              label="Apple 계정으로 로그인"
              bg="#000"
              textColor="#fff"
              border="#333"
            />

            {/* GitHub */}
            <OAuthBtn
              onClick={() => handleOAuth('github')}
              disabled={!!loadingProvider}
              loading={loadingProvider === 'github'}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              }
              label="GitHub 계정으로 로그인"
              bg="#24292e"
              textColor="#fff"
              border="#444"
            />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-600">또는 이메일</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-colors duration-150"
              />
              <MotionBtn
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    전송 중...
                  </span>
                ) : '매직 링크 보내기'}
              </MotionBtn>
            </form>

            {message?.type === 'err' && (
              <div className="text-xs p-2.5 rounded-lg bg-brand-900/30 border border-brand-800 text-brand-400">
                {message.text}
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] text-zinc-600 text-center mt-5 leading-relaxed">
          로그인 시{' '}
          <Link href="/legal/terms" className="text-zinc-400 underline hover:text-zinc-200 transition-colors">이용약관</Link>
          {' '}및{' '}
          <Link href="/legal/privacy" className="text-zinc-400 underline hover:text-zinc-200 transition-colors">개인정보처리방침</Link>
          에 동의합니다
        </p>
      </div>
    </div>
  );
}

function OAuthBtn({
  onClick, disabled, loading, icon, label, bg, textColor, border,
}: {
  onClick: () => void; disabled: boolean; loading: boolean;
  icon: React.ReactNode; label: string; bg: string; textColor: string; border: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
      style={{ backgroundColor: bg, color: textColor, border: `1px solid ${border}` }}
    >
      {loading ? (
        <span className="w-4 h-4 border border-current/30 border-t-current rounded-full animate-spin" />
      ) : icon}
      {label}
    </motion.button>
  );
}
