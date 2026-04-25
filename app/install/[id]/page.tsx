'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TIER_INFO, type TierName } from '@/lib/supabase/types';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Browser = 'ios-safari' | 'android-chrome' | 'desktop-chrome' | 'desktop-safari' | 'other';

function detectBrowser(): Browser {
  if (typeof window === 'undefined') return 'other';
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid;
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edg/.test(ua);
  if (isIOS && isSafari) return 'ios-safari';
  if (isAndroid && isChrome) return 'android-chrome';
  if (!isMobile && isChrome) return 'desktop-chrome';
  if (!isMobile && isSafari) return 'desktop-safari';
  return 'other';
}

export default function InstallPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const appId = params.id as string;
  const sessionId = search.get('session_id');
  const isUpgrade = search.get('upgrade') === '1';

  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<{ name: string; icon_url: string; slug: string } | null>(null);
  const [tier, setTier] = useState<TierName | null>(null);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [browser, setBrowser] = useState<Browser>('other');
  const [error, setError] = useState<string | null>(null);
  const [webauthnStep, setWebauthnStep] = useState<'idle' | 'registering' | 'done' | 'skipped' | 'unsupported'>('idle');
  const webauthnSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

  useEffect(() => {
    setBrowser(detectBrowser());
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    const installedHandler = () => setInstalled(true);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace(`/login?next=/install/${appId}`); return; }

        const { data: appData } = await supabase
          .from('apps_public').select('name, icon_url, slug')
          .eq('id', appId).maybeSingle();
        if (!appData) { setError('앱을 찾을 수 없습니다.'); setLoading(false); return; }
        setApp(appData);

        const { data: license } = await supabase
          .from('licenses').select('tier')
          .eq('user_id', user.id).eq('app_id', appId)
          .eq('status', 'active').maybeSingle();

        if (!license && sessionId) {
          await new Promise((r) => setTimeout(r, 1500));
          const { data: retry } = await supabase
            .from('licenses').select('tier')
            .eq('user_id', user.id).eq('app_id', appId)
            .eq('status', 'active').maybeSingle();
          if (retry?.tier) setTier(retry.tier as TierName);
          else setError('결제는 완료됐지만 라이선스 생성이 지연됩니다. 잠시 후 새로고침해주세요.');
        } else if (license?.tier) {
          setTier(license.tier as TierName);
        } else {
          setError('이 앱에 대한 구매 내역을 찾을 수 없습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류 발생');
      } finally {
        setLoading(false);
      }
    })();
  }, [appId, sessionId, router]);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result.outcome === 'accepted') setInstalled(true);
    setInstallEvent(null);
  }

  async function handleWebAuthnRegister() {
    if (!webauthnSupported) { setWebauthnStep('unsupported'); return; }
    setWebauthnStep('registering');
    try {
      // 서버에서 챌린지 수신
      const res = await fetch('/api/webauthn/challenge');
      const { challenge, rpId, rpName, userId, userName } = await res.json();

      // 브라우저 WebAuthn 등록 실행 (지문/FaceID 프롬프트)
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Buffer.from(challenge, 'base64url'),
          rp: { id: rpId, name: rpName },
          user: {
            id: Buffer.from(userId, 'base64url'),
            name: userName,
            displayName: userName,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // 내장 지문/FaceID만
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      const response = credential.response as AuthenticatorAttestationResponse;

      // 서버에 등록
      await fetch('/api/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: credential.id,
          rawId: Buffer.from(credential.rawId).toString('base64url'),
          clientDataJSON: Buffer.from(response.clientDataJSON).toString('base64url'),
          attestationObject: Buffer.from(response.attestationObject).toString('base64url'),
          appId,
        }),
      });
      setWebauthnStep('done');
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setWebauthnStep('skipped'); // 사용자가 직접 취소
      } else {
        setWebauthnStep('skipped');
      }
    }
  }

  async function handleOpenApp() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL || '';
    window.location.href = `${proxyUrl}/proxy/${appId}/?token=${session.access_token}`;
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm">확인 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 text-red-700 text-center py-10">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary mt-4 text-xs">
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <section className="card text-center">
        {app?.icon_url && (
          <img src={app.icon_url} alt={app.name} className="w-20 h-20 mx-auto rounded-2xl mb-3" />
        )}
        <h1 className="text-xl font-bold">{app?.name}</h1>
        {tier && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: TIER_INFO[tier].color }} />
            <span className="text-sm font-semibold" style={{ color: TIER_INFO[tier].color }}>
              {TIER_INFO[tier].label} 티어
            </span>
            {isUpgrade && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                업그레이드 완료
              </span>
            )}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-2">
          {isUpgrade ? '업그레이드가 완료되었습니다!' : '구매가 완료되었습니다!'}
        </p>
      </section>

      {installed ? (
        <section className="card" style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a3a1a' }}>
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#0d1a0d', border: '1px solid #1a4a1a' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="font-bold" style={{ color: '#4ade80' }}>설치 완료!</p>
            <p className="text-xs mt-1" style={{ color: '#22c55e' }}>홈화면에서 앱을 실행하세요.</p>
          </div>

          {/* WebAuthn 생체인증 바인딩 단계 */}
          {webauthnSupported && webauthnStep === 'idle' && (
            <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#1a0404', border: '1px solid #2a1515', color: '#cc1a1a' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#e8e8e8' }}>생체인증 바인딩</p>
                  <p className="text-xs mb-3" style={{ color: '#888888' }}>
                    지문·FaceID로 이 기기에 라이선스를 잠금. 계정 공유를 원천 차단합니다.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={handleWebAuthnRegister}
                      className="flex-1 py-2 rounded text-xs font-semibold"
                      style={{ backgroundColor: '#cc1a1a', color: '#fff' }}>
                      지금 설정하기
                    </button>
                    <button onClick={() => setWebauthnStep('skipped')}
                      className="px-3 py-2 rounded text-xs"
                      style={{ backgroundColor: '#160d12', color: '#554444', border: '1px solid #2a1515' }}>
                      건너뛰기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {webauthnStep === 'registering' && (
            <div className="mt-4 text-center text-sm" style={{ color: '#888888' }}>
              생체인증 등록 중…
            </div>
          )}

          {webauthnStep === 'done' && (
            <div className="mt-4 text-center text-sm" style={{ color: '#4ade80' }}>
              생체인증 바인딩 완료 — 이 기기에만 라이선스가 잠금됩니다.
            </div>
          )}

          <button onClick={handleOpenApp} className="btn-primary w-full mt-4">바로 실행하기</button>
        </section>
      ) : installEvent ? (
        <section className="card">
          <h2 className="font-bold mb-2">홈화면에 설치</h2>
          <p className="text-xs text-slate-600 mb-4">
            설치하면 일반 앱처럼 홈화면에서 빠르게 실행할 수 있습니다.
          </p>
          <button onClick={handleInstall} className="btn-primary w-full">설치하기</button>
          <button onClick={handleOpenApp} className="btn-secondary w-full mt-2 text-xs">
            설치 없이 웹에서 실행
          </button>
        </section>
      ) : (
        <ManualInstallGuide browser={browser} onOpen={handleOpenApp} />
      )}
    </div>
  );
}

