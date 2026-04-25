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
      icon: '💰',
      title: '판매 수익 직접 수령',
      desc: '앱 판매 수익을 바로 정산받습니다. 구독료 없이 무료로 시작하세요.',
    },
    {
      icon: '⚡',
      title: '즉시 마켓 노출',
      desc: '앱 등록 및 검토 통과 즉시 PLUTOS 마켓에 노출됩니다.',
    },
    {
      icon: '📊',
      title: '실시간 대시보드',
      desc: '판매량, 수익, 고객 데이터를 실시간 대시보드에서 확인하세요.',
    },
    {
      icon: '🔐',
      title: 'JS 소스 보호',
      desc: 'Pro 개발자는 동적 JS 난독화로 소스코드를 보호할 수 있습니다.',
    },
  ];

  return (
    <div className="max-w-lg mx-auto py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[11px] text-brand-500 font-bold uppercase tracking-[0.2em] mb-3">
          PLUTOS Developer Program
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
          개발자로{' '}
          <span className="text-brand-500">시작하기</span>
        </h1>
        <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
          당신의 AI 웹툴을 수천 명에게 판매하세요.
          <br />무료로 등록하고 판매 수익을 바로 받아가세요.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-2 mb-8">
        {BENEFITS.map((item) => (
          <div key={item.title} className="card hover:border-zinc-600 transition-colors duration-150">
            <span className="text-xl mb-2 block">{item.icon}</span>
            <div className="font-semibold text-white text-sm">{item.title}</div>
            <div className="text-zinc-500 text-xs mt-1 leading-relaxed">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Registration form */}
      <form action="/api/developer/activate" method="POST" className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
            개발자 표시명
          </label>
          <input
            name="display_name"
            type="text"
            defaultValue={profile?.display_name ?? ''}
            placeholder="홍길동 / Studio Name"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-colors duration-150"
            required
            minLength={2}
            maxLength={30}
          />
          <p className="text-[11px] text-zinc-600 mt-1">마켓에서 사용자에게 표시되는 이름입니다</p>
        </div>

        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="agree"
            required
            className="mt-0.5 w-4 h-4 accent-brand-600 flex-shrink-0"
          />
          <label htmlFor="agree" className="text-xs text-zinc-400 leading-relaxed">
            <span className="text-white font-medium">개발자 이용약관</span>에 동의합니다.
            플랫폼 수수료 및 운영 정책을 확인하고 동의합니다.
          </label>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 text-sm tracking-wide"
        >
          개발자 계정 활성화하기 →
        </button>

        <p className="text-center text-xs text-zinc-600">
          무료로 시작 · 언제든 탈퇴 가능
        </p>
      </form>
    </div>
  );
}
