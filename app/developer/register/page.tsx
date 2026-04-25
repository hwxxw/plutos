import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DeveloperRegisterPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/developer/register');

  const { data: profile } = await supabase
    .from('users')
    .select('role, display_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'developer' || profile?.role === 'admin') {
    redirect('/developer');
  }

  const BENEFITS = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      ),
      title: '즉시 마켓 노출',
      desc: '심사 통과 즉시 PLUTOS 마켓에 노출됩니다.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      title: '판매 수익 직접 수령',
      desc: '수익을 Stripe로 직접 정산. 구독료 없이 무료 시작.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
      ),
      title: '실시간 대시보드',
      desc: '판매량, 수익, 고객 데이터를 실시간으로 확인.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      title: 'JS 소스 보호',
      desc: 'Pro 개발자는 난독화로 소스코드를 보호할 수 있습니다.',
    },
  ];

  return (
    <div className="max-w-lg mx-auto py-10">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.25em] mb-3" style={{ color: '#880000', fontFamily: 'Cinzel, serif' }}>
          PLUTOS Developer Program
        </div>
        <h1 className="text-3xl font-black leading-tight mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#e8e8e8' }}>
          개발자로<br /><span style={{ color: '#cc1a1a' }}>시작하기</span>
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#888888', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          당신의 AI 웹툴을 수천 명에게 판매하세요.<br />
          무료로 등록하고 판매 수익을 바로 받아가세요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {BENEFITS.map((item) => (
          <div key={item.title} className="rounded-xl p-4" style={{ backgroundColor: '#120a0e', border: '1px solid #2a1515' }}>
            <div className="mb-3" style={{ color: '#880000' }}>{item.icon}</div>
            <div className="font-semibold text-sm mb-1" style={{ color: '#e8e8e8', fontFamily: 'Cinzel, serif' }}>{item.title}</div>
            <div className="text-xs leading-relaxed" style={{ color: '#888888', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <form action="/api/developer/activate" method="POST" className="space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-2" style={{ color: '#664444', fontFamily: 'Cinzel, serif' }}>
            개발자 표시명
          </label>
          <input
            name="display_name"
            type="text"
            defaultValue={profile?.display_name ?? ''}
            placeholder="홍길동 / Studio Name"
            required
            minLength={2}
            maxLength={30}
            className="w-full rounded-lg px-4 py-3 text-sm outline-none"
            style={{ backgroundColor: '#0d0a10', border: '1px solid #3a1515', color: '#e8e8e8' }}
          />
          <p className="text-[10px] mt-1" style={{ color: '#4a3535' }}>마켓에서 사용자에게 표시되는 이름입니다</p>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="agree"
            required
            className="mt-0.5 w-4 h-4 flex-shrink-0"
            style={{ accentColor: '#cc1a1a' }}
          />
          <label htmlFor="agree" className="text-xs leading-relaxed" style={{ color: '#888888', fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
            <span style={{ color: '#e8e8e8', fontWeight: 600 }}>개발자 이용약관</span>에 동의합니다.
            플랫폼 수수료 및 운영 정책을 확인하고 동의합니다.
          </label>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 text-sm"
          style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
        >
          개발자 계정 활성화하기 →
        </button>

        <p className="text-center text-[11px]" style={{ color: '#4a3535' }}>
          무료로 시작 · 언제든 탈퇴 가능
        </p>
      </form>
    </div>
  );
}