function ManualInstallGuide({ browser, onOpen }: { browser: Browser; onOpen: () => void }) {
  const guides: Record<Browser, { title: string; steps: string[] }> = {
    'ios-safari': {
      title: 'iPhone · iPad 설치 방법',
      steps: [
        '하단 공유 버튼(⬆️)을 누르세요',
        '"홈 화면에 추가" 메뉴를 선택하세요',
        '오른쪽 위 "추가"를 누르면 끝!',
      ],
    },
    'desktop-safari': {
      title: 'Mac Safari 설치 방법',
      steps: ['상단 메뉴 "파일" 클릭', '"Dock에 추가" 선택', 'Dock에서 실행 가능'],
    },
    'desktop-chrome': {
      title: 'Chrome 설치 방법',
      steps: [
        '주소창 오른쪽 설치 아이콘(⬇️) 클릭',
        '"설치" 버튼 클릭',
        '바탕화면/시작메뉴에서 실행',
      ],
    },
    'android-chrome': {
      title: 'Android Chrome 설치 방법',
      steps: ['우측 상단 메뉴(⋮) 열기', '"홈 화면에 추가" 선택', '"설치" 클릭'],
    },
    other: {
      title: '설치 안내',
      steps: ['현재 브라우저는 자동 설치 미지원', '아래 버튼으로 웹에서 바로 실행 가능'],
    },
  };
  const guide = guides[browser];

  return (
    <section className="card">
      <h2 className="font-bold mb-3">{guide.title}</h2>
      <ol className="space-y-2 text-sm">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-slate-700">{step}</span>
          </li>
        ))}
      </ol>
      <button onClick={onOpen} className="btn-primary w-full mt-5">웹에서 바로 실행하기</button>
    </section>
  );
}
